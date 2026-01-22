import { Suspense } from 'react';
import HiddenTagsPageClient from '@/components/dashboard/hidden-tags/HiddenTagsPageClient';

export const dynamic = 'force-dynamic';

export default function HiddenTagsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <HiddenTagsPageClient />
    </Suspense>
  );
}
