from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ContentType(str, enum.Enum):
    VIDEO = "video"
    AUDIO = "audio"
    ESSAY = "essay"
    MEDITATION = "meditation"


class AccessLevel(str, enum.Enum):
    FREE = "free"
    PREVIEW = "preview"
    PRAGYANI = "pragyani"
    PRAGYANI_PLUS = "pragyani_plus"


class Teaching(Base):
    __tablename__ = "teachings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    access_level = Column(Enum(AccessLevel), default=AccessLevel.FREE, nullable=False, index=True)
    preview_duration = Column(Integer, nullable=True)  # seconds, for video/audio previews
    video_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    text_content = Column(Text, nullable=True)  # markdown content for essays
    thumbnail_url = Column(String(500), nullable=True)
    duration = Column(Integer, nullable=True)  # total duration in seconds
    published_date = Column(DateTime, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(JSONB, nullable=True, default=[])
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    accesses = relationship("TeachingAccess", back_populates="teaching", cascade="all, delete-orphan")
    favorites = relationship("TeachingFavorite", back_populates="teaching", cascade="all, delete-orphan")


class TeachingAccess(Base):
    """Track when users access teachings."""
    __tablename__ = "teaching_accesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID(as_uuid=True), ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    accessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    duration_watched = Column(Integer, nullable=True)  # seconds watched

    # Relationships
    user = relationship("User", back_populates="teaching_accesses")
    teaching = relationship("Teaching", back_populates="accesses")


class TeachingFavorite(Base):
    """User's favorite teachings."""
    __tablename__ = "teaching_favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID(as_uuid=True), ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="teaching_favorites")
    teaching = relationship("Teaching", back_populates="favorites")
