import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import UserApplicationsClient from '@/components/dashboard/UserApplicationsClient';

export default async function UserApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/user/applications');
  }

  return <UserApplicationsClient session={session} />;
}
