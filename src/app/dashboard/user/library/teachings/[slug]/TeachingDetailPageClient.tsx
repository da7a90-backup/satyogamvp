'use client';

import { useRouter } from 'next/navigation';
import TeachingDetailPage from '@/components/teachings/TeachingDetail';
import { TeachingData } from '@/types/Teachings';

interface TeachingDetailPageClientProps {
  teaching: any; // FastAPI teaching response
  relatedTeachings: any[];
  userId: string;
  userTier: string;
}

export default function TeachingDetailPageClient({
  teaching,
  relatedTeachings,
  userId,
  userTier,
}: TeachingDetailPageClientProps) {
  const router = useRouter();

  // Transform FastAPI response to match TeachingData interface
  const transformedTeaching: TeachingData = {
    id: teaching.id,
    type: 'post',
    slug: teaching.slug,
    link: `/dashboard/user/library/teachings/${teaching.slug}`,
    date: teaching.published_date,
    date_gmt: teaching.published_date,
    modified: teaching.published_date,
    modified_gmt: teaching.published_date,
    title: teaching.title,
    description: teaching.description || '',
    excerpt_text: teaching.description || '',
    summary: teaching.description || '',
    duration: teaching.duration ? `${Math.floor(teaching.duration / 60)} minutes` : '45 minutes',
    accessType: teaching.can_access ? 'free' : 'restricted',
    content_type: determineCategory(teaching.content_type, teaching.category),
    imageUrl: teaching.thumbnail_url || '',
    featured_media: teaching.thumbnail_url ? {
      id: 0,
      url: teaching.thumbnail_url,
      alt: teaching.title,
      mime_type: 'image/jpeg',
    } : undefined,
    cloudflare_ids: teaching.video_url ? [extractCloudflareId(teaching.video_url)] : undefined,
    podbean_ids: teaching.audio_url ? [extractPodbeanId(teaching.audio_url)] : undefined,
    content_text: teaching.text_content || '',
    transcription: teaching.text_content || '',
    preview_duration: teaching.preview_duration || 300,
  };

  // Transform related teachings
  const transformedRelated: TeachingData[] = relatedTeachings.map((t) => ({
    id: t.id,
    type: 'post',
    slug: t.slug,
    link: `/dashboard/user/library/teachings/${t.slug}`,
    date: t.published_date,
    date_gmt: t.published_date,
    modified: t.published_date,
    modified_gmt: t.published_date,
    title: t.title,
    description: t.description || '',
    excerpt_text: t.description || '',
    summary: t.description || '',
    duration: t.duration ? `${Math.floor(t.duration / 60)} minutes` : '45 minutes',
    accessType: t.can_access ? 'free' : 'restricted',
    content_type: determineCategory(t.content_type, t.category),
    imageUrl: t.thumbnail_url || '',
    featured_media: t.thumbnail_url ? {
      id: 0,
      url: t.thumbnail_url,
      alt: t.title,
      mime_type: 'image/jpeg',
    } : undefined,
  }));

  // Custom handlers for dashboard
  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <TeachingDetailPage
      data={transformedTeaching}
      relatedTeachings={transformedRelated}
      isAuthenticated={true} // Always true in dashboard
      onLoginClick={handleLoginClick}
      onSignupClick={handleSignupClick}
    />
  );
}

// Helper function to determine category type
function determineCategory(
  contentType: string,
  category?: string
): 'video_teaching' | 'guided_meditation' | 'qa' | 'essay' {
  if (contentType === 'TEXT') {
    return 'essay';
  }
  if (category?.toLowerCase().includes('meditation')) {
    return 'guided_meditation';
  }
  if (category?.toLowerCase().includes('q&a') || category?.toLowerCase().includes('qa')) {
    return 'qa';
  }
  return 'video_teaching';
}

// Helper to extract Cloudflare video ID from URL
function extractCloudflareId(url: string): string {
  // Extract ID from URL like: https://customer-xxx.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8
  const match = url.match(/\/([a-f0-9]+)\/manifest/i);
  return match ? match[1] : url;
}

// Helper to extract Podbean ID from URL
function extractPodbeanId(url: string): string {
  // Extract ID from URL like: https://www.podbean.com/media/share/pb-ID
  const match = url.match(/pb-([a-z0-9]+)/i);
  return match ? match[1] : url;
}
