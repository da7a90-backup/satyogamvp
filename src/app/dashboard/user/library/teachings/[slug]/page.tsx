import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TeachingDetailPageClient from './TeachingDetailPageClient';

// API Configuration
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Fetch teaching from FastAPI backend
async function getTeachingBySlug(slug: string, token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${FASTAPI_URL}/api/teachings/${slug}`, {
      headers,
      cache: 'no-store', // Always fetch fresh data for dashboard
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching teaching ${slug}:`, error);
    return null;
  }
}

// Fetch related teachings
async function getRelatedTeachings(category?: string, currentId?: string, token?: string) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const categoryParam = category ? `?category=${encodeURIComponent(category)}&limit=10` : '?limit=10';
    const response = await fetch(`${FASTAPI_URL}/api/teachings${categoryParam}`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    // Filter out current teaching
    return data.teachings.filter((t: any) => t.id !== currentId).slice(0, 10);
  } catch (error) {
    console.error('Error fetching related teachings:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const teaching = await getTeachingBySlug(slug);

  if (!teaching) {
    return { title: 'Teaching Not Found' };
  }

  return {
    title: `${teaching.title} | Dashboard | Sat Yoga Institute`,
    description: teaching.description || '',
    openGraph: {
      title: teaching.title,
      description: teaching.description || '',
      images: teaching.thumbnail_url ? [teaching.thumbnail_url] : [],
      type: 'video.other',
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function DashboardTeachingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Dashboard is protected - this shouldn't happen but handle gracefully
    throw new Error('Unauthorized');
  }

  // Get auth token for FastAPI requests
  // @ts-ignore - accessToken is added by our auth callback
  const token = session.user.accessToken as string | undefined;

  // Fetch teaching from FastAPI backend
  const teaching = await getTeachingBySlug(slug, token);

  if (!teaching) {
    return notFound();
  }

  // Fetch related teachings
  const relatedTeachings = await getRelatedTeachings(teaching.category, teaching.id, token);

  return (
    <TeachingDetailPageClient
      teaching={teaching}
      relatedTeachings={relatedTeachings}
      userId={session.user.id}
      userTier={session.user.membershipTier || 'FREE'}
    />
  );
}
