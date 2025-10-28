"""Pydantic schemas for Product and Store models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List


class ProductBase(BaseModel):
    """Base product schema."""
    slug: str
    title: str
    type: str  # audio, video, audio_video, audio_video_text, retreat_portal_access, physical
    price: float
    description: Optional[str] = None
    digital_content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    retreat_id: Optional[UUID4] = None
    is_available: bool = True


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    slug: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    digital_content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    retreat_id: Optional[UUID4] = None
    is_available: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schema for product response."""
    id: UUID4
    created_at: datetime
    updated_at: datetime

    # Dynamic field for purchased products
    has_access: Optional[bool] = None

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    """Base order item schema."""
    product_id: UUID4
    quantity: int = 1


class OrderItemResponse(OrderItemBase):
    """Schema for order item response."""
    id: UUID4
    order_id: UUID4
    price_at_purchase: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    items: List[OrderItemBase]
    payment_id: Optional[UUID4] = None


class OrderResponse(BaseModel):
    """Schema for order response."""
    id: UUID4
    user_id: UUID4
    order_number: str
    total_amount: float
    status: str  # pending, completed, cancelled
    payment_id: Optional[UUID4]
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProductAccessResponse(BaseModel):
    """Schema for user product access response."""
    id: UUID4
    user_id: UUID4
    product_id: UUID4
    order_id: UUID4
    granted_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True
