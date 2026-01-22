import { Suspense } from 'react';
import VerifyEmailClient from '@/components/auth/VerifyEmailClient';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying email...</p>
        </div>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  );
}
