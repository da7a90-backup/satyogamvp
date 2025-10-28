from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy import String
from ..core.db_types import UUID_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ProductType(str, enum.Enum):
    AUDIO = "audio"
    VIDEO = "video"
    AUDIO_VIDEO = "audio_video"
    AUDIO_VIDEO_TEXT = "audio_video_text"
    RETREAT_PORTAL_ACCESS = "retreat_portal_access"
    PHYSICAL = "physical"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(ProductType), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    digital_content_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id"), nullable=True)  # for portal access
    is_available = Column(Boolean, default=True, nullable=False)
    stock_quantity = Column(Integer, nullable=True)  # for physical products
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    retreat = relationship("Retreat")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    user_accesses = relationship("UserProductAccess", back_populates="product", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)
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
