import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CourseSellingPage from "@/components/courses/CourseSellingPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function DashboardCourseSellingPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  return <CourseSellingPage slug={slug} session={session} />;
}
