import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CourseDetailPage from "@/components/dashboard/course/user/CourseDetailPage";
import { courseApi } from "@/lib/courseApi";
import { notFound } from "next/navigation";

interface CourseDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseDetailRoute({
  params,
}: CourseDetailRouteProps) {
  // Properly unwrap the params object
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Get the user session
  const session = await getServerSession(authOptions);

  // Check if the course exists
  try {
    const courseResponse = await courseApi.getCourseBySlug(slug);

    if (!courseResponse) {
      return notFound();
    }

    // Pass the slug to the client component
    return <CourseDetailPage slug={slug} />;
  } catch (error) {
    console.error(`Error fetching course with slug "${slug}":`, error);
    return notFound();
  }
}
