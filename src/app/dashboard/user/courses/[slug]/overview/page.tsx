import CourseOverview from "@/components/dashboard/course/user/CourseOverview";

interface CourseOverviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseOverviewPage({
  params,
}: CourseOverviewPageProps) {
  const { slug } = await params;

  return <CourseOverview slug={slug} isAuthenticated={true} />;
}
