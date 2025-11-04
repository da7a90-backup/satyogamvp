"""Pydantic schemas for Product and Store models."""

from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class DownloadItem(BaseModel):
    """Schema for download item."""
    id: str
    name: str
    url: str


class ProductBase(BaseModel):
    """Base product schema."""
    slug: str
    title: str
    type: str  # audio, video, audio_video, audio_video_text, retreat_portal_access, physical, ebook, guided_meditation
    price: float
    description: Optional[str] = None
    short_description: Optional[str] = None

    # Pricing
    regular_price: Optional[float] = None
    sale_price: Optional[float] = None
    member_discount: Optional[float] = 10.0  # Percentage discount for members

    # Media
    digital_content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    featured_image: Optional[str] = None
    images: Optional[List[str]] = None

    # WooCommerce metadata
    sku: Optional[str] = None
    woo_type: Optional[List[str]] = None
    downloads: Optional[List[DownloadItem]] = None

    # Categories and Tags
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    # Portal Media for Retreat Packages
    portal_media: Optional[Dict[str, Any]] = None
    has_video_category: bool = False
    has_audio_category: bool = False
    product_slug: Optional[str] = None
    store_slug: Optional[str] = None
    portal_url: Optional[str] = None

    # Inventory
    retreat_id: Optional[UUID4] = None
    is_available: bool = True
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    published: bool = True
    featured: bool = False

    # Additional metadata
    weight: Optional[str] = None
    allow_reviews: bool = False
    external_url: Optional[str] = None


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


# Cart Schemas
class CartItemCreate(BaseModel):
    """Schema for adding item to cart."""
    product_id: UUID4
    quantity: int = 1


class CartItemUpdate(BaseModel):
    """Schema for updating cart item."""
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    """Schema for cart item response."""
    id: UUID4
    cart_id: UUID4
    product_id: UUID4
    product: ProductResponse
    quantity: int
    created_at: datetime

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """Schema for cart response."""
    id: UUID4
    user_id: UUID4
    items: List[CartItemResponse] = []
    total_items: int = 0
    total_price: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    """Schema for checkout request."""
    cart_id: UUID4
    payment_method: str = "tilopay"  # Can be extended for other methods
    metadata: Optional[Dict[str, Any]] = None


class CheckoutResponse(BaseModel):
    """Schema for checkout response."""
    order_id: UUID4
    order_number: str
    total_amount: float
    payment_url: str  # Tilopay embedded checkout URL
    tilopay_token: str
