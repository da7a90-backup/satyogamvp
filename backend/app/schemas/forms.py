"""Pydantic schemas for Forms models."""

from pydantic import BaseModel, UUID4, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any
from ..models.forms import ApplicationType, ApplicationStatus


class ApplicationCreate(BaseModel):
    """Schema for creating an application."""
    type: ApplicationType
    form_data: Dict[str, Any]
    user_id: Optional[UUID4] = None


class ApplicationResponse(BaseModel):
    """Schema for application response."""
    id: UUID4
    user_id: Optional[UUID4]
    type: ApplicationType
    status: ApplicationStatus
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactSubmissionCreate(BaseModel):
    """Schema for creating a contact submission."""
    firstName: str
    lastName: str
    email: EmailStr
    topic: Optional[str] = None
    message: str
    subscribeNewsletter: Optional[bool] = False


class ContactSubmissionResponse(BaseModel):
    """Schema for contact submission response."""
    id: UUID4
    name: str
    email: str
    topic: Optional[str]
    message: str
    submitted_at: datetime

    class Config:
        from_attributes = True


class NewsletterSubscribeCreate(BaseModel):
    """Schema for newsletter subscription."""
    name: str
    email: EmailStr


class NewsletterSubscribeResponse(BaseModel):
    """Schema for newsletter subscription response."""
    message: str
    id: UUID4
