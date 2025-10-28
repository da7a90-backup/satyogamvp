"""Pydantic schemas for API validation."""

from .user import UserCreate, UserLogin, UserResponse, Token, TokenData
from .teaching import (
    TeachingCreate,
    TeachingUpdate,
    TeachingResponse,
    TeachingAccessCreate,
    TeachingFavoriteToggle,
    TeachingListResponse,
)
from .course import (
    InstructorResponse,
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseDetailResponse,
    CourseEnrollmentCreate,
    CourseProgressUpdate,
    CourseProgressResponse,
    CourseCommentCreate,
    CourseCommentResponse,
    CourseClassCreate,
    CourseClassResponse,
)
from .payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentDataResponse,
    PaymentWebhook,
    PaymentStatusResponse,
)
from .retreat import (
    RetreatCreate,
    RetreatUpdate,
    RetreatResponse,
    RetreatDetailResponse,
    RetreatRegistrationCreate,
    RetreatRegistrationResponse,
    RetreatPortalResponse,
)
from .product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    UserProductAccessResponse,
)

__all__ = [
    # User
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    # Teaching
    "TeachingCreate",
    "TeachingUpdate",
    "TeachingResponse",
    "TeachingAccessCreate",
    "TeachingFavoriteToggle",
    "TeachingListResponse",
    # Course
    "InstructorResponse",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseDetailResponse",
    "CourseEnrollmentCreate",
    "CourseProgressUpdate",
    "CourseProgressResponse",
    "CourseCommentCreate",
    "CourseCommentResponse",
    "CourseClassCreate",
    "CourseClassResponse",
    # Payment
    "PaymentCreate",
    "PaymentResponse",
    "PaymentDataResponse",
    "PaymentWebhook",
    "PaymentStatusResponse",
    # Retreat
    "RetreatCreate",
    "RetreatUpdate",
    "RetreatResponse",
    "RetreatDetailResponse",
    "RetreatRegistrationCreate",
    "RetreatRegistrationResponse",
    "RetreatPortalResponse",
    # Product
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "OrderCreate",
    "OrderResponse",
    "OrderItemResponse",
    "UserProductAccessResponse",
]
