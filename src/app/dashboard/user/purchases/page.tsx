import { Suspense } from 'react';
import PurchasesClient from '@/components/dashboard/PurchasesClient';

export const dynamic = 'force-dynamic';

export default function PurchasesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p>Loading purchases...</p>
        </div>
      </div>
    }>
      <PurchasesClient />
    </Suspense>
  );
}
