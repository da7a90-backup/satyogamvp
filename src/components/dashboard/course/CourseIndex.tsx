"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

// Define a Course interface that mimics your Strapi structure
interface Course {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
    price: number;
    isFree: boolean;
    featuredImage?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          formats: {
            thumbnail: {
              url: string;
            };
          };
        };
      };
    };
    instructors?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
        };
      }>;
    };
    startDate?: string;
    endDate?: string;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
  };
}

const CourseIndex = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const fetchCourses = async (page = 1, query = "") => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the courseApi utility function instead of direct fetch
      const response = await courseApi.getCourses(page, 10, query);
      setCourses(response.data || []);

      // Set pagination info
      if (response.meta?.pagination) {
        setTotalPages(response.meta.pagination.pageCount);
        setCurrentPage(response.meta.pagination.page);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCourses(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchCourses(1, searchQuery);
  };

  // Delete course
  const deleteCourse = async (id: number) => {
    try {
      await courseApi.deleteCourse(id.toString());

      // Refresh the courses list
      fetchCourses(currentPage, searchQuery);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate description for display
  const truncateText = (text?: string, maxLength = 50) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Confirm delete modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Delete
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this course? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              courseToDelete !== null && deleteCourse(courseToDelete)
            }
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Courses
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/admin/course/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Course
          </Link>
          <button
            onClick={() => fetchCourses(currentPage, searchQuery)}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search courses..."
            className="px-4 py-2 border border-gray-300 rounded-l-md flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Courses table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Instructors
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dates
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {course.attributes.isFeatured && (
                            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {course.attributes.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {truncateText(course.attributes.description)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {course.attributes.instructors?.data
                            .map((instructor) => instructor.attributes.name)
                            .join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {course.attributes.startDate &&
                          course.attributes.endDate
                            ? `${formatDate(
                                course.attributes.startDate
                              )} - ${formatDate(course.attributes.endDate)}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {course.attributes.isFree
                            ? "Free"
                            : `$${course.attributes.price}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            course.attributes.publishedAt
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.attributes.publishedAt
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {course.attributes.publishedAt && (
                            <Link
                              href={`/dashboard/admin/course/${course.attributes.slug}`}
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/admin/course/${course.attributes.slug}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setCourseToDelete(course.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No courses found.{" "}
                      {searchQuery && "Try a different search term or "}
                      <Link
                        href="/dashboard/admin/course/create"
                        className="text-purple-600 hover:underline"
                      >
                        create a new course
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center" aria-label="Pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 mr-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 ml-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default CourseIndex;
