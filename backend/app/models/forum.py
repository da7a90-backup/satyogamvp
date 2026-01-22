from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base
from ..core.db_types import UUID_TYPE, JSON_TYPE


class ReactionType(str, enum.Enum):
    LIKE = "like"
    LOVE = "love"
    INSIGHTFUL = "insightful"
    GRATEFUL = "grateful"
    QUESTION = "question"


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ForumCategory(Base):
    """Forum categories to organize discussions"""
    __tablename__ = "forum_categories"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon name for UI
    order = Column(Integer, default=0, nullable=False)  # Display order
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    threads = relationship("ForumThread", back_populates="category", cascade="all, delete-orphan")


class ForumThread(Base):
    """Forum discussion threads"""
    __tablename__ = "forum_threads"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    category_id = Column(UUID_TYPE, ForeignKey("forum_categories.id"), nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)

    # Moderation flags
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)

    # Statistics
    view_count = Column(Integer, default=0, nullable=False)
    post_count = Column(Integer, default=0, nullable=False)  # Cached count

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_post_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    category = relationship("ForumCategory", back_populates="threads")
    user = relationship("User", foreign_keys=[user_id])
    posts = relationship("ForumPost", back_populates="thread", cascade="all, delete-orphan")


class ForumPost(Base):
    """Forum posts and replies (supports nesting)"""
    __tablename__ = "forum_posts"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    thread_id = Column(UUID_TYPE, ForeignKey("forum_threads.id"), nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    parent_post_id = Column(UUID_TYPE, ForeignKey("forum_posts.id"), nullable=True, index=True)

    # Content (stored as HTML from Tiptap)
    content = Column(Text, nullable=False)

    # Metadata
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_edited = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    edited_at = Column(DateTime, nullable=True)

    # Relationships
    thread = relationship("ForumThread", back_populates="posts")
    user = relationship("User", foreign_keys=[user_id])
    parent_post = relationship("ForumPost", remote_side=[id], foreign_keys=[parent_post_id])
    replies = relationship("ForumPost", remote_side=[parent_post_id], cascade="all, delete-orphan")
    reactions = relationship("ForumPostReaction", back_populates="post", cascade="all, delete-orphan")
    attachments = relationship("ForumPostAttachment", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("ForumReport", back_populates="post", cascade="all, delete-orphan")
    mentions = relationship("ForumMention", back_populates="post", cascade="all, delete-orphan")


class ForumPostReaction(Base):
    """Reactions/likes on forum posts"""
    __tablename__ = "forum_post_reactions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    post_id = Column(UUID_TYPE, ForeignKey("forum_posts.id"), nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    reaction_type = Column(Enum(ReactionType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("ForumPost", back_populates="reactions")
    user = relationship("User")

    # Unique constraint: one reaction type per user per post
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class ForumPostAttachment(Base):
    """File/image attachments on forum posts"""
    __tablename__ = "forum_post_attachments"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    post_id = Column(UUID_TYPE, ForeignKey("forum_posts.id"), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)  # Cloudflare CDN URL
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # Size in bytes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("ForumPost", back_populates="attachments")


class ForumReport(Base):
    """User reports for inappropriate content"""
    __tablename__ = "forum_reports"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    post_id = Column(UUID_TYPE, ForeignKey("forum_posts.id"), nullable=False, index=True)
    reporter_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True)

    # Admin action
    resolved_by = Column(UUID_TYPE, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("ForumPost", back_populates="reports")
    reporter = relationship("User", foreign_keys=[reporter_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


class ForumUserBan(Base):
    """Forum bans for users"""
    __tablename__ = "forum_user_bans"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    banned_by = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    is_permanent = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[banned_by])


class ForumMention(Base):
    """@username mentions in posts with notifications"""
    __tablename__ = "forum_mentions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    post_id = Column(UUID_TYPE, ForeignKey("forum_posts.id"), nullable=False, index=True)
    mentioned_user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    post = relationship("ForumPost", back_populates="mentions")
    mentioned_user = relationship("User")
