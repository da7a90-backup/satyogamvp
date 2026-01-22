"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";
import ReactMarkdown from "react-markdown";

interface CourseAddendumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default function CourseAddendumPage({
  params,
}: CourseAddendumPageProps) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [addendum, setAddendum] = useState("");

  useEffect(() => {
    const fetchCourseAddendum = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseApi.getCourseBySlug(slug);

        if (courseData && courseData.attributes) {
          setCourseTitle(courseData.attributes.title);

          if (courseData.attributes.addendum) {
            setAddendum(courseData.attributes.addendum);
          } else {
            setError("This course doesn't have an addendum");
          }
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course addendum:", err);
        setError("Failed to load course addendum");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAddendum();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
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
    <div className="bg-white min-h-screen">
      {/* Back button - UPDATED LINK */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href={`/dashboard/user/courses/${slug}/overview`}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to course
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Course Addendum</h1>
        <h2 className="text-xl text-gray-700 mb-8">{courseTitle}</h2>

        {/* Addendum content */}
        <div className="prose max-w-none mb-12">
          <ReactMarkdown>{addendum}</ReactMarkdown>
        </div>

        {/* Action buttons - UPDATED LINK */}
        <div className="flex justify-center mt-8 mb-16">
          <Link
            href={`/dashboard/user/courses/${slug}/overview`}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Return to Course
          </Link>
        </div>
      </div>
    </div>
  );
}
