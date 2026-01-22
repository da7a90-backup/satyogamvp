import { Suspense } from 'react';
import ProfileClient from '@/components/dashboard/settings/profileClient';

export const dynamic = 'force-dynamic';

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    }>
      <ProfileClient />
    </Suspense>
  );
}
