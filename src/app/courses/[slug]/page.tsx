import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CourseSellingPage from '@/components/courses/CourseSellingPage';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  return <CourseSellingPage slug={slug} session={session} />;
}
