from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class MembershipTierEnum(str, enum.Enum):
    FREE = "free"
    GYANI = "gyani"
    PRAGYANI = "pragyani"
    PRAGYANI_PLUS = "pragyani_plus"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    membership_tier = Column(
        Enum(MembershipTierEnum),
        default=MembershipTierEnum.FREE,
        nullable=False
    )
    membership_start_date = Column(DateTime, nullable=True)
    membership_end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_token_expires = Column(DateTime, nullable=True)
    has_seen_dashboard_tour = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    teaching_accesses = relationship("TeachingAccess", back_populates="user", cascade="all, delete-orphan")
    teaching_favorites = relationship("TeachingFavorite", back_populates="user", cascade="all, delete-orphan")
    teaching_watch_later = relationship("TeachingWatchLater", back_populates="user", cascade="all, delete-orphan")
    teaching_comments = relationship("TeachingComment", back_populates="user", cascade="all, delete-orphan")
    course_enrollments = relationship("CourseEnrollment", back_populates="user", cascade="all, delete-orphan")
    course_comments = relationship("CourseComment", back_populates="user", cascade="all, delete-orphan")
    retreat_registrations = relationship("RetreatRegistration", back_populates="user", cascade="all, delete-orphan")
    calendar_events = relationship("UserCalendar", back_populates="user", cascade="all, delete-orphan")
    book_group_accesses = relationship("BookGroupAccess", back_populates="user", cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    product_accesses = relationship("UserProductAccess", back_populates="user", cascade="all, delete-orphan")
    product_bookmarks = relationship("ProductBookmark", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("UserAnalytics", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    preferences = Column(JSON_TYPE, nullable=True, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")
