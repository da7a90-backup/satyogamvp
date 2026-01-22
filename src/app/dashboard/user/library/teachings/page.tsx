import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardTeachingsClient from '@/components/dashboard/DashboardTeachingsClient';
import { getTeachingsData } from '@/lib/teachings-api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teachings Library | Dashboard | Sat Yoga Institute',
  description: 'Access your personal teachings library with progress tracking and continue watching.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardTeachingsPage() {
  // Get authentication session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Redirect to login if not authenticated
    // This shouldn't happen as dashboard is protected by middleware
    throw new Error('Unauthorized');
  }

  const userTier = session.user.membershipTier || 'FREE';

  // Fetch ALL teachings data from backend API (not limited like public page)
  const teachingLibraryData = await getTeachingsData(true);

  // TODO: Fetch continue watching data from backend
  // const continueWatching = await getContinueWatching(session.user.id);
  const continueWatching = []; // Placeholder until backend is ready

  return (
    <DashboardTeachingsClient
      data={teachingLibraryData}
      continueWatching={continueWatching}
      userTier={userTier}
      userId={session.user.id}
    />
  );
}
