"""Pydantic schemas for Retreat models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Dict, Any


class RetreatPortalBase(BaseModel):
    """Base retreat portal schema."""
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    order_index: int


class RetreatPortalResponse(RetreatPortalBase):
    """Schema for retreat portal response."""
    id: UUID4
    retreat_id: UUID4

    class Config:
        from_attributes = True


class RetreatBase(BaseModel):
    """Base retreat schema."""
    slug: str
    title: str
    type: str  # online, onsite_darshan, onsite_shakti, onsite_sevadhari
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    price_lifetime: Optional[float] = None
    price_limited: Optional[float] = None
    price_onsite: Optional[float] = None
    max_participants: Optional[int] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    location: Optional[str] = None

    # Selling Page Content
    subtitle: Optional[str] = None
    booking_tagline: Optional[str] = None
    intro1_title: Optional[str] = None
    intro1_content: Optional[List[str]] = None
    intro2_title: Optional[str] = None
    intro2_content: Optional[List[str]] = None
    intro3_title: Optional[str] = None
    intro3_content: Optional[List[str]] = None
    intro3_media: Optional[str] = None
    agenda_title: Optional[str] = None
    agenda_items: Optional[List[Dict[str, Any]]] = None
    included_title: Optional[str] = None
    included_items: Optional[List[Dict[str, Any]]] = None

    # Schedule (for selling page)
    schedule_tagline: Optional[str] = None
    schedule_title: Optional[str] = None
    schedule_items: Optional[List[Dict[str, Any]]] = None

    # Media
    hero_background: Optional[str] = None
    images: Optional[List[Dict[str, str]]] = None
    video_url: Optional[str] = None
    video_thumbnail: Optional[str] = None
    video_type: Optional[str] = None

    # Testimonials
    testimonial_tagline: Optional[str] = None
    testimonial_heading: Optional[str] = None
    testimonial_data: Optional[Dict[str, Any]] = None

    # Pricing Options
    price_options: Optional[List[Dict[str, Any]]] = None
    member_discount_percentage: Optional[int] = None
    scholarship_available: Optional[bool] = None
    scholarship_deadline: Optional[str] = None
    application_url: Optional[str] = None
    application_form_slug: Optional[str] = None
    product_component_data: Optional[Dict[str, Any]] = None

    # Portal/Selling Page Data
    invitation_video_url: Optional[str] = None
    announcement: Optional[str] = None
    about_content: Optional[str] = None
    about_image_url: Optional[str] = None
    overview_sections: Optional[List[Dict[str, Any]]] = None  # [{image_url, content}]
    preparation_instructions: Optional[List[Dict[str, Any]]] = None
    faq_data: Optional[List[Dict[str, str]]] = None
    live_schedule: Optional[List[Dict[str, Any]]] = None

    # Card Display Fields
    duration_days: Optional[int] = None
    has_audio: bool = True
    has_video: bool = True


class RetreatCreate(RetreatBase):
    """Schema for creating a retreat."""
    is_published: bool = False
    forum_enabled: bool = False


class RetreatUpdate(BaseModel):
    """Schema for updating a retreat."""
    slug: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    price_lifetime: Optional[float] = None
    price_limited: Optional[float] = None
    price_onsite: Optional[float] = None
    max_participants: Optional[int] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    forum_enabled: Optional[bool] = None
    thumbnail_url: Optional[str] = None
    subtitle: Optional[str] = None
    booking_tagline: Optional[str] = None
    location: Optional[str] = None


# Portal Content Schemas
class PortalSession(BaseModel):
    """Schema for a single session within a day."""
    session_title: str
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[int] = None  # in minutes
    type: Optional[str] = None  # meditation, teaching, q&a, etc.
    has_audio: bool = False
    has_video: bool = False
    teaching_id: Optional[str] = None
    youtube_live_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    zoom_link: Optional[str] = None
    is_text: bool = False


class PortalDay(BaseModel):
    """Schema for a single day in the portal."""
    title: str
    day_number: int
    date: Optional[str] = None
    day_label: Optional[str] = None
    sessions: List[PortalSession] = []


class PortalContent(BaseModel):
    """Schema for portal content structure."""
    days: List[PortalDay] = []


class PortalCreate(BaseModel):
    """Schema for creating/updating a retreat portal."""
    title: str
    description: Optional[str] = None
    content: PortalContent
    order_index: int = 0


class PortalUpdate(BaseModel):
    """Schema for updating a retreat portal."""
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[PortalContent] = None
    order_index: Optional[int] = None


class RetreatResponse(RetreatBase):
    """Schema for retreat response."""
    id: UUID4
    is_published: bool
    forum_enabled: bool
    created_at: datetime
    updated_at: datetime

    # Dynamic fields for registered users
    is_registered: Optional[bool] = None
    has_access: Optional[bool] = None
    access_type: Optional[str] = None  # lifetime, limited_12day, onsite
    access_expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RetreatDetailResponse(RetreatResponse):
    """Schema for detailed retreat response with portals."""
    portals: List[RetreatPortalResponse] = []


class RetreatRegistrationCreate(BaseModel):
    """Schema for retreat registration."""
    retreat_id: UUID4
    access_type: str  # lifetime, limited_12day, onsite
    payment_id: Optional[UUID4] = None
    application_data: Optional[Dict[str, Any]] = None


class RetreatRegistrationResponse(BaseModel):
    """Schema for retreat registration response."""
    id: UUID4
    user_id: UUID4
    retreat_id: UUID4
    access_type: str
    payment_id: Optional[UUID4]
    access_expires_at: Optional[datetime]
    status: str  # pending, approved, active, expired
    created_at: datetime

    class Config:
        from_attributes = True


class RetreatForumPostCreate(BaseModel):
    """Schema for creating a forum post."""
    title: Optional[str] = None  # Required for top-level posts, null for replies
    category: Optional[str] = None  # general, questions, insights, experiences, meditation, teachings
    content: str
    parent_id: Optional[UUID4] = None  # for replies


class RetreatForumPostResponse(BaseModel):
    """Schema for forum post response."""
    id: UUID4
    retreat_id: UUID4
    user_id: UUID4
    parent_id: Optional[UUID4]
    title: Optional[str] = None
    category: Optional[str] = None
    content: str
    created_at: datetime
    updated_at: datetime

    # User data
    user_name: Optional[str] = None
    user_photo: Optional[str] = None

    # Like data
    like_count: int = 0
    is_liked_by_user: bool = False

    # Replies
    replies: List["RetreatForumPostResponse"] = []

    class Config:
        from_attributes = True


# Update forward references
RetreatForumPostResponse.model_rebuild()


# ============================================================================
# PAST RETREAT PORTAL MEDIA SCHEMAS
# ============================================================================

class PortalMediaItem(BaseModel):
    """Schema for a single portal media item."""
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    order: int


class PortalMediaUpdate(BaseModel):
    """Schema for updating retreat portal media."""
    media_items: List[PortalMediaItem]


class PortalMediaResponse(BaseModel):
    """Schema for portal media response."""
    retreat_id: UUID4
    retreat_title: str
    retreat_slug: str
    is_past_retreat: bool
    is_published_to_store: bool
    store_product_id: Optional[UUID4]
    media_items: List[PortalMediaItem]


class PublishToStoreRequest(BaseModel):
    """Schema for publishing retreat to Dharma Bandhara store."""
    # Required Product Fields
    slug: str
    title: str
    price: float

    # Product Details
    description: Optional[str] = None
    short_description: Optional[str] = None

    # Pricing Fields
    regular_price: Optional[float] = None
    sale_price: Optional[float] = None
    member_discount: Optional[float] = 10.0  # Percentage discount for members

    # Media Fields
    thumbnail_url: Optional[str] = None
    featured_image: Optional[str] = None
    images: Optional[List[str]] = None  # Gallery images

    # WooCommerce Metadata
    sku: Optional[str] = None
    woo_type: Optional[List[str]] = None

    # Categories and Tags
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    # Inventory & Visibility
    is_available: bool = True
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    published: bool = True
    featured: bool = False

    # Additional Metadata
    weight: Optional[str] = None
    allow_reviews: bool = False
    external_url: Optional[str] = None


class PublishToStoreResponse(BaseModel):
    """Schema for publish-to-store response."""
    product_id: UUID4
    product_slug: str
    product_title: str
    retreat_id: UUID4
    portal_url: str
    message: str
