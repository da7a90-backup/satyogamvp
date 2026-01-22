import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AnalyticsDashboardClient from '@/components/dashboard/analytics/AnalyticsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <AnalyticsDashboardClient />;
}
