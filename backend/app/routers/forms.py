"""Forms router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.deps import get_optional_user
from ..models.user import User
from ..models.forms import ContactSubmission, Application, ApplicationType, ApplicationStatus
from ..schemas.forms import ApplicationCreate, ApplicationResponse, ContactSubmissionCreate
from ..services import mixpanel_service

router = APIRouter()


@router.post("/application", response_model=ApplicationResponse)
async def submit_application(
    application_data: ApplicationCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Submit an application form (retreat, scholarship, etc.).
    Can be submitted by authenticated or unauthenticated users.
    """
    # Use authenticated user ID if available, otherwise allow anonymous submissions
    user_id = current_user.id if current_user else application_data.user_id

    application = Application(
        user_id=user_id,
        type=application_data.type,
        form_data=application_data.form_data,
        status=ApplicationStatus.PENDING,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    # Track analytics if user is authenticated
    if current_user:
        await mixpanel_service.track_event(
            "Application Submitted",
            str(current_user.id),
            {
                "application_id": str(application.id),
                "application_type": application_data.type.value,
            }
        )

    return application


@router.post("/contact")
async def submit_contact_form(
    contact_data: ContactSubmissionCreate,
    db: Session = Depends(get_db),
):
    """Submit contact form."""
    submission = ContactSubmission(
        name=contact_data.name,
        email=contact_data.email,
        topic=contact_data.topic,
        message=contact_data.message,
    )
    db.add(submission)
    db.commit()

    return {"message": "Contact form submitted successfully"}
