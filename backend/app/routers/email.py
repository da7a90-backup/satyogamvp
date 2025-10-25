"""Email marketing router."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.email import NewsletterSubscriber, SubscriberStatus
from ..services import sendgrid_service

router = APIRouter()


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(
    email: str,
    name: str = None,
    db: Session = Depends(get_db),
):
    """Subscribe to newsletter."""
    # Check if already subscribed
    subscriber = (
        db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    )

    if subscriber:
        if subscriber.status == SubscriberStatus.UNSUBSCRIBED:
            subscriber.status = SubscriberStatus.ACTIVE
            db.commit()
            return {"message": "Resubscribed successfully"}
        return {"message": "Already subscribed"}

    # Create new subscriber
    subscriber = NewsletterSubscriber(
        email=email,
        name=name,
        status=SubscriberStatus.ACTIVE,
    )
    db.add(subscriber)
    db.commit()

    return {"message": "Subscribed successfully"}


@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter."""
    subscriber = (
        db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    )

    if not subscriber:
        return {"message": "Email not found"}

    subscriber.status = SubscriberStatus.UNSUBSCRIBED
    db.commit()

    return {"message": "Unsubscribed successfully"}
