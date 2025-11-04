"""
Dynamic form template models for configurable applications and questionnaires.
Enables creation of custom forms without code changes.
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import relationship
from ..core.db_types import UUID_TYPE, JSON_TYPE
from ..core.database import Base
from datetime import datetime
import uuid
import enum


class FormCategory(str, enum.Enum):
    """Form categories"""
    APPLICATION = "application"  # Retreat/program applications
    QUESTIONNAIRE = "questionnaire"  # Pre/post-retreat questionnaires
    SCHOLARSHIP = "scholarship"  # Scholarship applications
    FEEDBACK = "feedback"  # Feedback forms
    CUSTOM = "custom"  # Custom forms


class QuestionType(str, enum.Enum):
    """Question input types"""
    TEXT = "text"  # Short text input
    TEXTAREA = "textarea"  # Long text input
    EMAIL = "email"  # Email input with validation
    TEL = "tel"  # Phone number input
    DATE = "date"  # Date picker
    NUMBER = "number"  # Number input
    RADIO = "radio"  # Single choice (radio buttons)
    CHECKBOX = "checkbox"  # Multiple choice (checkboxes)
    DROPDOWN = "dropdown"  # Dropdown select
    FILE = "file"  # File upload
    HEADING = "heading"  # Section heading (not a question)
    PARAGRAPH = "paragraph"  # Informational paragraph (not a question)


class FormTemplate(Base):
    """
    Form template definition.
    Defines the structure and metadata for a form that can be rendered dynamically.
    """
    __tablename__ = "form_templates"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)  # URL-friendly identifier
    name = Column(String(255), nullable=False)  # Human-readable name
    category = Column(Enum(FormCategory), nullable=False, index=True)

    # Display content
    title = Column(String(500), nullable=False)  # Form title shown to users
    description = Column(Text, nullable=True)  # Introductory text
    introduction = Column(Text, nullable=True)  # Additional intro content

    # Configuration
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_multi_page = Column(Boolean, default=False, nullable=False)  # Single vs multi-page form
    requires_auth = Column(Boolean, default=False, nullable=False)  # Requires login?
    allow_anonymous = Column(Boolean, default=True, nullable=False)  # Allow non-logged-in users?

    # Submission settings
    success_message = Column(Text, nullable=True)  # Message shown on successful submission
    success_redirect = Column(String(500), nullable=True)  # URL to redirect after submission
    send_confirmation_email = Column(Boolean, default=False, nullable=False)
    notification_emails = Column(JSON_TYPE, nullable=True)  # List of emails to notify on submission

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    questions = relationship("FormQuestion", back_populates="form_template",
                           order_by="FormQuestion.order_index",
                           cascade="all, delete-orphan")
    submissions = relationship("FormSubmission", back_populates="form_template")
    creator = relationship("User", foreign_keys=[created_by])


class FormQuestion(Base):
    """
    Individual question within a form template.
    Defines the question text, type, validation, and options.
    """
    __tablename__ = "form_questions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    form_template_id = Column(UUID_TYPE, ForeignKey("form_templates.id", ondelete="CASCADE"),
                             nullable=False, index=True)

    # Question content
    question_text = Column(Text, nullable=False)  # The actual question
    description = Column(Text, nullable=True)  # Helper text / additional info
    placeholder = Column(String(255), nullable=True)  # Placeholder text for input

    # Question type and validation
    question_type = Column(Enum(QuestionType), nullable=False)
    is_required = Column(Boolean, default=False, nullable=False)

    # Layout
    page_number = Column(Integer, default=1, nullable=False)  # Which page (for multi-page forms)
    order_index = Column(Integer, nullable=False)  # Order within the page
    section_heading = Column(String(500), nullable=True)  # Optional section header above this question

    # Options (for radio, checkbox, dropdown)
    options = Column(JSON_TYPE, nullable=True)  # List of options: ["Option 1", "Option 2", ...]
    allow_other = Column(Boolean, default=False, nullable=False)  # Allow "Other" option?

    # Validation rules
    validation_rules = Column(JSON_TYPE, nullable=True)  # { min_length, max_length, pattern, etc. }

    # Conditional logic
    conditional_logic = Column(JSON_TYPE, nullable=True)  # Show question if conditions met

    # File upload settings (if question_type = FILE)
    allowed_file_types = Column(JSON_TYPE, nullable=True)  # ["image/*", "application/pdf"]
    max_file_size = Column(Integer, nullable=True)  # Max file size in bytes

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    form_template = relationship("FormTemplate", back_populates="questions")

    __table_args__ = (
        CheckConstraint('page_number >= 1', name='check_page_number_positive'),
        CheckConstraint('order_index >= 0', name='check_order_index_non_negative'),
    )


class FormSubmission(Base):
    """
    User submission of a form.
    Stores the answers to all questions in JSON format.
    """
    __tablename__ = "form_submissions"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    form_template_id = Column(UUID_TYPE, ForeignKey("form_templates.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Submission data
    answers = Column(JSON_TYPE, nullable=False)  # { question_id: answer_value }
    files = Column(JSON_TYPE, nullable=True)  # { question_id: file_url }

    # Submitter info (for anonymous submissions)
    submitter_email = Column(String(255), nullable=True)
    submitter_name = Column(String(255), nullable=True)

    # Review/status
    status = Column(String(50), default="pending", nullable=False, index=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_notes = Column(Text, nullable=True)

    # Metadata
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=True)  # For spam prevention
    user_agent = Column(String(500), nullable=True)

    # Relationships
    form_template = relationship("FormTemplate", back_populates="submissions")
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
