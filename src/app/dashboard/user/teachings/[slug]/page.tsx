import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DashboardTeachingDetailClient from './DashboardTeachingDetailClient';

// Fetch teaching from backend API
async function getTeaching(slug: string, token?: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';
    const url = `${API_URL}/api/teachings/${slug}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[getTeaching] Error:', error);
    return null;
  }
}

// Fetch related teachings - 6 most recent from same category
async function getRelatedTeachings(category: string, currentSlug: string, token?: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';
    const url = `${API_URL}/api/teachings?limit=100`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // API returns {teachings: [...], total: number} not a direct array
    const teachings = data.teachings || data;

    // Ensure teachings is an array
    if (!Array.isArray(teachings)) {
      console.error('[getRelatedTeachings] Expected array, got:', typeof teachings);
      return [];
    }

    // Filter by same category and exclude current teaching
    const sameCategory = teachings
      .filter((t: any) => t.category === category && t.slug !== currentSlug)
      .sort((a: any, b: any) =>
        new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      )
      .slice(0, 6);

    return sameCategory;
  } catch (error) {
    console.error('[getRelatedTeachings] Error:', error);
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const teaching = await getTeaching(slug);

  if (!teaching) {
    return { title: 'Teaching Not Found' };
  }

  return {
    title: `${teaching.title} | Dashboard | Sat Yoga`,
    description: teaching.description || '',
  };
}

export default async function DashboardTeachingPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/user/teachings/${slug}`);
  }

  // Get user's access token
  const accessToken = session.user.accessToken;

  // Fetch teaching
  const teaching = await getTeaching(slug, accessToken);

  if (!teaching) {
    notFound();
  }

  // Fetch related teachings (6 most recent from same category)
  const relatedTeachings = await getRelatedTeachings(teaching.category || '', teaching.slug, accessToken);

  return (
    <DashboardTeachingDetailClient
      teaching={teaching}
      relatedTeachings={relatedTeachings}
      isLoggedIn={true}
      userEmail={session.user.email || ''}
      userName={session.user.name || 'User'}
      accessToken={accessToken}
    />
  );
}
