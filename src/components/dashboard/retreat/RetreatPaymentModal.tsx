'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Retreat } from '@/types/retreat';
import { registerForRetreat } from '@/lib/retreats-api';
import { useSession } from 'next-auth/react';

interface RetreatPaymentModalProps {
  retreat: Retreat;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

export default function RetreatPaymentModal({
  retreat,
  onClose,
  onSuccess,
}: RetreatPaymentModalProps) {
  const { data: session } = useSession();
  const [selectedAccessType, setSelectedAccessType] = useState<'lifetime' | 'limited_12day' | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const responseTilopayRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    telephone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const initializeTilopaySDK = async () => {
    if (!selectedAccessType) return;

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in your name and email address');
        return;
      }

      setProcessing(true);

      console.log('Initializing Tilopay SDK for retreat:', retreat.id);

      const selectedPrice = selectedAccessType === 'lifetime'
        ? retreat.price_lifetime
        : retreat.price_limited;

      // Create payment via backend - SAME AS COURSES
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session?.user as any)?.jwt}`,
          },
          body: JSON.stringify({
            amount: parseFloat(selectedPrice?.toString() || '0'),
            currency: 'USD',
            payment_type: 'retreat',
            reference_id: retreat.id,
            description: `Retreat Registration: ${retreat.title} - ${selectedAccessType === 'lifetime' ? 'Lifetime' : '12-Day'} Access`,
            billing_email: formData.email,
            billing_first_name: formData.firstName,
            billing_last_name: formData.lastName,
            billing_address: formData.address || 'N/A',
            billing_city: formData.city || 'N/A',
            billing_state: formData.state || 'N/A',
            billing_country: formData.country || 'US',
            billing_postal_code: formData.postalCode || '00000',
            billing_telephone: formData.telephone || '',
            // Store access_type in metadata for registration after payment
            metadata: {
              access_type: selectedAccessType
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      console.log('Got payment data from backend:', data);
      setPaymentId(data.payment_id);

      // Initialize Tilopay SDK - SAME AS COURSES
      if (typeof window.Tilopay === 'undefined') {
        throw new Error('Tilopay SDK not loaded');
      }

      const $ = window.jQuery;
      if (!$) {
        throw new Error('jQuery not loaded');
      }

      console.log('Initializing Tilopay with:', {
        token: data.key?.substring(0, 20) + '...',
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
      });

      window.Tilopay.init({
        token: data.key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
        capture: data.capture || true,
        lang: 'en',

        // Payment methods configuration
        paymentMethods: [],
        savedCards: [],

        // Configuration
        buttonCheckout: {
          show: true,
          buttonText: `Pay $${selectedPrice}`,
          buttonActionAfter: async function(response: any) {
            console.log('Payment completed:', response);

            // Register user for retreat with payment
            try {
              await registerForRetreat(retreat.id, selectedAccessType, data.payment_id);

              // Success
              setProcessing(false);
              onSuccess();
            } catch (error: any) {
              console.error('Registration error:', error);
              alert(error.message || 'Failed to complete registration');
              setProcessing(false);
            }
          }
        },

        // Render in specific container
        container: responseTilopayRef.current,

        // Callbacks
        onError: function(error: any) {
          console.error('Tilopay error:', error);
          alert('Payment failed. Please try again.');
          setProcessing(false);
        },

        onCancel: function() {
          console.log('Payment cancelled by user');
          setProcessing(false);
        }
      });

      setSdkInitialized(true);

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      alert(error.message || 'Failed to initialize payment');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2
            className="text-2xl font-semibold text-black"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {showPayment ? 'Complete Payment' : 'Choose Access Type'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={processing}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showPayment ? (
            // Access Type Selection
            <div className="space-y-4">
              <p
                className="text-gray-600 mb-6"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Select your access type for "{retreat.title}"
              </p>

              {/* Lifetime Access Option */}
              {retreat.price_lifetime && retreat.price_lifetime > 0 && (
                <div
                  onClick={() => setSelectedAccessType('lifetime')}
                  className={`
                    border-2 rounded-lg p-6 cursor-pointer transition-all
                    ${
                      selectedAccessType === 'lifetime'
                        ? 'border-[#7D1A13] bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-xl font-semibold text-black"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      Lifetime Access
                    </h3>
                    <span
                      className="text-2xl font-bold text-[#7D1A13]"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      ${retreat.price_lifetime.toFixed(0)}
                    </span>
                  </div>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    Unlimited access to all retreat content forever
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Lifetime access to all sessions
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Video and audio recordings
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Access to retreat forum
                    </li>
                  </ul>
                </div>
              )}

              {/* 12-Day Limited Access Option */}
              {retreat.price_limited && retreat.price_limited > 0 && (
                <div
                  onClick={() => setSelectedAccessType('limited_12day')}
                  className={`
                    border-2 rounded-lg p-6 cursor-pointer transition-all
                    ${
                      selectedAccessType === 'limited_12day'
                        ? 'border-[#7D1A13] bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-xl font-semibold text-black"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      12-Day Access
                    </h3>
                    <span
                      className="text-2xl font-bold text-[#7D1A13]"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      ${retreat.price_limited.toFixed(0)}
                    </span>
                  </div>
                  <p
                    className="text-gray-600 text-sm mb-2"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    12 days of access starting <span className="font-semibold">after the retreat ends</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      12-day access period (after retreat ends)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All videos and audio
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Forum access during period
                    </li>
                  </ul>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => setShowPayment(true)}
                disabled={!selectedAccessType}
                className="
                  w-full mt-6 px-6 py-3 bg-[#7D1A13] text-white rounded-lg
                  font-semibold hover:opacity-90 transition-opacity
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            // Payment Form - MATCHING COURSES PATTERN
            <div>
              {!sdkInitialized ? (
                // Billing Information Form
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Billing Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7D1A13]"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowPayment(false)}
                      disabled={processing}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={initializeTilopaySDK}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Proceed to Payment</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Tilopay Payment Form Container
                <div>
                  <div
                    ref={responseTilopayRef}
                    className="min-h-[400px]"
                  ></div>

                  {processing && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-12 w-12 text-[#7D1A13] animate-spin mb-4" />
                      <p className="text-gray-600">Processing payment...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
