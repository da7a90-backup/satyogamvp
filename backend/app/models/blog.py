from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..core.database import Base


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)  # markdown
    excerpt = Column(Text, nullable=True)
    author_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(JSON_TYPE, nullable=True, default=[])
    featured_image = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    author = relationship("User")
