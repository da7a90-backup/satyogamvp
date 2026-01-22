import { Suspense } from 'react';
import StoreClient from '@/components/store/StoreClient';

export const dynamic = 'force-dynamic';

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p>Loading store...</p>
        </div>
      </div>
    }>
      <StoreClient />
    </Suspense>
  );
}
