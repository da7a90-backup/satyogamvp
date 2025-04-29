"use client";

import PaymentPage from "@/components/dashboard/course/user/PaymentPage";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { courseApi } from "@/lib/courseApi";

export default function CoursePurchasePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getCourseBySlug(slug);
        if (response && response.id) {
          setCourseId(response.id.toString());
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCourseId();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !courseId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error || "Course not found"}</p>
        </div>
      </div>
    );
  }

  return <PaymentPage courseId={courseId} courseSlug={slug} />;
}
