/**
 * Tilopay Embedded Payment Component
 *
 * This component handles in-page embedded payments with Tilopay.
 * It integrates with the backend API to create payment sessions
 * and embeds the Tilopay form directly in the page.
 */

'use client';

import { useState, useEffect } from 'react';
import { backendAPI } from '@/lib/backend-api';

// Declare Tilopay type for TypeScript
declare global {
  interface Window {
    Tilopay?: {
      init: (config: TilopayConfig) => void;
    };
  }
}

interface TilopayConfig {
  key: string;
  amount: string;
  currency: string;
  description: string;
  orderId: string;
  email: string;
  name: string;
  signature: string;
  container: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

interface PaymentData {
  key: string;
  amount: string;
  currency: string;
  description: string;
  orderId: string;
  email: string;
  name: string;
  signature: string;
  [key: string]: any;
}

interface TilopayEmbedProps {
  amount: number;
  paymentType: 'course' | 'retreat' | 'membership' | 'product' | 'donation';
  referenceId?: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  buttonText?: string;
  buttonClassName?: string;
}

export default function TilopayEmbed({
  amount,
  paymentType,
  referenceId,
  description,
  onSuccess,
  onError,
  onCancel,
  buttonText,
  buttonClassName,
}: TilopayEmbedProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Check if Tilopay SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (typeof window !== 'undefined' && window.Tilopay) {
        setSdkLoaded(true);
      }
    };

    // Check immediately
    checkSDK();

    // Also check after a delay in case it's still loading
    const timer = setTimeout(checkSDK, 1000);

    return () => clearTimeout(timer);
  }, []);

  const initiatePayment = async () => {
    setLoading(true);

    try {
      // Call backend API to create payment intent
      let paymentIntent;

      switch (paymentType) {
        case 'course':
          if (!referenceId) throw new Error('Course ID required');
          paymentIntent = await backendAPI.payments.createCoursePayment(referenceId);
          break;

        case 'membership':
          if (!referenceId) throw new Error('Membership tier required');
          // Assume referenceId format: "tier:frequency" (e.g., "PRAGYANI:monthly")
          const [tier, frequency] = referenceId.split(':');
          paymentIntent = await backendAPI.payments.createMembershipPayment(tier, frequency);
          break;

        case 'retreat':
          if (!referenceId) throw new Error('Retreat ID required');
          // Assume referenceId format: "retreatId:accessType"
          const [retreatId, accessType] = referenceId.split(':');
          paymentIntent = await backendAPI.payments.createRetreatPayment(retreatId, accessType);
          break;

        case 'donation':
          paymentIntent = await backendAPI.payments.createDonation(amount, referenceId);
          break;

        default:
          throw new Error(`Payment type ${paymentType} not yet implemented`);
      }

      // Store payment data
      setPaymentData(paymentIntent.payment_data);
      setPaymentId(paymentIntent.payment_id);

      // Initialize Tilopay embedded form after a short delay
      setTimeout(() => {
        initializeTilopayForm(paymentIntent.payment_data, paymentIntent.payment_id);
      }, 100);

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      onError(error.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const initializeTilopayForm = (data: PaymentData, paymentId: string) => {
    // Check if Tilopay SDK is loaded
    if (!sdkLoaded || typeof window.Tilopay === 'undefined') {
      onError('Tilopay SDK not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      // Initialize embedded payment form
      window.Tilopay!.init({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        orderId: data.orderId,
        email: data.email,
        name: data.name,
        signature: data.signature,
        container: 'tilopay-container',
        onSuccess: (response: any) => {
          console.log('Payment successful:', response);
          setLoading(false);
          onSuccess(paymentId);
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          setLoading(false);
          onError(error.message || 'Payment failed');
        },
        onCancel: () => {
          console.log('Payment cancelled');
          setLoading(false);
          if (onCancel) {
            onCancel();
          } else {
            onError('Payment cancelled');
          }
        },
      });
    } catch (error: any) {
      console.error('Tilopay initialization error:', error);
      onError('Failed to initialize payment form');
      setLoading(false);
    }
  };

  // Default button styling matching the dashboard design
  const defaultButtonClassName = `
    px-6 py-3 rounded-lg font-semibold transition-all
    bg-[#7D1A13] text-white hover:opacity-90
    shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!paymentData ? (
        <div className="text-center">
          <button
            onClick={initiatePayment}
            disabled={loading || !sdkLoaded}
            className={buttonClassName || defaultButtonClassName}
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {loading
              ? 'Initializing payment...'
              : !sdkLoaded
              ? 'Loading payment system...'
              : buttonText || `Pay $${amount.toFixed(2)}`}
          </button>

          {!sdkLoaded && (
            <p className="mt-2 text-sm text-gray-500">
              Loading payment system...
            </p>
          )}
        </div>
      ) : (
        <div>
          {/* Payment information card */}
          <div
            className="bg-white border rounded-lg p-6 mb-6"
            style={{ borderColor: '#D2D6DB' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111927',
                }}
              >
                Payment Details
              </span>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#7D1A13',
                }}
              >
                ${amount.toFixed(2)}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#384250',
              }}
            >
              {description}
            </p>
          </div>

          {/* Tilopay form container */}
          <div
            className="bg-white border rounded-lg p-6 min-h-[400px]"
            style={{ borderColor: '#D2D6DB' }}
          >
            <div id="tilopay-container"></div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
                <p
                  className="mt-4"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#384250',
                  }}
                >
                  Processing payment...
                </p>
              </div>
            )}
          </div>

          {/* Security badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L3 3V7C3 10.5 5.5 13.5 8 15C10.5 13.5 13 10.5 13 7V3L8 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="10"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper component to load Tilopay SDK script
 * Use this in your layout or page component
 */
export function TilopayScript() {
  return (
    <script
      src="https://app.tilopay.com/sdk/v2/sdk_tpay.min.js"
      async
      defer
    />
  );
}
