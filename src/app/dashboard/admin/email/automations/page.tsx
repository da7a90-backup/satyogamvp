import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import EmailAutomationsClient from '@/components/dashboard/email/EmailAutomationsClient';

export const dynamic = 'force-dynamic';

export default async function EmailAutomationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <EmailAutomationsClient />;
}
