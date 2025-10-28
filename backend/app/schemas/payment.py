"""Pydantic schemas for Payment models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any


class PaymentCreate(BaseModel):
    """Schema for creating a payment."""
    amount: float
    payment_type: str  # donation, membership, course, retreat, product
    reference_id: Optional[str] = None  # course_id, retreat_id, etc.
    currency: str = "USD"


class PaymentResponse(BaseModel):
    """Schema for payment response."""
    id: UUID4
    user_id: UUID4
    amount: float
    currency: str
    payment_method: Optional[str]
    tilopay_transaction_id: Optional[str]
    tilopay_order_id: Optional[str]
    status: str  # pending, completed, failed, refunded
    payment_type: str
    reference_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentDataResponse(BaseModel):
    """Schema for Tilopay embedded payment data."""
    payment_id: UUID4
    payment_data: Dict[str, Any]  # Data to embed Tilopay


class PaymentWebhook(BaseModel):
    """Schema for Tilopay webhook payload."""
    transaction_id: str
    order_id: str
    amount: float
    status: str
    signature: str
    # Add other Tilopay webhook fields as needed


class PaymentStatusResponse(BaseModel):
    """Schema for payment status response."""
    payment_id: UUID4
    status: str
    amount: float
    payment_type: str
    created_at: datetime
