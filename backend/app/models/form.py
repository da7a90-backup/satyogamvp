"""
Dynamic form models for admin-manageable application forms.
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
from app.core.db_types import UUID_TYPE


class FieldType(str, enum.Enum):
    """Field types supported in forms"""
    TEXT = "TEXT"
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    TEXTAREA = "TEXTAREA"
    SELECT = "SELECT"
    DATE = "DATE"
    FILE = "FILE"
    PHOTO = "PHOTO"


class SubmissionStatus(str, enum.Enum):
    """Workflow statuses for form submissions"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_COMPLETED = "payment_completed"


class DynamicFormTemplate(Base):
    """
    Form template - represents a complete form (e.g., Shakti Retreat Application)
    """
    __tablename__ = "dynamic_form_templates"

    id = Column(String, primary_key=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sections = relationship("FormSection", back_populates="form_template", cascade="all, delete-orphan", order_by="FormSection.order")
    submissions = relationship("DynamicFormSubmission", back_populates="form_template")


class FormSection(Base):
    """
    Form section/step - represents one step in a multi-step form
    """
    __tablename__ = "dynamic_form_sections"

    id = Column(String, primary_key=True)
    form_template_id = Column(String, ForeignKey("dynamic_form_templates.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, default=0)

    # Right-side content
    tagline = Column(String, nullable=True)  # e.g., "PROGRAM APPLICATION"
    image_url = Column(String, nullable=True)  # Image shown on right side

    # Relationships
    form_template = relationship("DynamicFormTemplate", back_populates="sections")
    fields = relationship("app.models.form.FormField", back_populates="section", cascade="all, delete-orphan", order_by="app.models.form.FormField.order")


class FormField(Base):
    """
    Individual form field within a section
    """
    __tablename__ = "dynamic_form_fields"

    id = Column(String, primary_key=True)
    section_id = Column(String, ForeignKey("dynamic_form_sections.id", ondelete="CASCADE"), nullable=False)

    label = Column(String, nullable=False)
    field_type = Column(SQLEnum(FieldType), nullable=False)
    placeholder = Column(String, nullable=True)
    help_text = Column(String, nullable=True)

    is_required = Column(Boolean, default=False)
    order = Column(Integer, nullable=False, default=0)

    # For select/dropdown fields
    options = Column(JSON, nullable=True)  # List of options: ["Option 1", "Option 2"]

    # Validation rules
    validation_rules = Column(JSON, nullable=True)  # e.g., {"min_length": 3, "max_length": 100}

    # For grouped fields (e.g., first name + last name in same row)
    group_id = Column(String, nullable=True)  # Fields with same group_id render in same row
    width = Column(String, nullable=True, default="full")  # "full", "half"

    # Relationships
    section = relationship("FormSection", back_populates="fields")


class DynamicFormSubmission(Base):
    """
    A user's submission of a form
    """
    __tablename__ = "dynamic_form_submissions"

    id = Column(String, primary_key=True)
    form_template_id = Column(String, ForeignKey("dynamic_form_templates.id"), nullable=False)
    user_id = Column(UUID_TYPE, ForeignKey("users.id"), nullable=False)

    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.SUBMITTED, nullable=False)

    # Admin review
    reviewed_by = Column(UUID_TYPE, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Payment tracking
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    form_template = relationship("DynamicFormTemplate", back_populates="submissions")
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    answers = relationship("FormAnswer", back_populates="submission", cascade="all, delete-orphan")
    payment = relationship("Payment")


class FormAnswer(Base):
    """
    A user's answer to a specific form field
    """
    __tablename__ = "dynamic_form_answers"

    id = Column(String, primary_key=True)
    submission_id = Column(String, ForeignKey("dynamic_form_submissions.id", ondelete="CASCADE"), nullable=False)
    field_id = Column(String, ForeignKey("dynamic_form_fields.id"), nullable=False)

    # Answer value (stored as JSON to support different types)
    value = Column(JSON, nullable=True)

    # For file uploads
    file_url = Column(String, nullable=True)
    file_name = Column(String, nullable=True)

    # Relationships
    submission = relationship("DynamicFormSubmission", back_populates="answers")
    field = relationship("app.models.form.FormField")
