from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.book_group import BookGroupStatus, BookGroupAccessType


# ===== Session Schemas =====

class BookGroupSessionBase(BaseModel):
    week_number: int = Field(..., gt=0, description="Week number (1, 2, 3, etc.)")
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    session_date: Optional[datetime] = None

    # Zoom fields (for live/upcoming sessions)
    zoom_link: Optional[str] = None
    zoom_enabled: bool = False
    zoom_meeting_id: Optional[str] = None
    zoom_password: Optional[str] = None

    # Media fields (for completed sessions)
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    transcript_url: Optional[str] = None
    duration_minutes: Optional[int] = None

    # Downloads
    downloads: Optional[List[Dict[str, Any]]] = None  # [{"title": "...", "url": "...", "type": "pdf"}]

    order_index: int = 0
    is_published: bool = True


class BookGroupSessionCreate(BookGroupSessionBase):
    """Schema for creating a new session."""
    pass


class BookGroupSessionUpdate(BaseModel):
    """Schema for updating an existing session (all fields optional)."""
    week_number: Optional[int] = Field(None, gt=0)
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    session_date: Optional[datetime] = None
    zoom_link: Optional[str] = None
    zoom_enabled: Optional[bool] = None
    zoom_meeting_id: Optional[str] = None
    zoom_password: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    transcript_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    downloads: Optional[List[Dict[str, Any]]] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None


class BookGroupSessionInDB(BookGroupSessionBase):
    """Session as stored in database."""
    id: str
    book_group_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Book Group Schemas =====

class BookGroupBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = None

    # Media
    hero_image: Optional[str] = None
    book_cover_image: Optional[str] = None
    thumbnail: Optional[str] = None
    hero_image_gravity: Optional[str] = "auto"
    thumbnail_gravity: Optional[str] = "auto"

    # Status and visibility
    status: BookGroupStatus = BookGroupStatus.UPCOMING
    is_featured: bool = False
    is_published: bool = True

    # Scheduling
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    meeting_day_of_week: Optional[str] = None
    meeting_time: Optional[str] = None  # e.g., "19:00"
    duration_minutes: Optional[int] = 90

    # Access control
    requires_purchase: bool = False  # If False, Gyani+ gets automatic access
    store_product_id: Optional[str] = None

    # Content tabs
    has_transcription: bool = False
    has_audio: bool = False
    has_downloads: bool = False


class BookGroupCreate(BookGroupBase):
    """Schema for creating a new book group."""
    pass


class BookGroupUpdate(BaseModel):
    """Schema for updating an existing book group (all fields optional)."""
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = None
    hero_image: Optional[str] = None
    book_cover_image: Optional[str] = None
    thumbnail: Optional[str] = None
    hero_image_gravity: Optional[str] = None
    thumbnail_gravity: Optional[str] = None
    status: Optional[BookGroupStatus] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    meeting_day_of_week: Optional[str] = None
    meeting_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    requires_purchase: Optional[bool] = None
    store_product_id: Optional[str] = None
    has_transcription: Optional[bool] = None
    has_audio: Optional[bool] = None
    has_downloads: Optional[bool] = None


class BookGroupInDB(BookGroupBase):
    """Book group as stored in database."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== List View Schemas =====

class BookGroupCard(BaseModel):
    """Compact schema for grid/list view cards."""
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    thumbnail: Optional[str] = None
    thumbnail_gravity: Optional[str] = "auto"
    status: BookGroupStatus
    session_count: int = 0
    has_video: bool = False
    has_audio: bool = False
    start_date: Optional[datetime] = None
    is_featured: bool = False

    class Config:
        from_attributes = True


class BookGroupList(BaseModel):
    """Response schema for listing book groups."""
    total: int
    items: List[BookGroupCard]
    page: int = 1
    page_size: int = 20


class FeaturedBookGroup(BaseModel):
    """Schema for the featured 'Coming up' book group."""
    id: str
    slug: str
    title: str
    description: Optional[str] = None
    hero_image: Optional[str] = None
    book_cover_image: Optional[str] = None
    hero_image_gravity: Optional[str] = "auto"
    start_date: datetime
    meeting_day_of_week: Optional[str] = None
    meeting_time: Optional[str] = None
    zoom_enabled: bool = False  # Derived from first upcoming session
    next_session_date: Optional[datetime] = None
    days_until_next_session: Optional[int] = None

    class Config:
        from_attributes = True


# ===== Portal View Schemas =====

class BookGroupPortalSession(BookGroupSessionInDB):
    """Session data for portal view (may hide zoom links based on zoom_enabled)."""
    pass


class BookGroupPortal(BookGroupInDB):
    """Full portal data with all sessions."""
    sessions: List[BookGroupPortalSession] = []
    session_count: int = 0
    has_access: bool = False  # Will be set by the router based on user access
    access_type: Optional[BookGroupAccessType] = None


# ===== Access Control Schemas =====

class BookGroupAccessCheck(BaseModel):
    """Response for checking if user has access to a book group."""
    has_access: bool
    access_type: Optional[BookGroupAccessType] = None
    reason: Optional[str] = None  # e.g., "gyani_plus_member", "purchased", "no_access"


class BookGroupAccessCreate(BaseModel):
    """For manually granting access (admin use)."""
    user_id: str
    book_group_id: str
    access_type: BookGroupAccessType
    order_id: Optional[str] = None
    expires_at: Optional[datetime] = None


class BookGroupAccessInDB(BaseModel):
    """Book group access as stored in database."""
    id: str
    user_id: str
    book_group_id: str
    access_type: BookGroupAccessType
    order_id: Optional[str] = None
    granted_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== Admin Management Schemas =====

class BookGroupAdmin(BookGroupInDB):
    """Extended schema for admin view with additional metadata."""
    sessions: List[BookGroupSessionInDB] = []
    session_count: int = 0
    access_count: int = 0  # Number of users with access
    store_product_title: Optional[str] = None  # If linked to store product


class BookGroupMarkCompleted(BaseModel):
    """Request to mark a book group as completed."""
    replace_zoom_with_videos: bool = True  # Whether to clear zoom links


class BookGroupConvertToProduct(BaseModel):
    """Request to convert completed book group to a store product."""
    product_title: Optional[str] = None  # If None, uses book group title
    product_description: Optional[str] = None  # If None, uses book group description
    price: float = Field(..., gt=0)
    regular_price: Optional[float] = None
    member_discount: Optional[float] = 10.0  # Percentage
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None


# ===== Calendar Reminder Schemas =====

class CalendarReminderCreate(BaseModel):
    """Request to add book group to user's calendar."""
    custom_title: Optional[str] = None  # Custom name for the reminder


class CalendarReminderResponse(BaseModel):
    """Response after adding reminder."""
    success: bool
    message: str
    calendar_id: Optional[str] = None
