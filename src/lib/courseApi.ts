/**
 * Course API - FastAPI Backend Integration
 * All course-related API calls
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

export const courseApi = {
  // ============================================================================
  // PUBLIC COURSE ENDPOINTS
  // ============================================================================

  /**
   * Get all published courses (public)
   */
  getCourses: async (page = 1, pageSize = 10, search = '') => {
    const params = new URLSearchParams({
      skip: ((page - 1) * pageSize).toString(),
      limit: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const data = await fetchAPI(`/api/courses/?${params}`);
    return data;
  },

  /**
   * Get a single course by slug
   */
  getCourseBySlug: async (slug: string) => {
    try {
      const data = await fetchAPI(`/api/courses/${slug}`);
      return data;
    } catch (error) {
      console.error(`Error fetching course with slug "${slug}":`, error);
      return null;
    }
  },

  /**
   * Get a single course by ID
   */
  getCourse: async (id: string) => {
    try {
      const data = await fetchAPI(`/api/courses/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching course with ID "${id}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // USER ENROLLMENT ENDPOINTS
  // ============================================================================

  /**
   * Get user's enrolled courses
   */
  getUserCourses: async () => {
    try {
      const data = await fetchAPI('/api/courses/my-enrollments');
      return data;
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw error;
    }
  },

  /**
   * Enroll in a course
   */
  enrollInCourse: async (courseId: string, paymentId?: string) => {
    try {
      const data = await fetchAPI('/api/courses/enroll', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          payment_id: paymentId,
        }),
      });
      return data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  /**
   * Get available courses (not enrolled)
   */
  getAvailableCourses: async () => {
    try {
      // Get all published courses
      const allCourses = await fetchAPI('/api/courses/');

      // If user is authenticated, filter out enrolled courses
      const token = getAuthToken();
      if (token) {
        const enrolledCourses = await courseApi.getUserCourses();
        const enrolledIds = new Set(enrolledCourses.enrollments?.map((e: any) => e.course.id) || []);

        return {
          ...allCourses,
          courses: allCourses.courses?.filter((c: any) => !enrolledIds.has(c.id)) || [],
        };
      }

      return allCourses;
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  },

  // ============================================================================
  // CLASS ENDPOINTS
  // ============================================================================

  /**
   * Get classes for a course
   */
  getClasses: async (courseId: string) => {
    try {
      // Classes are returned with the course detail endpoint
      const course = await fetchAPI(`/api/courses/${courseId}`);
      return { data: course.classes || [] };
    } catch (error) {
      console.error(`Error fetching classes for course "${courseId}":`, error);
      return { data: [] };
    }
  },

  /**
   * Get a single class by ID
   */
  getClass: async (classId: string) => {
    try {
      const data = await fetchAPI(`/api/courses/classes/${classId}`);
      return { data };
    } catch (error) {
      console.error(`Error fetching class with ID "${classId}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // ADMIN - COURSE MANAGEMENT
  // ============================================================================

  /**
   * Get all courses (including unpublished) - Admin only
   */
  getCoursesAdmin: async (page = 1, pageSize = 10, search = '') => {
    const params = new URLSearchParams({
      skip: ((page - 1) * pageSize).toString(),
      limit: pageSize.toString(),
    });

    const data = await fetchAPI(`/api/courses/admin/all?${params}`);

    // Transform to match expected format
    return {
      data: data.courses || [],
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(data.total / pageSize),
          total: data.total,
        },
      },
    };
  },

  /**
   * Create a new course - Admin only
   */
  createCourse: async (courseData: any) => {
    try {
      const data = await fetchAPI('/api/courses/admin/create', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * Update an existing course - Admin only
   */
  updateCourse: async (id: string, courseData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
      return data;
    } catch (error) {
      console.error(`Error updating course with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete a course - Admin only
   */
  deleteCourse: async (id: string) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/${id}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error(`Error deleting course with ID "${id}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // ADMIN - CLASS MANAGEMENT
  // ============================================================================

  /**
   * Create a new class - Admin only
   */
  createClass: async (courseId: string, classData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/${courseId}/classes`, {
        method: 'POST',
        body: JSON.stringify(classData),
      });
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  /**
   * Update a class - Admin only
   */
  updateClass: async (classId: string, classData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/classes/${classId}`, {
        method: 'PUT',
        body: JSON.stringify(classData),
      });
      return data;
    } catch (error) {
      console.error(`Error updating class with ID "${classId}":`, error);
      throw error;
    }
  },

  /**
   * Delete a class - Admin only
   */
  deleteClass: async (classId: string) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/classes/${classId}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error(`Error deleting class with ID "${classId}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // ADMIN - COMPONENT MANAGEMENT
  // ============================================================================

  /**
   * Add a component to a class - Admin only
   */
  createComponent: async (classId: string, componentData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/classes/${classId}/components`, {
        method: 'POST',
        body: JSON.stringify(componentData),
      });
      return data;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  },

  /**
   * Update a component - Admin only
   */
  updateComponent: async (componentId: string, componentData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/components/${componentId}`, {
        method: 'PUT',
        body: JSON.stringify(componentData),
      });
      return data;
    } catch (error) {
      console.error(`Error updating component with ID "${componentId}":`, error);
      throw error;
    }
  },

  /**
   * Delete a component - Admin only
   */
  deleteComponent: async (componentId: string) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/components/${componentId}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error(`Error deleting component with ID "${componentId}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // ADMIN - INSTRUCTOR MANAGEMENT
  // ============================================================================

  /**
   * Get all instructors - Admin only
   */
  getInstructors: async () => {
    try {
      const data = await fetchAPI('/api/courses/admin/instructors');
      return { data: data.instructors || [] };
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }
  },

  /**
   * Create a new instructor - Admin only
   */
  createInstructor: async (instructorData: any) => {
    try {
      const data = await fetchAPI('/api/courses/admin/instructors', {
        method: 'POST',
        body: JSON.stringify(instructorData),
      });
      return data;
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
  },

  /**
   * Update an instructor - Admin only
   */
  updateInstructor: async (id: string, instructorData: any) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/instructors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(instructorData),
      });
      return data;
    } catch (error) {
      console.error(`Error updating instructor with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete an instructor - Admin only
   */
  deleteInstructor: async (id: string) => {
    try {
      const data = await fetchAPI(`/api/courses/admin/instructors/${id}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error(`Error deleting instructor with ID "${id}":`, error);
      throw error;
    }
  },

  // ============================================================================
  // FILE UPLOAD (Optional - for admin dashboard)
  // ============================================================================

  /**
   * Upload a file (for Cloudflare Images/Stream)
   * Note: This would typically be a direct upload to Cloudflare
   * This is a placeholder for future implementation
   */
  uploadFile: async (file: File): Promise<{ id: string; url: string }> => {
    // TODO: Implement direct Cloudflare upload or proxy through backend
    throw new Error('File upload not yet implemented - use Cloudflare dashboard');
  },
};

export default courseApi;
