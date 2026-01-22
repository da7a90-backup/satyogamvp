import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BeefreeBuilderClient from '@/components/dashboard/email/BeefreeBuilderClient';

export const dynamic = 'force-dynamic';

export default async function BeefreeBuilderPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <BeefreeBuilderClient />;
}
