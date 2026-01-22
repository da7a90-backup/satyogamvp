"""Recommendation model for Shunyamurti Recommends (Books & Documentaries)."""

from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy import String
from ..core.db_types import UUID_TYPE
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class RecommendationType(str, enum.Enum):
    BOOK = "book"
    DOCUMENTARY = "documentary"


class Recommendation(Base):
    """Recommendations for books and documentaries (GYANI+ access)."""
    __tablename__ = "recommendations"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    recommendation_type = Column(String(50), nullable=False, index=True)  # 'book' or 'documentary'

    # Book-specific fields
    author = Column(String(255), nullable=True)  # For books
    amazon_url = Column(String(500), nullable=True)  # For books
    cover_image_url = Column(String(500), nullable=True)  # For books

    # Documentary-specific fields
    youtube_id = Column(String(100), nullable=True)  # For documentaries
    duration = Column(Integer, nullable=True)  # Duration in seconds (for documentaries)
    thumbnail_url = Column(String(500), nullable=True)  # For documentaries (auto-fetched from YouTube)

    # Common fields
    category = Column(String(100), nullable=True, index=True)  # e.g., "Spirituality", "Philosophy", "Psychology"
    access_level = Column(String(50), default='gyani', nullable=False, index=True)  # Default: 'gyani' (requires GYANI+)
    display_order = Column(Integer, default=0, nullable=False)  # For manual ordering
    published_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
