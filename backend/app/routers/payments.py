"""Payments router with Tilopay integration."""

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.payment import Payment, PaymentStatus, PaymentType
from ..models.course import CourseEnrollment
from ..models.retreat import RetreatRegistration
from ..models.product import Order, OrderItem, OrderStatus, UserProductAccess
from ..services import tilopay_service, mixpanel_service, ga4_service, sendgrid_service

router = APIRouter()


@router.post("/create")
async def create_payment(
    amount: float,
    payment_type: str,
    reference_id: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a payment with Tilopay."""
    # Validate payment type
    try:
        payment_type_enum = PaymentType(payment_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        amount=amount,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=payment_type_enum,
        reference_id=reference_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create Tilopay order
    tilopay_response = await tilopay_service.create_payment(
        amount=amount,
        order_id=str(payment.id),
        description=description or f"{payment_type} payment",
        customer_email=current_user.email,
        customer_name=current_user.name,
    )

    if not tilopay_response.get("success"):
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment order",
        )

    # Update payment with Tilopay details
    payment.tilopay_transaction_id = tilopay_response.get("transaction_id")
    payment.tilopay_order_id = tilopay_response.get("order_id")
    payment.tilopay_response = tilopay_response.get("data")
    db.commit()

    return {
        "payment_id": str(payment.id),
        "payment_url": tilopay_response.get("payment_url"),
        "transaction_id": tilopay_response.get("transaction_id"),
    }


@router.post("/webhook")
async def tilopay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Handle Tilopay webhook notifications."""
    # Get webhook payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Verify webhook signature (if provided in header)
    signature = request.headers.get("X-Tilopay-Signature")
    if signature and not tilopay_service.verify_webhook_signature(payload, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Process webhook
    webhook_data = await tilopay_service.process_webhook(payload)

    # Find payment by Tilopay transaction ID
    payment = (
        db.query(Payment)
        .filter(Payment.tilopay_transaction_id == webhook_data["transaction_id"])
        .first()
    )

    if not payment:
        # Try by order ID
        payment = (
            db.query(Payment)
            .filter(Payment.tilopay_order_id == webhook_data["order_id"])
            .first()
        )

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Update payment status
    if webhook_data["paid"]:
        payment.status = PaymentStatus.COMPLETED
        payment.payment_method = webhook_data.get("payment_method")

        # Grant access based on payment type
        background_tasks.add_task(
            grant_access_after_payment,
            payment.id,
            db,
        )

        # Track payment in analytics
        background_tasks.add_task(
            track_payment_analytics,
            payment.user_id,
            payment.amount,
            payment.payment_type.value,
            payment.reference_id,
        )

    else:
        payment.status = PaymentStatus.FAILED

    db.commit()

    return {"status": "success"}


def grant_access_after_payment(payment_id: str, db: Session):
    """Grant access to purchased items after successful payment."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or payment.status != PaymentStatus.COMPLETED:
        return

    # Course enrollment
    if payment.payment_type == PaymentType.COURSE and payment.reference_id:
        enrollment = (
            db.query(CourseEnrollment)
            .filter(
                CourseEnrollment.user_id == payment.user_id,
                CourseEnrollment.course_id == payment.reference_id,
            )
            .first()
        )
        if enrollment:
            enrollment.payment_id = payment.id
            db.commit()

    # Retreat registration
    elif payment.payment_type == PaymentType.RETREAT and payment.reference_id:
        registration = (
            db.query(RetreatRegistration)
            .filter(
                RetreatRegistration.user_id == payment.user_id,
                RetreatRegistration.retreat_id == payment.reference_id,
            )
            .first()
        )
        if registration:
            registration.payment_id = payment.id
            registration.status = "confirmed"
            db.commit()

    # Product purchase
    elif payment.payment_type == PaymentType.PRODUCT and payment.reference_id:
        order = db.query(Order).filter(Order.id == payment.reference_id).first()
        if order:
            order.status = OrderStatus.COMPLETED
            order.payment_id = payment.id

            # Grant access to products
            for item in order.items:
                access = UserProductAccess(
                    user_id=payment.user_id,
                    product_id=item.product_id,
                    order_id=order.id,
                )
                db.add(access)

            db.commit()


async def track_payment_analytics(
    user_id: str, amount: float, payment_type: str, reference_id: Optional[str]
):
    """Track payment in analytics platforms."""
    await mixpanel_service.track_payment(
        str(user_id),
        amount,
        "USD",
        payment_type,
        reference_id,
    )

    await ga4_service.track_purchase(
        str(user_id),
        reference_id or "unknown",
        amount,
        "USD",
        [{"item_name": payment_type, "price": amount}],
    )


@router.get("/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment status."""
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id, Payment.user_id == current_user.id)
        .first()
    )

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Verify with Tilopay if pending
    if payment.status == PaymentStatus.PENDING and payment.tilopay_transaction_id:
        tilopay_status = await tilopay_service.verify_payment(
            payment.tilopay_transaction_id
        )

        if tilopay_status.get("success") and tilopay_status.get("paid"):
            payment.status = PaymentStatus.COMPLETED
            db.commit()

    return {
        "payment_id": str(payment.id),
        "status": payment.status.value,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "payment_type": payment.payment_type.value,
        "created_at": payment.created_at,
    }
