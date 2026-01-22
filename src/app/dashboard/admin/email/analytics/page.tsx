import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import EmailAnalyticsClient from '@/components/dashboard/email/EmailAnalyticsClient';

export default async function EmailAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <EmailAnalyticsClient />;
}
