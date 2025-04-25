/**
 * Utility functions for interacting with the Courses API
 */
import { fetchAPI, buildStrapiUrl, getToken } from "./strapi";

/**
 * Course specific API methods
 */
export const courseApi = {
  /**
   * Upload a file to Strapi
   */
  uploadFile: async (file: File): Promise<{ id: number; url: string }> => {
    try {
      const formData = new FormData();
      formData.append("files", file);

      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

      console.log("Uploading file to:", `${apiUrl}/api/upload`);

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result[0].id,
        url: result[0].url,
      };
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  },
  /**
   * Get all courses with pagination
   */
  getCourses: async (
    page = 1,
    pageSize = 10,
    search = "",
    sort = "createdAt:desc"
  ) => {
    try {
      const filters = search ? { title: { $containsi: search } } : undefined;
      const url = buildStrapiUrl(
        "/api/courses",
        filters,
        { page, pageSize },
        sort,
        ["featuredImage", "instructors"]
      );
      return await fetchAPI(url);
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  /**
   * Get a single course by ID
   */
  getCourse: async (id: string) => {
    try {
      return await fetchAPI(
        `/api/courses/${id}?populate=featuredImage,instructors,seo`
      );
    } catch (error) {
      console.error(`Error fetching course with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData: any) => {
    try {
      return await fetchAPI("/api/courses", {
        method: "POST",
        body: JSON.stringify({ data: courseData }),
      });
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  /**
   * Update an existing course
   */
  updateCourse: async (id: string, courseData: any) => {
    try {
      return await fetchAPI(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify({ data: courseData }),
      });
    } catch (error) {
      console.error(`Error updating course with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id: string) => {
    try {
      return await fetchAPI(`/api/courses/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Error deleting course with ID "${id}":`, error);
      throw error;
    }
  },
  /**
   * Get a single course by slug
   */
  getCourseBySlug: async (slug: string) => {
    try {
      console.log(`Fetching course with slug "${slug}"`);

      // Build the URL with proper filters and populate parameters
      const url = buildStrapiUrl(
        "/api/courses",
        { slug: { $eq: slug } },
        undefined,
        undefined,
        [
          "featuredImage",
          "instructors",
          "seo",
          "whatYouWillLearn",
          "whatYouWillLearn.learningPoints",
          "courseFeatures",
          "previewMedia",
          "featuredQuote",
          "featuredQuote.authorImage",
        ]
      );

      // Make the request
      const response: any = await fetchAPI(url);

      // Check if we have data and log its structure
      if (response.data && response.data.length > 0) {
        // Return the first item from the data array
        return response.data[0];
      } else {
        console.log("No course found with the given slug");
        return null;
      }
    } catch (error) {
      console.error(`Error fetching course with slug "${slug}":`, error);
      throw error;
    }
  },
  /**
   * Get classes for a course
   */
  getClasses: async (courseId: string) => {
    try {
      console.log(`Fetching classes for course ID "${courseId}"`);

      // Use the correct endpoint name: course-class instead of classes
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&sort=orderIndex:asc&populate=content`;

      console.log(`Requesting URL: ${url}`);
      return await fetchAPI(url);
    } catch (error) {
      console.error(`Error fetching classes for course "${courseId}":`, error);
      // Return empty data array on error so the UI can still render
      return { data: [] };
    }
  },

  /**
   * Get a single class by ID
   */
  getClass: async (id: string) => {
    try {
      return await fetchAPI(
        `/api/course-classes/${id}?populate=course,content`
      );
    } catch (error) {
      console.error(`Error fetching class with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Create a new class
   */
  createClass: async (classData: any) => {
    try {
      return await fetchAPI("/api/course-classes", {
        method: "POST",
        body: JSON.stringify({ data: classData }),
      });
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  },

  /**
   * Update an existing class
   */
  updateClass: async (id: string, classData: any) => {
    try {
      return await fetchAPI(`/api/course-classes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ data: classData }),
      });
    } catch (error) {
      console.error(`Error updating class with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete a class
   */
  deleteClass: async (id: string) => {
    try {
      return await fetchAPI(`/api/course-classes/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Error deleting class with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Get instructors
   */
  getInstructors: async () => {
    try {
      return await fetchAPI("/api/instructors?sort=name:asc");
    } catch (error) {
      console.error("Error fetching instructors:", error);
      throw error;
    }
  },

  /**
   * Create a new instructor
   */
  createInstructor: async (instructorData: any) => {
    try {
      return await fetchAPI("/api/instructors", {
        method: "POST",
        body: JSON.stringify({ data: instructorData }),
      });
    } catch (error) {
      console.error("Error creating instructor:", error);
      throw error;
    }
  },

  /**
   * Update an existing instructor
   */
  updateInstructor: async (id: string, instructorData: any) => {
    try {
      return await fetchAPI(`/api/instructors/${id}`, {
        method: "PUT",
        body: JSON.stringify({ data: instructorData }),
      });
    } catch (error) {
      console.error(`Error updating instructor with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete an instructor
   */
  deleteInstructor: async (id: string) => {
    try {
      return await fetchAPI(`/api/instructors/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Error deleting instructor with ID "${id}":`, error);
      throw error;
    }
  },
};

export default courseApi;
