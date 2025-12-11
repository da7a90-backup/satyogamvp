/**
 * Course Progress API - FastAPI Backend Integration
 * Track user progress through courses
 */

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('jwt');
};

// Helper to make authenticated requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('User not authenticated');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

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

export const courseProgressApi = {
  /**
   * Get progress for a specific course
   */
  getUserCourseProgress: async (courseId: string) => {
    try {
      const data = await fetchAPI(`/api/courses/progress/${courseId}`);
      return data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  },

  /**
   * Update progress for a component
   */
  updateComponentProgress: async (
    classId: string,
    componentId: string | null,
    progressPercentage: number,
    completed: boolean = false,
    timeSpent: number = 0
  ) => {
    try {
      const data = await fetchAPI('/api/courses/progress', {
        method: 'POST',
        body: JSON.stringify({
          class_id: classId,
          component_id: componentId,
          progress_percentage: progressPercentage,
          completed,
          time_spent: timeSpent,
        }),
      });
      return data;
    } catch (error) {
      console.error('Error updating component progress:', error);
      throw error;
    }
  },

  /**
   * Mark a component as complete (100%)
   */
  markComponentComplete: async (
    classId: string,
    componentId: string | null
  ) => {
    return courseProgressApi.updateComponentProgress(
      classId,
      componentId,
      100,
      true
    );
  },

  /**
   * Save video timestamp for resume functionality
   */
  saveVideoTimestamp: async (
    componentId: string,
    timestamp: number
  ) => {
    try {
      const data = await fetchAPI('/api/courses/progress/video-timestamp', {
        method: 'POST',
        body: JSON.stringify({
          component_id: componentId,
          timestamp,
        }),
      });
      return data;
    } catch (error) {
      console.error('Error saving video timestamp:', error);
      throw error;
    }
  },

  /**
   * Get saved video timestamp
   */
  getVideoTimestamp: async (
    courseId: string,
    classId: string,
    componentId: string
  ) => {
    try {
      const data = await fetchAPI(
        `/api/courses/progress/video-timestamp/${courseId}/${classId}/${componentId}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching video timestamp:', error);
      return { timestamp: 0, progress_percentage: 0, completed: false };
    }
  },
};

export default courseProgressApi;
