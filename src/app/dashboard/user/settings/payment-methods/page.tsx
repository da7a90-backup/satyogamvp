'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PaymentMethod {
  id: string;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  cardholder_name?: string;
}

export const dynamic = 'force-dynamic';

export default function PaymentMethodsPage() {
  const { data: session } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Payment methods are managed by Tilopay, not stored in our database
    setIsLoading(false);
  }, [session]);

  const handleSetDefault = async (id: string) => {
    if (!session?.user?.accessToken) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/users/me/payment-methods/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPaymentMethods(
          paymentMethods.map((method) => ({
            ...method,
            is_default: method.id === id,
          }))
        );
        setMessage({ type: 'success', text: 'Default payment method updated' });
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setMessage({ type: 'error', text: 'Failed to update default payment method' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) return;
    if (!session?.user?.accessToken) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/users/me/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
        setMessage({ type: 'success', text: 'Payment method removed' });
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setMessage({ type: 'error', text: 'Failed to remove payment method' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[398px] sm:max-w-full mx-auto">
      <div className="mb-6">
        <h2 className="font-optima text-lg sm:text-2xl font-semibold text-[#181D27]">
          Payment Methods
        </h2>
        <p className="mt-1 font-avenir text-sm text-[#535862]">
          Manage your saved payment methods
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <p className="font-avenir text-sm">{message.text}</p>
        </div>
      )}

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-[#E9EAEB] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Card Icon */}
                <div className="w-14 h-10 bg-white border border-[#F5F5F5] rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="font-avenir text-xs font-semibold text-[#172B85]">
                    {method.card_type}
                  </span>
                </div>

                {/* Card Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-avenir text-sm font-medium text-[#414651]">
                      •••• •••• •••• {method.last_four}
                    </p>
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-3 py-1 bg-white border border-[#D5D7DA] rounded-lg font-avenir text-xs font-semibold text-[#414651] shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <p className="font-avenir text-sm text-[#535862] mb-2">
                    Expires {method.expiry_month}/{method.expiry_year}
                    {method.cardholder_name && ` • ${method.cardholder_name}`}
                  </p>

                  {method.is_default && (
                    <div className="flex items-center gap-1 mb-2">
                      <svg className="w-3 h-3 text-[#17B26A]" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="px-2 py-0.5 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full font-avenir text-xs font-medium text-[#067647]">
                        Default
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E9EAEB]">
                    <svg className="w-4 h-4 text-[#A4A7AE]" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M2.67 7.33V6c0-2.21 1.79-4 4-4h2.66c2.21 0 4 1.79 4 4v1.33M4.67 14h6.66c.73 0 1.34-.6 1.34-1.33V8.67c0-.74-.6-1.34-1.34-1.34H4.67c-.74 0-1.34.6-1.34 1.34v4c0 .73.6 1.33 1.34 1.33z"/>
                    </svg>
                    <p className="font-avenir text-sm text-[#535862]">
                      Securely stored with Tilopay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E9EAEB] rounded-xl p-8 text-center mb-6">
          <p className="font-avenir text-sm text-[#535862]">
            No payment methods saved
          </p>
        </div>
      )}

      {/* Add Payment Method CTA */}
      <div className="bg-white border border-[#E9EAEB] rounded-xl p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="font-avenir text-lg font-semibold text-[#181D27]">
            Add Payment Method
          </h3>
          <p className="font-avenir text-sm text-[#535862] mt-1">
            Add a new card to make payments easier
          </p>
        </div>

        <button className="w-full px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg font-avenir text-sm font-semibold text-[#414651] shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <span>+</span>
          <span>Add New Card</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 0v2m0-13.81V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2v-1.19"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8V6a4 4 0 00-8 0v2"/>
          </svg>
          <div>
            <h4 className="font-avenir font-semibold text-blue-900 text-sm">Secure Payment</h4>
            <p className="font-avenir text-sm text-blue-700 mt-1">
              Your payment information is encrypted and securely processed by Tilopay. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
