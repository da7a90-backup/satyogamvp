"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

interface ClassContentType {
  type: "video" | "key-concepts" | "writing-prompts" | "additional-materials";
  title: string;
  duration: number; // in minutes
  completed?: boolean;
}

interface ClassType {
  id: number;
  attributes: {
    title: string;
    orderIndex: number;
    duration: number;
    content: ClassContentType[];
    createdAt: string;
    updatedAt: string;
  };
}

interface CourseType {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
    publishedAt: string | null;
    // other fields
  };
}

interface CourseClassManagerProps {
  courseId: string;
}

const CourseClassManager = ({ courseId }: CourseClassManagerProps) => {
  const router = useRouter();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassType | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);

  // Fetch course details and classes
  const fetchCourseAndClasses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch course details
      const courseData = await courseApi.getCourse(courseId);
      setCourse(courseData.data);

      // Fetch classes for this course
      const classesData = await courseApi.getClasses(courseId);
      setClasses(classesData.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching course or classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load course and classes on component mount
  useEffect(() => {
    fetchCourseAndClasses();
  }, [courseId]);

  // Open delete modal
  const handleDeleteClick = (classItem: ClassType) => {
    setCurrentClass(classItem);
    setShowDeleteModal(true);
  };

  // Delete a class
  const handleDeleteClass = async () => {
    if (!currentClass) return;

    try {
      // Delete class from the API
      await courseApi.deleteClass(currentClass.id.toString());

      // Update UI
      setShowDeleteModal(false);
      setCurrentClass(null);
      setSuccessMessage("Class deleted successfully!");

      // Refresh classes
      fetchCourseAndClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  // Reorder a class (move up or down)
  const handleReorderClass = async (
    classId: number,
    direction: "up" | "down"
  ) => {
    const classIndex = classes.findIndex((c) => c.id === classId);
    if (classIndex === -1) return;

    // Can't move first class up or last class down
    if (
      (direction === "up" && classIndex === 0) ||
      (direction === "down" && classIndex === classes.length - 1)
    ) {
      return;
    }

    const newClasses = [...classes];
    const targetIndex = direction === "up" ? classIndex - 1 : classIndex + 1;

    // Swap the order indices
    const currentOrderIndex = newClasses[classIndex].attributes.orderIndex;
    newClasses[classIndex].attributes.orderIndex =
      newClasses[targetIndex].attributes.orderIndex;
    newClasses[targetIndex].attributes.orderIndex = currentOrderIndex;

    // Swap the elements in the array
    [newClasses[classIndex], newClasses[targetIndex]] = [
      newClasses[targetIndex],
      newClasses[classIndex],
    ];

    // Update UI optimistically
    setClasses(newClasses);

    try {
      // Update both classes in the API
      await Promise.all([
        courseApi.updateClass(newClasses[classIndex].id.toString(), {
          orderIndex: newClasses[classIndex].attributes.orderIndex,
        }),
        courseApi.updateClass(newClasses[targetIndex].id.toString(), {
          orderIndex: newClasses[targetIndex].attributes.orderIndex,
        }),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reorder classes"
      );
      // Revert the optimistic update
      fetchCourseAndClasses();
    }
  };

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    return `${hours}:${remainingMinutes.toString().padStart(2, "0")} hours`;
  };

  // Calculate total course duration
  const getTotalDuration = () => {
    const totalMinutes = classes.reduce(
      (sum, classItem) => sum + classItem.attributes.duration,
      0
    );
    return formatDuration(totalMinutes);
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Delete
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete the class "
          {currentClass?.attributes.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClass}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Content section rendering
  const renderClassContent = (classItem: ClassType) => {
    const isExpanded = expandedClassId === classItem.id;

    if (!isExpanded) return null;

    // If no content sections have been created yet
    if (
      !classItem.attributes.content ||
      classItem.attributes.content.length === 0
    ) {
      return (
        <div className="pl-10 pr-4 pb-6 pt-2">
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500 mb-4">
              No content sections created yet
            </p>
            <Link
              href={`/dashboard/admin/course/${courseId}/class/${classItem.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Content
            </Link>
          </div>
        </div>
      );
    }

    // Show the content sections
    return (
      <div className="pl-10 pr-4 pb-6 pt-2">
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          {classItem.attributes.content.map((content, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-gray-50 flex justify-between items-center"
            >
              <div className="flex items-center">
                {content.type === "video" && (
                  <PlayIcon className="h-5 w-5 text-purple-500 mr-3" />
                )}
                {content.type === "key-concepts" && (
                  <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3" />
                )}
                {content.type === "writing-prompts" && (
                  <BookOpenIcon className="h-5 w-5 text-green-500 mr-3" />
                )}
                {content.type === "additional-materials" && (
                  <QuestionMarkCircleIcon className="h-5 w-5 text-orange-500 mr-3" />
                )}

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {content.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(content.duration)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/admin/course/${courseId}/class/${classItem.id}/content/${idx}/edit`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href={`/dashboard/admin/course/${courseId}/class/${classItem.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Content
          </Link>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link
            href="/dashboard/admin/course"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Course Content: {course?.attributes.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage classes and course structure
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/admin/course/${courseId}/class/new`}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Class
          </Link>
          <button
            onClick={fetchCourseAndClasses}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Course info box */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Course Overview
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              {course?.attributes.description}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
            <p className="text-sm text-gray-500">Total Duration</p>
            <p className="text-lg font-medium text-gray-900">
              {getTotalDuration()}
            </p>
            <p className="mt-2 text-sm text-gray-500">Total Classes</p>
            <p className="text-lg font-medium text-gray-900">
              {classes.length}
            </p>
            <div className="mt-4">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  course?.attributes.publishedAt
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {course?.attributes.publishedAt ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Classes list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Course Classes</h2>
        </div>

        {classes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">
              No classes have been added to this course yet.
            </p>
            <Link
              href={`/dashboard/admin/course/${courseId}/class/new`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Class
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {classes.map((classItem, index) => (
              <li key={classItem.id} className="hover:bg-gray-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center" style={{ width: "70%" }}>
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full mr-4 font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          setExpandedClassId(
                            expandedClassId === classItem.id
                              ? null
                              : classItem.id
                          )
                        }
                        className="flex items-center text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {classItem.attributes.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDuration(classItem.attributes.duration)}
                          </p>
                        </div>
                        {expandedClassId === classItem.id ? (
                          <ChevronUpIcon className="h-5 w-5 ml-2 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 ml-2 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleReorderClass(classItem.id, "up")}
                        className="text-gray-600 hover:text-gray-900"
                        title="Move up"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    {index < classes.length - 1 && (
                      <button
                        onClick={() => handleReorderClass(classItem.id, "down")}
                        className="text-gray-600 hover:text-gray-900"
                        title="Move down"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <Link
                      href={`/dashboard/admin/course/${courseId}/class/${classItem.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit class content"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(classItem)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete class"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded content section */}
                {renderClassContent(classItem)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default CourseClassManager;
