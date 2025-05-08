"use client";

// Helper to get the JWT token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt");
};

// Base API URL
const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export const courseProgressApi = {
  /**
   * Get progress for the current user in a course
   */
  getUserCourseProgress: async (courseId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Use URL with populate to get the tracking structure
      const url = `${API_URL}/api/course-progresses?filters[course][id][$eq]=${courseId}&populate[tracking][populate]=*&populate=tracking,tracking.classes`;

      // console.log("Fetching progress from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      // console.log("Progress response:", result);

      // Return the first entry if found
      if (result.data && result.data.length > 0) {
        return result.data[0];
      }

      return null;
    } catch (error) {
      console.error("Error fetching course progress:", error);
      return null;
    }
  },

  /**
   * Update progress for a specific component
   */
  updateComponentProgress: async (
    courseId: string,
    classId: string,
    component: string,
    progress: number
  ) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      // First, get the current progress entry
      const progressData = await courseProgressApi.getUserCourseProgress(
        courseId
      );

      if (!progressData) {
        throw new Error("No progress entry found");
      }

      // Make a deep copy of the tracking data
      const tracking = JSON.parse(
        JSON.stringify(progressData.attributes.tracking)
      );

      // Find the class in tracking.classes
      const classIndex = tracking.classes.findIndex(
        (c: any) => c.classId === parseInt(classId)
      );

      if (classIndex === -1) {
        throw new Error(`Class with ID ${classId} not found in tracking`);
      }

      // Update the specific component progress
      if (
        [
          "video",
          "keyConcepts",
          "writingPrompts",
          "additionalMaterials",
        ].includes(component)
      ) {
        tracking.classes[classIndex][component] = progress;
      } else {
        throw new Error(`Invalid component: ${component}`);
      }

      // Check if class is completed
      const classItem = tracking.classes[classIndex];
      const isClassCompleted =
        classItem.video >= 0.99 &&
        classItem.keyConcepts >= 0.99 &&
        classItem.writingPrompts >= 0.99 &&
        classItem.additionalMaterials >= 0.99;

      tracking.classes[classIndex].completed = isClassCompleted;
      tracking.classes[classIndex].lastAccessed = new Date().toISOString();

      // Check if all classes are completed
      const allClassesCompleted = tracking.classes.every(
        (c: any) => c.completed
      );

      // Update tracking metadata
      tracking.started = true;
      tracking.completed = allClassesCompleted;
      tracking.lastAccessDate = new Date().toISOString();

      if (!tracking.startDate) {
        tracking.startDate = new Date().toISOString();
      }

      // Update the progress entry
      const updateResponse = await fetch(
        `${API_URL}/api/course-progresses/${progressData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              tracking: tracking,
            },
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Update API error: ${updateResponse.status}`);
      }

      return await updateResponse.json();
    } catch (error) {
      console.error("Error updating component progress:", error);
      throw error;
    }
  },

  /**
   * Mark a component as complete (100%)
   */
  markComponentComplete: async (
    courseId: string,
    classId: string,
    component: string
  ) => {
    return courseProgressApi.updateComponentProgress(
      courseId,
      classId,
      component,
      1
    );
  },
};

export default courseProgressApi;
