'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { useCart } from '@/contexts/CartContext';
import { Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface CheckoutClientProps {
  session: Session;
}

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

export default function CheckoutClient({ session }: CheckoutClientProps) {
  const router = useRouter();
  const { cart, isLoading: cartLoading, clearCart, refreshCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
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
    country: '',
    telephone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push('/dashboard/user/dharma-bandhara');
    }
  }, [cart, cartLoading, router]);

  const initializeTilopaySDK = async () => {
    if (!cart || cart.items.length === 0) return;

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in your name and email address');
        return;
      }

      setProcessing(true);
      setError(null);

      // Verify JWT token is present
      if (!session.user.accessToken) {
        console.error('No JWT token found in session');
        throw new Error('Authentication error: Please log in again');
      }

      console.log('Initializing Tilopay SDK for cart checkout');

      // Create payment via backend checkout endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            billing_email: formData.email,
            billing_name: `${formData.firstName} ${formData.lastName}`,
            billing_address: formData.address || 'N/A',
            billing_city: formData.city || 'N/A',
            billing_state: formData.state || 'N/A',
            billing_country: formData.country || 'US',
            billing_postal_code: formData.postalCode || '00000',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create checkout');
      }

      const data = await response.json();
      console.log('Got checkout data from backend:', data);

      // Initialize Tilopay SDK V2
      console.log('Calling Tilopay.Init with params:', {
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
      });

      const initialize = await window.Tilopay.Init({
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
        capture: '1',
        redirect: `${window.location.origin}/dashboard/user/purchases`,
        subscription: 0,
        // Billing information
        billToFirstName: formData.firstName,
        billToLastName: formData.lastName,
        billToEmail: formData.email,
        billToAddress: formData.address || 'N/A',
        billToAddress2: '',
        billToCity: formData.city || 'N/A',
        billToState: formData.state || 'N/A',
        billToZipPostCode: formData.postalCode || '00000',
        billToCountry: formData.country || 'US',
        billToTelephone: formData.telephone || '',
      });

      console.log('Tilopay.Init response:', initialize);

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
      setProcessing(false);
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
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
      console.log('Starting payment with Tilopay SDK...');

      // Call Tilopay's startPayment method
      const payment = await window.Tilopay.startPayment();
      console.log('Payment response:', payment);

      // Check the response
      if (!payment) {
        throw new Error('No response from payment gateway');
      }

      if (payment.message === '' || payment.message === 'Success') {
        // Empty message means success (payment processed or redirecting to 3DS)
        console.log('Payment processing or redirecting to 3DS authentication...');

        // Start polling for payment status after a short delay
        setTimeout(() => {
          pollPaymentStatus();
        }, 3000);
      } else if (payment.message) {
        // Non-empty message means there was an error
        console.error('Payment error:', payment.message);
        throw new Error(payment.message);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message || 'Please try again'}`);
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (attemptCount = 0) => {
    const maxAttempts = 20; // Poll for up to 40 seconds

    if (attemptCount >= maxAttempts) {
      console.log('Payment polling timeout - redirecting to My Purchases');
      setProcessing(false);
      router.push('/dashboard/user/purchases');
      return;
    }

    try {
      // Check cart checkout status by checking if cart is empty
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/cart`,
        {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const cartData = await response.json();

        console.log(`Poll attempt ${attemptCount + 1}: Cart items = ${cartData.items.length}`);

        if (cartData.items.length === 0) {
          // Cart is empty - payment completed!
          console.log('✅ Payment completed! Cart cleared. Refreshing cart context and redirecting...');

          // Refresh the cart context to update the UI
          await refreshCart();

          setProcessing(false);
          router.push('/dashboard/user/purchases');
          return;
        }
      }

      // Payment still pending - poll again after 2 seconds
      setTimeout(() => {
        pollPaymentStatus(attemptCount + 1);
      }, 2000);
    } catch (error) {
      console.error('Error polling payment status:', error);
      // Continue polling even on error
      setTimeout(() => {
        pollPaymentStatus(attemptCount + 1);
      }, 2000);
    }
  };

  if (cartLoading || !cart) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#7D1A13] animate-spin" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#FAF8F1] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Payment Form */}
          <div className="bg-white rounded-lg border border-gray-300 p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Optima, Georgia, serif' }}>
              1. Payment information
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}

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
                    disabled={processing}
                    className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Loading Payment Form...' : 'Proceed to Payment'}
                  </button>
                </div>
              )}

              {/* Tilopay Payment Form Structure */}
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

              {/* 3DS Container */}
              <div id="responseTilopay" ref={responseTilopayRef} suppressHydrationWarning style={{ minHeight: '50px' }}></div>

              {/* Submit Button - Only show when SDK is initialized */}
              {sdkInitialized && (
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : `Pay $${cart.total?.toFixed(2) || '0.00'} USD`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-300 p-8 sticky top-8">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Optima, Georgia, serif' }}>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="relative w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                      {item.product.featured_image || item.product.thumbnail_url ? (
                        <Image
                          src={item.product.featured_image || item.product.thumbnail_url || ''}
                          alt={item.product.title}
                          fill
                          className="object-cover rounded"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.product.title}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">${cart.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (13% IVA)</span>
                  <span className="font-semibold">${cart.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold">${cart.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>🔒 Secure payment powered by Tilopay</p>
                <p className="mt-2">Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
