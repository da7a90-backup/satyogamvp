"""Pydantic schemas for Recommendations."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import uuid


class RecommendationBase(BaseModel):
    """Base schema for Recommendation."""
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    recommendation_type: str = Field(..., pattern="^(book|documentary)$")

    # Book-specific fields
    author: Optional[str] = None
    amazon_url: Optional[str] = None
    cover_image_url: Optional[str] = None

    # Documentary-specific fields
    youtube_id: Optional[str] = None
    duration: Optional[int] = None  # seconds
    thumbnail_url: Optional[str] = None

    # Common fields
    category: Optional[str] = None
    access_level: str = "gyani"
    display_order: int = 0
    published_date: Optional[datetime] = None


class RecommendationCreate(RecommendationBase):
    """Schema for creating a new Recommendation."""

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v):
        """Validate slug format."""
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Slug must contain only alphanumeric characters, hyphens, and underscores')
        return v


class RecommendationUpdate(BaseModel):
    """Schema for updating an existing Recommendation."""
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    recommendation_type: Optional[str] = None

    # Book-specific fields
    author: Optional[str] = None
    amazon_url: Optional[str] = None
    cover_image_url: Optional[str] = None

    # Documentary-specific fields
    youtube_id: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None

    # Common fields
    category: Optional[str] = None
    access_level: Optional[str] = None
    display_order: Optional[int] = None
    published_date: Optional[datetime] = None


class RecommendationResponse(BaseModel):
    """Schema for Recommendation response."""
    id: str
    slug: str
    title: str
    description: Optional[str] = None
    recommendation_type: str

    # Book-specific fields
    author: Optional[str] = None
    amazon_url: Optional[str] = None
    cover_image_url: Optional[str] = None

    # Documentary-specific fields
    youtube_id: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None

    # Common fields
    category: Optional[str] = None
    access_level: str
    display_order: int
    published_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        """Convert UUID to string."""
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    """Schema for paginated list of Recommendations."""
    recommendations: list[RecommendationResponse]
    total: int
    skip: int
    limit: int
