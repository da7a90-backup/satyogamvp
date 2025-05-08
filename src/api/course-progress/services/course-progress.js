"use strict";

/**
 * course-progress service
 */

module.exports = {
  // Method to create a course progress entry when a user enrolls
  async createOnEnrollment(userId, courseId) {
    try {
      // First, get the course to access its classes
      const course = await strapi.entityService.findOne(
        "api::course.course",
        courseId,
        {
          populate: ["classes"],
        }
      );

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Get all classes for this course
      const classes = await strapi.entityService.findMany(
        "api::course-class.course-class",
        {
          filters: { course: courseId },
          sort: "orderIndex:asc",
        }
      );

      // Create tracking structure - initialize progress for each class
      const classesData = classes.map((classItem) => ({
        classId: classItem.id,
        orderIndex: classItem.orderIndex || 0,
        video: 0,
        keyConcepts: 0,
        writingPrompts: 0,
        additionalMaterials: 0,
        completed: false,
        lastAccessed: null,
      }));

      // Create the CourseProgress entry
      const courseProgress = await strapi.entityService.create(
        "api::course-progress.course-progress",
        {
          data: {
            user: userId,
            course: courseId,
            classes: classesData,
            started: false,
            completed: false,
            startDate: null,
            lastAccessDate: null,
            enrolledDate: new Date().toISOString(),
          },
        }
      );

      return courseProgress;
    } catch (error) {
      console.error("Error creating course progress:", error);
      throw error;
    }
  },

  // Method to update progress for a specific component of a class
  async updateComponentProgress(
    userId,
    courseId,
    classId,
    component,
    progress
  ) {
    try {
      // Find the course progress entry
      const courseProgressEntries = await strapi.entityService.findMany(
        "api::course-progress.course-progress",
        {
          filters: {
            user: userId,
            course: courseId,
          },
          populate: ["tracking", "tracking.classes"],
        }
      );

      if (!courseProgressEntries || courseProgressEntries.length === 0) {
        throw new Error(
          `No course progress found for user ${userId} and course ${courseId}`
        );
      }

      const courseProgress = courseProgressEntries[0];
      const tracking = courseProgress.attributes.tracking;

      // Find the class in tracking.classes
      const classIndex = tracking.classes.findIndex(
        (c) => c.classId === parseInt(classId)
      );

      if (classIndex === -1) {
        throw new Error(`Class with ID ${classId} not found in tracking`);
      }

      // Make a deep copy to avoid reference issues
      const updatedTracking = JSON.parse(JSON.stringify(tracking));

      // Update the specific component progress
      if (
        [
          "video",
          "keyConcepts",
          "writingPrompts",
          "additionalMaterials",
        ].includes(component)
      ) {
        updatedTracking.classes[classIndex][component] = progress;
      } else {
        throw new Error(`Invalid component: ${component}`);
      }

      // Check if class is completed (all components at 100%)
      const classItem = updatedTracking.classes[classIndex];
      const isClassCompleted =
        classItem.video >= 0.99 &&
        classItem.keyConcepts >= 0.99 &&
        classItem.writingPrompts >= 0.99 &&
        classItem.additionalMaterials >= 0.99;

      updatedTracking.classes[classIndex].completed = isClassCompleted;
      updatedTracking.classes[classIndex].lastAccessed =
        new Date().toISOString();

      // Check if all classes are completed
      const allClassesCompleted = updatedTracking.classes.every(
        (c) => c.completed
      );

      // Update tracking metadata
      updatedTracking.started = true;
      updatedTracking.completed = allClassesCompleted;
      updatedTracking.lastAccessDate = new Date().toISOString();

      if (!updatedTracking.startDate) {
        updatedTracking.startDate = new Date().toISOString();
      }

      // Update the progress entry
      const updatedProgress = await strapi.entityService.update(
        "api::course-progress.course-progress",
        courseProgress.id,
        {
          data: {
            tracking: updatedTracking,
          },
        }
      );

      return updatedProgress;
    } catch (error) {
      console.error("Error updating component progress:", error);
      throw error;
    }
  },

  // Method to mark a component as complete (100%)
  async markComponentComplete(userId, courseId, classId, component) {
    return this.updateComponentProgress(
      userId,
      courseId,
      classId,
      component,
      1
    );
  },

  // Method to get progress for a user in a course
  async getUserCourseProgress(userId, courseId) {
    try {
      const courseProgressEntries = await strapi.entityService.findMany(
        "api::course-progress.course-progress",
        {
          filters: {
            user: userId,
            course: courseId,
          },
          populate: ["classes"],
        }
      );

      if (!courseProgressEntries || courseProgressEntries.length === 0) {
        return null;
      }

      return courseProgressEntries[0];
    } catch (error) {
      console.error("Error getting user course progress:", error);
      throw error;
    }
  },

  // Helper method to calculate overall progress percentage for a course
  calculateOverallProgress(courseProgress) {
    if (
      !courseProgress ||
      !courseProgress.classes ||
      courseProgress.classes.length === 0
    ) {
      return 0;
    }

    const classes = courseProgress.classes;
    const totalComponents = classes.length * 4; // 4 components per class

    const completedComponents = classes.reduce((sum, classItem) => {
      return (
        sum +
        parseFloat(classItem.video || 0) +
        parseFloat(classItem.keyConcepts || 0) +
        parseFloat(classItem.writingPrompts || 0) +
        parseFloat(classItem.additionalMaterials || 0)
      );
    }, 0);

    return totalComponents > 0
      ? (completedComponents / totalComponents) * 100
      : 0;
  },
};
