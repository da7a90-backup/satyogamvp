"""Pydantic schemas for Event models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from ..models.event import EventType, LocationType, EventStructure


# ============================================================================
# Event Session Schemas
# ============================================================================

class EventSessionBase(BaseModel):
    """Base schema for event session."""
    session_number: int
    title: str
    description: Optional[str] = None
    session_date: Optional[datetime] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    materials_url: Optional[str] = None
    zoom_link: Optional[str] = None
    is_published: bool = True


class EventSessionCreate(EventSessionBase):
    """Schema for creating an event session."""
    pass


class EventSessionUpdate(BaseModel):
    """Schema for updating an event session."""
    session_number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    session_date: Optional[datetime] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    materials_url: Optional[str] = None
    zoom_link: Optional[str] = None
    is_published: Optional[bool] = None


class EventSessionResponse(EventSessionBase):
    """Schema for event session response."""
    id: UUID4
    event_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Event Schemas
# ============================================================================

class EventCreate(BaseModel):
    """Schema for creating an event."""
    slug: str
    title: str
    description: Optional[str] = None
    type: EventType
    location_type: LocationType = LocationType.ONLINE
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    event_structure: EventStructure = EventStructure.SIMPLE_RECURRING
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    zoom_link: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None
    max_participants: Optional[int] = None
    registration_required: bool = False
    registration_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: bool = False
    sessions: Optional[List[EventSessionCreate]] = None


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventType] = None
    location_type: Optional[LocationType] = None
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    event_structure: Optional[EventStructure] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    zoom_link: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None
    max_participants: Optional[int] = None
    registration_required: Optional[bool] = None
    registration_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class EventResponse(BaseModel):
    """Schema for event response."""
    id: UUID4
    slug: str
    title: str
    description: Optional[str]
    type: EventType
    location_type: LocationType
    location: Optional[str]
    start_datetime: Optional[datetime]
    end_datetime: Optional[datetime]
    duration_minutes: Optional[int]
    event_structure: EventStructure
    is_recurring: bool
    recurrence_rule: Optional[str]
    zoom_link: Optional[str]
    meeting_id: Optional[str]
    meeting_password: Optional[str]
    max_participants: Optional[int]
    registration_required: bool
    registration_url: Optional[str]
    thumbnail_url: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime
    sessions: List[EventSessionResponse] = []

    class Config:
        from_attributes = True
