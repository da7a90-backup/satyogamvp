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
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

      // Step 1: Get the current user's ID
      const meResponse = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meResponse.ok) {
        throw new Error(`Failed to fetch user: ${meResponse.status}`);
      }

      const userData = await meResponse.json();
      const userId = userData.id;

      // Step 2: Fetch the user's enrolled courses with deep population for images
      const coursesResponse = await fetch(
        `${apiUrl}/api/users/${userId}?populate[enrolledCourses][populate]=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!coursesResponse.ok) {
        throw new Error(
          `Failed to fetch enrolled courses: ${coursesResponse.status}`
        );
      }

      const coursesData = await coursesResponse.json();

      // Step 3: Extract and format enrolled courses
      const enrolledCourses = coursesData.enrolledCourses || [];

      // Format the courses to match our expected Course[] structure
      const formattedCourses = enrolledCourses.map((course) => {
        // Create the correctly formatted featuredImage object
        let featuredImage = undefined;

        if (course.featuredImage) {
          // Extract the formats directly from the featuredImage object
          const formats = course.featuredImage.formats || {};

          // Get the URL from the formats or use a fallback URL
          const url =
            formats.large?.url ||
            formats.small?.url ||
            `https://res.cloudinary.com/dxg19p7wn/image/upload/v1745531111/Chat_GPT_Image_Apr_24_2025_11_33_46_AM_168d1c0388.png`;

          featuredImage = {
            data: {
              attributes: {
                url: url,
                formats: formats,
              },
            },
          };
        }

        // Extract instructors if they exist
        let instructors = undefined;

        if (course.instructors) {
          instructors = {
            data: Array.isArray(course.instructors)
              ? course.instructors.map((instructor) => ({
                  id: instructor.id,
                  attributes: {
                    name: instructor.name || "Instructor",
                  },
                }))
              : [],
          };
        }

        return {
          id: course.id,
          attributes: {
            title: course.title || "",
            slug: course.slug || "",
            description: course.description || "",
            price: course.price || 0,
            isFree: course.free || false,
            ...(featuredImage && { featuredImage }),
            ...(instructors && { instructors }),
          },
        };
      });

      return {
        data: formattedCourses,
        meta: { pagination: { total: formattedCourses.length } },
      };
    } catch (error) {
      console.error("Error fetching user courses:", error);
      throw error;
    }
  },

  /**
   * Enroll user in a course using the correct Strapi v4 relationship format
   */
  enrollInCourse: async (courseId: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

      // Step 1: Get the current user's ID
      console.log("Fetching user data...");
      const userResponse = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to authenticate user.");
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Step 2: Update the course with the user relationship using proper Strapi v4 connect syntax
      const updateResponse = await fetch(`${apiUrl}/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            enrolledUsers: {
              connect: [userId],
            },
          },
        }),
      });

      console.log(`Update response status: ${updateResponse.status}`);

      let responseData;
      try {
        responseData = await updateResponse.json();
        console.log("Update response:", responseData);
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to enroll in course (${updateResponse.status})`
        );
      }

      return { success: true, message: "Successfully enrolled in course" };
    } catch (error) {
      console.error(`Error enrolling in course:`, error);
      throw error;
    }
  },

  /**
   * Get available courses (courses the user is not enrolled in)
   */
  getAvailableCourses: async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const token = localStorage.getItem("jwt");

      // For unauthenticated users, fetch all published courses
      if (!token) {
        console.log("No token found - fetching all published courses");
        const response = await fetch(
          `${apiUrl}/api/courses?filters[publishedAt][$notNull]=true&populate=featuredImage,instructors`
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        return await response.json();
      }

      // For authenticated users, exclude courses they're already enrolled in
      // First get the user's enrolled course IDs
      const meResponse = await fetch(
        `${apiUrl}/api/users/me?populate=enrolledCourses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!meResponse.ok) {
        throw new Error(`Failed to fetch user: ${meResponse.status}`);
      }

      const userData = await meResponse.json();
      const enrolledCourseIds = userData.enrolledCourses
        ? userData.enrolledCourses.map((course) => course.id)
        : [];

      console.log("User is enrolled in courses with IDs:", enrolledCourseIds);

      // Build a URL to fetch available courses (published, not enrolled)
      let url = `${apiUrl}/api/courses?filters[publishedAt][$notNull]=true&populate=featuredImage,instructors`;

      // Add filter to exclude enrolled courses if the user has any
      if (enrolledCourseIds.length > 0) {
        const idsParam = enrolledCourseIds.join(",");
        url += `&filters[id][$notIn]=${idsParam}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
          "introVideo.video",
          "enrolledUsers", // Add this to populate the enrolledUsers field
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
   * Get classes for a course with minimal data population
   * This is the base function used by ClassComponentLayout
   */
  getClassBySlugAndIndex: async (slug: string, orderIndex: number) => {
    try {
      // Step 1: Get the course by slug
      const course = await courseApi.getCourseBySlug(slug);
      if (!course) {
        throw new Error(`Course with slug "${slug}" not found`);
      }

      // Step 2: Fetch the class with the specific orderIndex for this course
      const courseId = course.id;

      // Use only basic populate parameters for minimal data
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&filters[orderIndex][$eq]=${orderIndex}&populate=course`;

      const response = await fetchAPI(url);

      // If no matching class is found, return null
      if (!response.data || response.data.length === 0) {
        console.log(
          `No class found for course ${courseId} with orderIndex ${orderIndex}`
        );
        return null;
      }

      return response.data[0];
    } catch (error) {
      console.error(
        `Error fetching class for course "${slug}" with orderIndex ${orderIndex}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get a specific class by course slug and orderIndex with full video-related content
   * This is optimized for the video component
   */
  getClassWithVideoContent: async (slug: string, orderIndex: number) => {
    try {
      // Step 1: Get the course by slug
      const course = await courseApi.getCourseBySlug(slug);
      if (!course) {
        throw new Error(`Course with slug "${slug}" not found`);
      }

      // Step 2: Fetch the class with the specific orderIndex for this course
      const courseId = course.id;

      // Use a very specific populate parameter to get all nested content including the video content with all possible field names
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&filters[orderIndex][$eq]=${orderIndex}&populate[content][populate][video][populate][videoFile][populate]=*&populate[content][populate][video][populate][AudioFile][populate]=*&populate[content][populate][video][populate][audioFile][populate]=*&populate[content][populate][video][populate][audio][populate]=*&populate[content][populate][video][populate]=videoDescription,videoTranscript&populate=*`;

      const response = await fetchAPI(url);

      // If no matching class is found, return null
      if (!response.data || response.data.length === 0) {
        console.log(
          `No class found for course ${courseId} with orderIndex ${orderIndex}`
        );
        return null;
      }

      return response.data[0];
    } catch (error) {
      console.error(
        `Error fetching class for video component for course "${slug}" with orderIndex ${orderIndex}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get a specific class by course slug and orderIndex with keyConcepts content
   */
  getClassWithKeyConcepts: async (slug: string, orderIndex: number) => {
    try {
      // Use a reference to prevent multiple identical requests
      const cacheKey = `key-concepts-${slug}-${orderIndex}`;

      // Step 1: Get the course by slug - but only once
      const course = await courseApi.getCourseBySlug(slug);
      if (!course) {
        throw new Error(`Course with slug "${slug}" not found`);
      }

      // Step 2: Fetch the class with the specific orderIndex for this course
      const courseId = course.id;

      // Use explicit path to content.keyConcepts to ensure deep population
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&filters[orderIndex][$eq]=${orderIndex}&populate=*,content.keyConcepts`;

      const response = await fetchAPI(url);

      // If no matching class is found, return null
      if (!response.data || response.data.length === 0) {
        console.log(
          `No class found for course ${courseId} with orderIndex ${orderIndex}`
        );
        return null;
      }

      // Only log the keys once to avoid logging loops
      console.log(
        "Key Concepts class data found with ID:",
        response.data[0].id
      );

      return response.data[0];
    } catch (error) {
      console.error(`Error fetching class with key concepts:`, error);
      throw error;
    }
  },

  /**
   * Get a specific class by course slug and orderIndex with writingPrompts content
   */
  getClassWithWritingPrompts: async (slug: string, orderIndex: number) => {
    try {
      // Step 1: Get the course by slug
      const course = await courseApi.getCourseBySlug(slug);
      if (!course) {
        throw new Error(`Course with slug "${slug}" not found`);
      }

      // Step 2: Fetch the class with the specific orderIndex for this course
      const courseId = course.id;

      // Use a populate parameter specifically for writing prompts
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&filters[orderIndex][$eq]=${orderIndex}&populate[content][populate]=*&populate=*`;

      const response = await fetchAPI(url);

      // If no matching class is found, return null
      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Return the first class that matches the criteria
      return response.data[0];
    } catch (error) {
      console.error(`Error fetching class with writing prompts:`, error);
      throw error;
    }
  },

  /**
   * Get a specific class by course slug and orderIndex with additionalMaterials content
   */
  getClassWithAdditionalMaterials: async (slug: string, orderIndex: number) => {
    try {
      // Step 1: Get the course by slug
      const course = await courseApi.getCourseBySlug(slug);
      if (!course) {
        throw new Error(`Course with slug "${slug}" not found`);
      }

      // Step 2: Fetch the class with the specific orderIndex for this course
      const courseId = course.id;

      // Use explicit path to content.additionalMaterials to ensure deep population with video and guidedMeditation content
      const url = `/api/course-classes?filters[course][id][$eq]=${courseId}&filters[orderIndex][$eq]=${orderIndex}&populate=content,content.additionalMaterials,content.additionalMaterials.video,content.additionalMaterials.guidedMeditation,content.additionalMaterials.video.data,content.additionalMaterials.guidedMeditation.data,content.additionalMaterials.videoDescription,content.additionalMaterials.essay`;

      const response = await fetchAPI(url);

      // If no matching class is found, return null
      if (!response.data || response.data.length === 0) {
        console.log(
          `No class found for course ${courseId} with orderIndex ${orderIndex}`
        );
        return null;
      }

      // Log the retrieved data structure for debugging
      console.log(
        "Additional Materials class data found with ID:",
        response.data[0].id
      );

      return response.data[0];
    } catch (error) {
      console.error(`Error fetching class with additional materials:`, error);
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

      const response = await fetchAPI(url);

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
