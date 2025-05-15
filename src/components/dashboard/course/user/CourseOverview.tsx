"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";
import { courseProgressApi } from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";

interface CourseOverviewProps {
  slug: string;
  isAuthenticated: boolean;
}

// Interface for the progress data as stored in component state
interface ProgressData {
  [key: string]: {
    started: boolean;
    completed: boolean;
    progress: number; // 0-100
  };
}

// Define the progress data structure from API
interface ClassProgress {
  classId: number;
  orderIndex: number;
  video: number;
  keyConcepts: number;
  writingPrompts: number;
  additionalMaterials: number;
  completed: boolean;
  lastAccessed: string | null;
}

interface CourseProgressData {
  id: number;
  attributes: {
    tracking: {
      classes: ClassProgress[];
      started: boolean;
      completed: boolean;
      startDate: string | null;
      lastAccessDate: string | null;
    };
    enrolledDate: string;
  };
}

// Interface for section durations
interface ClassContent {
  video?: {
    duration?: number;
  };
  keyConcepts?: {
    duration?: number;
  };
  writingPrompts?: {
    duration?: number;
  };
  additionalMaterials?: {
    duration?: number;
  };
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

const CourseOverview = ({ slug, isAuthenticated }: CourseOverviewProps) => {
  const [course, setCourse] = useState<any>(null);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData>({});
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const router = useRouter();

  // Store the full progress data for calculating overall percentage
  const progressDataRef = useRef<CourseProgressData | null>(null);

  // Fetch course data and progress
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getCourseBySlug(slug);

        if (!response) {
          setError("Course not found");
          return;
        }

        setCourse(response);

        // After setting the course, fetch the classes
        if (response.id) {
          fetchClasses(response.id.toString());

          // Fetch progress data if user is authenticated
          if (isAuthenticated) {
            await fetchCourseProgress(response.id.toString());
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchClasses = async (courseId: string) => {
      try {
        const response = await courseApi.getClasses(courseId);

        if (response.data && response.data.length > 0) {
          // Sort classes by orderIndex
          const sortedClasses = [...response.data].sort(
            (a, b) => a.attributes.orderIndex - b.attributes.orderIndex
          );

          setClasses(sortedClasses);
          // Expand the Welcome section by default
          setExpandedSections(["welcome"]);
        } else {
          console.log("No classes found for this course");
          setClasses([]);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load course classes");
      }
    };

    // Function to fetch and process course progress data
    const fetchCourseProgress = async (courseId: string) => {
      try {
        const progressData = await courseProgressApi.getUserCourseProgress(
          courseId
        );

        if (
          progressData &&
          progressData.attributes &&
          progressData.attributes.tracking
        ) {
          // Store full progress data for calculations
          progressDataRef.current = progressData;

          // Check if course is completed from API data
          setIsCourseCompleted(progressData.attributes.tracking.completed);

          // Transform progress data to the format our component uses
          const formattedProgress: ProgressData = {};

          const tracking = progressData.attributes.tracking;

          // Set introduction progress
          formattedProgress["introduction"] = {
            started: tracking.started,
            completed: tracking.started, // Assume intro is complete if course is started
            progress: tracking.started ? 100 : 0,
          };

          // Process each class's components
          if (tracking.classes && Array.isArray(tracking.classes)) {
            tracking.classes.forEach((classItem) => {
              // For each component in the class (video, keyConcepts, writingPrompts, additionalMaterials)
              // Create progress entries with the format: "orderIndex.componentNumber"
              const componentMapping = {
                video: 1,
                keyConcepts: 2,
                writingPrompts: 3,
                additionalMaterials: 4,
              };

              Object.entries(componentMapping).forEach(
                ([componentName, componentNumber]) => {
                  // Create the key in format "orderIndex.componentNumber" (e.g., "1.1", "1.2", etc.)
                  const key = `${classItem.orderIndex}.${componentNumber}`;

                  // Get the progress value (0-1) for this component
                  const progressValue = classItem[
                    componentName as keyof ClassProgress
                  ] as number;

                  // Store formatted progress data
                  formattedProgress[key] = {
                    started: progressValue > 0,
                    completed: progressValue >= 0.99, // Consider it complete at 99%
                    progress: Math.round(progressValue * 100),
                  };
                }
              );
            });
          }

          setProgress(formattedProgress);
        } else {
          console.log("No progress data found or invalid structure");
        }
      } catch (err) {
        console.error("Error fetching course progress:", err);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug, isAuthenticated]);

  // Toggle section expansion (except for addendum if course is not completed)
  const toggleSection = (sectionId: string) => {
    // Don't toggle addendum if course is not completed
    if (sectionId === "course-addendum" && !isCourseCompleted) {
      return;
    }

    setExpandedSections((prevIds) =>
      prevIds.includes(sectionId)
        ? prevIds.filter((id) => id !== sectionId)
        : [...prevIds, sectionId]
    );
  };

  // Get total duration for the course
  const getTotalDuration = (): string => {
    let totalMinutes = 0;

    classes.forEach((classItem) => {
      // Sum up all section durations for this class
      const content = classItem.attributes.content;
      if (content) {
        // Add each section's duration if available
        if (content.video?.duration) totalMinutes += content.video.duration;
        if (content.keyConcepts?.duration)
          totalMinutes += content.keyConcepts.duration;
        if (content.writingPrompts?.duration)
          totalMinutes += content.writingPrompts.duration;
        if (content.additionalMaterials?.duration)
          totalMinutes += content.additionalMaterials.duration;
      }
    });

    // Format as hours:minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:00 hours`;
    } else {
      return `${minutes}:00 min`;
    }
  };

  // Get progress for a specific component
  const getComponentProgress = (classIndex: number, componentIndex: number) => {
    const key = `${classIndex}.${componentIndex}`;
    return progress[key] || { started: false, completed: false, progress: 0 };
  };

  // Check if a section exists for a given class
  const sectionExists = (
    courseClass: CourseClass,
    sectionType: string
  ): boolean => {
    if (!courseClass.attributes.content) return false;

    const content = courseClass.attributes.content;

    switch (sectionType) {
      case "video":
        return !!content.video;
      case "keyConcepts":
        return !!content.keyConcepts;
      case "writingPrompts":
        return !!content.writingPrompts;
      case "additionalMaterials":
        return !!content.additionalMaterials;
      default:
        return false;
    }
  };

  // Get section duration
  const getSectionDuration = (
    courseClass: CourseClass,
    sectionType: string
  ): string => {
    if (!courseClass.attributes.content) return "";

    const content = courseClass.attributes.content;
    let duration = 0;

    switch (sectionType) {
      case "video":
        duration = content.video?.duration || 0;
        break;
      case "keyConcepts":
        duration = content.keyConcepts?.duration || 0;
        break;
      case "writingPrompts":
        duration = content.writingPrompts?.duration || 0;
        break;
      case "additionalMaterials":
        duration = content.additionalMaterials?.duration || 0;
        break;
    }

    // Format the duration
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}:${minutes.toString().padStart(2, "0")} hours`;
    } else {
      return `${duration} min`;
    }
  };

  // Calculate course completion percentage
  const getCourseCompletionPercentage = (): number => {
    // If no progress data or not authenticated, return 0
    if (!isAuthenticated || Object.keys(progress).length === 0) {
      return 0;
    }

    // Calculate using the actual progress values from each component
    let totalProgressSum = 0;
    let totalComponents = 0;

    // Loop through all progress entries except introduction
    Object.entries(progress).forEach(([key, value]) => {
      if (key !== "introduction") {
        totalComponents++;
        totalProgressSum += value.progress; // Use the actual percentage (0-100)
      }
    });

    // Calculate average progress across all components
    const averageProgress =
      totalComponents > 0 ? totalProgressSum / totalComponents : 0;

    // Return rounded percentage
    return Math.round(averageProgress);
  };

  // Handle component clicks
  const handleComponentClick = (classIndex: number, componentIndex: number) => {
    // Get progress for this component
    const componentProgress = getComponentProgress(classIndex, componentIndex);

    // If component is started but not completed, continue
    if (componentProgress.started && !componentProgress.completed) {
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex}/component/${componentIndex}`
      );
    }
    // If component is not started, mark as started and navigate
    else if (!componentProgress.started) {
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex}/component/${componentIndex}`
      );
    }
    // If completed, just navigate
    else {
      router.push(
        `/dashboard/user/courses/${slug}/class/${classIndex}/component/${componentIndex}`
      );
    }
  };

  const handleIntroductionClick = () => {
    router.push(`/dashboard/user/courses/${slug}/introduction`);
  };

  const handleAddendumClick = () => {
    // Only navigate if course is completed
    if (isCourseCompleted) {
      router.push(`/dashboard/user/courses/${slug}/addendum`);
    }
  };

  // Helper function to render progress indicator for a component
  const renderProgressIndicator = (componentProgress: {
    started: boolean;
    completed: boolean;
    progress: number;
  }) => {
    if (componentProgress.completed) {
      // Completed (checkmark)
      return (
        <div className="flex items-center">
          <CheckIcon className="h-5 w-5 text-purple-600" />
        </div>
      );
    } else if (componentProgress.started) {
      // In progress (circle with progress)
      return (
        <div className="relative h-5 w-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
          <div
            className="absolute inset-0 rounded-full border-2 border-purple-600"
            style={{
              clipPath: `inset(0 0 0 ${100 - componentProgress.progress}%)`,
            }}
          ></div>
        </div>
      );
    } else {
      // Not started (empty circle)
      return (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/dashboard/user/courses"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </Link>
      </div>

      {/* Course header with featured image as background */}
      <div
        className="bg-gray-800 text-white relative"
        style={{
          backgroundImage: course?.attributes.featuredImage?.data
            ? `url(${getImageUrl(
                course.attributes.featuredImage.data.attributes.url
              )})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="mb-2 text-sm font-medium">Course</div>
          <h1 className="text-4xl font-bold mb-4">
            {course?.attributes.title}
          </h1>
          {course?.attributes.subtitle && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {course.attributes.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Course content - No longer inside a tab */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-2">Course content</h2>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </div>
          <div className="text-sm text-gray-600">{getTotalDuration()}</div>
        </div>

        {/* Welcome section */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
              onClick={() => toggleSection("welcome")}
              className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
            >
              <span className="font-medium">Welcome!</span>
              <div className="flex items-center">
                {expandedSections.includes("welcome") ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400 ml-2" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2" />
                )}
              </div>
            </button>

            {expandedSections.includes("welcome") && (
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                <div
                  className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                  onClick={handleIntroductionClick}
                >
                  <div className="flex items-center">
                    <div className="w-8 flex justify-center">
                      {renderProgressIndicator(
                        progress["introduction"] || {
                          started: false,
                          completed: false,
                          progress: 0,
                        }
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium">Introduction</span>
                    </div>
                  </div>

                  {progress["introduction"]?.completed ? (
                    <div className="flex items-center w-1/3">
                      <div className="w-full bg-purple-100 h-1 rounded-full">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">100% completed</span>
                    </div>
                  ) : progress["introduction"]?.started ? (
                    <button className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800">
                      Continue
                    </button>
                  ) : (
                    <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                      Start
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Class sections */}
          {classes.map((classItem) => {
            const classId = `class-${classItem.id}`;
            const isExpanded = expandedSections.includes(classId);
            const classIndex = classItem.attributes.orderIndex;

            return (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-md overflow-hidden bg-white"
              >
                {/* Class header (always visible) */}
                <button
                  onClick={() => toggleSection(classId)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">
                    Class {classIndex} - {classItem.attributes.title}
                  </span>
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 ml-2" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2" />
                    )}
                  </div>
                </button>

                {/* Class content (visible when expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 divide-y divide-gray-200">
                    {/* Video section */}
                    {sectionExists(classItem, "video") && (
                      <div
                        className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleComponentClick(classIndex, 1)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 flex justify-center">
                            {renderProgressIndicator(
                              getComponentProgress(classIndex, 1)
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {classIndex}.1 Video: {classItem.attributes.title}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {getSectionDuration(classItem, "video")}
                            </span>
                          </div>
                        </div>

                        {getComponentProgress(classIndex, 1).completed ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-purple-100 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                            <span className="text-sm whitespace-nowrap">
                              100% completed
                            </span>
                          </div>
                        ) : getComponentProgress(classIndex, 1).started ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{
                                  width: `${
                                    getComponentProgress(classIndex, 1).progress
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <button className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 whitespace-nowrap">
                              Continue
                            </button>
                          </div>
                        ) : (
                          <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                            Start
                          </button>
                        )}
                      </div>
                    )}

                    {/* Key Concepts section */}
                    {sectionExists(classItem, "keyConcepts") && (
                      <div
                        className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleComponentClick(classIndex, 2)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 flex justify-center">
                            {renderProgressIndicator(
                              getComponentProgress(classIndex, 2)
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {classIndex}.2 Key Concepts
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {getSectionDuration(classItem, "keyConcepts")}
                            </span>
                          </div>
                        </div>

                        {getComponentProgress(classIndex, 2).completed ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-purple-100 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                            <span className="text-sm whitespace-nowrap">
                              100% completed
                            </span>
                          </div>
                        ) : getComponentProgress(classIndex, 2).started ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{
                                  width: `${
                                    getComponentProgress(classIndex, 2).progress
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <button className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 whitespace-nowrap">
                              Continue
                            </button>
                          </div>
                        ) : (
                          <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                            Start
                          </button>
                        )}
                      </div>
                    )}

                    {/* Writing Prompts section */}
                    {sectionExists(classItem, "writingPrompts") && (
                      <div
                        className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleComponentClick(classIndex, 3)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 flex justify-center">
                            {renderProgressIndicator(
                              getComponentProgress(classIndex, 3)
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {classIndex}.3 Writing Prompts & Further
                              Reflection
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {getSectionDuration(classItem, "writingPrompts")}
                            </span>
                          </div>
                        </div>

                        {getComponentProgress(classIndex, 3).completed ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-purple-100 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                            <span className="text-sm whitespace-nowrap">
                              100% completed
                            </span>
                          </div>
                        ) : getComponentProgress(classIndex, 3).started ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{
                                  width: `${
                                    getComponentProgress(classIndex, 3).progress
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <button className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 whitespace-nowrap">
                              Continue
                            </button>
                          </div>
                        ) : (
                          <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                            Start
                          </button>
                        )}
                      </div>
                    )}

                    {/* Additional Materials section - only show if it exists */}
                    {sectionExists(classItem, "additionalMaterials") && (
                      <div
                        className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleComponentClick(classIndex, 4)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 flex justify-center">
                            {renderProgressIndicator(
                              getComponentProgress(classIndex, 4)
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {classIndex}.4 Additional Materials
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {getSectionDuration(
                                classItem,
                                "additionalMaterials"
                              )}
                            </span>
                          </div>
                        </div>

                        {getComponentProgress(classIndex, 4).completed ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-purple-100 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                            <span className="text-sm whitespace-nowrap">
                              100% completed
                            </span>
                          </div>
                        ) : getComponentProgress(classIndex, 4).started ? (
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 h-1 rounded-full mr-2">
                              <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{
                                  width: `${
                                    getComponentProgress(classIndex, 4).progress
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <button className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 whitespace-nowrap">
                              Continue
                            </button>
                          </div>
                        ) : (
                          <button className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                            Start
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Course completion section (shown in-place without redirection) */}
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
              onClick={() => toggleSection("course-completed")}
              className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
            >
              <span className="font-medium">
                {getCourseCompletionPercentage() === 100
                  ? "Course completed"
                  : "Course completion"}
              </span>
              <div className="flex items-center">
                <div className="text-sm text-gray-500 mr-2">
                  {getCourseCompletionPercentage()}% completed
                </div>
                {expandedSections.includes("course-completed") ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.includes("course-completed") && (
              <div className="border-t border-gray-200 p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircleIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    You've completed {getCourseCompletionPercentage()}% of this
                    course
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {getCourseCompletionPercentage() === 100
                      ? "Congratulations on completing this course!"
                      : "Keep going to complete all course materials."}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${getCourseCompletionPercentage()}%` }}
                    ></div>
                  </div>

                  {/* Certificate button (if course is 100% completed) */}
                  {getCourseCompletionPercentage() === 100 && (
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Course addendum section (if exists) */}
          {course?.attributes.addendum && (
            <div
              className={`border border-gray-200 rounded-md overflow-hidden bg-white ${
                !isCourseCompleted ? "opacity-70" : ""
              }`}
            >
              <button
                onClick={() => toggleSection("course-addendum")}
                className={`w-full text-left px-4 py-3 flex justify-between items-center ${
                  isCourseCompleted ? "hover:bg-gray-50" : "cursor-not-allowed"
                }`}
              >
                <span className="font-medium">Course addendum</span>
                <div className="flex items-center">
                  {!isCourseCompleted ? (
                    <div className="text-sm text-gray-500 mr-2">
                      Unlocks when course is completed
                    </div>
                  ) : null}
                  {isCourseCompleted ? (
                    expandedSections.includes("course-addendum") ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )
                  ) : (
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedSections.includes("course-addendum") &&
                isCourseCompleted && (
                  <div
                    className="border-t border-gray-200 p-6 cursor-pointer"
                    onClick={handleAddendumClick}
                  >
                    <p className="text-gray-700">
                      Click to view additional resources and insights to deepen
                      your understanding.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get image URL
const getImageUrl = (url?: string) => {
  if (!url) return "";

  // Check if it's an absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Otherwise, it's a relative URL, so prepend the base URL
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return `${baseUrl}${url}`;
};

export default CourseOverview;
