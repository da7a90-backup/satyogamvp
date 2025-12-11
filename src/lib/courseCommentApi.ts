/**
 * Course Comment API - FastAPI Backend Integration
 * User comments on courses and classes
 */

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('jwt');
};

// Helper to make authenticated requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}, requireAuth: boolean = true) => {
  const token = getAuthToken();

  if (requireAuth && !token) {
    throw new Error('User not authenticated');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${FASTAPI_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
};

export const courseCommentApi = {
  /**
   * Get comments for a course or specific class
   * @param courseId - The ID of the course
   * @param classId - Optional: The ID of a specific class
   */
  getComments: async (
    courseId: string,
    classId?: string
  ) => {
    try {
      const params = new URLSearchParams();
      if (classId) {
        params.append('class_id', classId);
      }

      const queryString = params.toString();
      const url = `/api/courses/${courseId}/comments${queryString ? `?${queryString}` : ''}`;

      const data = await fetchAPI(url, {}, false); // Comments can be viewed by non-authenticated users
      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Add a new comment to a course or class
   * @param courseId - The ID of the course
   * @param comment - The comment text
   * @param classId - Optional: The ID of a specific class
   */
  addComment: async (
    courseId: string,
    comment: string,
    classId?: string
  ) => {
    try {
      const data = await fetchAPI(`/api/courses/${courseId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          class_id: classId || null,
          content: comment,
        }),
      });
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  /**
   * Update an existing comment
   * @param commentId - The ID of the comment to update
   * @param comment - The new comment text
   */
  updateComment: async (commentId: string, comment: string) => {
    try {
      const data = await fetchAPI(`/api/courses/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: comment,
        }),
      });
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment (owner or admin only)
   * @param commentId - The ID of the comment to delete
   */
  deleteComment: async (commentId: string) => {
    try {
      const data = await fetchAPI(`/api/courses/comments/${commentId}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Get the current user information
   */
  getCurrentUser: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      // Use the user endpoint to get current user data
      const data = await fetchAPI('/api/users/me');
      return data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
};

export default courseCommentApi;
