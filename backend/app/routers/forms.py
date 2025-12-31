"""Forms router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import uuid

from ..core.database import get_db
from ..core.deps import get_optional_user, get_current_user, require_admin
from ..models.user import User
from ..models.forms import ContactSubmission, Application, ApplicationType, ApplicationStatus
from ..models.email import NewsletterSubscriber, SubscriberStatus
from ..schemas.forms import ApplicationCreate, ApplicationResponse, ApplicationUpdate, ContactSubmissionCreate, ContactSubmissionResponse, ContactSubmissionUpdate, NewsletterSubscribeCreate, NewsletterSubscribeResponse
from ..services import mixpanel_service
from ..services.sendgrid_service import sendgrid_service

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
    # Combine firstName and lastName into name
    full_name = f"{contact_data.firstName} {contact_data.lastName}"

    submission = ContactSubmission(
        name=full_name,
        email=contact_data.email,
        topic=contact_data.topic,
        message=contact_data.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Send confirmation email to user
    try:
        await sendgrid_service.send_contact_confirmation(
            to_email=contact_data.email,
            name=full_name
        )
    except Exception as e:
        print(f"Failed to send contact confirmation email: {e}")
        # Don't fail the request if email fails

    # If newsletter checkbox is checked, add to newsletter subscribers
    if contact_data.subscribeNewsletter:
        # Check if email already exists in newsletter_subscribers
        existing_subscriber = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == contact_data.email
        ).first()

        if not existing_subscriber:
            # Create new newsletter subscriber
            subscriber = NewsletterSubscriber(
                email=contact_data.email,
                name=full_name,
                subscribed_at=datetime.utcnow(),
                status=SubscriberStatus.ACTIVE,
            )
            db.add(subscriber)
            db.commit()
        elif existing_subscriber.status == SubscriberStatus.UNSUBSCRIBED:
            # Resubscribe if previously unsubscribed
            existing_subscriber.status = SubscriberStatus.ACTIVE
            existing_subscriber.subscribed_at = datetime.utcnow()
            existing_subscriber.unsubscribed_at = None
            db.commit()

    return {
        "message": "Contact form submitted successfully",
        "id": str(submission.id)
    }


@router.post("/newsletter", response_model=NewsletterSubscribeResponse)
async def subscribe_to_newsletter(
    subscription_data: NewsletterSubscribeCreate,
    db: Session = Depends(get_db),
):
    """Subscribe to newsletter."""
    # Check if email already exists in newsletter_subscribers
    existing_subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == subscription_data.email
    ).first()

    if existing_subscriber:
        if existing_subscriber.status == SubscriberStatus.ACTIVE:
            # Already subscribed
            return NewsletterSubscribeResponse(
                message="You're already subscribed to our newsletter!",
                id=existing_subscriber.id
            )
        else:
            # Resubscribe if previously unsubscribed
            existing_subscriber.status = SubscriberStatus.ACTIVE
            existing_subscriber.name = subscription_data.name
            existing_subscriber.subscribed_at = datetime.utcnow()
            existing_subscriber.unsubscribed_at = None
            db.commit()
            return NewsletterSubscribeResponse(
                message="Welcome back! You've been resubscribed to our newsletter.",
                id=existing_subscriber.id
            )
    else:
        # Create new newsletter subscriber
        subscriber = NewsletterSubscriber(
            email=subscription_data.email,
            name=subscription_data.name,
            subscribed_at=datetime.utcnow(),
            status=SubscriberStatus.ACTIVE,
        )
        db.add(subscriber)
        db.commit()
        db.refresh(subscriber)

        # Send welcome email to new subscriber
        try:
            await sendgrid_service.send_newsletter_welcome(
                to_email=subscription_data.email,
                name=subscription_data.name
            )
        except Exception as e:
            print(f"Failed to send newsletter welcome email: {e}")
            # Don't fail the request if email fails

        return NewsletterSubscribeResponse(
            message="Thank you for subscribing to our newsletter!",
            id=subscriber.id
        )


# ============================================================================
# ADMIN ENDPOINTS - Applications Management
# ============================================================================

@router.get("/admin/applications", response_model=List[ApplicationResponse])
async def get_applications(
    status: Optional[ApplicationStatus] = None,
    application_type: Optional[ApplicationType] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all applications (admin only)."""
    query = db.query(Application)

    if status:
        query = query.filter(Application.status == status)
    if application_type:
        query = query.filter(Application.type == application_type)

    applications = query.order_by(Application.submitted_at.desc()).offset(skip).limit(limit).all()

    return applications


@router.get("/admin/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific application by ID (admin only)."""
    application = db.query(Application).filter(Application.id == uuid.UUID(application_id)).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


@router.put("/admin/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update an application (admin only)."""
    application = db.query(Application).filter(Application.id == uuid.UUID(application_id)).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update fields
    if update_data.status is not None:
        application.status = update_data.status
        if update_data.status != ApplicationStatus.PENDING:
            application.reviewed_at = datetime.utcnow()
            application.reviewed_by = current_user.id

    if update_data.notes is not None:
        application.notes = update_data.notes

    db.commit()
    db.refresh(application)

    return application


@router.delete("/admin/applications/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete an application (admin only)."""
    application = db.query(Application).filter(Application.id == uuid.UUID(application_id)).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()

    return {"message": "Application deleted successfully"}


# ============================================================================
# ADMIN ENDPOINTS - Contact Submissions Management
# ============================================================================

@router.get("/admin/contact-submissions", response_model=List[ContactSubmissionResponse])
async def get_contact_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all contact submissions (admin only)."""
    submissions = (
        db.query(ContactSubmission)
        .order_by(ContactSubmission.submitted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return submissions


@router.get("/admin/contact-submissions/{submission_id}", response_model=ContactSubmissionResponse)
async def get_contact_submission(
    submission_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific contact submission (admin only)."""
    submission = db.query(ContactSubmission).filter(
        ContactSubmission.id == uuid.UUID(submission_id)
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Contact submission not found")

    return submission


@router.put("/admin/contact-submissions/{submission_id}", response_model=ContactSubmissionResponse)
async def update_contact_submission(
    submission_id: str,
    update_data: ContactSubmissionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a contact submission (admin only) - mark as responded."""
    submission = db.query(ContactSubmission).filter(
        ContactSubmission.id == uuid.UUID(submission_id)
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Contact submission not found")

    if update_data.response is not None:
        submission.response = update_data.response
        submission.responded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return submission


@router.delete("/admin/contact-submissions/{submission_id}")
async def delete_contact_submission(
    submission_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a contact submission (admin only)."""
    submission = db.query(ContactSubmission).filter(
        ContactSubmission.id == uuid.UUID(submission_id)
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Contact submission not found")

    db.delete(submission)
    db.commit()

    return {"message": "Contact submission deleted successfully"}
