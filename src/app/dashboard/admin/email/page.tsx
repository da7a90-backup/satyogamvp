import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import EmailCampaignsClient from '@/components/dashboard/email/EmailCampaignsClient';

export const dynamic = 'force-dynamic';

export default async function EmailCampaignsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Check if user is admin
  // if (!session.user.isAdmin) {
  //   redirect('/dashboard/user');
  // }

  return <EmailCampaignsClient />;
}
