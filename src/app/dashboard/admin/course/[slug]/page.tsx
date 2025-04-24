"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { courseApi } from "@/lib/courseApi";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching course with slug:", slug);
        const response = await courseApi.getCourseBySlug(slug);
        console.log("API Response:", response);

        // Store debug info
        setDebugInfo(response);

        if (!response) {
          setError("Course not found");
          return;
        }

        setCourse(response);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          `Failed to load course details: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const handleDelete = async () => {
    if (!course?.id) return;

    setIsDeleting(true);
    try {
      await courseApi.deleteCourse(course.id.toString());
      router.push("/dashboard/admin/course");
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Failed to delete the course");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p className="font-medium">Error: {error || "Course not found"}</p>
          <p className="mt-2">
            <Link
              href="/dashboard/admin/course"
              className="text-purple-600 hover:underline"
            >
              &larr; Back to courses
            </Link>
          </p>

          {/* Debug information */}
          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
              <p className="font-bold mb-2">Debug Information:</p>
              <pre className="text-xs text-gray-800">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Extract course data safely with optional chaining
  const title = course?.attributes?.title || "Untitled Course";
  const description = course?.attributes?.description || "";
  const price = course?.attributes?.price || 0;
  const isFree = course?.attributes?.isFree || false;
  const startDate = course?.attributes?.startDate;
  const endDate = course?.attributes?.endDate;
  const isFeatured = course?.attributes?.isFeatured || false;
  const featuredImage = course?.attributes?.featuredImage;
  const instructors = course?.attributes?.instructors;
  const publishedAt = course?.attributes?.publishedAt;

  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString()
    : "Not set";
  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString()
    : "Not set";
  const publishStatus = publishedAt ? "Published" : "Draft";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with navigation and actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/dashboard/admin/course"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Course Details</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/admin/course/edit/${course.id}`}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PencilSquareIcon className="h-5 w-5 mr-1" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ArrowPathIcon className="h-5 w-5 mr-1 animate-spin" />
            ) : (
              <TrashIcon className="h-5 w-5 mr-1" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Course details card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Featured image */}
        {featuredImage?.data && featuredImage.data.attributes?.url && (
          <div className="w-full h-64 relative overflow-hidden">
            <Image
              src={
                featuredImage.data.attributes.url.startsWith("http")
                  ? featuredImage.data.attributes.url
                  : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${
                      featuredImage.data.attributes.url
                    }`
              }
              alt={title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}

        {/* Main content */}
        <div className="p-6">
          {/* Title and status badge */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                publishedAt
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {publishStatus}
            </div>
          </div>

          {/* Metadata tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              {isFree ? "Free" : `$${price}`}
            </div>
            {isFeatured && (
              <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <CheckBadgeIcon className="h-4 w-4 mr-1" />
                Featured
              </div>
            )}
            <div className="flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {startDate
                ? `${formattedStartDate} - ${formattedEndDate}`
                : "No dates set"}
            </div>
          </div>

          {/* Instructors */}
          {instructors?.data?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                Instructors
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructors.data.map((instructor: any) => (
                  <div
                    key={instructor.id}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                  >
                    {instructor.attributes.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
          </div>

          {/* Course classes section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Course Classes
              </h3>
              <Link
                href={`/dashboard/admin/course/${course.id}/class/new`}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Add Class
              </Link>
            </div>

            {/* This would be populated with actual class data */}
            <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
              No classes have been added to this course yet.
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
