"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// Define types for our component props
interface CoursesClientProps {
  isAuthenticated: boolean;
  userJwt: string | null;
}

// Define types based on your Strapi structure
interface Instructor {
  id: number;
  attributes: {
    name: string;
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
    featuredImage?: {
      data?: {
        attributes: {
          url: string;
          formats?: {
            thumbnail?: {
              url: string;
            };
          };
        };
      };
    };
    instructors?: {
      data: Instructor[];
    };
  };
}

const CoursesClient = ({ isAuthenticated, userJwt }: CoursesClientProps) => {
  const [activeTab, setActiveTab] = useState<"my-courses" | "available">(
    "my-courses"
  );
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // After component mounts, check localStorage
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Get saved tab from localStorage
      const savedTab = localStorage.getItem("coursesActiveTab");
      if (savedTab === "available" || savedTab === "my-courses") {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Create a function to handle tab changes
  const handleTabChange = (tab: "my-courses" | "available") => {
    setActiveTab(tab);
    // Save to localStorage
    localStorage.setItem("coursesActiveTab", tab);
  };

  // Store JWT in localStorage when it changes
  useEffect(() => {
    if (userJwt) {
      localStorage.setItem("jwt", userJwt);
    } else {
      localStorage.removeItem("jwt");
    }
  }, [userJwt]);

  // Fetch user's courses
  const fetchUserCourses = async () => {
    if (!isAuthenticated || !userJwt) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure JWT is set before making the API call
      localStorage.setItem("jwt", userJwt);

      // Use the updated getUserCourses function from courseApi
      const response = await courseApi.getUserCourses();
      // console.log("User courses response:", response);

      if (response && response.data) {
        setMyCourses(response.data);
      } else {
        console.log("No courses found or invalid response format");
        setMyCourses([]);
      }
    } catch (err) {
      console.error("Error fetching user courses:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available courses - works for both authenticated and unauthenticated users
  const fetchAvailableCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // console.log("Fetching available courses via courseApi...");

      // Use the updated getAvailableCourses function from courseApi
      const response = await courseApi.getAvailableCourses();
      // console.log("Available courses response:", response);

      if (response && response.data) {
        setAvailableCourses(response.data);
      } else {
        console.log("No available courses found or invalid response format");
        setAvailableCourses([]);
      }
    } catch (err) {
      console.error("Error fetching available courses:", err);
      setError("Failed to load available courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data based on active tab and authentication state
  useEffect(() => {
    if (activeTab === "my-courses") {
      fetchUserCourses();
    } else {
      fetchAvailableCourses();
    }
  }, [activeTab, isAuthenticated, userJwt]);

  // Format instructor names for display
  const formatInstructors = (course: Course) => {
    if (
      !course.attributes.instructors?.data ||
      course.attributes.instructors.data.length === 0
    ) {
      return "";
    }
    return course.attributes.instructors.data
      .map((instructor) => instructor.attributes.name)
      .join(", ");
  };

  // Get course image URL with proper handling for different data structures
  const getCourseImageUrl = (course: Course) => {
    // First check if featuredImage exists and has data with url
    if (course.attributes.featuredImage?.data?.attributes?.url) {
      const url = course.attributes.featuredImage.data.attributes.url;

      // Check if it's already a full URL
      if (url.startsWith("http")) {
        return url;
      }

      // Otherwise, prepend the API URL
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
      return `${baseUrl}${url}`;
    }

    // Fallback: Try to find large format URL directly (seen in the logs)
    if (
      course.attributes.featuredImage?.data?.attributes?.formats?.large?.url
    ) {
      return course.attributes.featuredImage.data.attributes.formats.large.url;
    }

    // Fallback: Try to find small format URL directly
    if (
      course.attributes.featuredImage?.data?.attributes?.formats?.small?.url
    ) {
      return course.attributes.featuredImage.data.attributes.formats.small.url;
    }

    return "/placeholder-course.jpg"; // Return placeholder if no image found
  };

  // Handle enrollment/purchase button click
  const handleEnroll = (course: Course) => {
    if (!isAuthenticated) {
      // Redirect to login page with a return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        `/dashboard/user/courses/${course.attributes.slug}`
      )}&action=view&courseId=${course.id}`;
      return;
    }

    // Redirect to the course detail page
    window.location.href = `/dashboard/user/courses/${course.attributes.slug}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Courses</h1>

      {/* Tab navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("my-courses")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my-courses"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Courses
          </button>

          <button
            onClick={() => handleTabChange("available")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "available"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Available to Purchase
          </button>
        </nav>
      </div>

      {/* Authentication warning */}
      {!isAuthenticated && activeTab === "my-courses" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            Please{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(
                "dashboard/user/courses"
              )}`}
              className="font-medium underline"
            >
              log in
            </Link>{" "}
            to view your enrolled courses.
          </p>
        </div>
      )}

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
          {/* Course count - only show for authenticated users in My Courses tab */}
          {activeTab === "my-courses" && isAuthenticated && (
            <div className="mb-4 text-sm text-gray-500">
              {myCourses.length} {myCourses.length === 1 ? "item" : "items"}
            </div>
          )}

          {/* My Courses tab content */}
          {activeTab === "my-courses" && (
            <>
              {/* Empty state for authenticated users with no courses */}
              {isAuthenticated && myCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    You haven't enrolled in any courses yet.
                    <br />
                    Explore our available courses to start your learning
                    journey.
                  </p>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    onClick={() => handleTabChange("available")}
                  >
                    Browse courses
                  </button>
                </div>
              ) : (
                // Only show course grid for authenticated users with courses
                isAuthenticated &&
                myCourses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg overflow-hidden shadow"
                      >
                        <div className="relative aspect-video bg-gray-200">
                          <img
                            src={getCourseImageUrl(course)}
                            alt={course.attributes.title}
                            className="w-full h-full object-cover"
                          />
                          <button className="absolute top-3 right-3 bg-white p-2 rounded-md shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="p-4">
                          {formatInstructors(course) && (
                            <p className="text-sm text-gray-500 mb-1">
                              Taught by {formatInstructors(course)}
                            </p>
                          )}
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {course.attributes.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                            {course.attributes.description}
                          </p>

                          <Link
                            href={`/dashboard/user/courses/${course.attributes.slug}`}
                            className="block w-full text-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {/* Available Courses tab content */}
          {activeTab === "available" && (
            <>
              {availableCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses available
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    There are no courses available for purchase at the moment.
                    <br />
                    Check back later or activate alerts to be notified when new
                    courses arrive.
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Notify me
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg overflow-hidden shadow"
                    >
                      <div className="relative aspect-video bg-gray-200">
                        <img
                          src={getCourseImageUrl(course)}
                          alt={course.attributes.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Bookmark button */}
                        <button className="absolute top-3 right-3 bg-white p-2 rounded-md shadow-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                        </button>

                        {/* Price tag - top left */}
                        <div className="absolute top-3 left-3">
                          {course.attributes.isFree ||
                          course.attributes.price === 0 ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-md">
                              Free
                            </span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-md">
                              ${course.attributes.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        {formatInstructors(course) && (
                          <p className="text-sm text-gray-500 mb-1">
                            Taught by {formatInstructors(course)}
                          </p>
                        )}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {course.attributes.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                          {course.attributes.description}
                        </p>

                        <button
                          onClick={() => handleEnroll(course)}
                          className={`block w-full text-center px-4 py-2 rounded-md ${
                            course.attributes.isFree ||
                            course.attributes.price === 0
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-black hover:bg-gray-800 text-white"
                          }`}
                        >
                          {course.attributes.isFree ||
                          course.attributes.price === 0
                            ? "Enroll Now"
                            : "Purchase"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filter button (we'll keep this simple for now) */}
              {availableCourses.length > 0 && (
                <div className="fixed bottom-6 right-6">
                  <button className="p-3 bg-white rounded-full shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesClient;
