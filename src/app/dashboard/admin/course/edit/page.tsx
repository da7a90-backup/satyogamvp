import CourseForm from "@/components/dashboard/course/CourseForm";
import { courseApi } from "@/lib/courseApi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface EditCoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { slug } = await params;

  let courseId: string | null = null;
  let error: string | null = null;

  // Fetch the course ID by slug
  try {
    const response = await courseApi.getCourseBySlug(slug);

    if (!response) {
      error = "Course not found";
    } else {
      courseId = response.id.toString();
    }
  } catch (err) {
    console.error("Error fetching course:", err);
    error = "Failed to load course details";
  }

  if (error || !courseId) {
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <CourseForm courseId={courseId} />
    </div>
  );
}
