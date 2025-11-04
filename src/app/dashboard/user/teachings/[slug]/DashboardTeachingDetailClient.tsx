'use client';

import { useRouter } from 'next/navigation';
import TeachingDetailPage from '@/components/teachings/TeachingDetail';
import { TeachingData } from '@/types/Teachings';

interface DashboardTeachingDetailClientProps {
  teaching: any;
  relatedTeachings: any[];
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  accessToken: string;
}

export default function DashboardTeachingDetailClient({
  teaching,
  relatedTeachings: relatedTeachingsData,
  isLoggedIn,
  userEmail,
  userName,
  accessToken,
}: DashboardTeachingDetailClientProps) {
  const router = useRouter();

  // Transform backend API teaching to match TeachingData interface
  const transformedTeaching = {
    id: teaching.id,
    slug: teaching.slug,
    title: teaching.title,
    description: teaching.description || '',
    excerpt_text: teaching.description || '',
    date: teaching.published_date,
    content_type: teaching.content_type?.toLowerCase() || 'video_teaching',
    accessType: teaching.can_access ? 'free' : 'restricted',
    cloudflare_ids: teaching.cloudflare_ids || [],
    podbean_ids: teaching.podbean_ids || [],
    youtube_ids: teaching.youtube_ids || [],
    preview_duration: teaching.preview_duration || 30,
    content_text: teaching.text_content || '',
    transcription: teaching.text_content || '',
    featured_media: teaching.thumbnail_url
      ? { url: teaching.thumbnail_url }
      : null,
    imageUrl: teaching.thumbnail_url || '',
  };

  // Debug logging
  console.log('[DashboardTeachingDetailClient] Raw teaching from backend:', {
    title: teaching.title,
    cloudflare_ids: teaching.cloudflare_ids,
    youtube_ids: teaching.youtube_ids,
    can_access: teaching.can_access,
  });
  console.log('[DashboardTeachingDetailClient] Transformed teaching:', {
    title: transformedTeaching.title,
    cloudflare_ids: transformedTeaching.cloudflare_ids,
    youtube_ids: transformedTeaching.youtube_ids,
    accessType: transformedTeaching.accessType,
  });

  // Transform related teachings
  const relatedTeachings = relatedTeachingsData.map((t: any) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description || '',
    excerpt_text: t.description || '',
    date: t.published_date,
    content_type: t.content_type?.toLowerCase() || 'video_teaching',
    accessType: t.can_access ? 'free' : 'restricted',
    cloudflare_ids: t.cloudflare_ids || [],
    podbean_ids: t.podbean_ids || [],
    youtube_ids: t.youtube_ids || [],
    preview_duration: t.preview_duration || 30,
    content_text: t.text_content || '',
    transcription: t.text_content || '',
    featured_media: t.thumbnail_url ? { url: t.thumbnail_url } : null,
    imageUrl: t.thumbnail_url || '',
  }));

  return (
    <div className="bg-[#FAF8F1] min-h-screen">
      <TeachingDetailPage
        data={transformedTeaching as TeachingData}
        relatedTeachings={relatedTeachings as TeachingData[]}
        isAuthenticated={isLoggedIn}
        accessToken={accessToken}
        onLoginClick={() => router.push('/login')}
        onSignupClick={() => router.push('/signup')}
      />
    </div>
  );
}
