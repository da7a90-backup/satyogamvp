"""
Pydantic schemas for dynamic form system.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.form import FieldType, SubmissionStatus


# ============================================================================
# Form Field Schemas
# ============================================================================

class FormFieldBase(BaseModel):
    label: str
    field_type: FieldType
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    is_required: bool = False
    order: int = 0
    options: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    group_id: Optional[str] = None
    width: Optional[str] = "full"  # "full", "half"


class FormFieldCreate(FormFieldBase):
    section_id: str


class FormFieldUpdate(BaseModel):
    label: Optional[str] = None
    field_type: Optional[FieldType] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    group_id: Optional[str] = None
    width: Optional[str] = None


class FormFieldResponse(FormFieldBase):
    id: str
    section_id: str

    class Config:
        from_attributes = True


# ============================================================================
# Form Section Schemas
# ============================================================================

class FormSectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0
    tagline: Optional[str] = None
    image_url: Optional[str] = None


class FormSectionCreate(FormSectionBase):
    form_template_id: str
    fields: Optional[List[FormFieldBase]] = []


class FormSectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    tagline: Optional[str] = None
    image_url: Optional[str] = None


class FormSectionResponse(FormSectionBase):
    id: str
    form_template_id: str
    fields: List[FormFieldResponse] = []

    class Config:
        from_attributes = True


# ============================================================================
# Form Template Schemas
# ============================================================================

class FormTemplateBase(BaseModel):
    slug: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    is_published: bool = False


class FormTemplateCreate(FormTemplateBase):
    sections: Optional[List[FormSectionCreate]] = []


class FormTemplateUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None


class FormTemplateResponse(FormTemplateBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    sections: List[FormSectionResponse] = []

    class Config:
        from_attributes = True


class FormTemplateListResponse(FormTemplateBase):
    id: str
    created_at: datetime
    section_count: int = 0
    submission_count: int = 0

    class Config:
        from_attributes = True


# ============================================================================
# Form Answer Schemas
# ============================================================================

class FormAnswerBase(BaseModel):
    field_id: str
    value: Optional[Any] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class FormAnswerCreate(FormAnswerBase):
    pass


class FormAnswerResponse(FormAnswerBase):
    id: str

    class Config:
        from_attributes = True


# ============================================================================
# Form Submission Schemas
# ============================================================================

class FormSubmissionBase(BaseModel):
    form_template_id: str


class FormSubmissionCreate(FormSubmissionBase):
    answers: List[FormAnswerCreate]
    member_discount_eligible: Optional[bool] = False
    retreat_id: Optional[str] = None


class FormSubmissionUpdate(BaseModel):
    status: Optional[SubmissionStatus] = None
    admin_notes: Optional[str] = None


class FormSubmissionResponse(FormSubmissionBase):
    id: str
    user_id: str
    status: SubmissionStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    payment_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    answers: List[FormAnswerResponse] = []

    class Config:
        from_attributes = True


class FormSubmissionListResponse(BaseModel):
    id: str
    user_id: str
    form_template_id: str
    form_title: str
    status: SubmissionStatus
    created_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# Admin Review Schemas
# ============================================================================

class ReviewSubmissionRequest(BaseModel):
    status: SubmissionStatus = Field(..., description="New status: accepted or rejected")
    admin_notes: Optional[str] = Field(None, description="Admin notes about the decision")
    send_email: bool = Field(True, description="Whether to send email notification to applicant")


class ReviewSubmissionResponse(BaseModel):
    success: bool
    message: str
    submission: FormSubmissionResponse
    payment_url: Optional[str] = None  # If accepted and payment required
