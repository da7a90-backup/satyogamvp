"""Pydantic schemas for User models."""

from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional, List
from ..models.user import MembershipTierEnum


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    accept_newsletter: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID4
    email: str
    name: str
    membership_tier: MembershipTierEnum
    membership_start_date: Optional[datetime]
    membership_end_date: Optional[datetime]
    is_active: bool
    is_admin: bool
    has_seen_dashboard_tour: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user (admin)."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    membership_tier: Optional[MembershipTierEnum] = None
    role: Optional[str] = None
    is_admin: Optional[bool] = None
    reason: Optional[str] = None  # Reason for making changes (especially for tier/admin changes)


class UserListResponse(BaseModel):
    """Schema for paginated user list."""
    users: List[UserResponse]
    total: int
    skip: int
    limit: int
