import { Suspense } from 'react';
import Script from 'next/script';
import DonationCheckoutClient from '@/components/donation/DonationCheckoutClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <>
      {/* Load jQuery (required by Tilopay SDK) */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      {/* Load Tilopay SDK V2 */}
      <Script
        src="https://app.tilopay.com/sdk/v2/sdk_tpay.min.js"
        strategy="afterInteractive"
      />

      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      }>
        <DonationCheckoutClient />
      </Suspense>
    </>
  );
}
