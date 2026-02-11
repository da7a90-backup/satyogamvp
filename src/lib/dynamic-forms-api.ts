import { getFastapiUrl } from './api-utils';
/**
 * API client for dynamic forms
 */

import { FormTemplate, FormSubmissionData, FormSubmission } from '@/types/dynamic-form';


/**
 * Fetch a form template by slug
 */
export async function getFormBySlug(slug: string): Promise<FormTemplate> {
  const response = await fetch(`${getFastapiUrl()}/api/form-templates/public/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch form' }));
    throw new Error(error.detail || 'Failed to fetch form');
  }

  const result = await response.json();
  // The API returns {success: true, data: form}, so extract the data
  return result.data || result;
}

/**
 * Submit a form
 */
export async function submitForm(
  slug: string,
  data: FormSubmissionData,
  token?: string
): Promise<FormSubmission> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if token is provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getFastapiUrl()}/api/forms/${slug}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to submit form' }));
    throw new Error(error.detail || 'Failed to submit form');
  }

  return response.json();
}
