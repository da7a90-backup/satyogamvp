from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy import String
from ..core.db_types import UUID_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"


class MembershipTier(Base):
    """This table is for reference/pricing - actual tier is on User model."""
    __tablename__ = "membership_tiers"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)  # free, pragyani, pragyani_plus
    display_name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    price_monthly = Column(Numeric(10, 2), nullable=True)
    price_annual = Column(Numeric(10, 2), nullable=True)
    features = Column(String, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tier = Column(String(50), nullable=False)  # free, pragyani, pragyani_plus
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)
    auto_renew = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    payment = relationship("Payment")
