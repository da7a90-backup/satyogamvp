from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ContentType(str, enum.Enum):
    VIDEO = "video"
    VIDEOANDAUDIO = "videoandaudio"
    AUDIO = "audio"
    TEXT = "text"


class AccessLevel(str, enum.Enum):
    FREE = "free"
    PREVIEW = "preview"
    GYANI = "gyani"
    PRAGYANI = "pragyani"
    PRAGYANI_PLUS = "pragyani_plus"


class Teaching(Base):
    __tablename__ = "teachings"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(String(50), nullable=False)  # video, videoandaudio, audio, text
    access_level = Column(String(50), default='free', nullable=False, index=True)  # free, preview, gyani, pragyani, pragyani_plus
    preview_duration = Column(Integer, nullable=True)  # minutes, for public video/audio previews
    dash_preview_duration = Column(Integer, nullable=True)  # minutes, preview duration when logged in to dashboard
    video_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    cloudflare_ids = Column(JSON_TYPE, nullable=True, default=[])  # Cloudflare video IDs
    podbean_ids = Column(JSON_TYPE, nullable=True, default=[])  # Podbean audio IDs
    youtube_ids = Column(JSON_TYPE, nullable=True, default=[])  # YouTube video IDs
    text_content = Column(Text, nullable=True)  # markdown content for essays
    thumbnail_url = Column(String(500), nullable=True)
    duration = Column(Integer, nullable=True)  # total duration in seconds
    published_date = Column(DateTime, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(JSON_TYPE, nullable=True, default=[])
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    accesses = relationship("TeachingAccess", back_populates="teaching", cascade="all, delete-orphan")
    favorites = relationship("TeachingFavorite", back_populates="teaching", cascade="all, delete-orphan")
    watch_later = relationship("TeachingWatchLater", back_populates="teaching", cascade="all, delete-orphan")
    comments = relationship("TeachingComment", back_populates="teaching", cascade="all, delete-orphan")


class TeachingAccess(Base):
    """Track when users access teachings."""
    __tablename__ = "teaching_accesses"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID_TYPE, ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    accessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    duration_watched = Column(Integer, nullable=True)  # seconds watched

    # Relationships
    user = relationship("User", back_populates="teaching_accesses")
    teaching = relationship("Teaching", back_populates="accesses")


class TeachingFavorite(Base):
    """User's favorite teachings."""
    __tablename__ = "teaching_favorites"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID_TYPE, ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="teaching_favorites")
    teaching = relationship("Teaching", back_populates="favorites")


class TeachingWatchLater(Base):
    """User's watch later list."""
    __tablename__ = "teaching_watch_later"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID_TYPE, ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="teaching_watch_later")
    teaching = relationship("Teaching", back_populates="watch_later")


class TeachingComment(Base):
    """Comments on teachings."""
    __tablename__ = "teaching_comments"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    teaching_id = Column(UUID_TYPE, ForeignKey("teachings.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(UUID_TYPE, ForeignKey("teaching_comments.id", ondelete="CASCADE"), nullable=True, index=True)  # For replies
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="teaching_comments")
    teaching = relationship("Teaching", back_populates="comments")
    parent = relationship("TeachingComment", remote_side=[id], backref="replies")
