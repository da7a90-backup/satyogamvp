"""Pydantic schemas for Teaching models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from ..models.teaching import ContentType, AccessLevel


class TeachingBase(BaseModel):
    """Base teaching schema."""
    slug: str
    title: str
    description: Optional[str] = None
    content_type: ContentType
    access_level: AccessLevel = AccessLevel.FREE
    preview_duration: Optional[int] = None  # minutes
    dash_preview_duration: Optional[int] = None  # minutes
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    cloudflare_ids: List[str] = []
    podbean_ids: List[str] = []
    youtube_ids: List[str] = []
    text_content: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    published_date: Optional[datetime] = None
    category: Optional[str] = None
    tags: List[str] = []


class TeachingCreate(TeachingBase):
    """Schema for creating a teaching."""
    pass


class TeachingUpdate(BaseModel):
    """Schema for updating a teaching."""
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[ContentType] = None
    access_level: Optional[AccessLevel] = None
    preview_duration: Optional[int] = None  # minutes
    dash_preview_duration: Optional[int] = None  # minutes
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    cloudflare_ids: Optional[List[str]] = None
    podbean_ids: Optional[List[str]] = None
    youtube_ids: Optional[List[str]] = None
    text_content: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    published_date: Optional[datetime] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None


class TeachingResponse(TeachingBase):
    """Schema for teaching response."""
    id: UUID4
    view_count: int
    created_at: datetime
    updated_at: datetime

    # Access control info (added dynamically)
    can_access: Optional[bool] = None
    access_type: Optional[str] = None  # "full" or "preview"
    preview_duration_seconds: Optional[int] = None

    class Config:
        from_attributes = True


class TeachingAccessCreate(BaseModel):
    """Schema for tracking teaching access."""
    teaching_id: UUID4
    duration_watched: Optional[int] = None


class TeachingFavoriteToggle(BaseModel):
    """Schema for toggling favorite."""
    teaching_id: UUID4


class TeachingWatchLaterToggle(BaseModel):
    """Schema for toggling watch later."""
    teaching_id: UUID4


class TeachingListResponse(BaseModel):
    """Schema for teaching list response."""
    teachings: List[TeachingResponse]
    total: int
    page: int
    page_size: int


class CommentCreate(BaseModel):
    """Schema for creating a comment."""
    content: str
    parent_id: Optional[UUID4] = None  # For replies


class CommentUpdate(BaseModel):
    """Schema for updating a comment."""
    content: str


class CommentResponse(BaseModel):
    """Schema for comment response."""
    id: UUID4
    user_id: UUID4
    teaching_id: UUID4
    parent_id: Optional[UUID4] = None
    content: str
    created_at: datetime
    updated_at: datetime

    # User info (added dynamically)
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    # Reply info
    replies: Optional[List['CommentResponse']] = []

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """Schema for comment list response."""
    comments: List[CommentResponse]
    total: int
