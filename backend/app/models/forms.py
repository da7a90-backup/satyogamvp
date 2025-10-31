from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ApplicationType(str, enum.Enum):
    RETREAT_ONSITE = "retreat_onsite"
    SCHOLARSHIP = "scholarship"
    GENERAL = "general"


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class Application(Base):
    """Generic application form for retreats, scholarships, etc."""
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(Enum(ApplicationType), nullable=False, index=True)
    form_data = Column(JSONB, nullable=False)  # flexible form data storage
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False, index=True)
    notes = Column(Text, nullable=True)  # admin notes
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class ContactSubmission(Base):
    """Contact form submissions."""
    __tablename__ = "contact_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    response = Column(Text, nullable=True)
