from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class EventType(str, enum.Enum):
    SATSANG = "satsang"
    BOOK_GROUP = "book_group"
    LIVE_EVENT = "live_event"
    RETREAT = "retreat"
    COURSE = "course"


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(EventType), nullable=False, index=True)
    start_datetime = Column(DateTime, nullable=False, index=True)
    end_datetime = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)  # physical address or "online"
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(JSON_TYPE, nullable=True)  # iCal RRULE format
    max_participants = Column(Integer, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user_calendars = relationship("UserCalendar", back_populates="event", cascade="all, delete-orphan")


class UserCalendar(Base):
    """User's personal calendar with their events."""
    __tablename__ = "user_calendars"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID_TYPE, ForeignKey("events.id", ondelete="CASCADE"), nullable=True, index=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id", ondelete="CASCADE"), nullable=True, index=True)
    custom_title = Column(String(500), nullable=True)  # if user wants custom name
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reminded_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="calendar_events")
    event = relationship("Event", back_populates="user_calendars")
    retreat = relationship("Retreat")
