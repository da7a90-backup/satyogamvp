/**
 * Type definitions for dynamic form system
 */

export type FieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'TEXTAREA' | 'SELECT' | 'DATE' | 'NUMBER' | 'RADIO' | 'CHECKBOX' | 'FILE' | 'PHOTO';

export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED';

export interface FormField {
  id: string;
  section_id: string;
  label: string;
  field_type: FieldType;
  placeholder?: string | null;
  help_text?: string | null;
  is_required: boolean;
  order: number;
  options?: string[] | null;
  validation_rules?: Record<string, any> | null;
  group_id?: string | null;
  width?: string | null; // "full" or "half"
}

export interface FormSection {
  id: string;
  form_template_id: string;
  title: string;
  description?: string | null;
  order: number;
  tagline?: string | null;
  image_url?: string | null;
  fields: FormField[];
}

export interface FormQuestion {
  id: string;
  form_template_id: string;
  question_text: string;
  description?: string | null;
  placeholder?: string | null;
  question_type: string;
  is_required: boolean;
  page_number: number;
  order_index: number;
  section_heading?: string | null;
  options?: string[] | null;
  allow_other: boolean;
  validation_rules?: any;
  conditional_logic?: any;
  allowed_file_types?: string[] | null;
  max_file_size?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FormTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  title: string;
  description?: string | null;
  introduction?: string | null;
  is_active: boolean;
  is_multi_page: boolean;
  requires_auth: boolean;
  allow_anonymous: boolean;
  success_message?: string | null;
  success_redirect?: string | null;
  send_confirmation_email: boolean;
  notification_emails?: string[] | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  questions: FormQuestion[];
  // Keep sections for backwards compatibility (will be empty)
  sections?: FormSection[];
}

export interface FormAnswer {
  field_id: string;
  value?: any;
  file_url?: string | null;
  file_name?: string | null;
}

export interface FormSubmissionData {
  form_template_id: string;
  answers: FormAnswer[];
}

export interface FormSubmission {
  id: string;
  user_id: string;
  form_template_id: string;
  status: SubmissionStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
  payment_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  submitted_at?: string | null;
  answers: FormAnswer[];
}
