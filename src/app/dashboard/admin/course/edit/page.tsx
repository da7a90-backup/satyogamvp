"use client";

import { useEffect, useState } from "react";
import { use } from "react"; // Import React.use
import CourseForm from "@/components/dashboard/course/CourseForm";
import { courseApi } from "@/lib/courseApi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EditCoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  // Use React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the course ID by slug
  useEffect(() => {
    const fetchCourseId = async () => {
      setIsLoading(true);
      try {
        // Use the courseApi utility to get course by slug
        const response = await courseApi.getCourseBySlug(slug);

        if (!response) {
          setError("Course not found");
          return;
        }

        // Set the numeric ID for the CourseForm
        setCourseId(response.id.toString());
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCourseId();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !courseId) {
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <CourseForm courseId={courseId} />
    </div>
  );
}
