from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class BookGroupStatus(str, enum.Enum):
    """Status of a book group."""
    UPCOMING = "upcoming"  # Not started yet, future sessions
    LIVE = "live"  # Currently ongoing with zoom meetings
    COMPLETED = "completed"  # Finished, converted to videos


class BookGroupAccessType(str, enum.Enum):
    """How user gained access to the book group."""
    MEMBERSHIP = "membership"  # Automatic access via Gyani+ membership
    PURCHASE = "purchase"  # Purchased from store


class BookGroup(Base):
    """Book groups - weekly discussion series about specific books/topics."""
    __tablename__ = "book_groups"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)

    # Media
    hero_image = Column(String(500), nullable=True)  # Large header image
    book_cover_image = Column(String(500), nullable=True)  # Book cover for overlay
    thumbnail = Column(String(500), nullable=True)  # Grid view thumbnail

    # Image positioning (for Cloudflare transformations)
    hero_image_gravity = Column(String(50), default="auto", nullable=True)
    thumbnail_gravity = Column(String(50), default="auto", nullable=True)

    # Status and visibility
    status = Column(Enum(BookGroupStatus), default=BookGroupStatus.UPCOMING, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)  # "Coming up" featured section
    is_published = Column(Boolean, default=True, nullable=False, index=True)

    # Scheduling
    start_date = Column(DateTime, nullable=True)  # First session date
    end_date = Column(DateTime, nullable=True)  # Last session date
    meeting_day_of_week = Column(String(20), nullable=True)  # e.g., "Sunday", "Wednesday"
    meeting_time = Column(String(10), nullable=True)  # e.g., "19:00" (7 PM)
    duration_minutes = Column(Integer, default=90, nullable=True)

    # Access control
    requires_purchase = Column(Boolean, default=False, nullable=False)  # If False, Gyani+ gets automatic access
    store_product_id = Column(UUID_TYPE, ForeignKey("products.id"), nullable=True)  # For completed book groups sold in store

    # Content tabs
    has_transcription = Column(Boolean, default=False, nullable=False)
    has_audio = Column(Boolean, default=False, nullable=False)
    has_downloads = Column(Boolean, default=False, nullable=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sessions = relationship("BookGroupSession", back_populates="book_group", cascade="all, delete-orphan", order_by="BookGroupSession.week_number")
    accesses = relationship("BookGroupAccess", back_populates="book_group", cascade="all, delete-orphan")
    store_product = relationship("Product", foreign_keys=[store_product_id])
    calendar_reminders = relationship("UserCalendar", foreign_keys="UserCalendar.book_group_id", back_populates="book_group")


class BookGroupSession(Base):
    """Individual weekly sessions within a book group."""
    __tablename__ = "book_group_sessions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    book_group_id = Column(UUID_TYPE, ForeignKey("book_groups.id", ondelete="CASCADE"), nullable=False, index=True)

    # Session identification
    week_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    title = Column(String(500), nullable=False)  # e.g., "Week 1: Introduction"
    description = Column(Text, nullable=True)

    # Scheduling (for live sessions)
    session_date = Column(DateTime, nullable=True)  # Specific date/time for this week's meeting

    # Zoom (for live/upcoming sessions)
    zoom_link = Column(String(500), nullable=True)
    zoom_enabled = Column(Boolean, default=False, nullable=False)  # Admin controls when zoom appears to users
    zoom_meeting_id = Column(String(100), nullable=True)
    zoom_password = Column(String(100), nullable=True)

    # Media (for completed sessions)
    video_url = Column(String(500), nullable=True)  # Cloudflare R2 or YouTube
    audio_url = Column(String(500), nullable=True)  # Cloudflare R2 MP3
    transcript_url = Column(String(500), nullable=True)  # PDF transcript
    duration_minutes = Column(Integer, nullable=True)

    # Downloads (JSON array of {title, url, type})
    downloads = Column(JSON_TYPE, nullable=True)  # [{"title": "Study Guide", "url": "...", "type": "pdf"}]

    # Metadata
    order_index = Column(Integer, default=0, nullable=False)  # For custom ordering
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    book_group = relationship("BookGroup", back_populates="sessions")


class BookGroupAccess(Base):
    """Tracks which users have access to which book groups and how they got access."""
    __tablename__ = "book_group_accesses"
    __table_args__ = (
        UniqueConstraint('user_id', 'book_group_id', name='uq_user_book_group'),
    )

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    book_group_id = Column(UUID_TYPE, ForeignKey("book_groups.id", ondelete="CASCADE"), nullable=False, index=True)

    # Access type
    access_type = Column(Enum(BookGroupAccessType), nullable=False)
    order_id = Column(UUID_TYPE, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)  # For purchased access

    # Metadata
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration

    # Relationships
    user = relationship("User", back_populates="book_group_accesses")
    book_group = relationship("BookGroup", back_populates="accesses")
    order = relationship("Order")
