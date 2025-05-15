"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

// Define Instructor interface
interface Instructor {
  id: number;
  attributes: {
    name: string;
    title: string;
    bio: string;
    email: string;
    website: string;
    profileImage?: {
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
    createdAt: string;
    updatedAt: string;
  };
}

const InstructorIndex = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<number | null>(
    null
  );

  // Fetch instructors
  const fetchInstructors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/instructors?populate=profileImage&sort=name:asc`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }

      const data = await response.json();
      setInstructors(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredInstructors = instructors.filter(
      (instructor) =>
        instructor.attributes.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        instructor.attributes.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    setInstructors(filteredInstructors);

    if (searchQuery === "") {
      fetchInstructors();
    }
  };

  // Delete instructor
  const deleteInstructor = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/instructors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to delete instructor"
        );
      }

      // Refresh the instructors list
      fetchInstructors();
      setShowDeleteModal(false);
      setInstructorToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete instructor"
      );
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

  // Truncate bio for display
  const truncateBio = (text?: string, maxLength = 100) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Confirm delete modal
  const DeleteConfirmationModal = () => {
    const instructor = instructors.find((i) => i.id === instructorToDelete);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Confirm Delete
          </h3>
          <p className="mb-6 text-gray-600">
            Are you sure you want to delete the instructor "
            {instructor?.attributes.name}"? This action cannot be undone.
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
                instructorToDelete !== null &&
                deleteInstructor(instructorToDelete)
              }
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Instructors
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/admin/instructors/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Instructor
          </Link>
          <button
            onClick={fetchInstructors}
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
            placeholder="Search instructors..."
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
          {/* Instructors table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Instructor
                  </th>
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
                    Bio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
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
                {instructors.length > 0 ? (
                  instructors.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {instructor.attributes.profileImage?.data ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={`${
                                  process.env.NEXT_PUBLIC_STRAPI_URL || ""
                                }${
                                  instructor.attributes.profileImage.data
                                    .attributes.formats?.thumbnail?.url ||
                                  instructor.attributes.profileImage.data
                                    .attributes.url
                                }`}
                                alt={instructor.attributes.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-800 font-medium">
                                  {instructor.attributes.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {instructor.attributes.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {instructor.attributes.title || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {truncateBio(instructor.attributes.bio)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {instructor.attributes.email && (
                            <div>
                              <a
                                href={`mailto:${instructor.attributes.email}`}
                                className="text-purple-600 hover:underline"
                              >
                                {instructor.attributes.email}
                              </a>
                            </div>
                          )}
                          {instructor.attributes.website && (
                            <div className="mt-1">
                              <a
                                href={instructor.attributes.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(instructor.attributes.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/dashboard/admin/instructors/edit/${instructor.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setInstructorToDelete(instructor.id);
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
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No instructors found.{" "}
                      {searchQuery && "Try a different search term or "}
                      <Link
                        href="/dashboard/admin/instructors/create"
                        className="text-purple-600 hover:underline"
                      >
                        create a new instructor
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default InstructorIndex;
