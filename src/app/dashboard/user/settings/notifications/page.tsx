import { Suspense } from 'react';
import NotificationsClient from '@/components/dashboard/settings/NotificationsClient';

export const dynamic = 'force-dynamic';

export default function NotificationsSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    }>
      <NotificationsClient />
    </Suspense>
  );
}
