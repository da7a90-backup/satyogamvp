from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class SubscriberStatus(str, enum.Enum):
    ACTIVE = "active"
    UNSUBSCRIBED = "unsubscribed"
    BOUNCED = "bounced"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENT = "sent"
    FAILED = "failed"


class TriggerType(str, enum.Enum):
    MIXPANEL_EVENT = "mixpanel_event"
    USER_ACTION = "user_action"
    TIME_BASED = "time_based"


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    unsubscribed_at = Column(DateTime, nullable=True)
    status = Column(Enum(SubscriberStatus), default=SubscriberStatus.ACTIVE, nullable=False, index=True)
    tags = Column(JSONB, nullable=True, default=[])
    metadata = Column(JSONB, nullable=True, default={})

    # Relationships
    user = relationship("User")
    emails_sent = relationship("EmailSent", back_populates="subscriber", cascade="all, delete-orphan")


class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    beefree_template_id = Column(String(255), nullable=True)
    beefree_json = Column(JSONB, nullable=True)  # Beefree template JSON
    html_content = Column(Text, nullable=False)  # rendered HTML
    variables = Column(JSONB, nullable=True, default=[])  # list of template variables like {{name}}, {{email}}
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaigns = relationship("EmailCampaign", back_populates="template", cascade="all, delete-orphan")
    automations = relationship("EmailAutomation", back_populates="template", cascade="all, delete-orphan")


class EmailCampaign(Base):
    __tablename__ = "email_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("email_templates.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(500), nullable=False)
    from_name = Column(String(255), nullable=False)
    from_email = Column(String(255), nullable=False)
    segment_filter = Column(JSONB, nullable=True)  # conditions for filtering subscribers
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT, nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    total_sent = Column(Integer, default=0, nullable=False)
    total_opened = Column(Integer, default=0, nullable=False)
    total_clicked = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    template = relationship("EmailTemplate", back_populates="campaigns")
    emails_sent = relationship("EmailSent", back_populates="campaign", cascade="all, delete-orphan")


class EmailAutomation(Base):
    """Automated email sequences triggered by events."""
    __tablename__ = "email_automations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    trigger_type = Column(Enum(TriggerType), nullable=False, index=True)
    trigger_config = Column(JSONB, nullable=False)  # e.g., {"event": "user_signup", "properties": {...}}
    template_id = Column(UUID(as_uuid=True), ForeignKey("email_templates.id", ondelete="CASCADE"), nullable=False)
    delay_minutes = Column(Integer, default=0, nullable=False)  # delay before sending
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    template = relationship("EmailTemplate", back_populates="automations")
    emails_sent = relationship("EmailSent", back_populates="automation", cascade="all, delete-orphan")


class EmailSent(Base):
    """Track individual emails sent."""
    __tablename__ = "emails_sent"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("email_campaigns.id", ondelete="CASCADE"), nullable=True, index=True)
    automation_id = Column(UUID(as_uuid=True), ForeignKey("email_automations.id", ondelete="CASCADE"), nullable=True, index=True)
    subscriber_id = Column(UUID(as_uuid=True), ForeignKey("newsletter_subscribers.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(UUID(as_uuid=True), ForeignKey("email_templates.id", ondelete="CASCADE"), nullable=False)
    sendgrid_message_id = Column(String(255), nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="sent", nullable=False)  # sent, delivered, bounced, etc.

    # Relationships
    campaign = relationship("EmailCampaign", back_populates="emails_sent")
    automation = relationship("EmailAutomation", back_populates="emails_sent")
    subscriber = relationship("NewsletterSubscriber", back_populates="emails_sent")
    template = relationship("EmailTemplate")
