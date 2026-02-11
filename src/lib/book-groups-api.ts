import { getFastapiUrl } from './api-utils';
/**
 * Book Groups API Client
 * Functions for interacting with the book groups backend API
 */

import {
  BookGroup,
  BookGroupCreate,
  BookGroupUpdate,
  BookGroupCard,
  BookGroupListResponse,
  FeaturedBookGroup,
  BookGroupPortal,
  BookGroupAccessCheck,
  BookGroupSession,
  BookGroupSessionCreate,
  BookGroupSessionUpdate,
  BookGroupAdmin,
  BookGroupMarkCompleted,
  BookGroupConvertToProduct,
  CalendarReminderCreate,
  CalendarReminderResponse,
  BookGroupStatus,
} from '@/types/book-group';

const API_URL = getFastapiUrl();

/**
 * Get authorization token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Build fetch headers with authorization
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }
  return response.json();
}

// ===== USER API FUNCTIONS =====

/**
 * Get list of book groups with optional filtering
 */
export async function getBookGroups(params?: {
  status?: BookGroupStatus;
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<BookGroupListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.search) query.append('search', params.search);

  const url = `${API_URL}/api/book-groups?${query.toString()}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return handleResponse<BookGroupListResponse>(response);
}

/**
 * Get the featured "Coming up" book group
 */
export async function getFeaturedBookGroup(): Promise<FeaturedBookGroup | null> {
  const url = `${API_URL}/api/book-groups/featured`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return handleResponse<FeaturedBookGroup | null>(response);
}

/**
 * Get full book group portal with all sessions
 */
export async function getBookGroupPortal(slug: string): Promise<BookGroupPortal> {
  const url = `${API_URL}/api/book-groups/${slug}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return handleResponse<BookGroupPortal>(response);
}

/**
 * Check if user has access to a book group
 */
export async function checkBookGroupAccess(slug: string): Promise<BookGroupAccessCheck> {
  const url = `${API_URL}/api/book-groups/${slug}/access`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return handleResponse<BookGroupAccessCheck>(response);
}

/**
 * Add book group to user's calendar
 */
export async function addCalendarReminder(
  slug: string,
  data: CalendarReminderCreate
): Promise<CalendarReminderResponse> {
  const url = `${API_URL}/api/book-groups/${slug}/calendar-reminder`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<CalendarReminderResponse>(response);
}

// ===== ADMIN API FUNCTIONS =====

/**
 * Get all book groups (admin only)
 */
export async function getAllBookGroupsAdmin(): Promise<BookGroupAdmin[]> {
  const url = `${API_URL}/api/book-groups/admin/all`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return handleResponse<BookGroupAdmin[]>(response);
}

/**
 * Create a new book group (admin only)
 */
export async function createBookGroup(data: BookGroupCreate): Promise<BookGroup> {
  const url = `${API_URL}/api/book-groups`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<BookGroup>(response);
}

/**
 * Update a book group (admin only)
 */
export async function updateBookGroup(
  bookGroupId: string,
  data: BookGroupUpdate
): Promise<BookGroup> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<BookGroup>(response);
}

/**
 * Delete a book group (admin only)
 */
export async function deleteBookGroup(bookGroupId: string): Promise<{ success: boolean; message: string }> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Create a session for a book group (admin only)
 */
export async function createSession(
  bookGroupId: string,
  data: BookGroupSessionCreate
): Promise<BookGroupSession> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}/sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<BookGroupSession>(response);
}

/**
 * Update a session (admin only)
 */
export async function updateSession(
  bookGroupId: string,
  sessionId: string,
  data: BookGroupSessionUpdate
): Promise<BookGroupSession> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}/sessions/${sessionId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<BookGroupSession>(response);
}

/**
 * Delete a session (admin only)
 */
export async function deleteSession(
  bookGroupId: string,
  sessionId: string
): Promise<{ success: boolean; message: string }> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}/sessions/${sessionId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Mark a book group as completed (admin only)
 */
export async function markBookGroupCompleted(
  bookGroupId: string,
  data: BookGroupMarkCompleted
): Promise<{ success: boolean; message: string }> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}/mark-completed`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Convert a completed book group to a store product (admin only)
 */
export async function convertToProduct(
  bookGroupId: string,
  data: BookGroupConvertToProduct
): Promise<{
  success: boolean;
  message: string;
  product_id: string;
  product_slug: string;
}> {
  const url = `${API_URL}/api/book-groups/${bookGroupId}/convert-to-product`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<{
    success: boolean;
    message: string;
    product_id: string;
    product_slug: string;
  }>(response);
}
