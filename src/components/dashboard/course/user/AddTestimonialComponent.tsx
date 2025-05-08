"use client";

import { useState } from "react";
import { courseCommentApi } from "@/lib/courseCommentApi";

interface AddTestimonialProps {
  courseId: string;
  onTestimonialAdded?: () => void;
}

const AddTestimonialComponent = ({
  courseId,
  onTestimonialAdded,
}: AddTestimonialProps) => {
  const [testimonial, setTestimonial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the testimonial text
    if (!testimonial.trim()) {
      setError("Please write your testimonial first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await courseCommentApi.addComment(courseId, "testimonial", testimonial);

      // Reset form and show success message
      setTestimonial("");
      setSuccess(true);
      setIsExpanded(false);

      // Call the callback if provided
      if (onTestimonialAdded) {
        onTestimonialAdded();
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      setError("Failed to submit your testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsExpanded(!isExpanded);
    // Reset error when toggling
    setError(null);
  };

  return (
    <div className="mt-8 mb-12">
      {!isExpanded ? (
        <button
          onClick={toggleForm}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Share Your Experience
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Share Your Experience</h3>
          <form onSubmit={submitTestimonial}>
            <textarea
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              rows={5}
              placeholder="Share your thoughts about this course..."
              disabled={isSubmitting}
            ></textarea>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          Thank you for sharing your testimonial! It has been submitted
          successfully.
        </div>
      )}
    </div>
  );
};

export default AddTestimonialComponent;
