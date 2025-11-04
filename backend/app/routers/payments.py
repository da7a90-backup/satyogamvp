"""Payments router with Tilopay integration."""

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import logging

from ..core.database import get_db, SessionLocal
from ..core.deps import get_current_user, get_optional_user
from ..core.config import settings
from ..models.user import User
from ..models.payment import Payment, PaymentStatus, PaymentType
from ..models.course import CourseEnrollment, EnrollmentStatus
from ..models.retreat import RetreatRegistration, RegistrationStatus, AccessType
from ..models.product import Order, OrderItem, OrderStatus, UserProductAccess, Product, Cart, CartItem
from ..services import tilopay_service, mixpanel_service, ga4_service, sendgrid_service
from ..schemas.product import CheckoutRequest, CheckoutResponse
from ..schemas.payment import PaymentCreate

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create")
async def create_payment(
    payment_data: PaymentCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Create an embedded payment session with Tilopay.

    Supports both authenticated and anonymous payments.
    For anonymous payments, billing information must be provided.

    Returns payment data for frontend to embed Tilopay form in-page.
    """
    # Validate payment type
    try:
        payment_type_enum = PaymentType(payment_data.payment_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    # For anonymous payments, require billing email and name
    if not current_user:
        if not payment_data.billing_email:
            raise HTTPException(status_code=400, detail="Email is required for anonymous payments")
        if not payment_data.billing_first_name and not payment_data.billing_name:
            raise HTTPException(status_code=400, detail="Name is required for anonymous payments")

    # Determine customer info
    if current_user:
        customer_email = current_user.email
        customer_name = current_user.name
        user_id = current_user.id
    else:
        customer_email = payment_data.billing_email
        # Construct name from first/last or use billing_name
        if payment_data.billing_first_name or payment_data.billing_last_name:
            customer_name = f"{payment_data.billing_first_name or ''} {payment_data.billing_last_name or ''}".strip()
        else:
            customer_name = payment_data.billing_name or "Anonymous Donor"
        user_id = None  # Anonymous payment

    # Create payment record
    payment = Payment(
        user_id=user_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        status=PaymentStatus.PENDING,
        payment_type=payment_type_enum,
        reference_id=payment_data.reference_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Get SDK token from Tilopay
    token_response = await tilopay_service.get_sdk_token()

    if not token_response.get("success"):
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Tilopay SDK token: {token_response.get('message', 'Unknown error')}",
        )

    # Store order ID in payment
    payment.tilopay_order_id = str(payment.id)
    db.commit()

    logger.info(f"Payment created: id={payment.id}, type={payment_data.payment_type}, amount={payment_data.amount}, user={'authenticated' if current_user else 'anonymous'}")

    # Extract first and last names
    first_name = payment_data.billing_first_name or (customer_name.split()[0] if customer_name else "")
    last_name = payment_data.billing_last_name or (" ".join(customer_name.split()[1:]) if customer_name and len(customer_name.split()) > 1 else "")

    # Return SDK token and all payment/billing info for frontend to initialize Tilopay SDK
    return {
        "payment_id": str(payment.id),
        "tilopay_key": token_response.get("token"),  # Return the actual SDK token from loginSdk
        "order_number": str(payment.id),
        "amount": float(payment_data.amount),
        "currency": payment_data.currency,
        "description": payment_data.description or f"{payment_data.payment_type.capitalize()} to Sat Yoga",
        "customer_email": customer_email,
        "customer_name": customer_name,
        "first_name": first_name,
        "last_name": last_name,
        "address": payment_data.billing_address or "",
        "city": payment_data.billing_city or "",
        "state": payment_data.billing_state or "",
        "zip_code": payment_data.billing_postal_code or "",
        "country": payment_data.billing_country or "",
        "telephone": payment_data.billing_telephone or "",
    }


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create an order from the cart and initiate payment with Tilopay.

    This endpoint:
    1. Gets the user's cart
    2. Creates an Order with OrderItems
    3. Creates a Payment record
    4. Initiates Tilopay embedded checkout
    5. Clears the cart
    6. Returns payment data for frontend to embed Tilopay form
    """
    # Get user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate totals
    subtotal = sum(item.product.price * item.quantity for item in cart.items)
    tax = subtotal * 0.13  # Costa Rica 13% IVA
    total = subtotal + tax

    # Create order
    order = Order(
        user_id=current_user.id,
        subtotal=subtotal,
        tax=tax,
        total=total,
        status=OrderStatus.PENDING,
        billing_email=checkout_data.billing_email or current_user.email,
        billing_name=checkout_data.billing_name or current_user.name,
        billing_address=checkout_data.billing_address,
        billing_city=checkout_data.billing_city,
        billing_country=checkout_data.billing_country,
        billing_postal_code=checkout_data.billing_postal_code,
    )
    db.add(order)
    db.flush()  # Get order ID without committing

    # Create order items from cart items
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price,
            subtotal=cart_item.product.price * cart_item.quantity,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        amount=total,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=PaymentType.PRODUCT,
        reference_id=str(order.id),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create Tilopay embedded payment session
    tilopay_response = await tilopay_service.create_embedded_payment(
        amount=float(total),
        order_id=str(payment.id),
        description=f"Order #{order.id} - {len(cart.items)} item(s)",
        customer_email=order.billing_email,
        customer_name=order.billing_name,
    )

    if not tilopay_response.get("success"):
        payment.status = PaymentStatus.FAILED
        order.status = OrderStatus.CANCELLED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment order",
        )

    # Update payment with Tilopay details
    payment.tilopay_order_id = tilopay_response.get("order_id")
    payment.tilopay_response = tilopay_response.get("payment_data")
    db.commit()

    # Clear cart after successful order creation
    for item in cart.items:
        db.delete(item)
    db.commit()

    logger.info(f"Checkout completed: order={order.id}, payment={payment.id}, user={current_user.id}")

    return CheckoutResponse(
        order_id=str(order.id),
        payment_id=str(payment.id),
        payment_data=tilopay_response.get("payment_data"),
        tilopay_order_id=tilopay_response.get("order_id"),
        total=float(total),
        currency="USD",
    )


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
