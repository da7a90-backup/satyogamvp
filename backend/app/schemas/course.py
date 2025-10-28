"""Pydantic schemas for Course models."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List


class InstructorBase(BaseModel):
    """Base instructor schema."""
    name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None


class InstructorResponse(InstructorBase):
    """Schema for instructor response."""
    id: UUID4

    class Config:
        from_attributes = True


class CourseComponentBase(BaseModel):
    """Base course component schema."""
    type: str  # video, audio, text, assignment, quiz
    title: str
    content: Optional[str] = None
    order_index: int


class CourseComponentResponse(CourseComponentBase):
    """Schema for course component response."""
    id: UUID4
    class_id: UUID4

    class Config:
        from_attributes = True


class CourseClassBase(BaseModel):
    """Base course class schema."""
    title: str
    description: Optional[str] = None
    order_index: int
    video_url: Optional[str] = None
    duration: Optional[int] = None


class CourseClassCreate(CourseClassBase):
    """Schema for creating a course class."""
    components: List[CourseComponentBase] = []


class CourseClassResponse(CourseClassBase):
    """Schema for course class response."""
    id: UUID4
    course_id: UUID4
    components: List[CourseComponentResponse] = []

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    """Base course schema."""
    slug: str
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    is_published: bool = False


class CourseCreate(CourseBase):
    """Schema for creating a course."""
    instructor_id: Optional[UUID4] = None


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    instructor_id: Optional[UUID4] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: UUID4
    instructor: Optional[InstructorResponse] = None
    created_at: datetime
    updated_at: datetime

    # Additional fields for enrolled users
    is_enrolled: Optional[bool] = None
    progress_percentage: Optional[float] = None

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    """Schema for detailed course response with classes."""
    classes: List[CourseClassResponse] = []


class CourseEnrollmentCreate(BaseModel):
    """Schema for enrolling in a course."""
    course_id: UUID4
    payment_id: Optional[UUID4] = None


class CourseProgressUpdate(BaseModel):
    """Schema for updating course progress."""
    class_id: UUID4
    component_id: Optional[UUID4] = None
    completed: bool = False
    progress_percentage: Optional[int] = None
    time_spent: Optional[int] = None


class CourseProgressResponse(BaseModel):
    """Schema for course progress response."""
    id: UUID4
    enrollment_id: UUID4
    class_id: UUID4
    component_id: Optional[UUID4]
    completed: bool
    progress_percentage: Optional[int]
    time_spent: Optional[int]
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseCommentCreate(BaseModel):
    """Schema for creating a course comment."""
    course_id: UUID4
    class_id: Optional[UUID4] = None
    content: str


class CourseCommentResponse(BaseModel):
    """Schema for course comment response."""
    id: UUID4
    user_id: UUID4
    course_id: UUID4
    class_id: Optional[UUID4]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
