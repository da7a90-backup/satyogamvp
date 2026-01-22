'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import RetreatsClient from './RetreatsClient';

interface RetreatsPageClientProps {
  initialUserRetreats: any[];
  initialAvailableRetreats: any[];
}

export default function RetreatsPageClient({
  initialUserRetreats,
  initialAvailableRetreats,
}: RetreatsPageClientProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [userRetreats, setUserRetreats] = useState(initialUserRetreats);
  const [availableRetreats, setAvailableRetreats] = useState(initialAvailableRetreats);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentRedirect = async () => {
      // Check for Tilopay redirect parameters
      const code = searchParams.get('code');
      const order = searchParams.get('order');
      const tilopayTransaction = searchParams.get('tilopay-transaction');

      if (code && order && session?.user?.accessToken) {
        console.log('🔍 [RETREAT PAYMENT] Payment redirect detected:', {
          code,
          order,
          tilopayTransaction,
          timestamp: new Date().toISOString(),
        });

        setIsProcessingPayment(true);
        setError(null);

        try {
          console.log('📤 [RETREAT PAYMENT] Calling /api/payments/confirm-redirect...');

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/confirm-redirect`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.user.accessToken}`,
              },
              body: JSON.stringify({
                code,
                order,
                'tilopay-transaction': tilopayTransaction,
                brand: searchParams.get('brand'),
                'last-digits': searchParams.get('last-digits'),
              }),
            }
          );

          console.log('📥 [RETREAT PAYMENT] Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ [RETREAT PAYMENT] Payment confirmed successfully:', data);

            // Refetch retreats to get updated list with new registration
            console.log('🔄 [RETREAT PAYMENT] Refetching retreats...');
            await refetchRetreats();

            // Clean up URL by removing payment parameters
            console.log('🧹 [RETREAT PAYMENT] Cleaning up URL parameters...');
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            console.log('🎉 [RETREAT PAYMENT] Payment processing complete!');
          } else {
            const errorData = await response.json();
            console.error('❌ [RETREAT PAYMENT] Payment confirmation failed:', errorData);
            setError(errorData.detail || 'Payment confirmation failed. Please contact support.');
          }
        } catch (err) {
          console.error('❌ [RETREAT PAYMENT] Error confirming payment:', err);
          setError('Failed to confirm payment. Please refresh the page or contact support.');
        } finally {
          setIsProcessingPayment(false);
        }
      }
    };

    handlePaymentRedirect();
  }, [searchParams, session]);

  const refetchRetreats = async () => {
    if (!session?.user?.accessToken) {
      console.warn('⚠️ [RETREAT PAYMENT] Cannot refetch: No access token');
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      console.log('📡 [RETREAT PAYMENT] Fetching user registrations...');
      // Fetch user's registered retreats
      const userResponse = await fetch(`${API_BASE_URL}/api/retreats/my-registrations`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const retreats = (userData.registrations || []).map((reg: any) => ({
          ...reg.retreat,
          registered_at: reg.registered_at,
          registration_status: reg.status,
          access_type: reg.access_type,
          access_expires_at: reg.access_expires_at,
          can_access: reg.can_access,
          is_registered: true,
        }));
        console.log(`✅ [RETREAT PAYMENT] Fetched ${retreats.length} registered retreats`);
        setUserRetreats(retreats);
      } else {
        console.error('❌ [RETREAT PAYMENT] Failed to fetch user retreats:', userResponse.status);
      }

      console.log('📡 [RETREAT PAYMENT] Fetching available retreats...');
      // Fetch available retreats
      const availableResponse = await fetch(
        `${API_BASE_URL}/api/retreats/?retreat_type=online`,
        {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        console.log(`✅ [RETREAT PAYMENT] Fetched ${availableData.retreats?.length || 0} available retreats`);
        setAvailableRetreats(availableData.retreats || []);
      } else {
        console.error('❌ [RETREAT PAYMENT] Failed to fetch available retreats:', availableResponse.status);
      }
    } catch (error) {
      console.error('❌ [RETREAT PAYMENT] Error refetching retreats:', error);
    }
  };

  // Show loading overlay while processing payment
  if (isProcessingPayment) {
    return (
      <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mb-4"></div>
          <h2 className="text-xl font-semibold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
            Processing Payment...
          </h2>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Confirming your retreat registration. Please wait.
          </p>
        </div>
      </div>
    );
  }

  // Show error if payment confirmation failed
  if (error) {
    return (
      <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2" style={{ fontFamily: 'Optima, serif' }}>
              Payment Processing Error
            </h2>
            <p className="text-red-700 mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                refetchRetreats();
              }}
              className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Retry
            </button>
          </div>
          <RetreatsClient userRetreats={userRetreats} availableRetreats={availableRetreats} />
        </div>
      </div>
    );
  }

  return <RetreatsClient userRetreats={userRetreats} availableRetreats={availableRetreats} />;
}
