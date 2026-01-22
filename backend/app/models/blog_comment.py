"""Blog comment models for SQLAlchemy ORM."""
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.db_types import UUID_TYPE
import uuid


class BlogComment(Base):
    """Blog comment model with nested replies support."""

    __tablename__ = "blog_comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_post_id = Column(String, ForeignKey("blog_posts.id"), nullable=False)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)  # Moderation flag

    # For nested comments/replies
    parent_comment_id = Column(String, ForeignKey("blog_comments.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    blog_post = relationship("BlogPost", backref="comments")
    user = relationship("User", backref="blog_comments")
    parent = relationship("BlogComment", remote_side=[id], backref="replies")

    def __repr__(self):
        return f"<BlogComment(id={self.id}, post_id={self.blog_post_id}, user_id={self.user_id})>"
