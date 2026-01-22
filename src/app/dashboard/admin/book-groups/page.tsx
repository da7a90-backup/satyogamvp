import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BookGroupsAdminClient from '@/components/dashboard/admin/book-groups/BookGroupsAdminClient';

export default async function AdminBookGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role;
  if (userRole !== 'admin') {
    redirect('/dashboard/user');
  }

  return (
    <BookGroupsAdminClient
      userJwt={session.user.accessToken || null}
    />
  );
}
