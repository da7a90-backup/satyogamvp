"""Pydantic schemas for Testimonial models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class TestimonialBase(BaseModel):
    """Base testimonial schema."""
    product_id: UUID4
    quote: str
    author_name: str
    author_location: Optional[str] = None
    author_avatar_url: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class TestimonialCreate(TestimonialBase):
    """Schema for creating a testimonial."""
    pass


class TestimonialUpdate(BaseModel):
    """Schema for updating a testimonial."""
    product_id: Optional[UUID4] = None
    quote: Optional[str] = None
    author_name: Optional[str] = None
    author_location: Optional[str] = None
    author_avatar_url: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class TestimonialResponse(TestimonialBase):
    """Schema for testimonial response."""
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestimonialReorder(BaseModel):
    """Schema for reordering testimonials."""
    testimonial_id: UUID4
    new_order_index: int
