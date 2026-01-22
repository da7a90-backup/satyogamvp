"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";
import ReactMarkdown from "react-markdown";

interface IntroductionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default function IntroductionPage({ params }: IntroductionPageProps) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCourseIntroduction = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseApi.getCourseBySlug(slug);

        if (courseData && courseData.attributes) {
          setCourseTitle(courseData.attributes.title);
          setIntroduction(courseData.attributes.introduction || "");
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course introduction:", err);
        setError("Failed to load course introduction");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseIntroduction();

    // Mock progress update
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [slug]);

  const handleMarkAsComplete = () => {
    // Mock implementation - would save completion status in a real app
    console.log("Marking introduction as complete");

    // Navigate back to course overview
    router.push(`/dashboard/user/courses/${slug}/overview`);
  };

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

      {/* Progress bar */}
      <div className="sticky top-0 w-full h-1 bg-gray-200 z-10">
        <div
          className="h-1 bg-purple-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Introduction</h1>

        {/* Introduction content */}
        <div className="prose max-w-none mb-12">
          <ReactMarkdown>{introduction}</ReactMarkdown>
        </div>

        {/* Action buttons - UPDATED LINK */}
        <div className="flex justify-between mt-8 mb-16">
          <Link
            href={`/dashboard/user/courses/${slug}/overview`}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>

          <button
            onClick={handleMarkAsComplete}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
