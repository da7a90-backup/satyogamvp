"""Blog models for SQLAlchemy ORM."""
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class BlogCategory(Base):
    """Blog category model."""

    __tablename__ = "blog_categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posts = relationship("BlogPost", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BlogCategory(id={self.id}, name={self.name})>"


class BlogPost(Base):
    """Blog post model with rich text content."""

    __tablename__ = "blog_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Rich text/Markdown content
    featured_image = Column(String(500), nullable=True)  # URL to featured image

    # Metadata
    author_name = Column(String(100), nullable=True)
    author_image = Column(String(500), nullable=True)
    read_time = Column(Integer, nullable=True)  # Reading time in minutes
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)

    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(500), nullable=True)

    # Foreign keys
    category_id = Column(String, ForeignKey("blog_categories.id"), nullable=True)

    # Timestamps
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("BlogCategory", back_populates="posts")

    def __repr__(self):
        return f"<BlogPost(id={self.id}, title={self.title})>"
