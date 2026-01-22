import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import MixpanelEventsClient from '@/components/dashboard/email/MixpanelEventsClient';

export const dynamic = 'force-dynamic';

export default async function MixpanelEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <MixpanelEventsClient />;
}
