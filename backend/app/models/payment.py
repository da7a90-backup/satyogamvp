from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentType(str, enum.Enum):
    DONATION = "donation"
    MEMBERSHIP = "membership"
    COURSE = "course"
    RETREAT = "retreat"
    PRODUCT = "product"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    payment_method = Column(String(50), nullable=True)  # card, bank_transfer, etc.

    # Tilopay specific fields
    tilopay_transaction_id = Column(String(255), unique=True, nullable=True, index=True)
    tilopay_order_id = Column(String(255), nullable=True)
    tilopay_response = Column(JSONB, nullable=True)  # store full response

    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    payment_type = Column(Enum(PaymentType), nullable=False, index=True)
    reference_id = Column(String(255), nullable=True)  # ID of course, retreat, product, etc.
    metadata = Column(JSONB, nullable=True)  # additional payment info

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="payments")
