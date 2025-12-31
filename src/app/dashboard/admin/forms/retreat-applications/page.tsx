import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import RetreatApplicationsClient from '@/components/dashboard/forms/RetreatApplicationsClient';

export default async function RetreatApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Check if user is admin
  // if (!session.user.isAdmin) {
  //   redirect('/dashboard/user');
  // }

  return <RetreatApplicationsClient />;
}
