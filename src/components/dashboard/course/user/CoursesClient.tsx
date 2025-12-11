"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// Define types for our component props
interface CoursesClientProps {
  isAuthenticated: boolean;
  userJwt: string | null;
}

// FastAPI course structure (flat, no attributes nesting)
interface Instructor {
  id: string;
  name: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url?: string;
  cloudflare_image_id?: string;
  instructor?: Instructor;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  is_enrolled?: boolean;
}

interface Enrollment {
  id: string;
  course: Course;
  enrolled_at: string;
  progress_percentage: number;
}

const CoursesClient = ({ isAuthenticated, userJwt }: CoursesClientProps) => {
  const [activeTab, setActiveTab] = useState<"my-courses" | "available">(
    "my-courses"
  );
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // After component mounts, check localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("coursesActiveTab");
      if (savedTab === "available" || savedTab === "my-courses") {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Create a function to handle tab changes
  const handleTabChange = (tab: "my-courses" | "available") => {
    setActiveTab(tab);
    localStorage.setItem("coursesActiveTab", tab);
  };

  // Store JWT in localStorage when it changes
  useEffect(() => {
    if (userJwt) {
      localStorage.setItem("token", userJwt);
      localStorage.setItem("jwt", userJwt); // Keep for backwards compatibility
    } else {
      localStorage.removeItem("token");
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
      localStorage.setItem("token", userJwt);
      localStorage.setItem("jwt", userJwt);

      const response = await courseApi.getUserCourses();

      if (response && response.enrollments) {
        // Extract courses from enrollments
        const courses = response.enrollments.map((enrollment: Enrollment) => ({
          ...enrollment.course,
          progress_percentage: enrollment.progress_percentage,
        }));
        setMyCourses(courses);
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

  // Fetch available courses
  const fetchAvailableCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseApi.getAvailableCourses();

      if (response && response.courses) {
        setAvailableCourses(response.courses);
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
    if (!course.instructor) {
      return "";
    }
    return course.instructor.name;
  };

  // Get course image URL
  const getCourseImageUrl = (course: Course) => {
    // If there's a Cloudflare image ID, use it
    if (course.cloudflare_image_id) {
      // You can add Cloudflare Images URL generation here
      // For now, just return the cloudflare_image_id
      return `https://imagedelivery.net/YOUR_ACCOUNT_HASH/${course.cloudflare_image_id}/public`;
    }

    // Otherwise use thumbnail_url
    if (course.thumbnail_url) {
      // Check if it's already a full URL
      if (course.thumbnail_url.startsWith("http")) {
        return course.thumbnail_url;
      }

      // Otherwise, prepend the API URL
      const baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
      return `${baseUrl}${course.thumbnail_url}`;
    }

    return "/placeholder-course.jpg";
  };

  // Handle enrollment/purchase button click
  const handleEnroll = (course: Course) => {
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        `/dashboard/user/courses/${course.slug}`
      )}&action=view&courseId=${course.id}`;
      return;
    }

    // Redirect to the course detail page
    window.location.href = `/dashboard/user/courses/${course.slug}`;
  };

  // Handle opening an enrolled course
  const handleOpenCourse = (slug: string) => {
    router.push(`/dashboard/user/courses/${slug}/overview`);
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
          {/* Course count */}
          {activeTab === "my-courses" && isAuthenticated && (
            <div className="mb-4 text-sm text-gray-500">
              {myCourses.length} {myCourses.length === 1 ? "item" : "items"}
            </div>
          )}

          {/* My Courses tab content */}
          {activeTab === "my-courses" && (
            <>
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
                    Explore our available courses to start your learning journey.
                  </p>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    onClick={() => handleTabChange("available")}
                  >
                    Browse courses
                  </button>
                </div>
              ) : (
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
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Progress indicator */}
                          {course.progress_percentage !== undefined && course.progress_percentage > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                              <div className="flex items-center justify-between text-white text-xs mb-1">
                                <span>Progress</span>
                                <span>{Math.round(course.progress_percentage)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${course.progress_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          {formatInstructors(course) && (
                            <p className="text-sm text-gray-500 mb-1">
                              Taught by {formatInstructors(course)}
                            </p>
                          )}
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                            {course.description}
                          </p>

                          <button
                            onClick={() => handleOpenCourse(course.slug)}
                            className="block w-full text-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                          >
                            {course.progress_percentage && course.progress_percentage > 0
                              ? "Continue"
                              : "Start"}
                          </button>
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
                    Check back later or activate alerts to be notified when new courses arrive.
                  </p>
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
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Price tag */}
                        <div className="absolute top-3 left-3">
                          {course.price === 0 ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-md">
                              Free
                            </span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-md">
                              ${course.price}
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
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        <button
                          onClick={() => handleEnroll(course)}
                          className={`block w-full text-center px-4 py-2 rounded-md ${
                            course.price === 0
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-black hover:bg-gray-800 text-white"
                          }`}
                        >
                          {course.price === 0 ? "Enroll Now" : "Purchase"}
                        </button>
                      </div>
                    </div>
                  ))}
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
