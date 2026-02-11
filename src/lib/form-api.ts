import { getFastapiUrl } from './api-utils';
/**
 * API client for dynamic form templates
 */


export interface FormQuestion {
  id: string;
  question_text: string;
  description?: string;
  placeholder?: string;
  question_type: 'text' | 'textarea' | 'email' | 'tel' | 'date' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'file' | 'heading' | 'paragraph';
  is_required: boolean;
  page_number: number;
  order_index: number;
  section_heading?: string;
  options?: string[];
  allow_other?: boolean;
  validation_rules?: Record<string, any>;
  conditional_logic?: Record<string, any>;
  allowed_file_types?: string[];
  max_file_size?: number;
}

export interface FormTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  title: string;
  description?: string;
  introduction?: string;
  is_active: boolean;
  is_multi_page: boolean;
  requires_auth: boolean;
  allow_anonymous: boolean;
  success_message?: string;
  success_redirect?: string;
  questions: FormQuestion[];
}

export interface FormSubmission {
  form_template_id: string;
  answers: Record<string, any>;
  files?: Record<string, string>;
  submitter_email?: string;
  submitter_name?: string;
}

/**
 * Get a form template by slug (public access)
 */
export async function getFormBySlug(slug: string): Promise<FormTemplate> {
  const response = await fetch(`${getFastapiUrl()}/api/form-templates/public/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch form');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Submit a form
 */
export async function submitForm(submission: FormSubmission, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getFastapiUrl()}/api/form-templates/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to submit form');
  }

  return response.json();
}

/**
 * Group questions by page number
 */
export function groupQuestionsByPage(questions: FormQuestion[]): Record<number, FormQuestion[]> {
  return questions.reduce((acc, question) => {
    if (!acc[question.page_number]) {
      acc[question.page_number] = [];
    }
    acc[question.page_number].push(question);
    return acc;
  }, {} as Record<number, FormQuestion[]>);
}

/**
 * Get total number of pages in a form
 */
export function getTotalPages(questions: FormQuestion[]): number {
  return Math.max(...questions.map(q => q.page_number), 1);
}
