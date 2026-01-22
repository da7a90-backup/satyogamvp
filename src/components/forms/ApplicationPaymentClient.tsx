'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { Loader2 } from 'lucide-react';
import MemberDiscountBadge, { calculateDiscountedPrice } from '@/components/shared/MemberDiscountBadge';

interface ApplicationPaymentClientProps {
  submissionId: string;
  session: Session;
}

interface SubmissionData {
  id: string;
  form_template_id: string;
  retreat_id: string;
  payment_amount: number;
  answers: Record<string, any>;
  submitter_email: string;
  submitter_name: string;
  status: string;
  retreat?: {
    id: string;
    title: string;
    slug: string;
    price: number;
  };
}

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

export default function ApplicationPaymentClient({ submissionId, session }: ApplicationPaymentClientProps) {
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
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
    const fetchSubmission = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/form-templates/submission/${submissionId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load submission');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setSubmission(result.data);

          // Pre-fill form with submission data if available
          if (result.data.submitter_email) {
            setFormData(prev => ({ ...prev, email: result.data.submitter_email }));
          }
          if (result.data.submitter_name) {
            const nameParts = result.data.submitter_name.split(' ');
            setFormData(prev => ({
              ...prev,
              firstName: nameParts[0] || prev.firstName,
              lastName: nameParts.slice(1).join(' ') || prev.lastName,
            }));
          }
        } else {
          setError('Submission not found');
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId, session]);

  const initializeTilopaySDK = async () => {
    if (!submission || !submission.retreat_id) {
      setError('Missing retreat information');
      return;
    }

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

      console.log('Initializing Tilopay SDK for application:', submissionId);

      // Create order and payment via backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/form-templates/submissions/${submissionId}/create-application-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            retreat_id: submission.retreat_id,
            payment_amount: submission.payment_amount,
            billing_email: formData.email,
            billing_first_name: formData.firstName,
            billing_last_name: formData.lastName,
            billing_address: formData.address || '',
            billing_city: formData.city || '',
            billing_state: formData.state || '',
            billing_country: formData.country || 'US',
            billing_postal_code: formData.postalCode || '',
            billing_telephone: formData.telephone || '',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      console.log('Got payment data from backend:', data);

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize Tilopay SDK V2 with embedded mode
      const initialize = await window.Tilopay.Init({
        token: data.tilopay_key,
        currency: data.currency,
        amount: data.amount,
        orderNumber: data.order_number,
        capture: '1',
        redirect: `${window.location.origin}/dashboard/user/online-retreats/${submission.retreat?.slug || 'portal'}`,
        subscription: 0,
        // Billing information
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
        // Container for embedded form
        container: 'responseTilopay',
      });

      console.log('Tilopay.Init response:', initialize);

      // Check if initialization was successful
      if (!initialize || initialize.message !== 'Success') {
        const errorMsg = initialize?.message || 'SDK initialization failed - no response';
        console.error('Tilopay initialization failed:', errorMsg);
        throw new Error(errorMsg);
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

    try {
      setProcessing(true);
      const result = await window.Tilopay.Pay();

      console.log('Tilopay.Pay() result:', result);

      if (result && result.message === 'Success') {
        console.log('Payment successful, redirecting...');
        // Redirect will be handled by Tilopay SDK
      } else {
        const errorMsg = result?.message || 'Payment failed';
        console.error('Payment failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#7D1A13] mx-auto mb-4 animate-spin" />
          <p>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Submission not found'}</p>
          <button
            onClick={() => router.push('/dashboard/user/applications')}
            className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#7D1A13]/90"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const total = submission.payment_amount || 0;

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Optima, serif' }}>
          Complete Your Application Payment
        </h1>

        {/* Application Summary */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Application Summary</h2>
          <div className="mb-4 pb-4 border-b">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{submission.retreat?.title || 'Retreat Application'}</h3>
              <p className="text-sm text-gray-600 mt-1">Application Fee</p>
            </div>
          </div>

          {/* Member Discount Badge */}
          <MemberDiscountBadge membershipTier={session.user?.membershipTier} />

          {/* Price Breakdown */}
          <div className="space-y-2">
            {(() => {
              const priceInfo = calculateDiscountedPrice(
                total,
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
