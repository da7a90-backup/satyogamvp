"""Pydantic schemas for User models."""

from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional
from ..models.user import MembershipTierEnum


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


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
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
