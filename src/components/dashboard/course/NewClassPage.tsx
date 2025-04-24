"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface CourseType {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
  };
}

interface NewClassPageProps {
  params: {
    slug: string;
  };
}

export default function NewClassPage({ params }: NewClassPageProps) {
  // Convert params.slug to a regular variable to avoid the Next.js warning
  const courseId = React.useMemo(() => params.slug, [params.slug]);
  const router = useRouter();

  const [course, setCourse] = useState<CourseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    duration: 0,
    inClassPosition: 0,
    classContent: {
      video: null,
      videoTitle: "",
      videoDescription: "",
      videoTranscript: "",
      videoAudioFile: null,
      keyConcepts: "",
      writingPrompts: "",
      additionalMaterials: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Direct API call instead of using courseApi to have more control over error handling
        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses/${courseId}?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error(
            `Failed to fetch course: ${courseResponse.statusText}`
          );
        }

        const courseData = await courseResponse.json();
        setCourse(courseData.data);

        // Also fetch the highest inClassPosition to suggest the next position
        const classesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/course-classes?filters[course][id][$eq]=${courseId}&sort=inClassPosition:desc&pagination[pageSize]=1&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
          }
        );

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          if (classesData.data && classesData.data.length > 0) {
            const highestPosition =
              classesData.data[0].attributes.inClassPosition;
            setFormData((prev) => ({
              ...prev,
              inClassPosition: highestPosition + 1,
            }));
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "inClassPosition"
          ? parseInt(value) || 0
          : value,
    }));
  };

  // Create a new class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.title.trim()) {
      setError("Class title is required");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the new class with the course relationship
      const classData = {
        title: formData.title,
        duration: formData.duration,
        inClassPosition: formData.inClassPosition,
        course: courseId,
        classContent: formData.classContent,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/course-classes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
          body: JSON.stringify({ data: classData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Failed to create class");
      }

      setSuccessMessage("Class created successfully!");

      // Redirect back to course classes manager after a short delay
      setTimeout(() => {
        router.push(`/dashboard/admin/course/${courseId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
      setIsSubmitting(false);
    }
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
      <div className="mb-8 flex items-center">
        <Link
          href={`/dashboard/admin/course/${courseId}`}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Class to: {course?.attributes.title || "Loading..."}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new class and add it to this course
          </p>
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

      {/* Class form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleCreateClass}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter class title"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="inClassPosition"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Position in Course
            </label>
            <input
              type="number"
              id="inClassPosition"
              name="inClassPosition"
              value={formData.inClassPosition}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              This determines the order of classes in the course.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              The length of this class in minutes.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              After creating this class, you'll be able to add detailed content
              including videos, key concepts, and writing prompts.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Link
                href={`/dashboard/admin/course/${courseId}`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Class"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
