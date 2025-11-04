import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import TeachingDetailPageClient from './TeachingDetailPageClient';
import { TeachingData } from '@/types/Teachings';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Backend API teaching interface
interface APITeaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'MEDITATION' | 'ESSAY';
  access_level: string;
  thumbnail_url?: string;
  duration?: number;
  published_date: string;
  category?: string;
  tags?: string[];
  can_access: boolean;
  access_type: 'full' | 'preview' | 'none';
  preview_duration?: number;
  video_url?: string;
  audio_url?: string;
  text_content?: string;
  cloudflare_ids?: string[];
  youtube_ids?: string[];
  podbean_ids?: string[];
  view_count?: number;
}

async function getTeaching(slug: string): Promise<APITeaching | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';

  try {
    const response = await fetch(`${API_BASE_URL}/api/teachings/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching teaching:', error);
    return null;
  }
}

// Fetch related teachings - 6 most recent from same category
async function getRelatedTeachings(category: string, currentSlug: string): Promise<APITeaching[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';

  try {
    const response = await fetch(`${API_BASE_URL}/api/teachings?limit=100`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
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
      .filter((t: APITeaching) => t.category === category && t.slug !== currentSlug)
      .sort((a: APITeaching, b: APITeaching) =>
        new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      )
      .slice(0, 6);

    return sameCategory;
  } catch (error) {
    console.error('Error fetching related teachings:', error);
    return [];
  }
}

export default async function TeachingPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  // Fetch teaching from backend
  const teaching = await getTeaching(slug);

  if (!teaching) {
    notFound();
  }

  // Fetch related teachings (6 most recent from same category)
  const relatedTeachingsData = await getRelatedTeachings(teaching.category || '', teaching.slug);

  // Transform main teaching to match expected format
  // accessType: 'free' = fully accessible (no preview limit)
  // accessType: 'preview' = preview mode with time limit
  // accessType: 'restricted' = locked, need to upgrade
  const transformedTeaching = {
    id: teaching.id,
    slug: teaching.slug,
    title: teaching.title,
    description: teaching.description || '',
    excerpt_text: teaching.description || '',
    date: teaching.published_date,
    content_type: teaching.content_type?.toLowerCase() || 'video_teaching',
    accessType: teaching.access_type, // Use the access_type from backend directly
    cloudflare_ids: teaching.cloudflare_ids || [],
    podbean_ids: teaching.podbean_ids || [],
    youtube_ids: teaching.youtube_ids || [],
    preview_duration: teaching.preview_duration || 0, // Respect database value (0 for free, >0 for preview)
    content_text: teaching.text_content || '',
    transcription: teaching.text_content || '',
    featured_media: teaching.thumbnail_url ? { url: teaching.thumbnail_url } : null,
    imageUrl: teaching.thumbnail_url || '',
  };

  // Transform related teachings to match expected format
  const relatedTeachings = relatedTeachingsData.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description || '',
    excerpt_text: t.description || '',
    date: t.published_date,
    content_type: t.content_type?.toLowerCase() || 'video_teaching',
    accessType: t.access_type, // Use the access_type from backend directly
    cloudflare_ids: t.cloudflare_ids || [],
    podbean_ids: t.podbean_ids || [],
    youtube_ids: t.youtube_ids || [],
    preview_duration: t.preview_duration || 0, // Respect database value
    content_text: t.text_content || '',
    transcription: t.text_content || '',
    featured_media: t.thumbnail_url ? { url: t.thumbnail_url } : null,
    imageUrl: t.thumbnail_url || '',
  }));

  return (
    <TeachingDetailPageClient
      data={transformedTeaching as TeachingData}
      relatedTeachings={relatedTeachings as TeachingData[]}
      isAuthenticated={isLoggedIn}
    />
  );
}
