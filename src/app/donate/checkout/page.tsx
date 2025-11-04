'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

// Declare Tilopay global
declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

// Wrapper component to handle suspense boundary
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const responseTilopayRef = useRef<HTMLDivElement>(null);

  // Get params from URL
  const amount = searchParams.get('amount') || '50';
  const projectId = searchParams.get('project') || 'general-fund';
  const projectName = searchParams.get('projectName') || 'General Fund';

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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

  // Don't auto-initialize - wait for user to fill form and click proceed
  // SDK will be initialized when user submits the form

  const initializeTilopaySDK = async () => {
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in your name and email address');
        return;
      }

      setLoading(true);
      console.log('Initializing Tilopay SDK with user data:', formData);

      // Get SDK token from our backend with actual user data
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'USD',
          payment_type: 'donation',
          reference_id: projectId,
          description: `Donation to ${projectName}`,
          billing_email: formData.email,
          billing_first_name: formData.firstName,
          billing_last_name: formData.lastName,
          billing_address: formData.address || 'N/A',
          billing_city: formData.city || 'N/A',
          billing_state: formData.state || 'N/A',
          billing_country: formData.country || 'US',
          billing_postal_code: formData.postalCode || '00000',
          billing_telephone: formData.telephone || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      console.log('Got payment data from backend:', data);

      // Initialize Tilopay SDK with token (API key)
      // Required parameters: token, currency, amount, orderNumber
      // SDK validates: billToFirstName, billToLastName, billToAddress, billToCountry, billToEmail
      console.log('Calling Tilopay.Init with params:', {
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
      });

      const initialize = await window.Tilopay.Init({
        token: data.tilopay_key,  // API key is passed as "token" parameter
        currency: data.currency,
        amount: data.amount,  // Use amount from backend to ensure it matches the payment record
        orderNumber: data.order_number,
        capture: '1',
        redirect: `${window.location.origin}/donate/thank-you`,
        subscription: 0,
        // Billing information (required for payment processing)
        billToFirstName: data.first_name,
        billToLastName: data.last_name,
        billToEmail: data.customer_email,
        billToAddress: data.address,
        billToAddress2: '',
        billToCity: data.city,
        billToState: data.state,
        billToZipPostCode: data.zip_code,
        billToCountry: data.country,
        billToTelephone: data.telephone || '',
      });

      console.log('Tilopay.Init response:', initialize);
      console.log('Response type:', typeof initialize);
      console.log('Response message:', initialize?.message);
      console.log('Response methods:', initialize?.methods);
      console.log('Response cards:', initialize?.cards);

      // Check if initialization was successful
      if (!initialize || initialize.message !== 'Success') {
        const errorMsg = initialize?.message || 'SDK initialization failed - no response';
        console.error('Tilopay initialization failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (initialize.methods) {
        setPaymentMethods(initialize.methods);
        // Auto-select first payment method if available
        setTimeout(() => {
          const methodSelect = document.getElementById('tlpy_payment_method') as HTMLSelectElement;
          if (methodSelect && initialize.methods.length > 0) {
            methodSelect.value = initialize.methods[0].id;
            console.log('Auto-selected payment method:', initialize.methods[0].id);
          }
        }, 100);
      }
      if (initialize.cards) {
        setSavedCards(initialize.cards);
      }

      setSdkInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize Tilopay:', error);
      alert('Failed to initialize payment system. Please try again.');
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    // Initialize SDK with user's form data
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

    // Check if responseTilopay div exists
    const responseTilopayDiv = document.getElementById('responseTilopay');
    console.log('responseTilopay div exists:', !!responseTilopayDiv);
    console.log('responseTilopay div innerHTML:', responseTilopayDiv?.innerHTML);

    try {
      setLoading(true);
      console.log('Starting payment with Tilopay SDK...');
      console.log('Current Tilopay options:', (window as any).tlpy_options);

      // Call Tilopay's startPayment method
      // This will validate the form and process the payment
      const payment = await window.Tilopay.startPayment();
      console.log('Payment response:', payment);
      console.log('Payment response type:', typeof payment);
      console.log('Payment response keys:', Object.keys(payment));

      // Check the response
      if (!payment) {
        throw new Error('No response from payment gateway');
      }

      if (payment.message === '' || payment.message === 'Success') {
        // Empty message means success (payment processed or redirecting to 3DS)
        console.log('Payment processing or redirecting to 3DS authentication...');
        // Check if 3DS form was injected
        const responseTilopayContent = document.getElementById('responseTilopay');
        console.log('responseTilopay after payment:', responseTilopayContent?.innerHTML);
        // The SDK will handle the 3DS redirect automatically
        // Don't set loading to false here - let the redirect happen
      } else if (payment.message) {
        // Non-empty message means there was an error
        console.error('Payment error:', payment.message);
        throw new Error(payment.message);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error stack:', error.stack);
      alert(`Payment failed: ${error.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Payment Form */}
          <div className="bg-white rounded-lg border border-gray-300 p-8">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Optima, Georgia, serif' }}
            >
              1. Payment information
            </h2>

            <div>
              {/* Billing Information */}
              <h3 className="text-lg font-semibold mb-4">Billing Information</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Street address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="CR">Costa Rica</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                    <option value="ES">Spain</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Proceed Button - Show only if SDK not initialized */}
              {!sdkInitialized && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading Payment Form...' : 'Proceed to Payment'}
                  </button>
                </div>
              )}

              {/* Tilopay Payment Form Structure - Always rendered so SDK can attach event listeners */}
              <div className="payFormTilopay" style={{ display: sdkInitialized ? 'block' : 'none' }}>
                  <h3 className="text-lg font-semibold mb-4 mt-6">2. Card Information</h3>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <select
                      id="tlpy_payment_method"
                      name="tlpy_payment_method"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Card Payment Fields */}
                  <div id="tlpy_card_payment_div">
                    {savedCards.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Saved Cards</label>
                        <select
                          id="tlpy_saved_cards"
                          name="tlpy_saved_cards"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select saved card</option>
                          {savedCards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        id="tlpy_cc_number"
                        name="tlpy_cc_number"
                        placeholder="4012 0000 0002 0071"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          id="tlpy_cc_expiration_date"
                          name="tlpy_cc_expiration_date"
                          placeholder="12/26"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          id="tlpy_cvv"
                          name="tlpy_cvv"
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yappy Payment (hidden by default) */}
                  <div id="tlpy_phone_number_div" style={{ display: 'none' }}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Phone Number (Yappy)</label>
                      <input
                        type="text"
                        id="tlpy_phone_number"
                        name="tlpy_phone_number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

              {/* 3DS Container - Always visible, outside payFormTilopay for SDK access */}
              {/* suppressHydrationWarning allows Tilopay SDK to inject HTML directly */}
              <div id="responseTilopay" ref={responseTilopayRef} suppressHydrationWarning style={{ minHeight: '50px' }}></div>

              {/* Submit Button - Only show when SDK is initialized */}
              {sdkInitialized && (
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/donate')}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                    disabled={loading}
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    {loading ? 'Processing...' : 'Complete Donation'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-300 p-8 sticky top-8">
              <h2
                className="text-xl font-bold mb-6"
                style={{ fontFamily: 'Optima, Georgia, serif' }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{projectName}</h3>
                    <p className="text-sm text-gray-500">One time donation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${parseFloat(amount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold">${parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      {/* Load jQuery (required by Tilopay SDK) */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('jQuery loaded')}
      />

      {/* Load Tilopay SDK V2 */}
      <Script
        src="https://app.tilopay.com/sdk/v2/sdk_tpay.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Tilopay SDK V2 loaded successfully');
          // Trigger re-render to initialize SDK
          window.dispatchEvent(new Event('tilopay-loaded'));
        }}
        onError={() => {
          console.error('Failed to load Tilopay SDK');
        }}
      />

      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      }>
        <CheckoutContentWrapper />
      </Suspense>
    </>
  );
}

// Wrapper to handle SDK loading
function CheckoutContentWrapper() {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Check if SDK is already loaded
    if (window.Tilopay) {
      setSdkLoaded(true);
    }

    // Listen for SDK load event
    const handleLoad = () => setSdkLoaded(true);
    window.addEventListener('tilopay-loaded', handleLoad);

    return () => window.removeEventListener('tilopay-loaded', handleLoad);
  }, []);

  if (!sdkLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p>Loading payment system...</p>
        </div>
      </div>
    );
  }

  return <CheckoutContent />;
}
