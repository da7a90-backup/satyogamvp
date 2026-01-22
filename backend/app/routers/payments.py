"""Payments router with Tilopay integration."""
# Billing fields added to Order model

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from ..core.database import get_db, SessionLocal
from ..core.deps import get_current_user, get_optional_user
from ..core.config import settings
from ..models.user import User, MembershipTierEnum
from ..models.payment import Payment, PaymentStatus, PaymentType
from ..models.course import CourseEnrollment, EnrollmentStatus, Course
from ..models.retreat import RetreatRegistration, RegistrationStatus, AccessType, Retreat
from ..models.product import Order, OrderItem, OrderStatus, UserProductAccess, Product, Cart, CartItem
from ..models.membership import Subscription, SubscriptionStatus, MembershipTier
from ..services import tilopay_service, mixpanel_service, ga4_service, sendgrid_service
from ..services.discount_service import DiscountService
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

    # Apply member discount for retreat payments if user is authenticated
    final_amount = payment_data.amount
    if current_user and payment_type_enum == PaymentType.RETREAT and payment_data.reference_id:
        try:
            retreat = db.query(Retreat).filter(Retreat.id == payment_data.reference_id).first()
            if retreat:
                discount_info = DiscountService.get_retreat_discount(current_user, retreat, db)
                final_amount = discount_info["discounted_price"]
                logger.info(f"Retreat payment discount applied: user={current_user.id}, retreat={retreat.id}, original=${discount_info['original_price']}, discounted=${final_amount}, discount={discount_info['discount_percentage']}%")
        except Exception as e:
            logger.warning(f"Could not apply retreat discount: {e}")
            # Continue with original amount if discount fails

    # Create payment record
    payment = Payment(
        user_id=user_id,
        amount=final_amount,
        currency=payment_data.currency,
        status=PaymentStatus.PENDING,
        payment_type=payment_type_enum,
        reference_id=payment_data.reference_id,
        payment_metadata=payment_data.metadata,  # Store metadata (e.g., access_type for retreats)
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


@router.post("/create-product-order")
async def create_product_order(
    product_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create an order and payment for a single product purchase.

    This endpoint is used for direct product purchases (not cart checkout).
    It creates:
    1. An Order with one OrderItem
    2. A Payment record with reference_id = order.id
    3. Returns payment data for Tilopay SDK

    This ensures consistency with cart checkout flow where all product
    purchases create Orders, allowing the webhook to properly grant access.
    """
    import time

    # Get product by ID
    product_id = product_data.get("product_id")
    if not product_id:
        raise HTTPException(status_code=400, detail="product_id is required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get billing information
    billing_email = product_data.get("billing_email") or current_user.email
    billing_first_name = product_data.get("billing_first_name", "")
    billing_last_name = product_data.get("billing_last_name", "")
    billing_name = f"{billing_first_name} {billing_last_name}".strip() or current_user.name
    billing_address = product_data.get("billing_address", "")
    billing_city = product_data.get("billing_city", "")
    billing_state = product_data.get("billing_state", "")
    billing_country = product_data.get("billing_country", "US")
    billing_postal_code = product_data.get("billing_postal_code", "")
    billing_telephone = product_data.get("billing_telephone", "")

    # Apply member discount if applicable
    discount_info = DiscountService.get_product_discount(current_user, product, db)
    total = discount_info["discounted_price"]

    logger.info(f"Product purchase: user={current_user.id}, product={product.id}, original=${discount_info['original_price']}, discounted=${total}, discount={discount_info['discount_percentage']}%")

    # Generate unique order number
    order_number = f"ORD-{int(time.time())}-{current_user.id.hex[:8].upper()}"

    # Create order with one item
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=total,
        status=OrderStatus.PENDING,
        billing_email=billing_email,
        billing_name=billing_name,
        billing_address=billing_address,
        billing_city=billing_city,
        billing_state=billing_state,
        billing_country=billing_country,
        billing_postal_code=billing_postal_code,
    )
    db.add(order)
    db.flush()  # Get order ID without committing

    # Create order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=1,
        price_at_purchase=product.price,
    )
    db.add(order_item)
    db.commit()
    db.refresh(order)

    logger.info(f"Created order for direct product purchase: order={order.id}, product={product.id}, user={current_user.id}")

    # Create payment record with order.id as reference
    payment = Payment(
        user_id=current_user.id,
        amount=total,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=PaymentType.PRODUCT,
        reference_id=str(order.id),  # Use order ID, not product ID
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Get SDK token from Tilopay
    token_response = await tilopay_service.get_sdk_token()

    if not token_response.get("success"):
        payment.status = PaymentStatus.FAILED
        order.status = OrderStatus.CANCELLED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Tilopay SDK token: {token_response.get('message', 'Unknown error')}",
        )

    # Store order ID in payment
    payment.tilopay_order_id = str(payment.id)
    db.commit()

    logger.info(f"Product order payment created: order={order.id}, payment={payment.id}, product={product.title}")

    # Extract first and last names
    first_name = billing_first_name or (billing_name.split()[0] if billing_name else "")
    last_name = billing_last_name or (" ".join(billing_name.split()[1:]) if billing_name and len(billing_name.split()) > 1 else "")

    # Return SDK token and payment info for frontend to initialize Tilopay SDK
    return {
        "order_id": str(order.id),
        "payment_id": str(payment.id),
        "tilopay_key": token_response.get("token"),
        "order_number": str(payment.id),
        "amount": float(total),
        "currency": "USD",
        "description": f"Product Purchase: {product.title}",
        "customer_email": billing_email,
        "customer_name": billing_name,
        "first_name": first_name,
        "last_name": last_name,
        "address": billing_address or "",
        "city": billing_city or "",
        "state": billing_state or "",
        "zip_code": billing_postal_code or "",
        "country": billing_country or "",
        "telephone": billing_telephone or "",
        "total": float(total),
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

    # Calculate total with member discounts applied to each product
    total = Decimal(0)
    for cart_item in cart.items:
        discount_info = DiscountService.get_product_discount(current_user, cart_item.product, db)
        item_total = discount_info["discounted_price"] * cart_item.quantity
        total += item_total
        logger.info(f"Cart item: product={cart_item.product.id}, qty={cart_item.quantity}, original=${cart_item.product.price}, discounted=${discount_info['discounted_price']}, discount={discount_info['discount_percentage']}%")

    logger.info(f"Cart checkout: user={current_user.id}, items={len(cart.items)}, total=${total}")

    # Generate unique order number
    import time
    order_number = f"ORD-{int(time.time())}-{current_user.id.hex[:8].upper()}"

    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=total,
        status=OrderStatus.PENDING,
        billing_email=checkout_data.billing_email or current_user.email,
        billing_name=checkout_data.billing_name or current_user.name,
        billing_address=checkout_data.billing_address,
        billing_city=checkout_data.billing_city,
        billing_state=checkout_data.billing_state,
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
            price_at_purchase=cart_item.product.price,
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

    # Get Tilopay SDK token for embedded checkout
    token_response = await tilopay_service.get_sdk_token()

    if not token_response.get("token"):
        payment.status = PaymentStatus.FAILED
        order.status = OrderStatus.CANCELLED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Tilopay SDK token: {token_response.get('message', 'Unknown error')}",
        )

    # Store order ID in payment
    payment.tilopay_order_id = str(payment.id)
    db.commit()

    # DON'T clear cart yet - wait for payment webhook to confirm
    # This way if payment fails, user still has items in cart

    logger.info(f"Checkout session created: order={order.id}, payment={payment.id}, user={current_user.id}")

    # Extract first and last names from billing name
    first_name = ""
    last_name = ""
    if order.billing_name:
        name_parts = order.billing_name.split()
        first_name = name_parts[0] if name_parts else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    # Return SDK token and payment info for frontend to initialize Tilopay SDK
    return {
        "order_id": str(order.id),
        "payment_id": str(payment.id),
        "tilopay_key": token_response.get("token"),
        "order_number": str(payment.id),
        "amount": float(total),
        "currency": "USD",
        "description": f"Order #{order.order_number} - {len(order.items)} item(s)",
        "customer_email": order.billing_email,
        "customer_name": order.billing_name,
        "first_name": first_name,
        "last_name": last_name,
        "address": order.billing_address or "",
        "city": order.billing_city or "",
        "state": order.billing_state or "",
        "zip_code": order.billing_postal_code or "",
        "country": order.billing_country or "",
        "telephone": "",
        "total": float(total),
    }


@router.post("/course")
async def create_course_payment(
    course_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a payment for course enrollment.

    Creates payment record and returns Tilopay payment data for embedded checkout.
    """
    # Get course by ID
    course_id = course_data.get("course_id")
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing_enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course.id,
        )
        .first()
    )

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Check if course is free
    if not course.price or course.price <= 0:
        raise HTTPException(status_code=400, detail="This course is free")

    # Apply member discount if applicable
    discount_info = DiscountService.get_course_discount(current_user, course, db)
    final_price = discount_info["discounted_price"]

    logger.info(f"Course enrollment: user={current_user.id}, course={course.id}, original=${discount_info['original_price']}, discounted=${final_price}, discount={discount_info['discount_percentage']}%")

    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        amount=final_price,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=PaymentType.COURSE,
        reference_id=str(course.id),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create embedded payment with Tilopay
    tilopay_response = await tilopay_service.create_embedded_payment(
        amount=float(course.price),
        currency="USD",
        order_id=str(payment.id),
        description=f"Course Enrollment: {course.title}",
        customer_email=current_user.email,
        customer_name=current_user.name,
    )

    if not tilopay_response.get("success"):
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment session",
        )

    # Update payment with Tilopay details
    payment.tilopay_order_id = tilopay_response.get("order_id")
    db.commit()

    logger.info(f"Course payment created: payment={payment.id}, course={course.id}, user={current_user.id}")

    return {
        "payment_id": str(payment.id),
        "order_id": tilopay_response.get("order_id"),
        "payment_data": tilopay_response.get("payment_data"),
        "course": {
            "id": str(course.id),
            "title": course.title,
            "price": float(course.price),
        },
    }


@router.post("/membership")
async def create_membership_payment(
    membership_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a payment for membership upgrade/subscription.

    Supports:
    - GYANI: 10-day free trial (card required, charge after trial)
    - PRAGYANI/PRAGYANI_PLUS: Monthly recurring or annual upfront

    Args:
        membership_data: Dict with tier, frequency (monthly/annual), trial (boolean)

    Returns:
        Payment data for Tilopay SDK initialization with subscription parameter
    """
    tier = membership_data.get("tier")
    frequency = membership_data.get("frequency", "monthly")  # monthly or annual
    trial = membership_data.get("trial", False)  # GYANI 10-day trial

    # Validate tier
    valid_tiers = ["gyani", "pragyani", "pragyani_plus"]
    if tier not in valid_tiers:
        raise HTTPException(status_code=400, detail=f"Invalid tier. Must be one of: {valid_tiers}")

    # Validate frequency
    if frequency not in ["monthly", "annual"]:
        raise HTTPException(status_code=400, detail="Frequency must be 'monthly' or 'annual'")

    # Check if user already has this tier or higher
    current_tier_value = {"free": 0, "gyani": 1, "pragyani": 2, "pragyani_plus": 3}
    requested_tier_value = current_tier_value.get(tier, 0)
    user_tier_value = current_tier_value.get(current_user.membership_tier.value, 0)

    if user_tier_value >= requested_tier_value:
        raise HTTPException(status_code=400, detail=f"You already have {current_user.membership_tier.value} membership")

    # Get pricing from MembershipTier table
    membership_tier = db.query(MembershipTier).filter(MembershipTier.name == tier).first()

    if not membership_tier:
        # Fallback to hardcoded pricing if tier not in DB
        pricing = {
            "gyani": {"monthly": 15.00, "annual": 150.00},
            "pragyani": {"monthly": 47.00, "annual": 470.00},
            "pragyani_plus": {"monthly": 97.00, "annual": 970.00},
        }
        amount = pricing[tier][frequency]
    else:
        amount = float(membership_tier.price_monthly if frequency == "monthly" else membership_tier.price_annual)

    # For GYANI trial, amount is still charged but after 10 days
    trial_days = 10 if (tier == "gyani" and trial) else 0

    # Determine subscription type for Tilopay
    is_recurring = (frequency == "monthly")  # Monthly = recurring, Annual = one-time

    # Create payment record with metadata
    payment = Payment(
        user_id=current_user.id,
        amount=amount,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=PaymentType.MEMBERSHIP,
        reference_id=f"{tier}:{frequency}",  # Store tier:frequency combo
        payment_metadata={
            "tier": tier,
            "frequency": frequency,
            "trial_days": trial_days,
            "is_subscription": is_recurring,
        },
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

    logger.info(f"Membership payment created: payment={payment.id}, tier={tier}, frequency={frequency}, trial={trial_days}d, user={current_user.id}")

    # Return SDK token and payment info for frontend
    # Frontend will use subscription: 1 for monthly, subscription: 0 for annual
    return {
        "payment_id": str(payment.id),
        "tilopay_key": token_response.get("token"),
        "order_number": str(payment.id),
        "amount": float(amount),
        "currency": "USD",
        "description": f"Membership Upgrade: {tier.upper()} ({frequency}){' - 10 Day Free Trial' if trial_days > 0 else ''}",
        "customer_email": current_user.email,
        "customer_name": current_user.name,
        "first_name": current_user.name.split()[0] if current_user.name else "",
        "last_name": " ".join(current_user.name.split()[1:]) if current_user.name and len(current_user.name.split()) > 1 else "",
        "tier": tier,
        "frequency": frequency,
        "trial_days": trial_days,
        "is_subscription": is_recurring,  # Frontend uses this to set subscription: 1 or 0
    }


@router.get("/subscription/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's active subscription details."""
    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id)
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if not subscription:
        return {
            "has_subscription": False,
            "tier": current_user.membership_tier.value,
            "status": "free",
        }

    return {
        "has_subscription": True,
        "subscription_id": str(subscription.id),
        "tier": subscription.tier,
        "status": subscription.status.value,
        "start_date": subscription.start_date.isoformat(),
        "end_date": subscription.end_date.isoformat() if subscription.end_date else None,
        "auto_renew": subscription.auto_renew,
        "payment_id": str(subscription.payment_id) if subscription.payment_id else None,
    }


@router.get("/all")
async def get_all_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all payments for admin dashboard.
    Returns all payment records with user, product, course, and retreat details.

    Admin only endpoint.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get all payments ordered by most recent
    payments = (
        db.query(Payment)
        .order_by(Payment.created_at.desc())
        .all()
    )

    # Transform to frontend format
    result = []
    for payment in payments:
        # Get user details
        user = payment.user

        # Get item details based on payment type
        item_name = "N/A"
        order_type = payment.payment_type.value.capitalize()

        if payment.payment_type == PaymentType.PRODUCT and payment.reference_id:
            # For products, get order and product names
            order = db.query(Order).filter(Order.id == payment.reference_id).first()
            if order and order.items:
                item_names = [item.product.title for item in order.items if item.product]
                item_name = ", ".join(item_names) if item_names else "N/A"
        elif payment.payment_type == PaymentType.COURSE and payment.reference_id:
            course = db.query(Course).filter(Course.id == payment.reference_id).first()
            item_name = course.title if course else "N/A"
        elif payment.payment_type == PaymentType.RETREAT and payment.reference_id:
            retreat = db.query(Retreat).filter(Retreat.id == payment.reference_id).first()
            item_name = retreat.title if retreat else "N/A"
        elif payment.payment_type == PaymentType.MEMBERSHIP:
            # Get tier from metadata
            if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
                tier = payment.payment_metadata.get('tier', '').upper()
                item_name = f"{tier} Membership"
            else:
                item_name = "Membership"

        result.append({
            "id": str(payment.id),
            "user": {
                "id": str(user.id) if user else None,
                "email": user.email if user else "Anonymous",
                "name": user.name if user else "Anonymous",
            },
            "order_type": order_type,
            "amount": float(payment.amount),
            "status": payment.status.value,
            "payment_method": payment.payment_method or "Tilopay",
            "created_at": payment.created_at.isoformat(),
            "tilopay_order_number": payment.tilopay_transaction_id or payment.tilopay_order_id,
            "product": {"name": item_name} if payment.payment_type == PaymentType.PRODUCT else None,
            "course": {"name": item_name} if payment.payment_type == PaymentType.COURSE else None,
            "retreat": {"name": item_name} if payment.payment_type == PaymentType.RETREAT else None,
        })

    return result


@router.get("/donations")
async def get_all_donations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all donations for admin dashboard.
    Returns all donation payments with user details and messages.

    Admin only endpoint.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get all donation payments ordered by most recent
    # Donations are payments with payment_type = DONATION or reference_id is None/empty
    donations = (
        db.query(Payment)
        .filter(Payment.payment_type == PaymentType.DONATION)
        .order_by(Payment.created_at.desc())
        .all()
    )

    # Transform to frontend format
    result = []
    for payment in donations:
        user = payment.user

        # Extract donation message from metadata if exists
        donation_message = None
        if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
            donation_message = payment.payment_metadata.get('message')

        result.append({
            "id": str(payment.id),
            "user": {
                "id": str(user.id) if user else None,
                "email": user.email if user else "Anonymous",
                "name": user.name if user else "Anonymous Donor",
            },
            "amount": float(payment.amount),
            "status": payment.status.value,
            "payment_method": payment.payment_method or "Tilopay",
            "created_at": payment.created_at.isoformat(),
            "tilopay_order_number": payment.tilopay_transaction_id or payment.tilopay_order_id,
            "donation_message": donation_message,
        })

    return result


@router.post("/subscription/cancel")
async def cancel_subscription(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cancel the user's active subscription.

    This will:
    1. Mark subscription as CANCELLED
    2. Disable auto-renewal
    3. Cancel recurring billing with Tilopay (if subscription ID exists)
    4. User keeps access until end_date
    5. Send cancellation confirmation email
    """
    # Find active subscription (including TRIAL status)
    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id,
            Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]),
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")

    # Store original values for logging
    original_status = subscription.status
    tier = subscription.tier
    access_until = subscription.end_date or subscription.trial_end_date

    # Cancel Tilopay recurring billing if we have a subscription ID
    tilopay_cancelled = False
    if subscription.tilopay_subscription_id:
        try:
            # TODO: Implement when Tilopay provides API documentation
            # response = await tilopay_service.cancel_recurring_billing(
            #     subscription_id=subscription.tilopay_subscription_id
            # )
            # if response.get("success"):
            #     tilopay_cancelled = True
            #     logger.info(f"Tilopay subscription cancelled: {subscription.tilopay_subscription_id}")
            # else:
            #     logger.warning(f"Failed to cancel Tilopay subscription: {response.get('error')}")

            # For now, just log that we would cancel
            logger.warning(
                f"[CANCEL] Tilopay subscription ID exists ({subscription.tilopay_subscription_id}) "
                f"but cancellation API not yet implemented. Marking as cancelled locally."
            )
        except Exception as e:
            logger.error(f"Error cancelling Tilopay subscription: {e}")
            # Continue with local cancellation even if Tilopay fails

    # Mark subscription as cancelled locally
    subscription.status = SubscriptionStatus.CANCELLED
    subscription.auto_renew = False
    db.commit()

    logger.info(
        f"Subscription cancelled: subscription={subscription.id}, user={current_user.id}, "
        f"tier={tier}, status={original_status}→CANCELLED, access_until={access_until}"
    )

    # Send cancellation confirmation email in background
    background_tasks.add_task(
        send_cancellation_email,
        user_email=current_user.email,
        user_name=current_user.name,
        tier=tier,
        access_until=access_until,
    )

    # Track cancellation in analytics
    background_tasks.add_task(
        track_subscription_cancellation,
        user_id=str(current_user.id),
        tier=tier,
        reason="user_requested",
    )

    return {
        "success": True,
        "message": "Subscription cancelled successfully. You will retain access until your billing period ends.",
        "tier": tier,
        "access_until": access_until.isoformat() if access_until else None,
        "cancelled_at": datetime.utcnow().isoformat(),
        "tilopay_cancelled": tilopay_cancelled,
    }


@router.post("/webhook")
async def tilopay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Handle Tilopay webhook notifications."""
    logger.info(f"[WEBHOOK] ========== Tilopay Webhook Called ==========")
    logger.info(f"[WEBHOOK] Headers: {dict(request.headers)}")

    # Get webhook payload
    try:
        payload = await request.json()
        logger.info(f"[WEBHOOK] Payload: {payload}")
    except Exception as e:
        logger.error(f"[WEBHOOK] Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Verify webhook signature (if provided in header)
    signature = request.headers.get("X-Tilopay-Signature")
    if signature:
        logger.info(f"[WEBHOOK] Verifying signature: {signature}")
        if not tilopay_service.verify_webhook_signature(payload, signature):
            logger.warning(f"[WEBHOOK] Invalid webhook signature for payload: {payload}")
            raise HTTPException(status_code=401, detail="Invalid signature")
    else:
        logger.info(f"[WEBHOOK] No signature provided in headers")

    # Process webhook
    webhook_data = await tilopay_service.process_webhook(payload)

    logger.info(f"[WEBHOOK] Processing webhook for transaction {webhook_data.get('transaction_id')}, order {webhook_data.get('order_id')}")

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
    import uuid as uuid_lib

    db = SessionLocal()
    try:
        logger.info(f"[GRANT_ACCESS] Starting for payment_id={payment_id}, user_id={user_id}, type={payment_type}, ref={reference_id}")

        # Convert string IDs to UUID for database queries
        try:
            payment_uuid = uuid_lib.UUID(payment_id) if isinstance(payment_id, str) else payment_id
            user_uuid = uuid_lib.UUID(user_id) if isinstance(user_id, str) else user_id
            reference_uuid = uuid_lib.UUID(reference_id) if reference_id and isinstance(reference_id, str) else reference_id
        except ValueError as e:
            logger.error(f"[GRANT_ACCESS] Invalid UUID format: {e}")
            return

        payment = db.query(Payment).filter(Payment.id == payment_uuid).first()
        if not payment:
            logger.error(f"[GRANT_ACCESS] Payment not found: {payment_id}")
            return

        if payment.status != PaymentStatus.COMPLETED:
            logger.warning(f"[GRANT_ACCESS] Payment {payment_id} not completed (status={payment.status})")
            return

        logger.info(f"[GRANT_ACCESS] Payment found and completed. Metadata: {payment.payment_metadata}")

        # Course enrollment
        if payment_type == PaymentType.COURSE.value and reference_uuid:
            logger.info(f"[GRANT_ACCESS] Processing course enrollment")
            enrollment = (
                db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.user_id == user_uuid,
                    CourseEnrollment.course_id == reference_uuid,
                )
                .first()
            )
            if enrollment:
                enrollment.payment_id = payment.id
                enrollment.status = EnrollmentStatus.ACTIVE
                db.commit()
                logger.info(f"[GRANT_ACCESS] ✓ Course access granted: user={user_id}, course={reference_id}")
            else:
                logger.warning(f"[GRANT_ACCESS] No enrollment found for user {user_id}, course {reference_id}")

        # Retreat registration
        elif payment_type == PaymentType.RETREAT.value and reference_uuid:
            logger.info(f"[GRANT_ACCESS] Processing retreat registration")

            # Check if this is an application payment
            is_application = False
            submission_id = None
            order_id = None
            if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
                is_application = payment.payment_metadata.get('is_application', False)
                submission_id = payment.payment_metadata.get('submission_id')
                order_id = payment.payment_metadata.get('order_id')
                logger.info(f"[GRANT_ACCESS] Application payment check: is_application={is_application}, submission_id={submission_id}")

            # Update FormSubmission if this is an application payment
            if is_application and submission_id:
                try:
                    from ..models.form_templates import FormSubmission
                    submission_uuid = uuid_lib.UUID(submission_id) if isinstance(submission_id, str) else submission_id
                    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_uuid).first()
                    if submission:
                        submission.status = "paid"
                        # Also update order_id if we have it
                        if order_id:
                            order_uuid = uuid_lib.UUID(order_id) if isinstance(order_id, str) else order_id
                            submission.order_id = order_uuid
                        db.commit()
                        logger.info(f"[GRANT_ACCESS] ✓ Updated FormSubmission {submission_id} status to 'paid'")
                    else:
                        logger.warning(f"[GRANT_ACCESS] FormSubmission {submission_id} not found")
                except Exception as e:
                    logger.error(f"[GRANT_ACCESS] Error updating FormSubmission: {e}")

            # Get access_type from payment metadata
            access_type_str = None
            if payment.payment_metadata:
                logger.info(f"[GRANT_ACCESS] Payment metadata type: {type(payment.payment_metadata)}")
                if isinstance(payment.payment_metadata, dict):
                    access_type_str = payment.payment_metadata.get('access_type')
                    logger.info(f"[GRANT_ACCESS] Extracted access_type from metadata: {access_type_str}")
                else:
                    logger.error(f"[GRANT_ACCESS] Payment metadata is not a dict: {payment.payment_metadata}")
            else:
                logger.error(f"[GRANT_ACCESS] No payment metadata found for retreat payment {payment_id}")

            # Convert string to enum
            access_type = None
            if access_type_str:
                try:
                    from ..models.retreat import AccessType
                    access_type = AccessType(access_type_str)
                    logger.info(f"[GRANT_ACCESS] Converted to AccessType enum: {access_type}")
                except ValueError as e:
                    logger.error(f"[GRANT_ACCESS] Invalid access_type '{access_type_str}': {e}")

            # Check for existing registration
            registration = (
                db.query(RetreatRegistration)
                .filter(
                    RetreatRegistration.user_id == user_uuid,
                    RetreatRegistration.retreat_id == reference_uuid,
                )
                .first()
            )

            if registration:
                # Update existing registration
                logger.info(f"[GRANT_ACCESS] Found existing registration, updating...")
                registration.payment_id = payment.id
                registration.status = RegistrationStatus.CONFIRMED
                if access_type:
                    registration.access_type = access_type
                db.commit()
                db.refresh(registration)
                logger.info(f"[GRANT_ACCESS] ✓ Updated retreat registration: id={registration.id}, user={user_id}, retreat={reference_id}, access={access_type_str}")
            else:
                # Create new registration if metadata contains access_type
                logger.info(f"[GRANT_ACCESS] No existing registration found, creating new one...")
                if access_type:
                    from ..models.retreat import Retreat
                    from datetime import timedelta

                    retreat = db.query(Retreat).filter(Retreat.id == reference_uuid).first()
                    if retreat:
                        logger.info(f"[GRANT_ACCESS] Found retreat: {retreat.title}")

                        # Calculate expiration for 12-day access (after retreat ends)
                        access_expires_at = None
                        if access_type == AccessType.LIMITED_12DAY:
                            if retreat.end_date:
                                access_expires_at = retreat.end_date + timedelta(days=12)
                                logger.info(f"[GRANT_ACCESS] 12-day access expires: {access_expires_at}")
                            else:
                                from datetime import datetime
                                access_expires_at = datetime.utcnow() + timedelta(days=12)
                                logger.info(f"[GRANT_ACCESS] No retreat end_date, expires in 12 days: {access_expires_at}")

                        registration = RetreatRegistration(
                            user_id=user_uuid,
                            retreat_id=reference_uuid,
                            access_type=access_type,
                            payment_id=payment.id,
                            status=RegistrationStatus.CONFIRMED,
                            access_expires_at=access_expires_at
                        )
                        db.add(registration)
                        db.commit()
                        db.refresh(registration)
                        logger.info(f"[GRANT_ACCESS] ✓✓✓ Created new retreat registration: id={registration.id}, user={user_id}, retreat={reference_id}, access={access_type_str}, expires={access_expires_at}")
                    else:
                        logger.error(f"[GRANT_ACCESS] Retreat not found with ID: {reference_id}")
                else:
                    logger.error(f"[GRANT_ACCESS] Cannot create registration: no access_type in metadata (metadata={payment.payment_metadata})")

        # Product purchase
        elif payment_type == PaymentType.PRODUCT.value and reference_uuid:
            logger.info(f"[GRANT_ACCESS] Processing product purchase")
            order = db.query(Order).filter(Order.id == reference_uuid).first()
            if order:
                order.status = OrderStatus.COMPLETED
                order.payment_id = payment.id

                # Grant access to products
                for item in order.items:
                    # Check if access already exists
                    existing_access = (
                        db.query(UserProductAccess)
                        .filter(
                            UserProductAccess.user_id == user_uuid,
                            UserProductAccess.product_id == item.product_id,
                        )
                        .first()
                    )
                    if not existing_access:
                        access = UserProductAccess(
                            user_id=user_uuid,
                            product_id=item.product_id,
                            order_id=order.id,
                        )
                        db.add(access)

                    # Check if product is linked to a retreat for instant portal access
                    product_obj = db.query(Product).filter(Product.id == item.product_id).first()
                    if product_obj and product_obj.retreat_id:
                        logger.info(f"[GRANT_ACCESS] Product {item.product_id} is linked to retreat {product_obj.retreat_id}, checking registration...")

                        # Check if user already has registration for this retreat
                        existing_registration = (
                            db.query(RetreatRegistration)
                            .filter(
                                RetreatRegistration.user_id == user_uuid,
                                RetreatRegistration.retreat_id == product_obj.retreat_id,
                            )
                            .first()
                        )

                        if not existing_registration:
                            # Create retreat registration with lifetime access
                            retreat_registration = RetreatRegistration(
                                user_id=user_uuid,
                                retreat_id=product_obj.retreat_id,
                                access_type=AccessType.LIFETIME,
                                payment_id=payment.id,
                                status=RegistrationStatus.CONFIRMED,
                            )
                            db.add(retreat_registration)
                            logger.info(f"[GRANT_ACCESS] ✓✓✓ Created retreat registration: user={user_id}, retreat={product_obj.retreat_id}, product={product_obj.slug}, access=lifetime")
                        else:
                            logger.info(f"[GRANT_ACCESS] Retreat registration already exists: user={user_id}, retreat={product_obj.retreat_id}")

                # Grant book group access if product is a book group portal access
                logger.info(f"[GRANT_ACCESS] Checking for book group products in order...")
                for item in order.items:
                    product_obj = db.query(Product).filter(Product.id == item.product_id).first()
                    if product_obj and product_obj.type == ProductType.BOOK_GROUP_PORTAL_ACCESS:
                        logger.info(f"[GRANT_ACCESS] Found book group product: {product_obj.slug}")
                        from ..services.book_group_service import BookGroupService
                        book_group_access = BookGroupService.grant_access_on_purchase(
                            db=db,
                            user_id=str(user_uuid),
                            order_id=str(order.id),
                            product_id=str(product_obj.id)
                        )
                        if book_group_access:
                            logger.info(f"[GRANT_ACCESS] ✓✓✓ Book group access granted: user={user_id}, product={product_obj.slug}")
                        else:
                            logger.warning(f"[GRANT_ACCESS] Could not grant book group access for product {product_obj.slug}")

                # Clear user's cart after successful purchase
                logger.info(f"[GRANT_ACCESS] Checking for cart to clear for user {user_id}")
                cart = db.query(Cart).filter(Cart.user_id == user_uuid).first()
                if cart:
                    cart_item_count = len(cart.items)
                    logger.info(f"[GRANT_ACCESS] Found cart with {cart_item_count} items, clearing...")
                    for cart_item in cart.items:
                        logger.info(f"[GRANT_ACCESS] Deleting cart item: product_id={cart_item.product_id}, quantity={cart_item.quantity}")
                        db.delete(cart_item)
                    logger.info(f"[GRANT_ACCESS] ✓ Cart cleared: {cart_item_count} items removed for user {user_id}")
                else:
                    logger.info(f"[GRANT_ACCESS] No cart found for user {user_id}")

                db.commit()
                logger.info(f"[GRANT_ACCESS] ✓ Product access granted: user={user_id}, order={reference_id}")
            else:
                logger.error(f"[GRANT_ACCESS] Order not found: {reference_id}")

        # Membership subscription
        elif payment_type == PaymentType.MEMBERSHIP.value:
            logger.info(f"[GRANT_ACCESS] Processing membership subscription")

            # Get tier and frequency from payment metadata
            tier = None
            frequency = None
            trial_days = 0

            if payment.payment_metadata:
                logger.info(f"[GRANT_ACCESS] Payment metadata: {payment.payment_metadata}")
                if isinstance(payment.payment_metadata, dict):
                    tier = payment.payment_metadata.get('tier')
                    frequency = payment.payment_metadata.get('frequency', 'monthly')
                    trial_days = payment.payment_metadata.get('trial_days', 0)
                    logger.info(f"[GRANT_ACCESS] Extracted tier={tier}, frequency={frequency}, trial_days={trial_days}")
                else:
                    logger.error(f"[GRANT_ACCESS] Payment metadata is not a dict: {payment.payment_metadata}")
            else:
                logger.error(f"[GRANT_ACCESS] No payment metadata found for membership payment {payment_id}")

            if not tier:
                logger.error(f"[GRANT_ACCESS] Cannot grant membership: no tier in metadata")
                return

            # Validate tier
            tier_mapping = {
                "gyani": MembershipTierEnum.GYANI,
                "pragyani": MembershipTierEnum.PRAGYANI,
                "pragyani_plus": MembershipTierEnum.PRAGYANI_PLUS,
            }

            if tier not in tier_mapping:
                logger.error(f"[GRANT_ACCESS] Invalid tier: {tier}")
                return

            membership_tier_enum = tier_mapping[tier]

            # Get user
            user = db.query(User).filter(User.id == user_uuid).first()
            if not user:
                logger.error(f"[GRANT_ACCESS] User not found: {user_id}")
                return

            # Calculate subscription dates
            from datetime import datetime, timedelta
            start_date = datetime.utcnow()

            # Determine subscription status and dates based on trial
            if trial_days > 0:
                # Trial subscription: user gets access immediately, but first charge is after trial
                subscription_status = SubscriptionStatus.TRIAL
                trial_end_date = start_date + timedelta(days=trial_days)
                # Set end_date to None for trial - will be set after first charge
                end_date = None
                logger.info(f"[GRANT_ACCESS] Trial period: {trial_days} days, trial ends on {trial_end_date}")
            else:
                # Regular subscription: charged immediately
                subscription_status = SubscriptionStatus.ACTIVE
                trial_end_date = None
                if frequency == "monthly":
                    end_date = start_date + timedelta(days=30)
                else:  # annual
                    end_date = start_date + timedelta(days=365)

            # Update user membership - grant access immediately (even during trial)
            user.membership_tier = membership_tier_enum
            user.membership_start_date = start_date
            user.membership_end_date = end_date if end_date else trial_end_date  # Use trial_end_date if no end_date

            # Create or update subscription record
            subscription = (
                db.query(Subscription)
                .filter(Subscription.user_id == user_uuid)
                .order_by(Subscription.created_at.desc())
                .first()
            )

            if subscription and subscription.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
                # Update existing subscription
                logger.info(f"[GRANT_ACCESS] Updating existing subscription: {subscription.id}")
                subscription.tier = tier
                subscription.frequency = frequency
                subscription.status = subscription_status
                subscription.start_date = start_date
                subscription.end_date = end_date
                subscription.trial_end_date = trial_end_date
                subscription.payment_id = payment.id
                subscription.auto_renew = (frequency == "monthly")  # Only monthly auto-renews
            else:
                # Create new subscription
                logger.info(f"[GRANT_ACCESS] Creating new subscription with status={subscription_status}")
                subscription = Subscription(
                    user_id=user_uuid,
                    tier=tier,
                    frequency=frequency,
                    status=subscription_status,
                    start_date=start_date,
                    end_date=end_date,
                    trial_end_date=trial_end_date,
                    payment_id=payment.id,
                    auto_renew=(frequency == "monthly"),
                )
                db.add(subscription)

            db.commit()
            db.refresh(user)
            db.refresh(subscription)
            logger.info(f"[GRANT_ACCESS] ✓ Membership access granted: user={user_id}, tier={tier}, start={start_date}, end={end_date}, subscription={subscription.id}")

    except Exception as e:
        logger.error(f"[GRANT_ACCESS] ⚠️ Error granting access for payment {payment_id}: {e}", exc_info=True)
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


async def send_cancellation_email(
    user_email: str,
    user_name: str,
    tier: str,
    access_until: Optional[datetime]
):
    """Send subscription cancellation confirmation email."""
    try:
        subject = "Subscription Cancellation Confirmed - Sat Yoga Institute"

        tier_display = {
            "gyani": "Gyani",
            "pragyani": "Pragyani",
            "pragyani_plus": "Pragyani Plus",
        }.get(tier, tier.title())

        access_until_str = access_until.strftime('%B %d, %Y') if access_until else "the end of your billing period"

        content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Subscription Cancellation Confirmed</h2>
            <p>Dear {user_name},</p>

            <p>We've received your request to cancel your <strong>{tier_display}</strong> membership subscription.</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #7D1A13; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #7D1A13;">Important Information:</h3>
                <ul style="margin-bottom: 0;">
                    <li>Your subscription has been successfully cancelled</li>
                    <li>You will retain full access to all {tier_display} features until <strong>{access_until_str}</strong></li>
                    <li>No further charges will be made to your payment method</li>
                    <li>Your account will automatically revert to FREE tier after access expires</li>
                </ul>
            </div>

            <p>If you change your mind, you can reactivate your subscription at any time by visiting your account settings.</p>

            <p>We're sorry to see you go, but we hope you've enjoyed your time with Sat Yoga Institute. You're always welcome back!</p>

            <p>If you cancelled by mistake or have any questions, please reply to this email or contact us at support@satyoga.org</p>

            <p>With gratitude,<br>Sat Yoga Institute Team</p>
        </body>
        </html>
        """

        await sendgrid_service.send_email(
            to_email=user_email,
            subject=subject,
            html_content=content,
        )

        logger.info(f"Cancellation confirmation email sent to {user_email} for {tier} subscription")

    except Exception as e:
        logger.error(f"Error sending cancellation email: {e}")


async def track_subscription_cancellation(user_id: str, tier: str, reason: str):
    """Track subscription cancellation in analytics."""
    try:
        # Track in Mixpanel
        await mixpanel_service.track(
            str(user_id),
            "subscription_cancelled",
            {
                "tier": tier,
                "reason": reason,
                "cancelled_at": datetime.utcnow().isoformat(),
            }
        )

        # Track in GA4
        await ga4_service.track_event(
            str(user_id),
            "subscription_cancel",
            {
                "subscription_tier": tier,
                "cancellation_reason": reason,
            }
        )

        logger.info(f"Subscription cancellation tracked in analytics: user={user_id}, tier={tier}")

    except Exception as e:
        logger.error(f"Error tracking subscription cancellation: {e}")


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


@router.get("/recent-retreat")
async def get_recent_retreat_payment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the most recent retreat payment for the current user.
    Used for polling payment status after Tilopay payment.
    """
    from sqlalchemy import desc

    # Get the most recent retreat payment for this user
    payment = (
        db.query(Payment)
        .filter(
            Payment.user_id == current_user.id,
            Payment.payment_type == PaymentType.RETREAT,
        )
        .order_by(desc(Payment.created_at))
        .first()
    )

    if not payment:
        raise HTTPException(status_code=404, detail="No retreat payment found")

    return {
        "payment_id": str(payment.id),
        "status": payment.status.value,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "reference_id": payment.reference_id,
        "created_at": payment.created_at.isoformat(),
    }


@router.post("/confirm-redirect")
async def confirm_payment_redirect(
    redirect_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Handle payment confirmation from Tilopay redirect.
    When user is redirected back after successful payment, confirm and enroll.
    """
    order_id = redirect_data.get("order")
    tilopay_transaction_id = redirect_data.get("tilopay-transaction")
    code = redirect_data.get("code")

    logger.info(f"[CONFIRM_REDIRECT] ========== Payment Redirect Confirmation Started ==========")
    logger.info(f"[CONFIRM_REDIRECT] Order: {order_id}, Transaction: {tilopay_transaction_id}, Code: {code}, User: {current_user.id}")
    logger.info(f"[CONFIRM_REDIRECT] Full redirect data: {redirect_data}")

    # Find payment by order ID
    payment = db.query(Payment).filter(Payment.tilopay_order_id == order_id).first()

    if not payment:
        # Payment record doesn't exist - create it retroactively
        logger.error(f"[CONFIRM_REDIRECT] Payment not found for order {order_id}")
        raise HTTPException(status_code=404, detail="Payment record not found")

    logger.info(f"[CONFIRM_REDIRECT] Found payment: id={payment.id}, type={payment.payment_type}, status={payment.status}, amount={payment.amount}")

    # Update payment with transaction ID and mark as completed if code=1 (approved)
    if code == "1" and tilopay_transaction_id:
        payment.tilopay_transaction_id = tilopay_transaction_id
        payment.status = PaymentStatus.COMPLETED
        payment.payment_method = redirect_data.get("brand", "Card")
        db.commit()

        logger.info(f"Payment {payment.id} confirmed and marked as completed")

        # Grant access immediately (synchronously for redirect case)
        if payment.payment_type == PaymentType.COURSE and payment.reference_id:
            # Check if already enrolled
            enrollment = (
                db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.user_id == current_user.id,
                    CourseEnrollment.course_id == payment.reference_id,
                )
                .first()
            )

            if not enrollment:
                # Create enrollment
                enrollment = CourseEnrollment(
                    user_id=current_user.id,
                    course_id=payment.reference_id,
                    payment_id=payment.id,
                    status=EnrollmentStatus.ACTIVE,
                )
                db.add(enrollment)
                db.commit()
                logger.info(f"Created enrollment: user={current_user.id}, course={payment.reference_id}")
            else:
                # Update existing enrollment
                enrollment.payment_id = payment.id
                enrollment.status = EnrollmentStatus.ACTIVE
                db.commit()
                logger.info(f"Updated enrollment: user={current_user.id}, course={payment.reference_id}")

        # Handle retreat registration
        elif payment.payment_type == PaymentType.RETREAT and payment.reference_id:
            from ..models.retreat import Retreat
            from datetime import timedelta

            logger.info(f"[CONFIRM_REDIRECT] ========== Processing Retreat Registration ==========")
            logger.info(f"[CONFIRM_REDIRECT] Payment ID: {payment.id}, Retreat ID: {payment.reference_id}")
            logger.info(f"[CONFIRM_REDIRECT] Payment metadata: {payment.payment_metadata}")

            # Get access_type from payment metadata
            access_type_str = None
            if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
                access_type_str = payment.payment_metadata.get('access_type')
                logger.info(f"[CONFIRM_REDIRECT] Extracted access_type from metadata: {access_type_str}")
            else:
                logger.error(f"[CONFIRM_REDIRECT] Payment metadata is missing or invalid: {payment.payment_metadata}")

            # Convert string to enum
            access_type = None
            if access_type_str:
                try:
                    access_type = AccessType(access_type_str)
                    logger.info(f"[CONFIRM_REDIRECT] Converted to AccessType enum: {access_type}")
                except ValueError as e:
                    logger.error(f"[CONFIRM_REDIRECT] Invalid access_type '{access_type_str}': {e}")
            else:
                logger.error(f"[CONFIRM_REDIRECT] No access_type_str found, cannot create registration")

            # Check if already registered
            logger.info(f"[CONFIRM_REDIRECT] Checking for existing registration: user={current_user.id}, retreat={payment.reference_id}")
            registration = (
                db.query(RetreatRegistration)
                .filter(
                    RetreatRegistration.user_id == current_user.id,
                    RetreatRegistration.retreat_id == payment.reference_id,
                )
                .first()
            )

            if registration:
                logger.info(f"[CONFIRM_REDIRECT] Found existing registration: id={registration.id}, status={registration.status}")
            else:
                logger.info(f"[CONFIRM_REDIRECT] No existing registration found")

            if not registration and access_type:
                # Create new registration
                logger.info(f"[CONFIRM_REDIRECT] Creating new retreat registration...")
                retreat = db.query(Retreat).filter(Retreat.id == payment.reference_id).first()
                if retreat:
                    logger.info(f"[CONFIRM_REDIRECT] Found retreat: {retreat.title} (id={retreat.id})")
                    # Calculate expiration for 12-day access
                    access_expires_at = None
                    if access_type == AccessType.LIMITED_12DAY:
                        if retreat.end_date:
                            access_expires_at = retreat.end_date + timedelta(days=12)
                            logger.info(f"[CONFIRM_REDIRECT] Calculated 12-day expiration: {access_expires_at}")
                        else:
                            access_expires_at = datetime.utcnow() + timedelta(days=12)
                            logger.info(f"[CONFIRM_REDIRECT] No retreat end_date, expires in 12 days: {access_expires_at}")

                    registration = RetreatRegistration(
                        user_id=current_user.id,
                        retreat_id=payment.reference_id,
                        access_type=access_type,
                        payment_id=payment.id,
                        status=RegistrationStatus.CONFIRMED,
                        access_expires_at=access_expires_at,
                    )
                    db.add(registration)
                    db.commit()
                    db.refresh(registration)
                    logger.info(f"[CONFIRM_REDIRECT] ✅✅✅ SUCCESS! Created retreat registration: id={registration.id}, user={current_user.id}, retreat={payment.reference_id}, access={access_type_str}, status={registration.status}")
                else:
                    logger.error(f"[CONFIRM_REDIRECT] ❌ Retreat not found with ID: {payment.reference_id}")
            elif registration:
                # Update existing registration
                logger.info(f"[CONFIRM_REDIRECT] Updating existing registration...")
                registration.payment_id = payment.id
                registration.status = RegistrationStatus.CONFIRMED
                if access_type:
                    registration.access_type = access_type
                db.commit()
                db.refresh(registration)
                logger.info(f"[CONFIRM_REDIRECT] ✅ Updated retreat registration: id={registration.id}, user={current_user.id}, retreat={payment.reference_id}, status={registration.status}")
            else:
                logger.error(f"[CONFIRM_REDIRECT] ❌ Cannot create registration: no access_type in metadata")

        # Handle product purchase
        elif payment.payment_type == PaymentType.PRODUCT and payment.reference_id:
            logger.info(f"[CONFIRM_REDIRECT] ========== Processing Product Purchase ==========")
            logger.info(f"[CONFIRM_REDIRECT] Payment ID: {payment.id}, Order ID: {payment.reference_id}")

            order = db.query(Order).filter(Order.id == payment.reference_id).first()
            if order:
                logger.info(f"[CONFIRM_REDIRECT] Found order: id={order.id}, items={len(order.items)}")
                order.status = OrderStatus.COMPLETED
                order.payment_id = payment.id

                # Grant access to all products in the order
                products_granted = []
                for item in order.items:
                    # Check if access already exists
                    existing_access = (
                        db.query(UserProductAccess)
                        .filter(
                            UserProductAccess.user_id == current_user.id,
                            UserProductAccess.product_id == item.product_id,
                        )
                        .first()
                    )
                    if not existing_access:
                        access = UserProductAccess(
                            user_id=current_user.id,
                            product_id=item.product_id,
                            order_id=order.id,
                        )
                        db.add(access)
                        products_granted.append(str(item.product_id))
                        logger.info(f"[CONFIRM_REDIRECT] Created access: product={item.product_id}")
                    else:
                        logger.info(f"[CONFIRM_REDIRECT] Access already exists: product={item.product_id}")

                    # Check if product is linked to a retreat for instant portal access
                    if item.product.retreat_id:
                        logger.info(f"[CONFIRM_REDIRECT] Product {item.product_id} is linked to retreat {item.product.retreat_id}, checking registration...")

                        # Check if user already has registration for this retreat
                        existing_registration = (
                            db.query(RetreatRegistration)
                            .filter(
                                RetreatRegistration.user_id == current_user.id,
                                RetreatRegistration.retreat_id == item.product.retreat_id,
                            )
                            .first()
                        )

                        if not existing_registration:
                            # Create retreat registration with lifetime access
                            retreat_registration = RetreatRegistration(
                                user_id=current_user.id,
                                retreat_id=item.product.retreat_id,
                                access_type=AccessType.LIFETIME,
                                payment_id=payment.id,
                                status=RegistrationStatus.CONFIRMED,
                            )
                            db.add(retreat_registration)
                            logger.info(f"[CONFIRM_REDIRECT] ✓✓✓ Created retreat registration: user={current_user.id}, retreat={item.product.retreat_id}, product={item.product.slug}, access=lifetime")
                        else:
                            logger.info(f"[CONFIRM_REDIRECT] Retreat registration already exists: user={current_user.id}, retreat={item.product.retreat_id}")

                # Clear user's cart after successful purchase
                logger.info(f"[CONFIRM_REDIRECT] Checking for cart to clear for user {current_user.id}")
                cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
                if cart:
                    cart_item_count = len(cart.items)
                    logger.info(f"[CONFIRM_REDIRECT] Found cart with {cart_item_count} items, clearing...")
                    for cart_item in cart.items:
                        logger.info(f"[CONFIRM_REDIRECT] Deleting cart item: product_id={cart_item.product_id}")
                        db.delete(cart_item)
                    logger.info(f"[CONFIRM_REDIRECT] ✓ Cart cleared: {cart_item_count} items removed")
                else:
                    logger.info(f"[CONFIRM_REDIRECT] No cart found for user {current_user.id}")

                db.commit()
                logger.info(f"[CONFIRM_REDIRECT] ✅✅✅ SUCCESS! Product access granted: order={order.id}, products={len(products_granted)}, user={current_user.id}")
            else:
                logger.error(f"[CONFIRM_REDIRECT] ❌ Order not found with ID: {payment.reference_id}")

        logger.info(f"[CONFIRM_REDIRECT] ========== Payment Redirect Confirmation Complete ==========")
        return {
            "success": True,
            "payment_id": str(payment.id),
            "enrolled": True,
        }
    else:
        logger.error(f"[CONFIRM_REDIRECT] ❌ Payment not approved: code={code}")
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="Payment was not approved")

