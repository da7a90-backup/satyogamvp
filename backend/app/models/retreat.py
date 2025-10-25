from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class RetreatType(str, enum.Enum):
    ONLINE = "online"
    ONSITE_DARSHAN = "onsite_darshan"
    ONSITE_SHAKTI = "onsite_shakti"
    ONSITE_SEVADHARI = "onsite_sevadhari"


class AccessType(str, enum.Enum):
    LIFETIME = "lifetime"
    LIMITED_12DAY = "limited_12day"


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Retreat(Base):
    __tablename__ = "retreats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(RetreatType), nullable=False, index=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    price_lifetime = Column(Numeric(10, 2), nullable=True)  # for online retreats
    price_limited = Column(Numeric(10, 2), nullable=True)  # 12-day access
    price_onsite = Column(Numeric(10, 2), nullable=True)  # for onsite retreats
    location = Column(String(255), nullable=True)
    max_participants = Column(Integer, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    portals = relationship("RetreatPortal", back_populates="retreat", cascade="all, delete-orphan")
    registrations = relationship("RetreatRegistration", back_populates="retreat", cascade="all, delete-orphan")


class RetreatPortal(Base):
    """Content/portal for online retreats."""
    __tablename__ = "retreat_portals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    retreat_id = Column(UUID(as_uuid=True), ForeignKey("retreats.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(JSONB, nullable=True)  # videos, materials, sessions, etc.
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    retreat = relationship("Retreat", back_populates="portals")


class RetreatRegistration(Base):
    __tablename__ = "retreat_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    retreat_id = Column(UUID(as_uuid=True), ForeignKey("retreats.id", ondelete="CASCADE"), nullable=False, index=True)
    access_type = Column(Enum(AccessType), nullable=True)  # for online retreats
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    access_expires_at = Column(DateTime, nullable=True)  # for 12-day access
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING, nullable=False)
    application_data = Column(JSONB, nullable=True)  # for onsite retreat applications

    # Relationships
    user = relationship("User", back_populates="retreat_registrations")
    retreat = relationship("Retreat", back_populates="registrations")
    payment = relationship("Payment")
