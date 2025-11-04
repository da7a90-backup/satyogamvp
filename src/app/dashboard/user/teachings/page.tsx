import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DashboardTeachingsClient from './DashboardTeachingsClient';

export const metadata: Metadata = {
  title: 'Teachings Library | Dashboard | Sat Yoga',
  description: 'Access your personal teachings library with exclusive member content.',
};

async function getTeachings() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/api/teachings?limit=1000`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.teachings;
  } catch (error) {
    console.error('[getTeachings] Error fetching teachings:', error);
    return [];
  }
}

export default async function DashboardTeachingsPage() {
  // Get authentication session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/teachings');
  }

  // Fetch all teachings
  const teachings = await getTeachings();

  // Find featured teaching (first one with featured flag for video_teaching)
  const featuredTeaching = teachings.find(
    (t: any) => t.featured === 'teaching' && t.category === 'video_teaching'
  ) || teachings.find((t: any) => t.category === 'video_teaching') || null;

  return (
    <DashboardTeachingsClient
      initialTeachings={teachings}
      initialFeaturedTeaching={featuredTeaching}
    />
  );
}
