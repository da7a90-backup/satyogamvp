from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class EventType(str, enum.Enum):
    SATSANG = "SATSANG"
    BOOK_GROUP = "BOOK_GROUP"
    LIVE_EVENT = "LIVE_EVENT"
    RETREAT = "RETREAT"
    COURSE = "COURSE"


class LocationType(str, enum.Enum):
    ONLINE = "ONLINE"
    ONSITE = "ONSITE"


class EventStructure(str, enum.Enum):
    """Defines how event content is organized."""
    SIMPLE_RECURRING = "SIMPLE_RECURRING"  # Simple recurring events (e.g., Sunday meditation)
    DAY_BY_DAY = "DAY_BY_DAY"  # Day-by-day schedule (e.g., online retreats)
    WEEK_BY_WEEK = "WEEK_BY_WEEK"  # Week-by-week schedule (e.g., book groups)


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(EventType), nullable=False, index=True)

    # Location
    location_type = Column(Enum(LocationType), nullable=False, default=LocationType.ONLINE, index=True)
    location = Column(String(255), nullable=True)  # physical address or location name

    # Timing
    start_datetime = Column(DateTime, nullable=False, index=True)
    end_datetime = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)  # for recurring events

    # Structure
    event_structure = Column(Enum(EventStructure), nullable=False, default=EventStructure.SIMPLE_RECURRING)

    # Recurring settings
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(String(500), nullable=True)  # RRULE format (e.g., "FREQ=WEEKLY;BYDAY=SU")

    # Online event settings
    zoom_link = Column(String(500), nullable=True)  # For online events
    meeting_id = Column(String(100), nullable=True)
    meeting_password = Column(String(100), nullable=True)

    # Registration
    max_participants = Column(Integer, nullable=True)
    registration_required = Column(Boolean, default=False, nullable=False)
    registration_url = Column(String(500), nullable=True)

    # Publishing
    is_published = Column(Boolean, default=True, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user_calendars = relationship("UserCalendar", back_populates="event", cascade="all, delete-orphan")
    sessions = relationship("EventSession", back_populates="event", cascade="all, delete-orphan", order_by="EventSession.session_number")


class EventSession(Base):
    """Individual sessions for structured events (day-by-day or week-by-week)."""
    __tablename__ = "event_sessions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID_TYPE, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)

    # Session identification
    session_number = Column(Integer, nullable=False)  # 1, 2, 3... (day 1, week 1, etc.)
    title = Column(String(500), nullable=False)  # e.g., "Day 1: Introduction" or "Week 1: Chapter 1"
    description = Column(Text, nullable=True)

    # Timing (for day-by-day structure)
    session_date = Column(DateTime, nullable=True)  # specific date for this session
    start_time = Column(String(10), nullable=True)  # e.g., "09:00" (for daily schedule)
    duration_minutes = Column(Integer, nullable=True)

    # Content
    content = Column(Text, nullable=True)  # Full session content/notes
    video_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    materials_url = Column(String(500), nullable=True)  # PDF, docs, etc.

    # For online sessions
    zoom_link = Column(String(500), nullable=True)  # Can override event-level zoom link

    # Metadata
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    event = relationship("Event", back_populates="sessions")


class UserCalendar(Base):
    """User's personal calendar with their events."""
    __tablename__ = "user_calendars"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID_TYPE, ForeignKey("events.id", ondelete="CASCADE"), nullable=True, index=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id", ondelete="CASCADE"), nullable=True, index=True)
    book_group_id = Column(UUID_TYPE, ForeignKey("book_groups.id", ondelete="CASCADE"), nullable=True, index=True)
    custom_title = Column(String(500), nullable=True)  # if user wants custom name
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reminded_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="calendar_events")
    event = relationship("Event", back_populates="user_calendars")
    retreat = relationship("Retreat")
    book_group = relationship("BookGroup", foreign_keys=[book_group_id], back_populates="calendar_reminders")
