"""
API router for dynamic form templates
Endpoints for managing and submitting forms
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models import FormTemplate, FormQuestion, FormSubmission, User
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
def submit_form(
    submission: FormSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Submit a form (public or authenticated)"""
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

    # Create submission
    new_submission = FormSubmission(
        form_template_id=submission.form_template_id,
        user_id=current_user.id if current_user else None,
        answers=submission.answers,
        files=submission.files,
        submitter_email=submission.submitter_email,
        submitter_name=submission.submitter_name,
        status="pending"
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return {
        "success": True,
        "data": new_submission,
        "message": form.success_message or "Form submitted successfully"
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
