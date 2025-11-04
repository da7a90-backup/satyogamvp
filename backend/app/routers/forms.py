"""Forms router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_optional_user
from ..models.user import User
from ..models.forms import ContactSubmission, Application, ApplicationType, ApplicationStatus
from ..models.email import NewsletterSubscriber, SubscriberStatus
from ..schemas.forms import ApplicationCreate, ApplicationResponse, ContactSubmissionCreate, NewsletterSubscribeCreate, NewsletterSubscribeResponse
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
