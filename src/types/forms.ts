// Form configuration types for dynamic form system

export type QuestionType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'number'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'file';

export interface FormQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    value: string | string[];
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface FormConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  category: 'application' | 'scholarship' | 'questionnaire';
  programType?: 'onsite-retreat' | 'online-retreat' | 'sevadhari' | 'other';
  sections: FormSection[];
  submitEndpoint: string;
  confirmationMessage?: string;
  multiPage?: boolean;
}

export interface FormSubmission {
  formId: string;
  responses: Record<string, any>;
  submittedAt: string;
  userId?: string;
  email: string;
}

// Common question sets that can be reused
export interface CommonQuestionSet {
  id: string;
  name: string;
  questions: FormQuestion[];
}
