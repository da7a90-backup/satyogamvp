import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CourseDetailPage from "@/components/dashboard/course/user/CourseDetailPage";
import { courseApi } from "@/lib/courseApi";
import { notFound } from "next/navigation";

export default async function CourseDetailRoute({
  params,
}: {
  params: { slug: string };
}) {
  // Get the user session
  const session = await getServerSession(authOptions);

  // Debug - log the session information
  console.log(
    "Course detail page - session:",
    JSON.stringify(
      {
        authenticated: !!session,
        user: session?.user,
        role: session?.user?.role,
      },
      null,
      2
    )
  );

  // Check if the course exists
  try {
    const courseResponse = await courseApi.getCourseBySlug(params.slug);

    if (!courseResponse) {
      return notFound();
    }

    // Pass the slug to the client component
    return <CourseDetailPage slug={params.slug} />;
  } catch (error) {
    console.error(`Error fetching course with slug "${params.slug}":`, error);
    return notFound();
  }
}
