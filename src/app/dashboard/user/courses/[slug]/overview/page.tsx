import { Suspense } from 'react';
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

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CourseOverview slug={slug} isAuthenticated={true} />
    </Suspense>
  );
}
