"""
Pydantic schemas for dynamic form templates API
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# Enums
class FormCategoryEnum(str):
    APPLICATION = "application"
    QUESTIONNAIRE = "questionnaire"
    SCHOLARSHIP = "scholarship"
    FEEDBACK = "feedback"
    CUSTOM = "custom"


class QuestionTypeEnum(str):
    TEXT = "text"
    TEXTAREA = "textarea"
    EMAIL = "email"
    TEL = "tel"
    DATE = "date"
    NUMBER = "number"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    DROPDOWN = "dropdown"
    FILE = "file"
    HEADING = "heading"
    PARAGRAPH = "paragraph"


# Form Question Schemas
class FormQuestionBase(BaseModel):
    question_text: str
    description: Optional[str] = None
    placeholder: Optional[str] = None
    question_type: str
    is_required: bool = False
    page_number: int = 1
    order_index: int
    section_heading: Optional[str] = None
    options: Optional[List[str]] = None
    allow_other: bool = False
    validation_rules: Optional[Dict[str, Any]] = None
    conditional_logic: Optional[Dict[str, Any]] = None
    allowed_file_types: Optional[List[str]] = None
    max_file_size: Optional[int] = None


class FormQuestionCreate(FormQuestionBase):
    pass


class FormQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    description: Optional[str] = None
    placeholder: Optional[str] = None
    question_type: Optional[str] = None
    is_required: Optional[bool] = None
    page_number: Optional[int] = None
    order_index: Optional[int] = None
    section_heading: Optional[str] = None
    options: Optional[List[str]] = None
    allow_other: Optional[bool] = None
    validation_rules: Optional[Dict[str, Any]] = None
    conditional_logic: Optional[Dict[str, Any]] = None
    allowed_file_types: Optional[List[str]] = None
    max_file_size: Optional[int] = None


class FormQuestion(FormQuestionBase):
    id: UUID
    form_template_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Form Template Schemas
class FormTemplateBase(BaseModel):
    slug: str
    name: str
    category: str
    title: str
    description: Optional[str] = None
    introduction: Optional[str] = None
    is_active: bool = True
    is_multi_page: bool = False
    requires_auth: bool = False
    allow_anonymous: bool = True
    success_message: Optional[str] = None
    success_redirect: Optional[str] = None
    send_confirmation_email: bool = False
    notification_emails: Optional[List[EmailStr]] = None


class FormTemplateCreate(FormTemplateBase):
    questions: Optional[List[FormQuestionCreate]] = None


class FormTemplateUpdate(BaseModel):
    slug: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    introduction: Optional[str] = None
    is_active: Optional[bool] = None
    is_multi_page: Optional[bool] = None
    requires_auth: Optional[bool] = None
    allow_anonymous: Optional[bool] = None
    success_message: Optional[str] = None
    success_redirect: Optional[str] = None
    send_confirmation_email: Optional[bool] = None
    notification_emails: Optional[List[EmailStr]] = None


class FormTemplate(FormTemplateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    questions: List[FormQuestion] = []

    class Config:
        from_attributes = True


class FormTemplateList(BaseModel):
    """Simplified form template for listing"""
    id: UUID
    slug: str
    name: str
    category: str
    title: str
    is_active: bool
    is_multi_page: bool
    question_count: int = 0

    class Config:
        from_attributes = True


# Form Submission Schemas
class FormSubmissionCreate(BaseModel):
    form_template_id: UUID
    answers: Dict[str, Any]  # { question_id: answer_value }
    files: Optional[Dict[str, str]] = None  # { question_id: file_url }
    submitter_email: Optional[EmailStr] = None
    submitter_name: Optional[str] = None


class FormSubmissionUpdate(BaseModel):
    status: Optional[str] = None
    reviewer_notes: Optional[str] = None


class FormSubmission(BaseModel):
    id: UUID
    form_template_id: UUID
    user_id: Optional[UUID] = None
    answers: Dict[str, Any]
    files: Optional[Dict[str, str]] = None
    submitter_email: Optional[str] = None
    submitter_name: Optional[str] = None
    status: str
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[UUID] = None
    reviewer_notes: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True


# Response schemas
class FormTemplateResponse(BaseModel):
    success: bool
    data: FormTemplate


class FormTemplateListResponse(BaseModel):
    success: bool
    data: List[FormTemplateList]
    total: int


class FormSubmissionResponse(BaseModel):
    success: bool
    data: FormSubmission
    message: Optional[str] = None
