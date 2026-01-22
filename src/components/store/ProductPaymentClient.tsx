'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { productsApi, Product } from '@/lib/store-api';
import { Loader2 } from 'lucide-react';
import MemberDiscountBadge, { calculateDiscountedPrice } from '@/components/shared/MemberDiscountBadge';

interface ProductPaymentClientProps {
  slug: string;
  session: Session;
}

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

export default function ProductPaymentClient({ slug, session }: ProductPaymentClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
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
    country: '',
    telephone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await productsApi.getProducts({ slug });
        if (products && products.length > 0) {
          setProduct(products[0]);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const initializeTilopaySDK = async () => {
    if (!product) return;

    // Check if SDK is available
    if (!window.Tilopay || !window.jQuery) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in your name and email address');
        return;
      }

      setProcessing(true);
      setError(null);

      console.log('Initializing Tilopay SDK for product:', product.id);

      // Create order and payment via backend (creates Order + Payment for consistent flow)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/create-product-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            product_id: product.id,
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
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment');
      }

      const data = await response.json();
      console.log('Got payment data from backend:', data);

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize Tilopay SDK V2 (without container - manual form mode)
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

      // Store payment methods and saved cards
      if (initialize.methods) {
        setPaymentMethods(initialize.methods);
        console.log('Payment methods loaded:', initialize.methods);
      }
      if (initialize.cards) {
        setSavedCards(initialize.cards);
        console.log('Saved cards loaded:', initialize.cards);
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

        // Redirect after short delay
        setTimeout(() => {
          router.push('/dashboard/user/purchases');
        }, 2000);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#7D1A13] mx-auto mb-4 animate-spin" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
          <button
            onClick={() => router.push('/dashboard/user/dharma-bandhara')}
            className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#7D1A13]/90"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Optima, serif' }}>
          Complete Your Purchase
        </h1>

        {/* Product Summary */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b">
            {product.featured_image && (
              <img
                src={product.featured_image}
                alt={product.title}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-sm text-gray-600">Qty: 1</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${product.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Member Discount Badge */}
          <MemberDiscountBadge membershipTier={session.user?.membershipTier} />

          {/* Price Breakdown */}
          <div className="space-y-2">
            {(() => {
              const priceInfo = calculateDiscountedPrice(
                product.price,
                session.user?.membershipTier
              );

              const hasDiscount = priceInfo.discountPercentage > 0;

              return (
                <>
                  {hasDiscount && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Original Price</span>
                        <span className="line-through">${priceInfo.originalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Member Discount ({priceInfo.discountPercentage}%)</span>
                        <span>-${priceInfo.savings.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-[#7D1A13]">
                      ${priceInfo.discountedPrice.toFixed(2)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!sdkInitialized ? (
            <button
              onClick={handleProceedToPayment}
              disabled={processing}
              className="w-full py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:bg-[#7D1A13]/90 disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading payment form...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Enter Payment Details</h2>
              <div id="responseTilopay" ref={responseTilopayRef} className="mb-6"></div>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:bg-[#7D1A13]/90 disabled:opacity-50"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing payment...
                  </div>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
