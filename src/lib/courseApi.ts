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
        {
          page,
          pageSize,
          publicationState: "preview", // This includes both published and draft content
        },
        sort,
        ["featuredImage", "instructors"]
      );
      return await fetchAPI(url);
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Add to your courseApi.ts file

  /**
   * Get all published courses without requiring authentication
   */
  getPublicCourses: async (page = 1, pageSize = 10) => {
    try {
      // Create a URL for published courses
      const url = `/api/courses?filters[publishedAt][$notNull]=true&populate=featuredImage,instructors&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;

      // Make a direct fetch without auth headers
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${url}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching public courses:", error);
      throw error;
    }
  },
  /**
   * Get courses for the current user
   */
  getUserCourses: async () => {
    try {
      // Use our custom API endpoint instead of direct Strapi call
      const response = await fetch("/api/user-courses");

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user courses:", error);
      throw error;
    }
  },

  /**
   * Enroll user in a course
   */
  enrollInCourse: async (courseId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      // First get the current user to get their ID
      const user = await fetchAPI(`/api/users/me`);

      // Update the user's enrolled courses
      return await fetchAPI(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          enrolledCourses: {
            connect: [courseId],
          },
        }),
      });
    } catch (error) {
      console.error(`Error enrolling in course:`, error);
      throw error;
    }
  },

  /**
   * Get available courses - courses the user is not enrolled in
   */
  getAvailableCourses: async () => {
    try {
      // Use the server-side API endpoint
      const response = await fetch("/api/available-courses");

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching available courses:", error);
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
          "instructors.picture",
          "seo",
          "whatYouWillLearn",
          "whatYouWillLearn.learningPoints",
          "courseFeatures",
          "previewMedia",
          "featuredQuote",
          "featuredQuote.authorImage",
          "introVideo",
          "introVideo.video", // Added this to populate the video field in the introVideo component
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
   * Get classes for a course with complete content
   */
  getClasses: async (courseId: string) => {
    try {
      console.log(`Fetching classes for course ID "${courseId}"`);

      // Create a more comprehensive populate query to ensure we get all needed data
      // We need to use deep populate to get nested components
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&sort=orderIndex:asc&populate[content][populate]=*&populate=*`;

      console.log(`Requesting URL: ${url}`);
      const response = await fetchAPI(url);

      // Log the response structure to help with debugging
      if (response.data && response.data.length > 0) {
        console.log(
          "First class structure sample:",
          JSON.stringify(response.data[0], null, 2).substring(0, 300) + "..."
        );

        // Check if content is properly populated
        const firstClass = response.data[0];
        if (firstClass.attributes.content) {
          console.log(
            "Content structure:",
            JSON.stringify(firstClass.attributes.content, null, 2)
          );
        } else {
          console.log("Content not properly populated in response");
        }
      }

      return response;
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
      // Explicitly wrap the data as expected by Strapi v4
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
