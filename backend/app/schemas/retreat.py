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


class RetreatCreate(RetreatBase):
    """Schema for creating a retreat."""
    pass


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


class RetreatResponse(RetreatBase):
    """Schema for retreat response."""
    id: UUID4
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
