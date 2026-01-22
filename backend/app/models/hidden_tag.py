"""
Hidden Tags Model
Manages which content entities (teachings, blog posts, products, etc.)
appear on specific marketing pages with custom ordering.
"""
from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class EntityType(str, enum.Enum):
    """Types of entities that can be tagged for pages"""
    TEACHING = "teaching"
    BLOG = "blog"
    PRODUCT = "product"
    RETREAT = "retreat"
    EVENT = "event"


class HiddenTag(Base):
    """
    HiddenTag model for managing which content appears on which pages.

    Example usage:
    - Show specific teachings on homepage (page_tag="homepage/teachings")
    - Show specific blog posts on about/satyoga page (page_tag="about/satyoga/blog")
    - Show specific books on about/shunyamurti page (page_tag="about/shunyamurti/books")
    """
    __tablename__ = "hidden_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Entity reference
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    entity_type = Column(SQLEnum(EntityType), nullable=False, index=True)

    # Page tagging
    page_tag = Column(String, nullable=False, index=True)
    # Format: "page_slug/section" or just "page_slug"
    # Examples: "homepage/teachings", "about/satyoga/blog", "about/shunyamurti/books"

    # Ordering within page section
    order_index = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<HiddenTag {self.entity_type}:{self.entity_id} on {self.page_tag}>"
