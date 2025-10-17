'use client';

import { useRouter } from 'next/navigation';
import TeachingDetailPage from '@/components/teachings/TeachingDetail';
import type { TeachingData } from '@/types/Teachings';

interface TeachingDetailPageClientProps {
  data: TeachingData;
  relatedTeachings: TeachingData[];
  isAuthenticated: boolean;
}

export default function TeachingDetailPageClient({ 
  data,
  relatedTeachings,
  isAuthenticated 
}: TeachingDetailPageClientProps) {
  const router = useRouter();

  return (
    <TeachingDetailPage
      data={data}
      relatedTeachings={relatedTeachings}
      isAuthenticated={isAuthenticated}
      onLoginClick={() => router.push('/login')}
      onSignupClick={() => router.push('/signup')}
    />
  );
}