"""
API routes for dynamic form system.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.deps import get_db, get_current_user, require_admin, get_optional_user
from app.models.user import User
from app.models.form import (
    DynamicFormTemplate,
    FormSection,
    FormField,
    DynamicFormSubmission,
    FormAnswer,
    SubmissionStatus,
)
from app.schemas.dynamic_form import (
    FormTemplateResponse,
    FormTemplateListResponse,
    FormTemplateCreate,
    FormTemplateUpdate,
    FormSectionCreate,
    FormSectionUpdate,
    FormSectionResponse,
    FormFieldCreate,
    FormFieldUpdate,
    FormFieldResponse,
    FormSubmissionCreate,
    FormSubmissionResponse,
    FormSubmissionListResponse,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
)

router = APIRouter()


# ============================================================================
# Public Endpoints - Form Access and Submission
# ============================================================================

@router.get("/forms/{slug}", response_model=FormTemplateResponse)
def get_form_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get a published form template by slug for user to fill out.
    """
    form = (
        db.query(DynamicFormTemplate)
        .filter(DynamicFormTemplate.slug == slug, DynamicFormTemplate.is_published == True)
        .options(
            joinedload(DynamicFormTemplate.sections).joinedload(FormSection.fields)
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with slug '{slug}' not found or not published",
        )

    return form


@router.post("/forms/{slug}/submit", response_model=FormSubmissionResponse)
async def submit_form(
    slug: str,
    submission_data: FormSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Submit a form. If user is not authenticated, creates a new user account.
    """
    import secrets
    import string
    from app.core.security import get_password_hash
    from app.models.user import MembershipTierEnum

    # Verify form exists and is published
    form = (
        db.query(DynamicFormTemplate)
        .filter(DynamicFormTemplate.slug == slug, DynamicFormTemplate.is_published == True)
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with slug '{slug}' not found",
        )

    # If no authenticated user, try to create one from form data
    user = current_user
    generated_password = None

    if not user:
        # Extract email from form answers
        email = None
        first_name = None
        last_name = None

        for answer in submission_data.answers:
            # Find the field to check its label
            field = db.query(FormField).filter(FormField.id == answer.field_id).first()
            if field:
                label_lower = field.label.lower()
                if 'email' in label_lower and answer.value:
                    email = str(answer.value).strip()
                elif 'first' in label_lower and 'name' in label_lower and answer.value:
                    first_name = str(answer.value).strip()
                elif 'last' in label_lower and 'name' in label_lower and answer.value:
                    last_name = str(answer.value).strip()

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is required to submit this form",
            )

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            user = existing_user
        else:
            # Generate secure random password
            alphabet = string.ascii_letters + string.digits + string.punctuation
            generated_password = ''.join(secrets.choice(alphabet) for _ in range(16))

            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                first_name=first_name or email.split('@')[0],
                last_name=last_name or "",
                hashed_password=get_password_hash(generated_password),
                membership_tier=MembershipTierEnum.FREE,
                is_active=True,
                is_admin=False,
            )
            db.add(user)
            db.flush()

    # Create submission
    submission = DynamicFormSubmission(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        user_id=user.id,
        status=SubmissionStatus.SUBMITTED,
        submitted_at=datetime.utcnow(),
        member_discount_eligible=submission_data.member_discount_eligible,
        retreat_id=submission_data.retreat_id,
    )
    db.add(submission)
    db.flush()

    # Create answers
    for answer_data in submission_data.answers:
        answer = FormAnswer(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            field_id=answer_data.field_id,
            value=answer_data.value,
            file_url=answer_data.file_url,
            file_name=answer_data.file_name,
        )
        db.add(answer)

    db.commit()
    db.refresh(submission)

    # Send welcome email if a new user was created
    if generated_password:
        from app.services.sendgrid_service import sendgrid_service
        try:
            await sendgrid_service.send_welcome_with_credentials(
                to_email=user.email,
                name=user.first_name or "User",
                password=generated_password,
                form_title=form.title
            )
        except Exception as email_error:
            # Log error but don't fail the submission
            print(f"Failed to send welcome email: {email_error}")

    # Fetch submission with answers
    submission_with_answers = (
        db.query(DynamicFormSubmission)
        .filter(DynamicFormSubmission.id == submission.id)
        .options(joinedload(DynamicFormSubmission.answers))
        .first()
    )

    # TODO: Send email notification to admin

    return submission_with_answers


# ============================================================================
# Admin Endpoints - Form Template Management
# ============================================================================

@router.get("/admin/forms", response_model=List[FormTemplateListResponse])
def list_forms(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    List all form templates (admin only).
    """
    forms = db.query(DynamicFormTemplate).all()

    result = []
    for form in forms:
        section_count = db.query(FormSection).filter(FormSection.form_template_id == form.id).count()
        submission_count = db.query(DynamicFormSubmission).filter(DynamicFormSubmission.form_template_id == form.id).count()

        result.append(
            FormTemplateListResponse(
                id=form.id,
                slug=form.slug,
                title=form.title,
                subtitle=form.subtitle,
                description=form.description,
                is_published=form.is_published,
                created_at=form.created_at,
                section_count=section_count,
                submission_count=submission_count,
            )
        )

    return result


@router.post("/admin/forms", response_model=FormTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    form_data: FormTemplateCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new form template (admin only).
    """
    # Check if slug exists
    existing = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.slug == form_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Form with slug '{form_data.slug}' already exists",
        )

    # Create form template
    form = DynamicFormTemplate(
        id=str(uuid.uuid4()),
        slug=form_data.slug,
        title=form_data.title,
        subtitle=form_data.subtitle,
        description=form_data.description,
        is_published=form_data.is_published,
    )
    db.add(form)
    db.flush()

    # Create sections if provided
    for section_data in form_data.sections:
        section = FormSection(
            id=str(uuid.uuid4()),
            form_template_id=form.id,
            title=section_data.title,
            description=section_data.description,
            order=section_data.order,
            tagline=section_data.tagline,
            image_url=section_data.image_url,
        )
        db.add(section)
        db.flush()

        # Create fields for section
        for field_data in section_data.fields:
            field = FormField(
                id=str(uuid.uuid4()),
                section_id=section.id,
                label=field_data.label,
                field_type=field_data.field_type,
                placeholder=field_data.placeholder,
                help_text=field_data.help_text,
                is_required=field_data.is_required,
                order=field_data.order,
                options=field_data.options,
                validation_rules=field_data.validation_rules,
                group_id=field_data.group_id,
                width=field_data.width,
            )
            db.add(field)

    db.commit()

    # Fetch form with sections and fields
    form_with_relations = (
        db.query(DynamicFormTemplate)
        .filter(DynamicFormTemplate.id == form.id)
        .options(
            joinedload(DynamicFormTemplate.sections).joinedload(FormSection.fields)
        )
        .first()
    )

    return form_with_relations


@router.get("/admin/forms/{form_id}", response_model=FormTemplateResponse)
def get_form(
    form_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get form template by ID (admin only).
    """
    form = (
        db.query(DynamicFormTemplate)
        .filter(DynamicFormTemplate.id == form_id)
        .options(
            joinedload(DynamicFormTemplate.sections).joinedload(FormSection.fields)
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID '{form_id}' not found",
        )

    return form


@router.put("/admin/forms/{form_id}", response_model=FormTemplateResponse)
def update_form(
    form_id: str,
    form_data: FormTemplateUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update form template (admin only).
    """
    form = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.id == form_id).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID '{form_id}' not found",
        )

    # Update fields
    for field, value in form_data.model_dump(exclude_unset=True).items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)

    # Fetch form with relations
    form_with_relations = (
        db.query(DynamicFormTemplate)
        .filter(DynamicFormTemplate.id == form.id)
        .options(
            joinedload(DynamicFormTemplate.sections).joinedload(FormSection.fields)
        )
        .first()
    )

    return form_with_relations


@router.delete("/admin/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    form_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete form template (admin only).
    """
    form = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.id == form_id).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID '{form_id}' not found",
        )

    db.delete(form)
    db.commit()

    return None


# ============================================================================
# Admin Endpoints - Section Management
# ============================================================================

@router.post("/admin/forms/{form_id}/sections", response_model=FormSectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(
    form_id: str,
    section_data: FormSectionCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Add a section to a form template (admin only).
    """
    # Verify form exists
    form = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID '{form_id}' not found",
        )

    section = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form_id,
        title=section_data.title,
        description=section_data.description,
        order=section_data.order,
        tagline=section_data.tagline,
        image_url=section_data.image_url,
    )
    db.add(section)
    db.flush()

    # Create fields if provided
    for field_data in section_data.fields:
        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section.id,
            label=field_data.label,
            field_type=field_data.field_type,
            placeholder=field_data.placeholder,
            help_text=field_data.help_text,
            is_required=field_data.is_required,
            order=field_data.order,
            options=field_data.options,
            validation_rules=field_data.validation_rules,
            group_id=field_data.group_id,
            width=field_data.width,
        )
        db.add(field)

    db.commit()

    # Fetch section with fields
    section_with_fields = (
        db.query(FormSection)
        .filter(FormSection.id == section.id)
        .options(joinedload(FormSection.fields))
        .first()
    )

    return section_with_fields


@router.put("/admin/forms/sections/{section_id}", response_model=FormSectionResponse)
def update_section(
    section_id: str,
    section_data: FormSectionUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update a form section (admin only).
    """
    section = db.query(FormSection).filter(FormSection.id == section_id).first()

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with ID '{section_id}' not found",
        )

    # Update fields
    for field, value in section_data.model_dump(exclude_unset=True).items():
        setattr(section, field, value)

    db.commit()

    # Fetch section with fields
    section_with_fields = (
        db.query(FormSection)
        .filter(FormSection.id == section.id)
        .options(joinedload(FormSection.fields))
        .first()
    )

    return section_with_fields


@router.delete("/admin/forms/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a form section (admin only).
    """
    section = db.query(FormSection).filter(FormSection.id == section_id).first()

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with ID '{section_id}' not found",
        )

    db.delete(section)
    db.commit()

    return None


# ============================================================================
# Admin Endpoints - Field Management
# ============================================================================

@router.post("/admin/forms/sections/{section_id}/fields", response_model=FormFieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(
    section_id: str,
    field_data: FormFieldCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Add a field to a form section (admin only).
    """
    # Verify section exists
    section = db.query(FormSection).filter(FormSection.id == section_id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with ID '{section_id}' not found",
        )

    field = FormField(
        id=str(uuid.uuid4()),
        section_id=section_id,
        label=field_data.label,
        field_type=field_data.field_type,
        placeholder=field_data.placeholder,
        help_text=field_data.help_text,
        is_required=field_data.is_required,
        order=field_data.order,
        options=field_data.options,
        validation_rules=field_data.validation_rules,
        group_id=field_data.group_id,
        width=field_data.width,
    )
    db.add(field)
    db.commit()
    db.refresh(field)

    return field


@router.put("/admin/forms/fields/{field_id}", response_model=FormFieldResponse)
def update_field(
    field_id: str,
    field_data: FormFieldUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update a form field (admin only).
    """
    field = db.query(FormField).filter(FormField.id == field_id).first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with ID '{field_id}' not found",
        )

    # Update fields
    for field_name, value in field_data.model_dump(exclude_unset=True).items():
        setattr(field, field_name, value)

    db.commit()
    db.refresh(field)

    return field


@router.delete("/admin/forms/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    field_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a form field (admin only).
    """
    field = db.query(FormField).filter(FormField.id == field_id).first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with ID '{field_id}' not found",
        )

    db.delete(field)
    db.commit()

    return None


# ============================================================================
# Admin Endpoints - Submission Management
# ============================================================================

@router.get("/admin/forms/submissions", response_model=List[FormSubmissionListResponse])
def list_submissions(
    form_id: str = None,
    status_filter: SubmissionStatus = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    List all form submissions (admin only).
    """
    query = db.query(DynamicFormSubmission).join(DynamicFormTemplate)

    if form_id:
        query = query.filter(DynamicFormSubmission.form_template_id == form_id)

    if status_filter:
        query = query.filter(DynamicFormSubmission.status == status_filter)

    submissions = query.order_by(DynamicFormSubmission.created_at.desc()).all()

    result = []
    for submission in submissions:
        form = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.id == submission.form_template_id).first()
        result.append(
            FormSubmissionListResponse(
                id=submission.id,
                user_id=submission.user_id,
                form_template_id=submission.form_template_id,
                form_title=form.title if form else "Unknown",
                status=submission.status,
                created_at=submission.created_at,
                submitted_at=submission.submitted_at,
            )
        )

    return result


@router.get("/admin/forms/submissions/{submission_id}", response_model=FormSubmissionResponse)
def get_submission(
    submission_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get submission details (admin only).
    """
    submission = (
        db.query(DynamicFormSubmission)
        .filter(DynamicFormSubmission.id == submission_id)
        .options(joinedload(DynamicFormSubmission.answers))
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with ID '{submission_id}' not found",
        )

    return submission


@router.post("/admin/forms/submissions/{submission_id}/review", response_model=ReviewSubmissionResponse)
def review_submission(
    submission_id: str,
    review_data: ReviewSubmissionRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Review and accept/reject a submission (admin only).
    """
    submission = (
        db.query(DynamicFormSubmission)
        .filter(DynamicFormSubmission.id == submission_id)
        .options(joinedload(DynamicFormSubmission.answers))
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with ID '{submission_id}' not found",
        )

    # Update submission status
    submission.status = review_data.status
    submission.reviewed_by = admin.id
    submission.reviewed_at = datetime.utcnow()
    submission.admin_notes = review_data.admin_notes

    db.commit()
    db.refresh(submission)

    return submission


@router.put("/admin/forms/submissions/{submission_id}/approve")
def approve_submission(
    submission_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Approve a retreat application and generate payment link (admin only).
    """
    submission = db.query(DynamicFormSubmission).filter(DynamicFormSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Update submission status
    submission.status = "approved"
    submission.reviewed_by = admin.id
    submission.reviewed_at = datetime.utcnow()

    # Get form template to check if it's linked to a retreat
    form_template = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.id == submission.form_template_id).first()

    if form_template and form_template.linked_retreat_id:
        # Generate payment link via Tilopay
        from app.services.tilopay import create_payment_link
        from app.models.retreat import Retreat

        retreat = db.query(Retreat).filter(Retreat.id == form_template.linked_retreat_id).first()
        if retreat:
            # Calculate price with member discount if eligible
            base_price = float(retreat.price) if hasattr(retreat, 'price') and retreat.price else 0.0
            discount_percentage = float(retreat.member_discount_percentage) if hasattr(retreat, 'member_discount_percentage') and retreat.member_discount_percentage else 10.0

            # Apply discount if user is eligible
            final_price = base_price
            if submission.member_discount_eligible:
                final_price = base_price * (1 - discount_percentage / 100)

            submission.payment_amount = final_price

            # Create payment link
            payment_data = {
                "amount": str(final_price),
                "currency": "USD",
                "description": f"Payment for {retreat.title} Retreat Application",
                "customer_email": submission.user.email if submission.user else None,
                "metadata": {
                    "submission_id": submission_id,
                    "retreat_id": retreat.id,
                    "user_id": str(submission.user_id) if submission.user_id else None,
                    "discount_applied": str(submission.member_discount_eligible),
                }
            }

            payment_link = create_payment_link(payment_data)
            submission.payment_link = payment_link

    db.commit()
    db.refresh(submission)

    # TODO: Send approval email with payment link via SendGrid

    return {"message": "Submission approved", "payment_link": submission.payment_link, "amount": submission.payment_amount}


@router.put("/admin/forms/submissions/{submission_id}/reject")
def reject_submission(
    submission_id: str,
    reason: str = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Reject a retreat application (admin only).
    """
    submission = db.query(DynamicFormSubmission).filter(DynamicFormSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "rejected"
    submission.reviewed_by = admin.id
    submission.reviewed_at = datetime.utcnow()
    submission.admin_notes = reason

    db.commit()
    db.refresh(submission)

    # TODO: Send rejection email via SendGrid

    return {"message": "Submission rejected"}


@router.put("/admin/forms/submissions/{submission_id}/schedule-zoom")
def schedule_zoom_call(
    submission_id: str,
    zoom_link: str,
    zoom_date: datetime = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Schedule a Zoom call with applicant (admin only).
    """
    submission = db.query(DynamicFormSubmission).filter(DynamicFormSubmission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.zoom_link = zoom_link
    submission.zoom_scheduled_at = zoom_date or datetime.utcnow()
    submission.status = "zoom_scheduled"

    db.commit()
    db.refresh(submission)

    # TODO: Send Zoom invitation email via SendGrid

    return {"message": "Zoom call scheduled", "zoom_link": zoom_link}


@router.get("/admin/forms/submissions/by-retreat/{retreat_slug}")
def get_submissions_by_retreat(
    retreat_slug: str,
    status_filter: str = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get all submissions for a specific retreat (admin only).
    """
    from app.models.retreat import Retreat

    # Find retreat
    retreat = db.query(Retreat).filter(Retreat.slug == retreat_slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Find forms linked to this retreat
    forms = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.linked_retreat_id == retreat.id).all()
    form_ids = [f.id for f in forms]

    # Get submissions for these forms
    query = db.query(DynamicFormSubmission).filter(DynamicFormSubmission.form_template_id.in_(form_ids))

    if status_filter:
        query = query.filter(DynamicFormSubmission.status == status_filter)

    submissions = query.order_by(DynamicFormSubmission.created_at.desc()).all()

    return submissions

    # TODO: Send email notification to user
    # TODO: If accepted, create payment link

    payment_url = None
    if review_data.status == SubmissionStatus.ACCEPTED:
        # TODO: Create payment and get URL
        payment_url = f"/payment/{submission_id}"

    return ReviewSubmissionResponse(
        success=True,
        message=f"Submission {review_data.status.value}",
        submission=submission,
        payment_url=payment_url,
    )
