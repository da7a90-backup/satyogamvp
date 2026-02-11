import { getFastapiUrl } from './api-utils';
/**
 * Admin API client for course management
 */

import { Course, CourseStructure } from '@/types/course';


interface CreateCoursePayload {
  slug: string;
  title: string;
  description?: string;
  price?: number;
  instructor_id?: string;
  is_published?: boolean;
  structure_template?: CourseStructure;
  selling_page_data?: any;
}

interface UpdateCoursePayload extends Partial<CreateCoursePayload> {}

/**
 * Get all courses (admin only)
 */
export async function getAllCoursesAdmin(token: string): Promise<Course[]> {
  const response = await fetch(`${getFastapiUrl()}/api/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch courses');
  }

  return response.json();
}

/**
 * Get course by ID (admin only)
 */
export async function getCourseByIdAdmin(courseId: string, token: string): Promise<Course> {
  const response = await fetch(`${getFastapiUrl()}/api/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch course');
  }

  return response.json();
}

/**
 * Create new course (admin only)
 */
export async function createCourse(payload: CreateCoursePayload, token: string): Promise<Course> {
  const response = await fetch(`${getFastapiUrl()}/api/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create course');
  }

  return response.json();
}

/**
 * Update course (admin only)
 */
export async function updateCourse(
  courseId: string,
  payload: UpdateCoursePayload,
  token: string
): Promise<Course> {
  const response = await fetch(`${getFastapiUrl()}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update course');
  }

  return response.json();
}

/**
 * Delete course (admin only)
 */
export async function deleteCourse(courseId: string, token: string): Promise<void> {
  const response = await fetch(`${getFastapiUrl()}/api/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete course');
  }
}

/**
 * Get all instructors (admin only)
 */
export async function getAllInstructors(token: string): Promise<Array<{ id: string; name: string; bio?: string }>> {
  const response = await fetch(`${getFastapiUrl()}/api/instructors`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch instructors');
  }

  return response.json();
}
