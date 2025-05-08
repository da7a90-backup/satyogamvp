"use client";

// Helper to get the JWT token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt");
};

// Base API URL
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export const courseCommentApi = {
  /**
   * Get comments for a specific section of a course
   * @param courseId - The ID of the course
   * @param sectionType - Type of section (video, additionalMaterials, testimonial)
   * @param classIndex - The index of the class (optional, for video and additionalMaterials only)
   */
  getComments: async (
    courseId: string,
    sectionType: "video" | "additionalMaterials" | "testimonial",
    classIndex?: number
  ) => {
    try {
      const token = getToken();

      // Build filter parameters
      let filterParams = `filters[course][id][$eq]=${courseId}&filters[sectionType][$eq]=${sectionType}`;

      // Add classIndex filter if provided
      if (classIndex !== undefined) {
        filterParams += `&filters[classIndex][$eq]=${classIndex}`;
      } else {
        // For testimonials ensure classIndex is null
        filterParams += `&filters[classIndex][$null]=true`;
      }

      // Sort by creation date (newest first) and populate user data
      const url = `${API_URL}/api/course-comments?${filterParams}&sort=createdAt:desc&populate=user`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  /**
   * Add a new comment
   * @param courseId - The ID of the course
   * @param sectionType - Type of section (video, additionalMaterials, testimonial)
   * @param comment - The comment text
   * @param classIndex - The index of the class (optional, for video and additionalMaterials only)
   */
  addComment: async (
    courseId: string,
    sectionType: "video" | "additionalMaterials" | "testimonial",
    comment: string,
    classIndex?: number
  ) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      // First, get the current user's ID
      const userResponse = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get current user data");
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Now create comment with explicit user relation
      const commentData = {
        data: {
          comment: comment,
          course: courseId,
          sectionType: sectionType,
          classIndex: classIndex || null,
          user: userId, // Explicitly set the user ID
        },
      };

      console.log("Submitting comment with data:", JSON.stringify(commentData));

      const response = await fetch(`${API_URL}/api/course-comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(
          errorData.error?.message ||
            `Failed to create comment: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating comment:", error);
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
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      const commentData = {
        data: {
          comment: comment,
        },
      };

      const response = await fetch(
        `${API_URL}/api/course-comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message ||
            `Failed to update comment: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  /**
   * Delete a comment (for admins or comment owners)
   * @param commentId - The ID of the comment to delete
   */
  deleteComment: async (commentId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${API_URL}/api/course-comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  /**
   * Get the current user information
   */
  getCurrentUser: async () => {
    try {
      const token = getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },
};

export default courseCommentApi;
