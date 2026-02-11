import { getFastapiUrl } from './api-utils';
/**
 * Course API functions
 * Handles all API calls to the FastAPI backend for courses
 */

import { Course, CourseComponent, ComponentNavigation, CommentResponse } from '@/types/course';

const FASTAPI_URL = getFastapiUrl();

/**
 * Get authentication token from NextAuth session
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    return session?.user?.accessToken || session?.user?.jwt || null;
  } catch (error) {
    console.error('Failed to get session token:', error);
    return null;
  }
}

/**
 * Create headers with authentication
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Get course by slug with full details
 */
export async function getCourseBySlug(slug: string): Promise<Course> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/courses/${slug}`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch course: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get specific component by ID
 */
export async function getComponent(componentId: string): Promise<CourseComponent> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/courses/components/${componentId}`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch component: ${response.statusText}`);
  }

  return response.json();
}

// Alias for getComponent
export const getComponentById = getComponent;

/**
 * Get navigation for a component (previous/next)
 */
export async function getComponentNavigation(
  courseSlug: string,
  componentId: string
): Promise<ComponentNavigation> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/courses/${courseSlug}/navigation/${componentId}`,
    {
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch navigation: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update component progress
 */
export async function updateComponentProgress(
  componentId: string,
  progressPercentage: number,
  completed: boolean
): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/courses/progress`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      component_id: componentId,
      progress_percentage: progressPercentage,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update progress: ${response.statusText}`);
  }
}

/**
 * Save video timestamp for resume functionality
 */
export async function saveVideoTimestamp(
  componentId: string,
  timestamp: number
): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/courses/progress/video-timestamp`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      component_id: componentId,
      timestamp: Math.floor(timestamp),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save timestamp: ${response.statusText}`);
  }
}

/**
 * Get comments for a component
 */
export async function getComponentComments(componentId: string): Promise<CommentResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/courses/components/${componentId}/comments`,
    {
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Post a comment to a component
 */
export async function postComponentComment(
  componentId: string,
  content: string
): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/courses/components/${componentId}/comments`,
    {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to post comment: ${response.statusText}`);
  }
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(courseId: string, paymentId?: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/courses/enroll`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      course_id: courseId,
      payment_id: paymentId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to enroll: ${response.statusText}`);
  }
}

/**
 * Get all courses
 */
export async function getCourses(skip: number = 0, limit: number = 50): Promise<{
  courses: Course[];
  total: number;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/courses/?skip=${skip}&limit=${limit}`,
    {
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.statusText}`);
  }

  return response.json();
}
