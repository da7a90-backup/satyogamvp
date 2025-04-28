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
  BookOpenIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  PlayIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const response = await courseApi.getCourseBySlug(slug);
        console.log("API Response:", response);

        // Store debug info
        setDebugInfo(response);

        if (!response) {
          setError("Course not found");
          return;
        }

        setCourse(response);

        // Fetch classes after we have the course
        if (response.id) {
          try {
            const classesResponse = await courseApi.getClasses(
              response.id.toString()
            );
            console.log("Classes Response:", classesResponse);

            if (classesResponse.data) {
              setClasses(classesResponse.data);
            }
          } catch (classError) {
            console.error("Error fetching classes:", classError);
            // Continue even if classes fail to load
          }
        }
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

  // Helper function to safely construct image URLs
  const getImageUrl = (urlPath: string) => {
    if (!urlPath) return "";

    // If it's already an absolute URL, return it as is
    if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
      return urlPath;
    }

    // Otherwise, prepend the Strapi URL
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
    return `${strapiUrl}${urlPath}`;
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return "Duration not set";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours} hr${hours > 1 ? "s" : ""} ${
        remainingMinutes > 0 ? `${remainingMinutes} min` : ""
      }`;
    } else {
      return `${remainingMinutes} min`;
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

  // New fields
  const whatYouWillLearn = course?.attributes?.whatYouWillLearn || [];
  const courseFeatures = course?.attributes?.courseFeatures || {};
  const previewMedia = course?.attributes?.previewMedia;
  const featuredQuote = course?.attributes?.featuredQuote;
  const introduction = course?.attributes?.introduction || "";
  const addendum = course?.attributes?.addendum || "";

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
            href={`/dashboard/admin/course/${course.attributes.slug}/edit`}
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
              src={getImageUrl(featuredImage.data.attributes.url)}
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

          {/* What You Will Learn Section */}
          {whatYouWillLearn && whatYouWillLearn.length > 0 && (
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-gray-500" />
                What You Will Learn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whatYouWillLearn.map((point: any, index: number) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-1">
                      {point.title}
                    </h4>
                    <p className="text-sm text-gray-600">{point.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Features Section */}
          {courseFeatures && Object.keys(courseFeatures).length > 0 && (
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-500" />
                This Course Includes:
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {courseFeatures.videoClasses && (
                  <div className="flex">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">Video Classes</p>
                      <p className="text-sm text-gray-600">
                        {courseFeatures.videoClasses}
                      </p>
                    </div>
                  </div>
                )}

                {courseFeatures.guidedMeditations && (
                  <div className="flex">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        Guided Meditations
                      </p>
                      <p className="text-sm text-gray-600">
                        {courseFeatures.guidedMeditations}
                      </p>
                    </div>
                  </div>
                )}

                {courseFeatures.studyMaterials && (
                  <div className="flex">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        Study Materials
                      </p>
                      <p className="text-sm text-gray-600">
                        {courseFeatures.studyMaterials}
                      </p>
                    </div>
                  </div>
                )}

                {courseFeatures.supportInfo && (
                  <div className="flex">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-bold">4</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">Support</p>
                      <p className="text-sm text-gray-600">
                        {courseFeatures.supportInfo}
                      </p>
                    </div>
                  </div>
                )}

                {courseFeatures.curriculumAids && (
                  <div className="flex">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-bold">5</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        Curriculum Aids
                      </p>
                      <p className="text-sm text-gray-600">
                        {courseFeatures.curriculumAids}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Media */}
          {previewMedia?.data?.length > 0 && (
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                Preview Media
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewMedia.data.map((media: any) => {
                  const mediaUrl = getImageUrl(media.attributes.url);
                  const isImage = media.attributes.mime?.startsWith("image/");

                  return (
                    <div key={media.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                        {isImage ? (
                          <Image
                            src={mediaUrl}
                            alt={media.attributes.name || "Preview media"}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                            <span className="text-xs p-2 text-center">
                              {media.attributes.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs mt-1 block truncate">
                        {media.attributes.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Quote */}
          {featuredQuote?.quoteText && (
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                Featured Quote
              </h3>

              <blockquote className="relative bg-purple-50 p-5 rounded-lg border-l-4 border-purple-400">
                <p className="italic text-gray-800 mb-3">
                  "{featuredQuote.quoteText}"
                </p>

                <footer className="flex items-center">
                  {featuredQuote.authorImage?.data && (
                    <div className="mr-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image
                          src={getImageUrl(
                            featuredQuote.authorImage.data.attributes.url
                          )}
                          alt={featuredQuote.authorName || "Quote author"}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  )}

                  <cite className="not-italic font-medium text-gray-900">
                    {featuredQuote.authorName}
                  </cite>
                </footer>
              </blockquote>
            </div>
          )}

          {/* Course classes section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Course Classes
              </h3>
              <Link
                href={`/dashboard/admin/course/${course.attributes.slug}/classes`}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Manage Classes
              </Link>
            </div>

            {/* Display course classes including intro and addendum */}
            <div className="space-y-4">
              {/* Introduction as the first item */}
              {introduction && (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900">
                        Introduction
                      </h4>
                    </div>
                    <div className="prose max-w-none mt-2">
                      <ReactMarkdown>{introduction}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular classes */}
              {classes.length > 0 ? (
                classes
                  .sort(
                    (a, b) => a.attributes.orderIndex - b.attributes.orderIndex
                  )
                  .map((classItem, index) => (
                    <div
                      key={classItem.id}
                      className="bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-900">
                            {index + 1}. {classItem.attributes.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDuration(classItem.attributes.duration)}
                          </div>
                        </div>

                        {/* Display class content types */}
                        {classItem.attributes.content && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {classItem.attributes.content.video && (
                              <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                                <PlayIcon className="h-3 w-3 mr-1" />
                                Video
                              </div>
                            )}
                            {classItem.attributes.content.essay && (
                              <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                Essay
                              </div>
                            )}
                            {classItem.attributes.content.guidedMeditation && (
                              <div className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                Guided Meditation
                              </div>
                            )}
                            {classItem.attributes.content
                              .additionalMaterials && (
                              <div className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                Additional Materials
                              </div>
                            )}
                            {classItem.attributes.content.writingPrompts && (
                              <div className="inline-flex items-center px-2 py-1 bg-rose-100 text-rose-800 rounded-md text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                Writing Prompts
                              </div>
                            )}
                            {classItem.attributes.content.keyConceptc && (
                              <div className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-800 rounded-md text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                Key Concepts
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex justify-end">
                          <Link
                            href={`/dashboard/admin/course/${course.attributes.slug}/class/edit/${classItem.id}`}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Edit Class
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                  No classes have been added to this course yet.
                </div>
              )}

              {/* Addendum as the last item */}
              {addendum && (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="p-4 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900">
                        Addendum
                      </h4>
                    </div>
                    <div className="prose max-w-none mt-2">
                      <ReactMarkdown>{addendum}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
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
