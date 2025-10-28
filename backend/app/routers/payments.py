"""Payments router with Tilopay integration."""

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import logging

from ..core.database import get_db, SessionLocal
from ..core.deps import get_current_user
from ..models.user import User
from ..models.payment import Payment, PaymentStatus, PaymentType
from ..models.course import CourseEnrollment, EnrollmentStatus
from ..models.retreat import RetreatRegistration, RegistrationStatus, AccessType
from ..models.product import Order, OrderItem, OrderStatus, UserProductAccess
from ..services import tilopay_service, mixpanel_service, ga4_service, sendgrid_service

logger = logging.getLogger(__name__)

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
    """
    Create an embedded payment session with Tilopay.

    Returns payment data for frontend to embed Tilopay form in-page.
    """
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

    # Create Tilopay embedded payment session
    tilopay_response = await tilopay_service.create_embedded_payment(
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
    payment.tilopay_order_id = tilopay_response.get("order_id")
    payment.tilopay_response = tilopay_response.get("payment_data")
    db.commit()

    return {
        "payment_id": str(payment.id),
        "payment_data": tilopay_response.get("payment_data"),
        "order_id": tilopay_response.get("order_id"),
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
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Verify webhook signature (if provided in header)
    signature = request.headers.get("X-Tilopay-Signature")
    if signature:
        if not tilopay_service.verify_webhook_signature(payload, signature):
            logger.warning(f"Invalid webhook signature for payload: {payload}")
            raise HTTPException(status_code=401, detail="Invalid signature")

    # Process webhook
    webhook_data = await tilopay_service.process_webhook(payload)

    logger.info(f"Processing webhook for transaction {webhook_data.get('transaction_id')}, order {webhook_data.get('order_id')}")

    # Find payment by Tilopay transaction ID (if already set)
    payment = None
    if webhook_data.get("transaction_id"):
        payment = (
            db.query(Payment)
            .filter(Payment.tilopay_transaction_id == webhook_data["transaction_id"])
            .first()
        )

    # Try by order ID if not found
    if not payment and webhook_data.get("order_id"):
        payment = (
            db.query(Payment)
            .filter(Payment.tilopay_order_id == webhook_data["order_id"])
            .first()
        )

    if not payment:
        logger.error(f"Payment not found for webhook: transaction_id={webhook_data.get('transaction_id')}, order_id={webhook_data.get('order_id')}")
        raise HTTPException(status_code=404, detail="Payment not found")

    # Update payment with transaction ID from webhook (if not already set)
    if webhook_data.get("transaction_id") and not payment.tilopay_transaction_id:
        payment.tilopay_transaction_id = webhook_data["transaction_id"]

    # Update payment status
    if webhook_data["paid"]:
        payment.status = PaymentStatus.COMPLETED
        payment.payment_method = webhook_data.get("payment_method")

        logger.info(f"Payment {payment.id} marked as completed, granting access")

        # Grant access based on payment type (runs in background)
        background_tasks.add_task(
            grant_access_after_payment,
            str(payment.id),
            str(payment.user_id),
            payment.payment_type.value,
            payment.reference_id,
        )

        # Send confirmation email (runs in background)
        background_tasks.add_task(
            send_payment_confirmation_email,
            str(payment.user_id),
            str(payment.id),
        )

        # Track payment in analytics (runs in background)
        background_tasks.add_task(
            track_payment_analytics,
            str(payment.user_id),
            float(payment.amount),
            payment.payment_type.value,
            payment.reference_id,
        )

    else:
        payment.status = PaymentStatus.FAILED
        logger.warning(f"Payment {payment.id} marked as failed")

    db.commit()

    return {"status": "success"}


def grant_access_after_payment(
    payment_id: str,
    user_id: str,
    payment_type: str,
    reference_id: Optional[str]
):
    """
    Grant access to purchased items after successful payment.
    This runs as a background task and creates its own DB session.
    """
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment or payment.status != PaymentStatus.COMPLETED:
            logger.warning(f"Cannot grant access for payment {payment_id}: payment not found or not completed")
            return

        # Course enrollment
        if payment_type == PaymentType.COURSE.value and reference_id:
            enrollment = (
                db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.user_id == user_id,
                    CourseEnrollment.course_id == reference_id,
                )
                .first()
            )
            if enrollment:
                enrollment.payment_id = payment.id
                enrollment.status = EnrollmentStatus.ACTIVE
                db.commit()
                logger.info(f"Granted course access: user={user_id}, course={reference_id}")
            else:
                logger.warning(f"No enrollment found for user {user_id}, course {reference_id}")

        # Retreat registration
        elif payment_type == PaymentType.RETREAT.value and reference_id:
            registration = (
                db.query(RetreatRegistration)
                .filter(
                    RetreatRegistration.user_id == user_id,
                    RetreatRegistration.retreat_id == reference_id,
                )
                .first()
            )
            if registration:
                registration.payment_id = payment.id
                registration.status = RegistrationStatus.CONFIRMED
                db.commit()
                logger.info(f"Granted retreat access: user={user_id}, retreat={reference_id}")
            else:
                logger.warning(f"No registration found for user {user_id}, retreat {reference_id}")

        # Product purchase
        elif payment_type == PaymentType.PRODUCT.value and reference_id:
            order = db.query(Order).filter(Order.id == reference_id).first()
            if order:
                order.status = OrderStatus.COMPLETED
                order.payment_id = payment.id

                # Grant access to products
                for item in order.items:
                    # Check if access already exists
                    existing_access = (
                        db.query(UserProductAccess)
                        .filter(
                            UserProductAccess.user_id == user_id,
                            UserProductAccess.product_id == item.product_id,
                        )
                        .first()
                    )
                    if not existing_access:
                        access = UserProductAccess(
                            user_id=user_id,
                            product_id=item.product_id,
                            order_id=order.id,
                        )
                        db.add(access)

                db.commit()
                logger.info(f"Granted product access: user={user_id}, order={reference_id}")
            else:
                logger.warning(f"No order found for reference {reference_id}")

    except Exception as e:
        logger.error(f"Error granting access for payment {payment_id}: {e}")
        db.rollback()
    finally:
        db.close()


async def send_payment_confirmation_email(user_id: str, payment_id: str):
    """Send payment confirmation email to user."""
    db = SessionLocal()
    try:
        # Get user and payment details
        user = db.query(User).filter(User.id == user_id).first()
        payment = db.query(Payment).filter(Payment.id == payment_id).first()

        if not user or not payment:
            logger.warning(f"Cannot send confirmation email: user or payment not found")
            return

        # Build email subject and content based on payment type
        subject = "Payment Confirmation - Sat Yoga Institute"

        if payment.payment_type == PaymentType.COURSE:
            item_type = "Course"
        elif payment.payment_type == PaymentType.RETREAT:
            item_type = "Retreat"
        elif payment.payment_type == PaymentType.PRODUCT:
            item_type = "Product"
        elif payment.payment_type == PaymentType.MEMBERSHIP:
            item_type = "Membership"
        else:
            item_type = "Purchase"

        # Simple email content
        content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Payment Confirmation</h2>
            <p>Dear {user.name},</p>
            <p>Thank you for your payment! Your transaction has been successfully processed.</p>

            <h3>Payment Details:</h3>
            <ul>
                <li><strong>Transaction ID:</strong> {payment.tilopay_transaction_id or 'N/A'}</li>
                <li><strong>Amount:</strong> ${payment.amount} {payment.currency}</li>
                <li><strong>Type:</strong> {item_type}</li>
                <li><strong>Date:</strong> {payment.created_at.strftime('%B %d, %Y')}</li>
                <li><strong>Payment Method:</strong> {payment.payment_method or 'Card'}</li>
            </ul>

            <p>Your access has been granted and you can now enjoy your {item_type.lower()}.</p>

            <p>If you have any questions, please don't hesitate to contact us.</p>

            <p>With gratitude,<br>Sat Yoga Institute Team</p>
        </body>
        </html>
        """

        # Send email
        await sendgrid_service.send_email(
            to_email=user.email,
            subject=subject,
            html_content=content,
        )

        logger.info(f"Payment confirmation email sent to {user.email} for payment {payment_id}")

    except Exception as e:
        logger.error(f"Error sending payment confirmation email: {e}")
    finally:
        db.close()


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
