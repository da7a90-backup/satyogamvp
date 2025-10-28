from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class ComponentType(str, enum.Enum):
    VIDEO = "video"
    AUDIO = "audio"
    TEXT = "text"
    ASSIGNMENT = "assignment"
    QUIZ = "quiz"


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    courses = relationship("Course", back_populates="instructor")


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=True)
    instructor_id = Column(UUID_TYPE, ForeignKey("instructors.id"), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    difficulty_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("Instructor", back_populates="courses")
    classes = relationship("CourseClass", back_populates="course", cascade="all, delete-orphan", order_by="CourseClass.order_index")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    comments = relationship("CourseComment", back_populates="course", cascade="all, delete-orphan")


class CourseClass(Base):
    __tablename__ = "course_classes"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    course_id = Column(UUID_TYPE, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)
    video_url = Column(String(500), nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    materials = Column(JSON_TYPE, nullable=True, default=[])
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="classes")
    components = relationship("CourseComponent", back_populates="course_class", cascade="all, delete-orphan", order_by="CourseComponent.order_index")
    progress_records = relationship("CourseProgress", back_populates="course_class", cascade="all, delete-orphan")


class CourseComponent(Base):
    __tablename__ = "course_components"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    class_id = Column(UUID_TYPE, ForeignKey("course_classes.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(Enum(ComponentType), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)  # URL for video/audio, markdown for text, etc.
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course_class = relationship("CourseClass", back_populates="components")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID_TYPE, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False)

    # Relationships
    user = relationship("User", back_populates="course_enrollments")
    course = relationship("Course", back_populates="enrollments")
    payment = relationship("Payment")
    progress_records = relationship("CourseProgress", back_populates="enrollment", cascade="all, delete-orphan")


class CourseProgress(Base):
    __tablename__ = "course_progress"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    enrollment_id = Column(UUID_TYPE, ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(UUID_TYPE, ForeignKey("course_classes.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(UUID_TYPE, ForeignKey("course_components.id", ondelete="CASCADE"), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)  # 0-100
    last_accessed = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_spent = Column(Integer, default=0, nullable=False)  # seconds

    # Relationships
    enrollment = relationship("CourseEnrollment", back_populates="progress_records")
    course_class = relationship("CourseClass", back_populates="progress_records")


class CourseComment(Base):
    __tablename__ = "course_comments"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID_TYPE, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(UUID_TYPE, ForeignKey("course_classes.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="course_comments")
    course = relationship("Course", back_populates="comments")
