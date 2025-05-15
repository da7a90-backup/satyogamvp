"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header - redesigned based on Figma */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/user/courses/${slug}/overview`}
              className="text-purple-600 hover:text-purple-800 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </Link>

            <div className="flex space-x-2">
              <button
                onClick={navigateToPrevious}
                className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded hover:bg-gray-50 font-medium text-sm"
              >
                Previous
              </button>
              <button
                onClick={navigateToNext}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium text-sm"
              >
                Next class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Component title */}
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {getComponentTitle()}
        </h1>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-2 bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Main content - white container */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClassComponentLayout;
