"use client";

import { useState, useEffect } from "react";
import { courseProgressApi } from "@/lib/courseProgressApi";
import { courseApi } from "@/lib/courseApi";

interface CourseProgressContainerProps {
  courseId: string;
  courseSlug: string;
  children: React.ReactNode;
  onProgressUpdate?: (progressData: any) => void;
}

/**
 * Container component that manages course progress data and provides it to child components
 */
const CourseProgressContainer = ({
  courseId,
  courseSlug,
  children,
  onProgressUpdate,
}: CourseProgressContainerProps) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch progress data when component mounts
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch progress data from API
        const data = await courseProgressApi.getUserCourseProgress(courseId);
        setProgressData(data);

        // Calculate completion percentage
        if (data && data.attributes && data.attributes.tracking) {
          calculateCompletionPercentage(data.attributes.tracking);
        } else {
          setCompletionPercentage(0);
        }

        // Notify parent component if callback provided
        if (onProgressUpdate) {
          onProgressUpdate(data);
        }
      } catch (err) {
        console.error("Error fetching course progress:", err);
        setError("Failed to load course progress data");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchProgressData();
    }
  }, [courseId, courseSlug, onProgressUpdate]);

  // Calculate overall completion percentage based on class components
  const calculateCompletionPercentage = (tracking: any) => {
    if (!tracking || !tracking.classes || tracking.classes.length === 0) {
      setCompletionPercentage(0);
      return;
    }

    const classes = tracking.classes;
    const totalComponents = classes.length * 4; // 4 components per class (video, keyConcepts, writingPrompts, additionalMaterials)

    let completedComponents = 0;

    // Sum up progress across all classes and components
    classes.forEach((classItem: any) => {
      completedComponents += parseFloat(classItem.video || 0);
      completedComponents += parseFloat(classItem.keyConcepts || 0);
      completedComponents += parseFloat(classItem.writingPrompts || 0);
      completedComponents += parseFloat(classItem.additionalMaterials || 0);
    });

    // Calculate percentage
    const percentage =
      totalComponents > 0
        ? Math.round((completedComponents / totalComponents) * 100)
        : 0;

    setCompletionPercentage(percentage);
  };

  // Update progress for a specific component
  const updateComponentProgress = async (
    classId: string,
    component: string,
    progress: number
  ) => {
    try {
      setError(null);

      // Call API to update progress
      const updatedData = await courseProgressApi.updateComponentProgress(
        courseId,
        classId,
        component,
        progress
      );

      // Update local state
      setProgressData(updatedData);

      // Recalculate completion percentage
      if (
        updatedData &&
        updatedData.attributes &&
        updatedData.attributes.tracking
      ) {
        calculateCompletionPercentage(updatedData.attributes.tracking);
      }

      // Notify parent component if callback provided
      if (onProgressUpdate) {
        onProgressUpdate(updatedData);
      }

      return updatedData;
    } catch (err) {
      console.error(`Error updating ${component} progress:`, err);
      setError(`Failed to update progress for ${component}`);
      throw err;
    }
  };

  // Mark a component as complete (100%)
  const markComponentComplete = async (classId: string, component: string) => {
    return updateComponentProgress(courseId, classId, component, 1);
  };

  // Get progress for a specific class
  const getClassProgress = (classId: string) => {
    if (
      !progressData ||
      !progressData.attributes ||
      !progressData.attributes.tracking
    ) {
      return null;
    }

    const classItem = progressData.attributes.tracking.classes.find(
      (c: any) => c.classId === parseInt(classId)
    );

    return classItem || null;
  };

  // Check if a class is completed
  const isClassCompleted = (classId: string) => {
    const classProgress = getClassProgress(classId);
    return classProgress ? classProgress.completed : false;
  };

  // Get overall completion status
  const isCourseCompleted = () => {
    if (
      !progressData ||
      !progressData.attributes ||
      !progressData.attributes.tracking
    ) {
      return false;
    }

    return progressData.attributes.tracking.completed || false;
  };

  // Create the context value with all progress data and helper functions
  const progressContext = {
    progressData,
    isLoading,
    error,
    completionPercentage,
    updateComponentProgress,
    markComponentComplete,
    getClassProgress,
    isClassCompleted,
    isCourseCompleted,
  };

  // Pass progress context to children via clone
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        progressContext,
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
};

export default CourseProgressContainer;
