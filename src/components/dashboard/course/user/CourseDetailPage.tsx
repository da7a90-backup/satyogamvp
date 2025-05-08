"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";
import ReactMarkdown from "react-markdown";
import SuccessNotification from "@/components/dashboard/course/user/SuccessNotificationPage";
import CourseTestimonialsComponent from "@/components/dashboard/course/user/CourseTestimonialsComponent";

interface CourseDetailPageProps {
  slug: string;
}

// Define types based on Strapi structure
interface Instructor {
  id: number;
  attributes: {
    name: string;
    title?: string;
    bio?: string;
    website?: string;
    picture?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface FeaturedQuote {
  quoteText: string;
  authorName: string;
  authorImage?: {
    data?: {
      attributes: {
        url: string;
      };
    };
  };
}

interface LearningPoint {
  title: string;
  description: string;
}

interface CourseFeatures {
  videoClasses: string;
  guidedMeditations: string;
  studyMaterials: string;
  supportInfo: string;
  curriculumAids: string;
}

interface ClassContent {
  video?: any;
  essay?: any;
  guidedMeditation?: any;
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
    duration?: string; // Added duration field based on the logs
    content?: ClassContent;
  };
}

interface Course {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
    price: number;
    isFree: boolean;
    startDate?: string;
    endDate?: string;
    introduction?: string;
    addendum?: string;
    featuredImage?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
    previewMedia?: {
      data: Array<{
        id: number;
        attributes: {
          url: string;
          mime: string;
          name: string;
        };
      }>;
    };
    instructors?: {
      data: Instructor[];
    };
    whatYouWillLearn?: any[];
    courseFeatures?: CourseFeatures;
    featuredQuote?: FeaturedQuote;
    // New field for introVideo component
    introVideo?: {
      title?: string;
      video?: {
        data?: {
          attributes: {
            url: string;
            mime: string;
            name: string;
          };
        };
      };
    };
  };
}

const CourseDetailPage = ({ slug }: CourseDetailPageProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [expandedClassIds, setExpandedClassIds] = useState<number[]>([]);
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for media slider
  const sliderRef = useRef<HTMLDivElement>(null);

  // Helper function to get image URL with proper base
  const getImageUrl = (url?: string) => {
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
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getCourseBySlug(slug);

        if (!response) {
          setError("Course not found");
          return;
        }

        // // Log the full course data to debug image issues
        // console.log("Full course data:", response);

        // // Check instructor data specifically
        // if (response.attributes.instructors?.data) {
        //   console.log(
        //     "Instructors data:",
        //     response.attributes.instructors.data
        //   );
        // }

        setCourse(response);

        // After setting the course, fetch the classes
        if (response.id) {
          fetchClasses(response.id.toString());
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchClasses = async (courseId: string) => {
      try {
        const response = await courseApi.getClasses(courseId);
        // console.log("Classes data:", response);

        if (response.data && response.data.length > 0) {
          // // Debug: Log the structure of the first class to understand its structure
          // console.log(
          //   "First class structure:",
          //   JSON.stringify(response.data[0], null, 2)
          // );
          // console.log(
          //   "First class content:",
          //   response.data[0].attributes.content
          // );

          // // Explicitly log what fields we're counting
          // const firstClass = response.data[0];
          // if (firstClass.attributes.content) {
          //   console.log("Content fields found in first class:");
          //   console.log("- video:", !!firstClass.attributes.content.video);
          //   console.log("- essay:", !!firstClass.attributes.content.essay);
          //   console.log(
          //     "- guidedMeditation:",
          //     !!firstClass.attributes.content.guidedMeditation
          //   );
          //   console.log(
          //     "- keyConcepts:",
          //     !!firstClass.attributes.content.keyConcepts
          //   );
          //   console.log(
          //     "- writingPrompts:",
          //     !!firstClass.attributes.content.writingPrompts
          //   );
          //   console.log(
          //     "- videoDescription:",
          //     !!firstClass.attributes.content.videoDescription
          //   );
          //   console.log(
          //     "- videoTranscript:",
          //     !!firstClass.attributes.content.videoTranscript
          //   );

          //   // For content.video, which might be complex or nested
          //   console.log(
          //     "Video content type:",
          //     typeof firstClass.attributes.content.video
          //   );
          //   if (firstClass.attributes.content.video) {
          //     console.log(
          //       "Video content structure:",
          //       JSON.stringify(firstClass.attributes.content.video, null, 2)
          //     );
          //   }
          // }

          setClasses(response.data);
          // Expand the first class by default
          setExpandedClassIds([response.data[0].id]);
        } else {
          console.log("No classes found for this course");
          setClasses([]);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        // We'll just show the course without the classes if there's an error
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  useEffect(() => {
    // Check if we're returning from a successful enrollment
    const checkEnrollmentSuccess = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const enrolled = urlParams.get("enrolled");

        if (enrolled === "true") {
          // Show success notification
          setShowSuccessNotification(true);

          // Remove the query parameter using history API
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    checkEnrollmentSuccess();
  }, []);

  // Updated handlePurchase function with redirection
  const handlePurchase = async () => {
    if (!course) return;

    try {
      // Check if the course is free or paid
      if (course.attributes.isFree || course.attributes.price === 0) {
        setIsEnrolling(true);
        setErrorMessage(null);

        try {
          // Enroll in the free course
          await courseApi.enrollInCourse(course.id.toString());

          // Show success notification
          setShowSuccessNotification(true);

          // Redirect after a short delay
          setTimeout(() => {
            // Redirect to the courses page with the "my-courses" tab active
            // We can use local storage to set the active tab before redirecting
            localStorage.setItem("coursesActiveTab", "my-courses");
            router.push("/dashboard/user/courses");
          }, 3000); // 3 second delay to allow user to see the notification
        } catch (enrollError: any) {
          console.error("Error enrolling in course:", enrollError);
          setErrorMessage(
            enrollError.message ||
              "Failed to enroll in course. Please try again."
          );
        } finally {
          setIsEnrolling(false);
        }
      } else {
        // For paid courses, redirect to payment page
        router.push(`/dashboard/user/courses/${slug}/payment`);
      }
    } catch (err) {
      console.error("Error in purchase flow:", err);
      setIsEnrolling(false);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Slider navigation
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Toggle syllabus section expansion
  const toggleClass = (classId: number) => {
    setExpandedClassIds((prevIds) =>
      prevIds.includes(classId)
        ? prevIds.filter((id) => id !== classId)
        : [...prevIds, classId]
    );
  };

  // Calculate duration for each class using the duration field from class attributes
  const calculateDuration = (courseClass: CourseClass): string => {
    // Use the duration field directly if available
    if (courseClass.attributes.duration) {
      const durationMinutes = parseInt(courseClass.attributes.duration, 10);

      // Format based on duration length
      if (durationMinutes >= 60) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        // Format appropriately
        if (minutes === 0) {
          return `${hours} h`; // Just hours if no minutes
        } else {
          return `${hours} h ${minutes} m`; // Hours and minutes
        }
      } else {
        return `${durationMinutes} m`; // Just minutes if less than an hour
      }
    }

    // Return empty string if no duration available
    return "";
  };

  // Count lectures based on content fields: video, keyConcepts, writingPrompts
  const countLectures = (courseClass: CourseClass): string => {
    let count = 0;
    const content = courseClass.attributes.content;

    // Check if video field exists in content
    if (content.video) {
      count++;
    }

    // Check if keyConcepts field exists in content
    if (content.keyConcepts) {
      count++;
    }

    // Check if writingPrompts field exists in content
    if (content.writingPrompts) {
      count++;
    }

    // Return in the format "X lectures"
    return `${count} ${count === 1 ? "lecture" : "lectures"}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error || "Course not found"}</p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/user/courses"
            className="text-purple-600 hover:underline flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/dashboard/user/courses"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </Link>
      </div>
      {/* Course header with featured image, title and enrollment details */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Featured Image with gallery */}
            <div className="rounded-lg overflow-hidden bg-gray-100">
              {course.attributes.featuredImage?.data?.attributes?.url ? (
                <img
                  src={getImageUrl(
                    course.attributes.featuredImage.data.attributes.url
                  )}
                  alt={course.attributes.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              {/* Image thumbnails below main image */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 h-16 rounded-md"
                  ></div>
                ))}
              </div>
            </div>

            {/* Right: Course Information */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.attributes.title}
              </h1>

              {/* Free badge and payment info */}
              <div className="flex items-center mb-4">
                <span className="text-xl font-semibold text-black bg-transparent border-2 border-black rounded-full px-4 py-1">
                  {course.attributes.isFree || course.attributes.price === 0
                    ? "Free"
                    : `$${course.attributes.price}`}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  One time payment
                </span>
              </div>

              {/* Course dates */}
              {(course.attributes.startDate || course.attributes.endDate) && (
                <div className="mb-4 text-gray-600">
                  {formatDate(course.attributes.startDate)} -{" "}
                  {formatDate(course.attributes.endDate)}
                </div>
              )}

              {/* Brief description */}
              <div className="mb-6 text-gray-700">
                <p>{course.attributes.description}</p>
              </div>

              {/* Membership Section */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Are you a member?</p>
                <div className="relative inline-block w-full mb-4">
                  <select className="block appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:border-gray-500">
                    <option>No</option>
                    <option>Yes - Prajnani</option>
                    <option>Yes - Satyagrahi</option>
                    <option>Yes - Brahmachari</option>
                    <option>Yes - Sannyasi</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Enroll button */}
              <button
                onClick={handlePurchase}
                className="w-full py-3 px-6 rounded-md bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    Enrolling...
                  </span>
                ) : course.attributes.isFree ||
                  course.attributes.price === 0 ? (
                  "Enroll now (Free)"
                ) : (
                  `Purchase ($${course.attributes.price})`
                )}
              </button>
              {errorMessage && (
                <div className="mt-2 text-sm text-red-600">
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Membership discovery link */}
              <p className="text-xs text-center mt-2">
                Discover our <span className="underline">memberships</span> to
                receive discounts
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main course content */}
      <div className="container mx-auto px-4 py-8">
        {/* Featured video section */}
        {course.attributes.introVideo?.video?.data ? (
          <div className="mb-16 bg-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video relative">
              {course.attributes.introVideo.video.data.attributes.mime.startsWith(
                "video/"
              ) ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="/video-placeholder.jpg"
                >
                  <source
                    src={getImageUrl(
                      course.attributes.introVideo.video.data.attributes.url
                    )}
                    type={
                      course.attributes.introVideo.video.data.attributes.mime
                    }
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="flex flex-col items-center">
                    <PlayIcon className="h-16 w-16 text-white opacity-50 mb-4" />
                    <p className="text-white text-center">
                      Video format not supported
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video title and instructor badges */}
            <div className="bg-gray-800 p-4">
              {course.attributes.introVideo.title && (
                <h3 className="text-white text-lg font-medium mb-4">
                  {course.attributes.introVideo.title}
                </h3>
              )}

              {/* Instructor badges */}
              <div className="flex flex-wrap gap-4">
                {course.attributes.instructors?.data &&
                  course.attributes.instructors.data.map((instructor) => (
                    <div
                      key={instructor.id}
                      className="flex items-center gap-2"
                    >
                      {instructor.attributes.picture?.data?.attributes?.url ? (
                        <img
                          src={getImageUrl(
                            instructor.attributes.picture.data.attributes.url
                          )}
                          alt={instructor.attributes.name}
                          className="h-8 w-8 object-cover rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {instructor.attributes.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-white text-sm">
                        {instructor.attributes.name} · Instructor
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : // Skip the video section completely if no introVideo exists
        null}

        {/* What you will learn */}
        {course.attributes.whatYouWillLearn &&
          course.attributes.whatYouWillLearn.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                What you will learn
              </h2>

              <div className="space-y-6">
                {course.attributes.whatYouWillLearn.map((point, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {point.title}
                      </h3>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* This course includes */}
        {course.attributes.courseFeatures && (
          <div className="mb-16 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              This course includes:
            </h2>

            <div className="space-y-6">
              {course.attributes.courseFeatures.videoClasses && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      7 video classes
                    </h3>
                    <p className="text-gray-600">
                      {course.attributes.courseFeatures.videoClasses}
                    </p>
                  </div>
                </div>
              )}

              {course.attributes.courseFeatures.guidedMeditations && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      7 Guided meditations
                    </h3>
                    <p className="text-gray-600">
                      {course.attributes.courseFeatures.guidedMeditations}
                    </p>
                  </div>
                </div>
              )}

              {course.attributes.courseFeatures.studyMaterials && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Additional study materials
                    </h3>
                    <p className="text-gray-600">
                      {course.attributes.courseFeatures.studyMaterials}
                    </p>
                  </div>
                </div>
              )}

              {course.attributes.courseFeatures.supportInfo && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Comments and questions
                    </h3>
                    <p className="text-gray-600">
                      {course.attributes.courseFeatures.supportInfo}
                    </p>
                  </div>
                </div>
              )}

              {course.attributes.courseFeatures.curriculumAids && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <ChevronRightIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Curriculum study aids
                    </h3>
                    <p className="text-gray-600">
                      {course.attributes.courseFeatures.curriculumAids}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Media Slider */}
        {course.attributes.previewMedia?.data &&
          course.attributes.previewMedia.data.length > 0 && (
            <div className="mb-16">
              <div className="relative">
                <div
                  ref={sliderRef}
                  className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {course.attributes.previewMedia.data.map((media) => (
                    <div
                      key={media.id}
                      className="flex-shrink-0 w-72 h-48 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {media.attributes.mime.startsWith("image/") ? (
                        <img
                          src={getImageUrl(media.attributes.url)}
                          alt={media.attributes.name}
                          className="w-full h-full object-cover"
                        />
                      ) : media.attributes.mime.startsWith("video/") ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                              <PlayIcon className="h-8 w-8 text-purple-600" />
                            </div>
                          </div>
                          <span className="text-white text-sm">
                            Video Preview
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500">Media Preview</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center z-10"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center z-10"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === 0 ? "bg-black" : "bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}

        {/* Featured Quote */}
        {course.attributes.featuredQuote?.quoteText && (
          <div className="mb-16">
            <div className="p-8 mb-16 text-center">
              <blockquote className="text-xl italic font-medium text-gray-900 mb-6">
                "{course.attributes.featuredQuote.quoteText}"
              </blockquote>

              <div className="flex flex-col items-center">
                {course.attributes.featuredQuote.authorImage?.data?.attributes
                  ?.url ? (
                  <img
                    src={getImageUrl(
                      course.attributes.featuredQuote.authorImage.data
                        .attributes.url
                    )}
                    alt={course.attributes.featuredQuote.authorName}
                    className="w-16 h-16 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-500 text-xl font-medium">
                      {course.attributes.featuredQuote.authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <cite className="font-medium text-gray-900 not-italic">
                  {course.attributes.featuredQuote.authorName}
                </cite>
              </div>
            </div>
          </div>
        )}

        {/* The Instructors */}
        {course.attributes.instructors?.data &&
          course.attributes.instructors.data.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                The instructors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {course.attributes.instructors.data.map((instructor) => {
                  // Check if picture field exists and has data
                  const hasPicture =
                    instructor.attributes.picture &&
                    instructor.attributes.picture.data &&
                    instructor.attributes.picture.data.attributes &&
                    instructor.attributes.picture.data.attributes.url;

                  const imageUrl = hasPicture
                    ? getImageUrl(
                        instructor.attributes.picture.data.attributes.url
                      )
                    : null;

                  return (
                    <div key={instructor.id} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={instructor.attributes.name}
                            className="h-32 w-32 object-cover rounded-sm"
                          />
                        ) : (
                          <div className="h-32 w-32 bg-gray-100 flex items-center justify-center rounded-sm">
                            <span className="text-gray-500 text-6xl font-medium">
                              {instructor.attributes.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {instructor.attributes.name}
                        </h3>
                        {instructor.attributes.title && (
                          <p className="text-gray-500 text-sm mb-2">
                            {instructor.attributes.title}
                          </p>
                        )}
                        {instructor.attributes.bio && (
                          <p className="text-gray-600 text-sm">
                            {instructor.attributes.bio}
                          </p>
                        )}
                        {instructor.attributes.website && (
                          <a
                            href={instructor.attributes.website}
                            className="text-purple-600 hover:underline text-sm mt-2 inline-block"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit website
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Syllabus Section - now using real data */}
        {classes.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Syllabus</h2>
            <p className="text-gray-600 mb-8">
              {classes.length} class course curriculum
            </p>

            <div className="space-y-4">
              {classes.map((courseClass) => {
                const isExpanded = expandedClassIds.includes(courseClass.id);

                return (
                  <div
                    key={courseClass.id}
                    className="border-t border-gray-200"
                  >
                    <button
                      onClick={() => toggleClass(courseClass.id)}
                      className="flex justify-between items-center w-full py-4 text-left"
                    >
                      <div className="flex items-center">
                        <ChevronRightIcon
                          className={`h-5 w-5 text-purple-700 mr-2 transition-transform ${
                            isExpanded ? "transform rotate-90" : ""
                          }`}
                        />
                        <span className="text-purple-700 font-medium">
                          {courseClass.attributes.title}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {calculateDuration(courseClass)} ·{" "}
                        {countLectures(courseClass)}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="pl-8 pb-4 pr-4">
                        {/* Class description - rendered as markdown */}
                        {courseClass.attributes.description && (
                          <div className="mb-4 prose max-w-none">
                            <ReactMarkdown>
                              {courseClass.attributes.description}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Testimonials
          </h2>
          <p className="text-gray-600 mb-8">What students say about us</p>

          {course && (
            <CourseTestimonialsComponent
              courseId={course.id.toString()}
              maxDisplay={3}
            />
          )}
        </div>

        {/* Final CTA */}
        <div className="text-center mb-16">
          <button
            onClick={handlePurchase}
            className="w-full py-3 px-6 rounded-md bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isEnrolling}
          >
            {isEnrolling ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Enrolling...
              </span>
            ) : course.attributes.isFree || course.attributes.price === 0 ? (
              "Enroll now (Free)"
            ) : (
              `Purchase ($${course.attributes.price})`
            )}
          </button>
          {errorMessage && (
            <div className="mt-2 text-sm text-red-600">
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Style for hiding scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Success notification */}
      {showSuccessNotification && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-md shadow-md max-w-md z-50">
          <div className="p-4 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-grow">
              <p className="text-green-800 font-medium">
                Course successfully added to your courses! You can find it in
                the 'My Courses' tab.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
