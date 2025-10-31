"""Forms router."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.forms import ContactSubmission

router = APIRouter()


@router.post("/contact")
async def submit_contact_form(
    name: str,
    email: str,
    topic: str,
    message: str,
    db: Session = Depends(get_db),
):
    """Submit contact form."""
    submission = ContactSubmission(
        name=name,
        email=email,
        topic=topic,
        message=message,
    )
    db.add(submission)
    db.commit()

    return {"message": "Contact form submitted successfully"}
