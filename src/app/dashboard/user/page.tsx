import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import UserDashboardClient from '@/components/dashboard/UserDashboardClient';

// Server-side data fetching functions
async function getFeaturedTeaching() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/teachings/?limit=1`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch teaching');

    const data = await response.json();
    return data.teachings[0] || null;
  } catch (error) {
    console.error('Error fetching featured teaching:', error);
    return null;
  }
}

async function getUpcomingEvents() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/events/?upcoming_only=true&limit=10`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch events');

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

async function getRecentTeachings() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/teachings/?limit=3`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch teachings');

    const data = await response.json();
    return data.teachings || [];
  } catch (error) {
    console.error('Error fetching recent teachings:', error);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/products/?limit=3`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch products');

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getUpcomingRetreats() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/retreats?type=online`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch retreats');

    const data = await response.json();
    const retreats = (data.retreats || []).map((retreat: any) => ({
      ...retreat,
      price: retreat.price || retreat.price_lifetime || retreat.price_limited || 195,
      fixed_date: retreat.fixed_date || computeFixedDate(retreat.start_date, retreat.end_date),
    }));
    return retreats;
  } catch (error) {
    console.error('Error fetching upcoming retreats:', error);
    return [];
  }
}

// Helper to format date
function computeFixedDate(startDate: string | null, endDate: string | null): string | null {
  if (!startDate || !endDate) return null;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}, ${year}`;
  } catch {
    return null;
  }
}

async function getUserRetreats(userId: string | undefined) {
  // Return empty if no user ID
  if (!userId) {
    return [];
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/retreats`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    // Return empty array if endpoint doesn't exist or user has no retreats
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.retreats || [];
  } catch (error) {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all data in parallel
  const [featuredTeaching, upcomingEvents, recentTeachings, featuredProducts, upcomingRetreats, userRetreats] = await Promise.all([
    getFeaturedTeaching(),
    getUpcomingEvents(),
    getRecentTeachings(),
    getFeaturedProducts(),
    getUpcomingRetreats(),
    getUserRetreats(session.user.id),
  ]);

  return (
    <UserDashboardClient
      user={session.user}
      featuredTeaching={featuredTeaching}
      upcomingEvents={upcomingEvents}
      recentTeachings={recentTeachings}
      featuredProducts={featuredProducts}
      upcomingRetreats={upcomingRetreats}
      userRetreats={userRetreats}
    />
  );
}
