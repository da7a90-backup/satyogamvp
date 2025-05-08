"use client";

import { useState, useEffect, useRef } from "react"; // Add useRef here
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";
import { courseProgressApi } from "@/lib/courseProgressApi";
interface ClassComponentLayoutProps {
  slug: string;
  classIndex: number;
  componentIndex: number;
  children: React.ReactNode;
}

// Define types for classes and components
interface ClassContent {
  video?: any;
  videoDescription?: string;
  videoTranscript?: string;
  keyConcepts?: string;
  writingPrompts?: string;
  additionalMaterials?: string;
}

interface CourseClass {
  id: number;
  attributes: {
    title: string;
    orderIndex: number;
    description?: string;
    content?: ClassContent;
  };
}

interface Course {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

const ClassComponentLayout = ({
  slug,
  classIndex,
  componentIndex,
  children,
}: ClassComponentLayoutProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [courseClass, setCourseClass] = useState<CourseClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const progressDataRef = useRef<any>(null);

  // Component type labels
  const componentLabels = {
    1: "Video",
    2: "Key Concepts",
    3: "Writing Prompts & Further Reflection",
    4: "Additional Materials",
  };

  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch course by slug
        const courseData = await courseApi.getCourseBySlug(slug);
        if (!courseData) {
          setError("Course not found");
          return;
        }
        setCourse(courseData);

        // Get only the specific class we need using the new base function
        // This is the lightweight version that only gets minimal class data
        const classData = await courseApi.getClassBySlugAndIndex(
          slug,
          classIndex
        );
        if (!classData) {
          setError(`Class ${classIndex} not found`);
          return;
        }

        setCourseClass(classData);

        // After loading course and class data, fetch current progress
        if (courseData.id && classData.id) {
          try {
            const progressData = await courseProgressApi.getUserCourseProgress(
              courseData.id.toString()
            );
            progressDataRef.current = progressData;

            if (progressData) {
              // Find this class in the tracking data
              const classTracking =
                progressData.attributes.tracking.classes.find(
                  (c) => c.classId === classData.id
                );

              if (classTracking) {
                // Get progress for this specific component
                const componentType = getComponentType(componentIndex);
                const componentProgress =
                  (classTracking[
                    componentType as keyof typeof classTracking
                  ] as number) || 0;

                // Set progress as percentage
                setProgress(componentProgress * 100);

                // If we're just starting this component, update the progress to show it's been started
                if (componentProgress === 0) {
                  updateProgress(10); // Start with 10% progress
                }
              }
            }
          } catch (progressError) {
            console.error("Error fetching progress:", progressError);
            // Non-fatal error, we'll just start with 0 progress
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, classIndex]);

  // Get component type from index
  const getComponentType = (index: number): string => {
    switch (index) {
      case 1:
        return "video";
      case 2:
        return "keyConcepts";
      case 3:
        return "writingPrompts";
      case 4:
        return "additionalMaterials";
      default:
        return "video";
    }
  };

  // Update progress
  const updateProgress = async (newProgress: number) => {
    if (!course || !courseClass || isUpdatingProgress) return;

    // Don't update if progress is going backward
    if (newProgress <= progress && progress > 0) return;

    setIsUpdatingProgress(true);

    try {
      // Convert progress to 0-1 range for API
      const normalizedProgress = Math.min(Math.max(newProgress, 0), 100) / 100;

      // Update progress in API
      await courseProgressApi.updateComponentProgress(
        course.id.toString(),
        courseClass.id.toString(),
        getComponentType(componentIndex),
        normalizedProgress
      );

      // Update local state
      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Mark as complete
  const markAsComplete = async () => {
    if (!course || !courseClass) return;

    setIsUpdatingProgress(true);

    try {
      // Mark component as complete in API (100% progress)
      await courseProgressApi.markComponentComplete(
        course.id.toString(),
        courseClass.id.toString(),
        getComponentType(componentIndex)
      );

      // Update local state
      setProgress(100);

      // Navigate back to the course overview
      router.push(`/dashboard/user/courses/${slug}/overview`);
    } catch (error) {
      console.error("Error marking as complete:", error);
      setIsUpdatingProgress(false);
    }
  };

  // Calculate component title
  const getComponentTitle = () => {
    if (!courseClass) return "";

    if (componentIndex === 1) {
      return `${classIndex}.${componentIndex} Video: ${courseClass.attributes.title}`;
    } else {
      return `${classIndex}.${componentIndex} ${
        componentLabels[componentIndex as keyof typeof componentLabels] || ""
      }`;
    }
  };

  // Navigation to previous/next component
  const navigateToPrevious = () => {
    if (componentIndex > 1) {
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex}/component/${
          componentIndex - 1
        }`
      );
    } else if (classIndex > 1) {
      // Go to the last component of the previous class
      // For simplicity, we'll assume 4 components per class
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex - 1}/component/4`
      );
    } else {
      // At first component of first class, go back to overview
      router.push(`/dashboard/user/courses/${slug}/overview`);
    }
  };

  const navigateToNext = () => {
    // For simplicity, we'll assume 4 components per class
    if (componentIndex < 4) {
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex}/component/${
          componentIndex + 1
        }`
      );
    } else {
      // Go to the first component of the next class
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex + 1}/component/1`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !course || !courseClass) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error || "Content not found"}</p>
        </div>
        <div className="mt-4">
          <Link
            href={`/dashboard/user/courses/${slug}/overview`}
            className="text-purple-600 hover:underline flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              href={`/dashboard/user/courses/${slug}/overview`}
              className="text-gray-600 hover:text-gray-900 flex items-center mr-6"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to course
            </Link>

            <div className="text-sm text-gray-500">
              {course.attributes.title}{" "}
              <ChevronRightIcon className="h-3 w-3 inline mx-1" />
              Class {classIndex}: {courseClass.attributes.title}{" "}
              <ChevronRightIcon className="h-3 w-3 inline mx-1" />
              {componentLabels[
                componentIndex as keyof typeof componentLabels
              ] || ""}
            </div>
          </div>
        </div>
      </div>

      {/* Component title */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {getComponentTitle()}
        </h1>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-2 bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Main content */}
        <div className="mb-12">{children}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 mb-16">
          <button
            onClick={navigateToPrevious}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <button
            onClick={markAsComplete}
            className={`px-6 py-2 ${
              isUpdatingProgress
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white rounded-md`}
            disabled={isUpdatingProgress}
          >
            {isUpdatingProgress ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Updating...
              </span>
            ) : (
              "Mark as Complete"
            )}
          </button>

          <button
            onClick={navigateToNext}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassComponentLayout;
