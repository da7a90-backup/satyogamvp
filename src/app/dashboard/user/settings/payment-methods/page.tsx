import { Suspense } from 'react';
import PaymentMethodsClient from '@/components/dashboard/settings/payment-methodsClient';

export const dynamic = 'force-dynamic';

export default function PaymentMethodsSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    }>
      <PaymentMethodsClient />
    </Suspense>
  );
}
