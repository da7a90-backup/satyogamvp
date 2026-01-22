"""Pydantic schemas for forum models."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.forum import ReactionType, ReportStatus


# User Summary (for displaying in forum posts)
class ForumUserSummary(BaseModel):
    """Minimal user info for forum display."""
    id: str
    name: str
    membership_tier: str

    class Config:
        from_attributes = True


# Category Schemas
class ForumCategoryBase(BaseModel):
    """Base forum category schema."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    order: int = Field(default=0, ge=0)


class ForumCategoryCreate(ForumCategoryBase):
    """Schema for creating a forum category."""
    pass


class ForumCategoryUpdate(BaseModel):
    """Schema for updating a forum category."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ForumCategoryResponse(ForumCategoryBase):
    """Schema for forum category response."""
    id: str
    is_active: bool
    thread_count: int = 0  # Calculated field
    post_count: int = 0  # Calculated field
    latest_thread: Optional["ForumThreadSummary"] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Thread Schemas
class ForumThreadBase(BaseModel):
    """Base forum thread schema."""
    title: str = Field(..., min_length=1, max_length=255)
    category_id: str


class ForumThreadCreate(ForumThreadBase):
    """Schema for creating a forum thread."""
    initial_post_content: str = Field(..., min_length=1)  # First post content
    attachments: Optional[List[str]] = None  # List of attachment URLs


class ForumThreadUpdate(BaseModel):
    """Schema for updating a forum thread."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[str] = None


class ForumThreadSummary(BaseModel):
    """Summary of thread for list views."""
    id: str
    title: str
    slug: str
    user: ForumUserSummary
    is_pinned: bool
    is_locked: bool
    view_count: int
    post_count: int
    created_at: datetime
    last_post_at: datetime

    class Config:
        from_attributes = True


class ForumThreadResponse(ForumThreadSummary):
    """Full thread response with category."""
    category: ForumCategoryResponse
    updated_at: datetime

    class Config:
        from_attributes = True


class ForumThreadDetail(ForumThreadResponse):
    """Thread detail with posts."""
    posts: List["ForumPostResponse"] = []

    class Config:
        from_attributes = True


# Post Schemas
class ForumPostBase(BaseModel):
    """Base forum post schema."""
    content: str = Field(..., min_length=1)


class ForumPostCreate(ForumPostBase):
    """Schema for creating a forum post."""
    thread_id: str
    parent_post_id: Optional[str] = None  # For nested replies
    mentioned_user_ids: Optional[List[str]] = None  # Users to notify
    attachments: Optional[List[str]] = None  # Attachment URLs


class ForumPostUpdate(BaseModel):
    """Schema for updating a forum post."""
    content: str = Field(..., min_length=1)
    mentioned_user_ids: Optional[List[str]] = None


class ForumPostResponse(BaseModel):
    """Forum post response."""
    id: str
    thread_id: str
    user: ForumUserSummary
    parent_post_id: Optional[str]
    content: str
    is_deleted: bool
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    edited_at: Optional[datetime]

    # Calculated/joined fields
    reaction_counts: dict[str, int] = {}  # {reaction_type: count}
    user_reaction: Optional[str] = None  # Current user's reaction
    reply_count: int = 0  # Number of direct replies
    replies: List["ForumPostResponse"] = []  # Nested replies
    attachments: List["ForumAttachmentResponse"] = []
    can_edit: bool = False  # Permission check
    can_delete: bool = False  # Permission check

    class Config:
        from_attributes = True


# Reaction Schemas
class ForumReactionCreate(BaseModel):
    """Schema for creating/toggling a reaction."""
    post_id: str
    reaction_type: ReactionType


class ForumReactionResponse(BaseModel):
    """Forum reaction response."""
    id: str
    post_id: str
    user: ForumUserSummary
    reaction_type: ReactionType
    created_at: datetime

    class Config:
        from_attributes = True


# Attachment Schemas
class ForumAttachmentCreate(BaseModel):
    """Schema for creating an attachment."""
    file_name: str
    file_type: str
    file_size: int
    file_url: str


class ForumAttachmentResponse(BaseModel):
    """Forum attachment response."""
    id: str
    file_url: str
    file_name: str
    file_type: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True


# Report Schemas
class ForumReportCreate(BaseModel):
    """Schema for creating a report."""
    post_id: str
    reason: str = Field(..., min_length=10, max_length=500)


class ForumReportUpdate(BaseModel):
    """Schema for updating a report (admin only)."""
    status: ReportStatus
    admin_notes: Optional[str] = None


class ForumReportResponse(BaseModel):
    """Forum report response."""
    id: str
    post: "ForumPostResponse"
    reporter: ForumUserSummary
    reason: str
    status: ReportStatus
    resolved_by: Optional[ForumUserSummary]
    resolved_at: Optional[datetime]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Ban Schemas
class ForumBanCreate(BaseModel):
    """Schema for creating a forum ban."""
    user_id: str
    reason: str = Field(..., min_length=10)
    is_permanent: bool = False
    expires_at: Optional[datetime] = None


class ForumBanResponse(BaseModel):
    """Forum ban response."""
    id: str
    user: ForumUserSummary
    banned_by: ForumUserSummary
    reason: str
    is_permanent: bool
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Mention Schemas
class ForumMentionResponse(BaseModel):
    """Forum mention notification."""
    id: str
    post: "ForumPostResponse"
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Paginated List Responses
class ForumCategoryListResponse(BaseModel):
    """Paginated list of forum categories."""
    categories: List[ForumCategoryResponse]
    total: int


class ForumThreadListResponse(BaseModel):
    """Paginated list of forum threads."""
    threads: List[ForumThreadSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class ForumPostListResponse(BaseModel):
    """Paginated list of forum posts."""
    posts: List[ForumPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ForumReportListResponse(BaseModel):
    """Paginated list of forum reports."""
    reports: List[ForumReportResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ForumMentionListResponse(BaseModel):
    """List of user mentions."""
    mentions: List[ForumMentionResponse]
    unread_count: int
    total: int


# Moderation Schemas
class ForumModerationAction(BaseModel):
    """Schema for moderation actions."""
    action: str  # "pin", "unpin", "lock", "unlock", "delete"
    reason: Optional[str] = None


# Update forward references for nested models
ForumCategoryResponse.model_rebuild()
ForumThreadDetail.model_rebuild()
ForumPostResponse.model_rebuild()
ForumReportResponse.model_rebuild()
ForumMentionResponse.model_rebuild()
