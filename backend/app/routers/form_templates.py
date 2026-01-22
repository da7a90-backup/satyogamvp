"""
API router for dynamic form templates
Endpoints for managing and submitting forms
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
import logging

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models import OldFormTemplate as FormTemplate, FormQuestion, OldFormSubmission as FormSubmission, User
from ..schemas.form_templates import (
    FormTemplateCreate,
    FormTemplateUpdate,
    FormTemplate as FormTemplateSchema,
    FormTemplateList,
    FormTemplateListResponse,
    FormTemplateResponse,
    FormSubmissionCreate,
    FormSubmissionUpdate,
    FormSubmission as FormSubmissionSchema,
    FormSubmissionResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ========== Public Endpoints (Form Viewing & Submission) ==========

@router.get("/public/{slug}", response_model=FormTemplateResponse)
def get_public_form_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get a form template by slug (public access)"""
    form = db.query(FormTemplate).filter(
        FormTemplate.slug == slug,
        FormTemplate.is_active == True
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Check if authentication is required
    if form.requires_auth and not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    return {"success": True, "data": form}


@router.post("/submit", response_model=FormSubmissionResponse)
async def submit_form(
    submission: FormSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Submit a form (public or authenticated) - auto-registers anonymous users"""
    # Get form template
    form = db.query(FormTemplate).filter(
        FormTemplate.id == submission.form_template_id,
        FormTemplate.is_active == True
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Check authentication requirements
    if form.requires_auth and not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if not form.allow_anonymous and not current_user:
        raise HTTPException(status_code=401, detail="Please log in to submit this form")

    # Auto-register anonymous users
    user_to_link = current_user
    user_was_created = False

    if not current_user and submission.submitter_email:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == submission.submitter_email).first()

        if existing_user:
            user_to_link = existing_user
        else:
            # Create new user with temporary password
            import secrets
            from ..core.security import get_password_hash

            temp_password = secrets.token_urlsafe(32)
            new_user = User(
                email=submission.submitter_email,
                name=submission.submitter_name or submission.submitter_email.split('@')[0],
                password_hash=get_password_hash(temp_password),
                is_active=True,
                is_admin=False,
                membership_tier="FREE",
                email_verified=False  # They need to verify and set password
            )
            db.add(new_user)
            db.flush()  # Get user ID
            user_to_link = new_user
            user_was_created = True

            # Send password setup email
            from ..services.sendgrid_service import sendgrid_service
            from ..core.config import settings

            # Create password setup token (you can use JWT or simple token)
            password_setup_token = secrets.token_urlsafe(32)
            # TODO: Store token in database with expiration if needed
            # For now, we'll just send a welcome email prompting them to use password reset

            password_setup_url = f"{settings.FRONTEND_URL}/reset-password?email={new_user.email}"

            try:
                await sendgrid_service.send_welcome_application_email(
                    to_email=new_user.email,
                    name=new_user.name,
                    password_setup_url=password_setup_url
                )
            except Exception as e:
                logger.warning(f"Failed to send welcome email to {new_user.email}: {e}")

    # Create submission
    new_submission = FormSubmission(
        form_template_id=submission.form_template_id,
        user_id=user_to_link.id if user_to_link else None,
        answers=submission.answers,
        files=submission.files,
        submitter_email=submission.submitter_email,
        submitter_name=submission.submitter_name,
        status="pending"
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    message = form.success_message or "Form submitted successfully"
    if user_was_created:
        message += " We've created an account for you. Please check your email to set up your password."

    return {
        "success": True,
        "data": new_submission,
        "message": message
    }


# ========== Admin Endpoints (Form Management) ==========

@router.get("/", response_model=FormTemplateListResponse)
def list_forms(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all form templates (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(FormTemplate)

    if category:
        query = query.filter(FormTemplate.category == category)
    if is_active is not None:
        query = query.filter(FormTemplate.is_active == is_active)

    total = query.count()
    forms = query.offset(skip).limit(limit).all()

    # Add question count to each form
    form_list = []
    for form in forms:
        form_data = FormTemplateList.from_orm(form)
        form_data.question_count = len(form.questions)
        form_list.append(form_data)

    return {"success": True, "data": form_list, "total": total}


@router.get("/{form_id}", response_model=FormTemplateResponse)
def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a form template by ID (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    form = db.query(FormTemplate).filter(FormTemplate.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    return {"success": True, "data": form}


@router.post("/", response_model=FormTemplateResponse)
def create_form(
    form_data: FormTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new form template (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if slug already exists
    existing = db.query(FormTemplate).filter(FormTemplate.slug == form_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Form with this slug already exists")

    # Create form template
    new_form = FormTemplate(
        **form_data.dict(exclude={"questions"}),
        created_by=current_user.id
    )

    db.add(new_form)
    db.flush()  # Get the form ID

    # Create questions if provided
    if form_data.questions:
        for question_data in form_data.questions:
            question = FormQuestion(
                **question_data.dict(),
                form_template_id=new_form.id
            )
            db.add(question)

    db.commit()
    db.refresh(new_form)

    return {"success": True, "data": new_form}


@router.put("/{form_id}", response_model=FormTemplateResponse)
def update_form(
    form_id: UUID,
    form_data: FormTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a form template (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    form = db.query(FormTemplate).filter(FormTemplate.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Update fields
    for field, value in form_data.dict(exclude_unset=True).items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)

    return {"success": True, "data": form}


@router.delete("/{form_id}")
def delete_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a form template (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    form = db.query(FormTemplate).filter(FormTemplate.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    db.delete(form)
    db.commit()

    return {"success": True, "message": "Form deleted successfully"}


# ========== Submission Management ==========

@router.get("/my-submissions")
def get_my_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's own submissions"""
    query = db.query(FormSubmission).filter(FormSubmission.user_id == current_user.id)

    total = query.count()
    submissions = query.order_by(FormSubmission.submitted_at.desc()).offset(skip).limit(limit).all()

    return {"success": True, "data": submissions, "total": total}


@router.get("/submissions/all")
def list_all_submissions(
    status: Optional[str] = None,
    form_template_id: Optional[UUID] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all submissions across all forms (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(FormSubmission)

    if form_template_id:
        query = query.filter(FormSubmission.form_template_id == form_template_id)

    if status:
        query = query.filter(FormSubmission.status == status)

    total = query.count()
    submissions = query.order_by(FormSubmission.submitted_at.desc()).offset(skip).limit(limit).all()

    return {"success": True, "data": submissions, "total": total}


@router.get("/submission/{submission_id}", response_model=FormSubmissionResponse)
def get_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single submission by ID (user must own it or be admin)"""
    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Check authorization
    if submission.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")

    return {"success": True, "data": submission}


@router.get("/submissions/{form_id}")
def list_submissions(
    form_id: UUID,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List submissions for a form (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(FormSubmission).filter(FormSubmission.form_template_id == form_id)

    if status:
        query = query.filter(FormSubmission.status == status)

    total = query.count()
    submissions = query.order_by(FormSubmission.submitted_at.desc()).offset(skip).limit(limit).all()

    return {"success": True, "data": submissions, "total": total}


@router.put("/submissions/{submission_id}", response_model=FormSubmissionResponse)
def update_submission(
    submission_id: UUID,
    update_data: FormSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a submission (admin only - for reviewing)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Update fields
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(submission, field, value)

    # Set reviewer info
    submission.reviewed_by = current_user.id
    from datetime import datetime
    submission.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return {"success": True, "data": submission}


# ========== Application Payment Endpoint ==========

@router.post("/submissions/{submission_id}/create-application-payment")
async def create_application_payment(
    submission_id: UUID,
    payment_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create an order and payment for a retreat application after admin approval.

    This endpoint follows the exact pattern as /api/payments/create-product-order:
    1. Creates Order with one OrderItem (virtual item for application fee)
    2. Creates Payment record with reference_id = order.id
    3. Updates FormSubmission with payment info
    4. Returns payment data for Tilopay SDK initialization

    Used when admin approves an application and user needs to pay.
    """
    import time
    from ..models.retreat import Retreat
    from ..models.product import Order, OrderItem, OrderStatus
    from ..models.payment import Payment, PaymentStatus, PaymentType
    from ..services import tilopay_service
    from ..services.discount_service import DiscountService
    from decimal import Decimal

    # Get form submission
    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Form submission not found")

    # Verify user owns this submission (or is admin)
    if submission.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this submission")

    # Get payment parameters from request
    retreat_id = payment_data.get("retreat_id")
    payment_amount = payment_data.get("payment_amount")

    if not retreat_id or not payment_amount:
        raise HTTPException(status_code=400, detail="retreat_id and payment_amount are required")

    # Get retreat details
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Get billing information
    billing_email = payment_data.get("billing_email") or submission.submitter_email or current_user.email
    billing_first_name = payment_data.get("billing_first_name", "")
    billing_last_name = payment_data.get("billing_last_name", "")
    billing_name = f"{billing_first_name} {billing_last_name}".strip() or submission.submitter_name or current_user.name
    billing_address = payment_data.get("billing_address", "")
    billing_city = payment_data.get("billing_city", "")
    billing_state = payment_data.get("billing_state", "")
    billing_country = payment_data.get("billing_country", "US")
    billing_postal_code = payment_data.get("billing_postal_code", "")
    billing_telephone = payment_data.get("billing_telephone", "")

    # Apply member discount if applicable
    base_price = Decimal(str(payment_amount))
    discount_info = DiscountService.get_application_discount(current_user, retreat, base_price, db)
    total = discount_info["discounted_price"]

    logger.info(f"Application payment: user={current_user.id}, retreat={retreat.id}, original=${discount_info['original_price']}, discounted=${total}, discount={discount_info['discount_percentage']}%")

    # Generate unique order number
    order_number = f"APP-{int(time.time())}-{current_user.id.hex[:8].upper()}"

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

    # Create order item (virtual item for application fee)
    order_item = OrderItem(
        order_id=order.id,
        product_id=None,  # No product, this is an application fee
        quantity=1,
        price_at_purchase=amount,
    )
    db.add(order_item)
    db.commit()
    db.refresh(order)

    logger.info(f"Created order for retreat application: order={order.id}, submission={submission_id}, retreat={retreat_id}, user={current_user.id}")

    # Create payment record with order.id as reference
    payment = Payment(
        user_id=current_user.id,
        amount=total,
        currency="USD",
        status=PaymentStatus.PENDING,
        payment_type=PaymentType.RETREAT,
        reference_id=str(retreat_id),  # Reference retreat for granting access
        payment_metadata={
            "is_application": True,
            "submission_id": str(submission_id),
            "retreat_id": str(retreat_id),
            "order_id": str(order.id),
            "access_type": payment_data.get("access_type", "lifetime")  # Default to lifetime for onsite
        }
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

    # Update FormSubmission with payment info
    submission.retreat_id = retreat_id
    submission.payment_amount = amount
    submission.payment_id = payment.id
    submission.order_id = order.id
    submission.status = "payment_sent"  # Update status
    submission.payment_link_sent_at = datetime.utcnow()
    db.commit()

    logger.info(f"Application payment created: order={order.id}, payment={payment.id}, submission={submission_id}, retreat={retreat.title}")

    # Extract first and last names
    first_name = billing_first_name or (billing_name.split()[0] if billing_name else "")
    last_name = billing_last_name or (" ".join(billing_name.split()[1:]) if billing_name and len(billing_name.split()) > 1 else "")

    # Return SDK token and payment info for frontend to initialize Tilopay SDK
    # EXACT format as create-product-order for compatibility with ProductPaymentClient pattern
    return {
        "order_id": str(order.id),
        "payment_id": str(payment.id),
        "submission_id": str(submission_id),
        "retreat_id": str(retreat_id),
        "tilopay_key": token_response.get("token"),  # SDK token
        "order_number": str(payment.id),
        "amount": float(total),
        "currency": "USD",
        "description": f"Retreat Application: {retreat.title}",
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
        "retreat_title": retreat.title,
    }
