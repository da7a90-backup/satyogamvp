import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import CustomAnalyticsClient from '@/components/dashboard/analytics/CustomAnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function CustomAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <CustomAnalyticsClient />;
}
