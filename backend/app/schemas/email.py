"""Email marketing schemas."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# Newsletter Subscriber Schemas
class NewsletterSubscribeRequest(BaseModel):
    """Schema for newsletter subscription."""
    email: EmailStr
    name: Optional[str] = None


class NewsletterSubscriberResponse(BaseModel):
    """Response schema for newsletter subscriber."""
    id: UUID
    email: str
    name: Optional[str]
    user_id: Optional[UUID]
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime]
    status: str
    tags: List[str] = []
    subscriber_metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True


# Email Template Schemas
class EmailTemplateCreate(BaseModel):
    """Schema for creating an email template."""
    name: str = Field(..., description="Template name")
    subject: str = Field(..., description="Email subject line")
    html_content: str = Field(..., description="HTML content with {{variables}}")
    beefree_template_id: Optional[str] = None
    beefree_json: Optional[Dict[str, Any]] = None
    variables: Optional[List[str]] = Field(default=[], description="List of template variables")


class EmailTemplateUpdate(BaseModel):
    """Schema for updating an email template."""
    name: Optional[str] = None
    subject: Optional[str] = None
    html_content: Optional[str] = None
    beefree_template_id: Optional[str] = None
    beefree_json: Optional[Dict[str, Any]] = None
    variables: Optional[List[str]] = None


class EmailTemplateResponse(BaseModel):
    """Response schema for email template."""
    id: UUID
    name: str
    subject: str
    html_content: str
    beefree_template_id: Optional[str]
    beefree_json: Optional[Dict[str, Any]]
    variables: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Email Campaign Schemas
class EmailCampaignCreate(BaseModel):
    """Schema for creating an email campaign."""
    name: str = Field(..., description="Campaign name")
    template_id: UUID = Field(..., description="Template to use")
    subject: str = Field(..., description="Email subject (can override template)")
    from_name: str = Field(..., description="Sender name")
    from_email: EmailStr = Field(..., description="Sender email")
    segment_filter: Optional[Dict[str, Any]] = Field(None, description="Subscriber filter conditions")
    scheduled_at: Optional[datetime] = Field(None, description="When to send (None = draft)")


class EmailCampaignUpdate(BaseModel):
    """Schema for updating an email campaign."""
    name: Optional[str] = None
    subject: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[EmailStr] = None
    segment_filter: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None


class EmailCampaignResponse(BaseModel):
    """Response schema for email campaign."""
    id: UUID
    name: str
    template_id: UUID
    subject: str
    from_name: str
    from_email: str
    segment_filter: Optional[Dict[str, Any]]
    status: str
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    total_sent: int
    total_opened: int
    total_clicked: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Email Automation Schemas
class EmailAutomationCreate(BaseModel):
    """Schema for creating an email automation."""
    name: str = Field(..., description="Automation name")
    trigger_type: str = Field(..., description="Type of trigger: mixpanel_event, user_action, time_based")
    trigger_config: Dict[str, Any] = Field(..., description="Trigger configuration")
    template_id: UUID = Field(..., description="Template to use")
    delay_minutes: int = Field(default=0, description="Delay before sending (in minutes)")
    is_active: bool = Field(default=True, description="Whether automation is active")


class EmailAutomationUpdate(BaseModel):
    """Schema for updating an email automation."""
    name: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    template_id: Optional[UUID] = None
    delay_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class EmailAutomationResponse(BaseModel):
    """Response schema for email automation."""
    id: UUID
    name: str
    trigger_type: str
    trigger_config: Dict[str, Any]
    template_id: UUID
    delay_minutes: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Email Send Request
class SendEmailRequest(BaseModel):
    """Schema for sending a test email."""
    template_id: UUID
    to_email: EmailStr
    to_name: Optional[str] = None
    variables: Optional[Dict[str, Any]] = {}
