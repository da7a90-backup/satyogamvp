// Updated CoursesClient.tsx with modified price filters
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

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
    startDate?: string;
    endDate?: string;
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

// Updated Filter options interface with maxPrice instead of priceFilter
interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  instructors: number[];
  isFreeOnly: boolean;
  maxPrice: number | null;
}

const CoursesClient = ({ isAuthenticated, userJwt }: CoursesClientProps) => {
  const [activeTab, setActiveTab] = useState<"my-courses" | "available">(
    "my-courses"
  );
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [instructorsList, setInstructorsList] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Modified filter states with isFreeOnly and maxPrice
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: {
      start: "",
      end: "",
    },
    instructors: [],
    isFreeOnly: false,
    maxPrice: null,
  });

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

  // Set up keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Create a function to handle tab changes
  const handleTabChange = (tab: "my-courses" | "available") => {
    setActiveTab(tab);
    setSearchQuery(""); // Reset search when changing tabs
    resetFilters(); // Reset filters when changing tabs
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

  // Fetch all instructors for filter dropdown
  const fetchInstructors = async () => {
    try {
      const response = await courseApi.getInstructors();
      if (response && response.data) {
        setInstructorsList(response.data);
      }
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

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

      if (response && response.data) {
        setMyCourses(response.data);
        if (activeTab === "my-courses") {
          setFilteredCourses(response.data);
        }
      } else {
        console.log("No courses found or invalid response format");
        setMyCourses([]);
        if (activeTab === "my-courses") {
          setFilteredCourses([]);
        }
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
      // Use the updated getAvailableCourses function from courseApi
      const response = await courseApi.getAvailableCourses();

      if (response && response.data) {
        setAvailableCourses(response.data);
        if (activeTab === "available") {
          setFilteredCourses(response.data);
        }
      } else {
        console.log("No available courses found or invalid response format");
        setAvailableCourses([]);
        if (activeTab === "available") {
          setFilteredCourses([]);
        }
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
    fetchInstructors(); // Always fetch instructors for filter options

    if (activeTab === "my-courses") {
      fetchUserCourses();
    } else {
      fetchAvailableCourses();
    }
  }, [activeTab, isAuthenticated, userJwt]);

  // Apply filters when they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filterOptions, myCourses, availableCourses, activeTab]);

  // Apply filters and search with updated price filtering logic
  const applyFiltersAndSearch = () => {
    // Select the appropriate course list based on active tab
    const courses = activeTab === "my-courses" ? myCourses : availableCourses;

    // First apply search if there is any
    let results = courses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (course) =>
          course.attributes.title.toLowerCase().includes(query) ||
          course.attributes.description.toLowerCase().includes(query)
      );
    }

    // Then apply filters
    // 1. Date filter
    if (filterOptions.dateRange.start || filterOptions.dateRange.end) {
      results = results.filter((course) => {
        const startDateMatch =
          !filterOptions.dateRange.start ||
          !course.attributes.startDate ||
          new Date(course.attributes.startDate) >=
            new Date(filterOptions.dateRange.start);

        const endDateMatch =
          !filterOptions.dateRange.end ||
          !course.attributes.endDate ||
          new Date(course.attributes.endDate) <=
            new Date(filterOptions.dateRange.end);

        return startDateMatch && endDateMatch;
      });
    }

    // 2. Instructor filter
    if (filterOptions.instructors.length > 0) {
      results = results.filter((course) => {
        if (
          !course.attributes.instructors ||
          !course.attributes.instructors.data
        ) {
          return false;
        }

        // Check if any of the selected instructors are in this course
        return course.attributes.instructors.data.some((instructor) =>
          filterOptions.instructors.includes(instructor.id)
        );
      });
    }

    // 3. Updated Price filters for "Available" tab
    if (activeTab === "available") {
      // Apply free only filter if selected
      if (filterOptions.isFreeOnly) {
        results = results.filter(
          (course) => course.attributes.isFree || course.attributes.price === 0
        );
      }
      // Apply maxPrice filter if set and not using free only
      else if (filterOptions.maxPrice !== null) {
        results = results.filter(
          (course) => course.attributes.price <= filterOptions.maxPrice!
        );
      }
    }

    setFilteredCourses(results);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterOptions({
      dateRange: {
        start: "",
        end: "",
      },
      instructors: [],
      isFreeOnly: false,
      maxPrice: null,
    });
    setSearchQuery("");
  };

  // Handle instructor selection
  const handleInstructorToggle = (instructorId: number) => {
    setFilterOptions((prev) => {
      const updatedInstructors = prev.instructors.includes(instructorId)
        ? prev.instructors.filter((id) => id !== instructorId) // Remove if already selected
        : [...prev.instructors, instructorId]; // Add if not selected

      return {
        ...prev,
        instructors: updatedInstructors,
      };
    });
  };

  // Handle price input change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If value is empty, set maxPrice to null
    if (!value) {
      setFilterOptions((prev) => ({
        ...prev,
        maxPrice: null,
      }));
      return;
    }

    // Otherwise, parse as number
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setFilterOptions((prev) => ({
        ...prev,
        maxPrice: price,
        // Turn off freeOnly when setting a specific price
        isFreeOnly: false,
      }));
    }
  };

  // Handle free only toggle
  const handleFreeOnlyToggle = (checked: boolean) => {
    setFilterOptions((prev) => ({
      ...prev,
      isFreeOnly: checked,
      // Reset maxPrice when toggling freeOnly on
      maxPrice: checked ? null : prev.maxPrice,
    }));
  };

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

  // Handle opening an enrolled course - redirect to the overview page
  const handleOpenCourse = (slug: string) => {
    router.push(`/dashboard/user/courses/${slug}/overview`);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;

    // Count date filters
    if (filterOptions.dateRange.start) count++;
    if (filterOptions.dateRange.end) count++;

    // Count instructor filters
    count += filterOptions.instructors.length;

    // Count price filters
    if (filterOptions.isFreeOnly) count++;
    if (filterOptions.maxPrice !== null) count++;

    return count;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row with title and search/filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Courses
        </h1>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search (⌘K)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Section with tabs and filter button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        {/* Tab navigation - moved to left */}
        <div className="mb-4 md:mb-0 border-b border-gray-200 w-full md:w-auto">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("my-courses")}
              className={`py-2 px-1 border-b-2 font-medium ${
                activeTab === "my-courses"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Courses
            </button>

            <button
              onClick={() => handleTabChange("available")}
              className={`py-2 px-1 border-b-2 font-medium ${
                activeTab === "available"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Available to Purchase
            </button>
          </nav>
        </div>

        {/* Filters button - moved to right */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg border ${
            showFilters || countActiveFilters() > 0
              ? "bg-purple-100 border-purple-300 text-purple-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
          {countActiveFilters() > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-purple-600 text-white rounded-full">
              {countActiveFilters()}
            </span>
          )}
        </button>
      </div>

      {/* Course count */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {filteredCourses.length}{" "}
          {filteredCourses.length === 1 ? "item" : "items"}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Filter Courses</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="flex space-x-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start
                  </label>
                  <input
                    type="date"
                    value={filterOptions.dateRange.start}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        dateRange: {
                          ...filterOptions.dateRange,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End
                  </label>
                  <input
                    type="date"
                    value={filterOptions.dateRange.end}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        dateRange: {
                          ...filterOptions.dateRange,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Instructors filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Instructors
              </label>
              <div className="relative">
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {instructorsList.length > 0 ? (
                    instructorsList.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex items-center py-1"
                      >
                        <input
                          type="checkbox"
                          id={`instructor-${instructor.id}`}
                          checked={filterOptions.instructors.includes(
                            instructor.id
                          )}
                          onChange={() => handleInstructorToggle(instructor.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`instructor-${instructor.id}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {instructor.attributes.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-1">
                      Loading instructors...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Updated Price filter - only show for Available tab */}
            {activeTab === "available" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  Price
                </label>
                <div className="space-y-3">
                  {/* Free only checkbox */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.isFreeOnly}
                      onChange={(e) => handleFreeOnlyToggle(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Free only
                    </span>
                  </label>

                  {/* Price under input */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Price under
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                        value={
                          filterOptions.maxPrice !== null
                            ? filterOptions.maxPrice
                            : ""
                        }
                        onChange={handleMaxPriceChange}
                        disabled={filterOptions.isFreeOnly}
                        className={`w-full pl-7 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          filterOptions.isFreeOnly ? "bg-gray-100" : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          {/* My Courses tab content */}
          {activeTab === "my-courses" && (
            <>
              {/* Empty state for authenticated users with no courses */}
              {isAuthenticated && filteredCourses.length === 0 ? (
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
                    {searchQuery || countActiveFilters() > 0
                      ? "No courses match your search or filters"
                      : "No courses yet"}
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    {searchQuery || countActiveFilters() > 0
                      ? "Try adjusting your search terms or filters"
                      : "You haven't enrolled in any courses yet.\nExplore our available courses to start your learning journey."}
                  </p>
                  {!(searchQuery || countActiveFilters() > 0) && (
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      onClick={() => handleTabChange("available")}
                    >
                      Browse courses
                    </button>
                  )}
                </div>
              ) : (
                // Only show course grid for authenticated users with courses
                isAuthenticated && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-video bg-gray-200">
                          <img
                            src={getCourseImageUrl(course)}
                            alt={course.attributes.title}
                            className="w-full h-full object-cover"
                          />
                          <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md">
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

                          {/* Date badges */}
                          {(course.attributes.startDate ||
                            course.attributes.endDate) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {course.attributes.startDate && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Start:{" "}
                                  {formatDate(course.attributes.startDate)}
                                </span>
                              )}
                              {course.attributes.endDate && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  End: {formatDate(course.attributes.endDate)}
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleOpenCourse(course.attributes.slug)
                            }
                            className="block w-full text-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                          >
                            Open
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
              {filteredCourses.length === 0 ? (
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
                    {searchQuery || countActiveFilters() > 0
                      ? "No courses match your search or filters"
                      : "No courses available"}
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    {searchQuery || countActiveFilters() > 0
                      ? "Try adjusting your search terms or filters"
                      : "There are no courses available for purchase at the moment.\nCheck back later or activate alerts to be notified when new courses arrive."}
                  </p>
                  {!(searchQuery || countActiveFilters() > 0) && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      Notify me
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-video bg-gray-200">
                        <img
                          src={getCourseImageUrl(course)}
                          alt={course.attributes.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Bookmark button */}
                        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md">
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

                        {/* Date badges */}
                        {(course.attributes.startDate ||
                          course.attributes.endDate) && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {course.attributes.startDate && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Start: {formatDate(course.attributes.startDate)}
                              </span>
                            )}
                            {course.attributes.endDate && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                End: {formatDate(course.attributes.endDate)}
                              </span>
                            )}
                          </div>
                        )}

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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesClient;
