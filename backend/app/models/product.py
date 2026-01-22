from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, Enum, JSON
from ..core.db_types import UUID_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ProductType(str, enum.Enum):
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"
    AUDIO_VIDEO = "AUDIO_VIDEO"
    AUDIO_VIDEO_TEXT = "AUDIO_VIDEO_TEXT"
    RETREAT_PORTAL_ACCESS = "RETREAT_PORTAL_ACCESS"
    BOOK_GROUP_PORTAL_ACCESS = "BOOK_GROUP_PORTAL_ACCESS"
    PHYSICAL = "PHYSICAL"
    EBOOK = "EBOOK"
    GUIDED_MEDITATION = "GUIDED_MEDITATION"
    COLLECTION = "COLLECTION"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    type = Column(Enum(ProductType), nullable=False, index=True)

    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    regular_price = Column(Numeric(10, 2), nullable=True)
    sale_price = Column(Numeric(10, 2), nullable=True)
    member_discount = Column(Numeric(5, 2), nullable=True, default=10.00)  # Percentage discount for members

    # Media & Assets
    digital_content_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    featured_image = Column(String(500), nullable=True)
    images = Column(JSON, nullable=True)  # Array of image URLs

    # WooCommerce metadata
    sku = Column(String(100), nullable=True)
    woo_type = Column(JSON, nullable=True)  # ["simple", "downloadable", "virtual"]
    downloads = Column(JSON, nullable=True)  # Array of download objects

    # Categories and Tags
    categories = Column(JSON, nullable=True)  # Array of category strings
    tags = Column(JSON, nullable=True)  # Array of tag strings

    # Portal Media for Retreat Packages
    portal_media = Column(JSON, nullable=True)  # {youtube: [], audio: [], pdf_files: []}
    has_video_category = Column(Boolean, default=False)
    has_audio_category = Column(Boolean, default=False)
    product_slug = Column(String(255), nullable=True, index=True)  # Links to portal_media_final
    store_slug = Column(String(255), nullable=True)
    portal_url = Column(String(500), nullable=True)

    # Inventory
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id"), nullable=True)  # for portal access
    is_available = Column(Boolean, default=True, nullable=False)
    in_stock = Column(Boolean, default=True, nullable=False)
    stock_quantity = Column(Integer, nullable=True)  # for physical products
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)

    # Additional metadata
    weight = Column(String(50), nullable=True)
    allow_reviews = Column(Boolean, default=False)
    external_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    # retreat = relationship("Retreat", foreign_keys=[retreat_id])  # Commented out: causes ambiguity with Retreat.store_product
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    user_accesses = relationship("UserProductAccess", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    bookmarks = relationship("ProductBookmark", back_populates="product", cascade="all, delete-orphan")
    testimonials = relationship("Testimonial", back_populates="product", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)

    # Billing information
    billing_name = Column(String(255), nullable=True)
    billing_email = Column(String(255), nullable=True)
    billing_address = Column(String(500), nullable=True)
    billing_city = Column(String(255), nullable=True)
    billing_state = Column(String(255), nullable=True)
    billing_country = Column(String(100), nullable=True)
    billing_postal_code = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    payment = relationship("Payment")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID_TYPE, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Cart(Base):
    __tablename__ = "carts"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    cart_id = Column(UUID_TYPE, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class UserProductAccess(Base):
    """Tracks which products/content users have access to."""
    __tablename__ = "user_product_accesses"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(UUID_TYPE, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # for time-limited access

    # Relationships
    user = relationship("User", back_populates="product_accesses")
    product = relationship("Product", back_populates="user_accesses")
    order = relationship("Order")


class ProductBookmark(Base):
    """User's bookmarked/saved for later products."""
    __tablename__ = "product_bookmarks"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="product_bookmarks")
    product = relationship("Product", back_populates="bookmarks")


class Testimonial(Base):
    """Product testimonials/reviews from customers."""
    __tablename__ = "testimonials"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quote = Column(Text, nullable=False)
    author_name = Column(String(255), nullable=False)
    author_location = Column(String(255), nullable=True)
    author_avatar_url = Column(String(500), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="testimonials")
