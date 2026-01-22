import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CoursesManagementClient from '@/components/dashboard/courses/CoursesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/admin/courses');
  }

  // TODO: Add proper admin role check here
  // For now, we'll just ensure user is authenticated

  return <CoursesManagementClient />;
}
