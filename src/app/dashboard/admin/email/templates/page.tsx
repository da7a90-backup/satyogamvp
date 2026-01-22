import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import EmailTemplatesClient from '@/components/dashboard/email/EmailTemplatesClient';

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <EmailTemplatesClient />;
}
