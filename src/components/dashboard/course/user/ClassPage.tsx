"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";
import ReactMarkdown from "react-markdown";

interface ClassPageProps {
  courseSlug: string;
  classId: string;
}

// Define types based on Strapi structure
interface ClassContent {
  video?: {
    data?: {
      attributes: {
        url: string;
        name: string;
      };
    };
  };
  essay?: {
    data?: {
      attributes: {
        url: string;
        name: string;
      };
    };
  };
  guidedMeditation?: {
    data?: {
      attributes: {
        url: string;
        name: string;
      };
    };
  };
  videoDescription?: string;
  videoTranscript?: string;
  keyConcepts?: string;
  writingPrompts?: string;
}

interface CourseClass {
  id: number;
  attributes: {
    title: string;
    orderIndex: number;
    description?: string;
    duration?: string;
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

const ClassPage = ({ courseSlug, classId }: ClassPageProps) => {
  const [currentClass, setCurrentClass] = useState<CourseClass | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper function to get URL with proper base
  const getFileUrl = (url?: string) => {
    if (!url) return "";

    // Check if it's an absolute URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Otherwise, it's a relative URL, so prepend the base URL
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // First get the course details
        const courseResponse = await courseApi.getCourseBySlug(courseSlug);
        if (!courseResponse) {
          setError("Course not found");
          return;
        }
        setCourse(courseResponse);

        // Get all classes for this course
        const classesResponse = await courseApi.getClasses(
          courseResponse.id.toString()
        );
        if (!classesResponse.data || classesResponse.data.length === 0) {
          setError("No classes found for this course");
          return;
        }
        setClasses(classesResponse.data);

        // Find the current class by ID
        const classIdNumber = parseInt(classId);
        const currentClassData = classesResponse.data.find(
          (c) => c.id === classIdNumber
        );
        if (!currentClassData) {
          setError("Class not found");
          return;
        }

        // Get complete class data with content
        const fullClassData = await courseApi.getClass(classId);
        console.log("Full class data:", fullClassData);

        setCurrentClass(fullClassData.data);
      } catch (err) {
        console.error("Error fetching class data:", err);
        setError("Failed to load class content");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseSlug && classId) {
      fetchData();
    }
  }, [courseSlug, classId]);

  // Navigate to previous class
  const goToPreviousClass = () => {
    if (!currentClass || !classes.length) return;

    const currentIndex = classes.findIndex((c) => c.id === currentClass.id);
    if (currentIndex > 0) {
      const previousClass = classes[currentIndex - 1];
      router.push(
        `/dashboard/user/courses/${courseSlug}/class/${previousClass.id}`
      );
    }
  };

  // Navigate to next class
  const goToNextClass = () => {
    if (!currentClass || !classes.length) return;

    const currentIndex = classes.findIndex((c) => c.id === currentClass.id);
    if (currentIndex < classes.length - 1) {
      const nextClass = classes[currentIndex + 1];
      router.push(
        `/dashboard/user/courses/${courseSlug}/class/${nextClass.id}`
      );
    }
  };

  // Count available content items
  const countContentItems = (content?: ClassContent): number => {
    if (!content) return 0;

    let count = 0;
    if (content.video?.data) count++;
    if (content.essay?.data) count++;
    if (content.guidedMeditation?.data) count++;
    if (content.videoDescription) count++;
    if (content.videoTranscript) count++;
    if (content.keyConcepts) count++;
    if (content.writingPrompts) count++;

    return count;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !currentClass || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error || "Class data not available"}</p>
        </div>
        <div className="mt-4">
          <Link
            href={`/dashboard/user/courses/${courseSlug}`}
            className="text-purple-600 hover:underline flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  // Get class content
  const content = currentClass.attributes.content || {};
  const hasVideo = !!content.video?.data;
  const hasEssay = !!content.essay?.data;
  const hasGuidedMeditation = !!content.guidedMeditation?.data;
  const lectureCount = countContentItems(content);

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href={`/dashboard/user/courses/${courseSlug}`}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to course
            </Link>

            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousClass}
                className="text-gray-600 hover:text-gray-900 flex items-center"
                disabled={
                  classes.findIndex((c) => c.id === currentClass.id) === 0
                }
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>

              <button
                onClick={goToNextClass}
                className="text-gray-600 hover:text-gray-900 flex items-center"
                disabled={
                  classes.findIndex((c) => c.id === currentClass.id) ===
                  classes.length - 1
                }
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentClass.attributes.title}
          </h1>
          <div className="text-gray-500">
            {currentClass.attributes.duration} minutes · {lectureCount}{" "}
            {lectureCount === 1 ? "lecture" : "lectures"}
          </div>
        </div>

        {/* Video section (if available) */}
        {hasVideo && (
          <div className="mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {content.video?.data?.attributes.url ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  poster="/placeholder-video.jpg"
                >
                  <source
                    src={getFileUrl(content.video.data.attributes.url)}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white">Video not available</div>
                </div>
              )}
            </div>

            {content.videoDescription && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Video Description
                </h3>
                <div className="prose max-w-none">
                  <ReactMarkdown>{content.videoDescription}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description and content */}
        {currentClass.attributes.description && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="prose max-w-none">
              <ReactMarkdown>
                {currentClass.attributes.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Key concepts */}
        {content.keyConcepts && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Key Concepts
            </h2>
            <div className="prose max-w-none">
              <ReactMarkdown>{content.keyConcepts}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Additional materials section */}
        {(hasEssay ||
          hasGuidedMeditation ||
          content.videoTranscript ||
          content.writingPrompts) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Additional Materials
            </h2>

            <div className="space-y-4">
              {/* Essay */}
              {hasEssay && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Essay:{" "}
                    {content.essay?.data?.attributes.name ||
                      "Supplementary reading"}
                  </h3>
                  <a
                    href={getFileUrl(content.essay?.data?.attributes.url)}
                    className="text-purple-600 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Essay
                  </a>
                </div>
              )}

              {/* Guided meditation */}
              {hasGuidedMeditation && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Guided Meditation:{" "}
                    {content.guidedMeditation?.data?.attributes.name ||
                      "Meditation practice"}
                  </h3>
                  <audio
                    controls
                    className="w-full mt-2"
                    src={getFileUrl(
                      content.guidedMeditation?.data?.attributes.url
                    )}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Video transcript */}
              {content.videoTranscript && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Video Transcript
                  </h3>
                  <div className="max-h-64 overflow-y-auto prose max-w-none">
                    <ReactMarkdown>{content.videoTranscript}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Writing prompts */}
              {content.writingPrompts && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Writing Prompts
                  </h3>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{content.writingPrompts}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={goToPreviousClass}
            className={`px-4 py-2 border rounded-md flex items-center ${
              classes.findIndex((c) => c.id === currentClass.id) === 0
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={classes.findIndex((c) => c.id === currentClass.id) === 0}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous class
          </button>

          <button
            onClick={goToNextClass}
            className={`px-4 py-2 border rounded-md flex items-center ${
              classes.findIndex((c) => c.id === currentClass.id) ===
              classes.length - 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={
              classes.findIndex((c) => c.id === currentClass.id) ===
              classes.length - 1
            }
          >
            Next class
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
