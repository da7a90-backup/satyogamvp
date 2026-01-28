'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants';

interface MembershipCheckoutClientProps {
  tier: string;
  frequency: string;
  trial: boolean;
  session: Session;
}

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

// Pricing map - displays per-month price based on billing frequency
const PRICING = {
  gyani: { monthly: 20, annual: 15 },        // $20/mo billed monthly, $15/mo billed annually ($180/year)
  pragyani: { monthly: 100, annual: 83 },    // $100/mo billed monthly, $83/mo billed annually ($996/year)
  pragyani_plus: { monthly: 142, annual: 142 }, // $142/mo billed annually only ($1704/year)
};

// Tier display names
const TIER_NAMES = {
  gyani: 'Gyani',
  pragyani: 'Pragyani',
  pragyani_plus: 'Pragyani Plus',
};

export default function MembershipCheckoutClient({
  tier,
  frequency,
  trial,
  session,
}: MembershipCheckoutClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const responseTilopayRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: session.user?.name?.split(' ')[0] || '',
    lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session.user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    telephone: '',
  });

  // Get amount based on tier and frequency
  const amount = PRICING[tier as keyof typeof PRICING][frequency as 'monthly' | 'annual'];
  const tierName = TIER_NAMES[tier as keyof typeof TIER_NAMES];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Load Tilopay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Tilopay SDK loaded');
      setIsLoading(false);
    };
    script.onerror = () => {
      setError('Failed to load payment SDK. Please refresh the page.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeTilopaySDK = async () => {
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in your name and email address');
        return;
      }

      if (!formData.address || !formData.city || !formData.state || !formData.postalCode) {
        alert('Please fill in your complete billing address');
        return;
      }

      setProcessing(true);
      setError(null);

      console.log('Initializing Tilopay SDK for membership:', { tier, frequency, trial });

      // Create payment via backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/membership`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            tier,
            frequency,
            trial: trial && tier === 'gyani',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment');
      }

      const data = await response.json();
      console.log('Got payment data from backend:', data);

      // Initialize Tilopay SDK V2
      console.log('Calling Tilopay.Init with params:', {
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
        subscription: data.is_subscription ? 1 : 0,
      });

      const initialize = await window.Tilopay.Init({
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
        capture: '1',
        redirect: `${window.location.origin}/dashboard/user?upgrade=success`,
        subscription: data.is_subscription ? 1 : 0, // CRITICAL: 1 for monthly recurring, 0 for annual one-time
        // Billing information (required for payment processing)
        billToFirstName: data.first_name,
        billToLastName: data.last_name,
        billToEmail: data.customer_email,
        billToAddress: formData.address,
        billToAddress2: '',
        billToCity: formData.city,
        billToState: formData.state,
        billToZipPostCode: formData.postalCode,
        billToCountry: formData.country,
        billToTelephone: formData.telephone || '',
      });

      console.log('Tilopay.Init response:', initialize);

      // Check if initialization was successful
      if (!initialize || initialize.message !== 'Success') {
        const errorMsg = initialize?.message || 'SDK initialization failed - no response';
        console.error('Tilopay initialization failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // SDK initialized successfully - show the payment form
      setSdkInitialized(true);

      // Auto-select first payment method if available
      if (initialize.methods && initialize.methods.length > 0) {
        setTimeout(() => {
          const methodSelect = document.getElementById('tlpy_payment_method') as HTMLSelectElement;
          if (methodSelect) {
            methodSelect.value = initialize.methods[0].id;
            console.log('Auto-selected payment method:', initialize.methods[0].id);
          }
        }, 100);
      }

      setProcessing(false);
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setSdkInitialized(false); // Reset on error
      setProcessing(false);
    }
  };

  const handleProceedToPayment = async () => {
    await initializeTilopaySDK();
  };

  const handlePayment = async () => {
    if (!sdkInitialized) {
      alert('Please click "Proceed to Payment" first to load the payment form');
      return;
    }

    // Validate form fields before submitting
    const paymentMethod = (document.getElementById('tlpy_payment_method') as HTMLSelectElement)?.value;
    const cardNumber = (document.getElementById('tlpy_cc_number') as HTMLInputElement)?.value;
    const cvv = (document.getElementById('tlpy_cvv') as HTMLInputElement)?.value;
    const expDate = (document.getElementById('tlpy_cc_expiration_date') as HTMLInputElement)?.value;

    console.log('Form validation:', {
      paymentMethod,
      cardNumber: cardNumber ? 'PRESENT' : 'MISSING',
      cvv: cvv ? 'PRESENT' : 'MISSING',
      expDate: expDate ? 'PRESENT' : 'MISSING',
    });

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!cardNumber || !cvv || !expDate) {
      alert('Please fill in all card details');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      console.log('Starting payment...');
      await window.Tilopay.startPayment();
      // Tilopay will redirect to success URL or webhook will process
      console.log('Payment initiated successfully');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F1] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#942017] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Complete Your {tierName} Membership
          </h1>
          <p className="text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {frequency === 'monthly' ? 'Monthly' : 'Annual'} Subscription
            {trial && ' • 10-Day Free Trial'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#D2D6DB] p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Error</h3>
                  <p className="text-sm text-red-700" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{error}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-[#942017] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Billing Information</h2>

            {/* Billing Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="CA"
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Proceed to Payment Button */}
            {!sdkInitialized && (
              <div className="mt-8">
                <button
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full bg-[#942017] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#7D1A13] disabled:bg-[#D2D6DB] disabled:cursor-not-allowed transition-colors"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading Payment Form...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            )}

            {/* Payment Form (injected by Tilopay SDK) - Always rendered but hidden until SDK initialized */}
            <div className="mt-8" style={{ display: sdkInitialized ? 'block' : 'none' }}>
              <h2 className="text-xl font-bold text-[#942017] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Payment Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      Payment Method
                    </label>
                    <select
                      id="tlpy_payment_method"
                      className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    ></select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="tlpy_cc_number"
                      name="tlpy_cc_number"
                      placeholder="4012 0000 0002 0071"
                      className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="tlpy_cc_expiration_date"
                        name="tlpy_cc_expiration_date"
                        placeholder="12/26"
                        className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#414651] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        id="tlpy_cvv"
                        name="tlpy_cvv"
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* 3DS iframe container */}
                  <div id="responseTilopay" ref={responseTilopayRef}></div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-[#942017] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#7D1A13] disabled:bg-[#D2D6DB] disabled:cursor-not-allowed transition-colors"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay $${frequency === 'monthly' ? amount : amount * 12}`
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#6B7280] text-center mt-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Your payment is secure and encrypted. By completing this purchase, you agree to our Terms of Service.
                </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#D2D6DB] p-6 sticky top-4">
              <h2 className="text-xl font-bold text-[#942017] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Plan:</span>
                  <span className="font-semibold text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{tierName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Billing:</span>
                  <span className="font-semibold capitalize text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{frequency}</span>
                </div>
                {trial && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Trial:</span>
                    <span className="font-semibold text-[#059669]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>10 days free</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#D2D6DB] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {frequency === 'monthly' ? 'Monthly Total' : 'Annual Total'}
                  </span>
                  <span className="text-2xl font-bold text-[#942017]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    ${frequency === 'monthly' ? amount : amount * 12}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {frequency === 'monthly' ? 'Billed monthly' : `Billed annually ($${amount}/month)`}
                </p>
              </div>

              {trial && (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-[#065F46]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>10-Day Free Trial</h3>
                      <p className="text-xs text-[#047857] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        You won't be charged today. Your first payment of ${frequency === 'monthly' ? amount : amount * 12} will be processed after your trial ends.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs text-[#6B7280]">
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {frequency === 'monthly' ? 'Cancel anytime' : 'Full year access'}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Instant access to all {tierName} features
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Secure payment processing
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
