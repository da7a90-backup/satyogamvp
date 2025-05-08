import CourseOverview from "@/components/dashboard/course/user/CourseOverview";

interface CourseOverviewPageProps {
  params: {
    slug: string;
  };
}

export default function CourseOverviewPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  return <CourseOverview slug={slug} isAuthenticated={true} />;
}
