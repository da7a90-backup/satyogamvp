from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..core.database import Base


class AnalyticsEvent(Base):
    """Track analytics events from Mixpanel and other sources."""
    __tablename__ = "analytics_events"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    event_name = Column(String(255), nullable=False, index=True)
    event_properties = Column(JSON_TYPE, nullable=True, default={})
    mixpanel_event_id = Column(String(255), nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User")


class UserAnalytics(Base):
    """Aggregated analytics for each user."""
    __tablename__ = "user_analytics"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Financial metrics
    total_donations = Column(Numeric(10, 2), default=0, nullable=False)
    total_spent = Column(Numeric(10, 2), default=0, nullable=False)

    # Engagement metrics
    courses_enrolled = Column(Integer, default=0, nullable=False)
    courses_completed = Column(Integer, default=0, nullable=False)
    retreats_attended = Column(Integer, default=0, nullable=False)
    teachings_viewed = Column(Integer, default=0, nullable=False)

    # Activity
    last_active_at = Column(DateTime, nullable=True)
    total_sessions = Column(Integer, default=0, nullable=False)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="analytics")
