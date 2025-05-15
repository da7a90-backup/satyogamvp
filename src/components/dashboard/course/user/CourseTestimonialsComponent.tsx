"use client";

import { useState, useEffect, useRef } from "react";
import { courseCommentApi } from "@/lib/courseCommentApi";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CourseTestimonialsProps {
  courseId: string;
  maxDisplay?: number; // Optional: limit how many testimonials to show
}

interface Testimonial {
  id: number;
  attributes: {
    comment: string;
    createdAt: string;
    user: {
      data: {
        id: number;
        attributes: {
          username: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        };
      };
    };
  };
}

const CourseTestimonialsComponent = ({
  courseId,
  maxDisplay = 3,
}: CourseTestimonialsProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [courseId]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await courseCommentApi.getComments(
        courseId,
        "testimonial" // This will fetch comments where sectionType is 'testimonial' and classIndex is null
      );

      setTestimonials(response.data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setError("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  // Get the display name for a user
  const getUserDisplayName = (user: any): string => {
    if (user?.attributes) {
      // Try to use firstName and lastName if available
      if (user.attributes.firstName && user.attributes.lastName) {
        return `${user.attributes.firstName} ${user.attributes.lastName}`;
      }

      // Fall back to username
      if (user.attributes.username) {
        return user.attributes.username;
      }

      // Last resort, use email (but hide part of it for privacy)
      if (user.attributes.email) {
        const emailParts = user.attributes.email.split("@");
        return `${emailParts[0]}@...`;
      }
    }

    // If all else fails
    return "Student";
  };

  // Get user location/position - for now we'll just use a placeholder
  const getUserLocation = (user: any): string => {
    // In a real system, this would pull from user profile data
    return "Course Student";
  };

  // Handle testimonial navigation
  const handleNext = () => {
    if (testimonials.length <= maxDisplay) return;

    setCurrentPage((prev) => {
      const totalPages = Math.ceil(testimonials.length / maxDisplay);
      return (prev + 1) % totalPages;
    });
  };

  const handlePrevious = () => {
    if (testimonials.length <= maxDisplay) return;

    setCurrentPage((prev) => {
      const totalPages = Math.ceil(testimonials.length / maxDisplay);
      return (prev - 1 + totalPages) % totalPages;
    });
  };

  // Function to truncate long testimonials
  const truncateText = (text: string, maxLength = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get current page of testimonials
  const getCurrentTestimonials = () => {
    const start = currentPage * maxDisplay;
    const end = start + maxDisplay;
    return testimonials.slice(start, end);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No testimonials yet.</div>
    );
  }

  const totalPages = Math.ceil(testimonials.length / maxDisplay);

  return (
    <div className="relative" ref={testimonialRef}>
      {/* Testimonial container with navigation arrows */}
      <div className="relative">
        {/* Navigation arrows - only show if we have more than maxDisplay testimonials */}
        {testimonials.length > maxDisplay && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Previous testimonials"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={handleNext}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Next testimonials"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Testimonial cards - show current page */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getCurrentTestimonials().map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <p className="text-gray-700 italic mb-6 min-h-[120px]">
                "{truncateText(testimonial.attributes.comment)}"
              </p>
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-medium">
                    {getUserDisplayName(
                      testimonial.attributes.user.data
                    ).charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getUserDisplayName(testimonial.attributes.user.data)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getUserLocation(testimonial.attributes.user.data)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots - only show if we have more than maxDisplay testimonials */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 w-2 rounded-full ${
                index === currentPage ? "bg-black" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseTestimonialsComponent;
