"""Analytics schemas for tracking events."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AnalyticsEventCreate(BaseModel):
    """Schema for creating an analytics event."""
    event_name: str = Field(..., description="Name of the event")
    event_properties: Optional[Dict[str, Any]] = Field(default={}, description="Event properties")
    user_id: Optional[str] = Field(None, description="User ID (if authenticated)")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent string")


class AnalyticsEventResponse(BaseModel):
    """Response schema for analytics event."""
    id: UUID
    user_id: Optional[UUID]
    event_name: str
    event_properties: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserAnalyticsResponse(BaseModel):
    """Response schema for user analytics."""
    id: UUID
    user_id: UUID
    total_donations: float
    total_spent: float
    courses_enrolled: int
    courses_completed: int
    retreats_attended: int
    teachings_viewed: int
    last_active_at: Optional[datetime]
    total_sessions: int
    updated_at: datetime

    class Config:
        from_attributes = True
