'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { formatTilopayData, processPayment, processRecurrentPayment } from '@/lib/services/tilopay';

// Import components
import AccountSection from './checkout/AccountSection';
import PlanSelectionSection from './checkout/PlanSelectionSection';
import PaymentInfoSection from './checkout/PaymentInfoSection';
import InvoiceInfoSection from './checkout/InvoiceInfoSection';
import DonationSection from './checkout/DonationSection';
import OrderSummary from './checkout/OrderSummary';
import SuccessModal from './checkout/SuccessModal';

// Types for checkout form data
interface CheckoutFormData {
  email: string;
  password: string;
  confirmPassword: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  donationAmount: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
  [key: string]: string | boolean; // Add this index signature
}

interface CheckoutErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: string;
  [key: string]: string | undefined; // Add this index signature
}

// Main checkout component
export default function MembershipCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  // Get plan and billing info from URL
  const planParam = searchParams.get('plan') || 'gyani';
  const billingParam = searchParams.get('billing') || 'monthly';
  const isMonthly = billingParam === 'monthly';

  // State
  const [showLogin, setShowLogin] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planParam);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  // Form data and validation
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    firstName: '',
    lastName: '',
    country: 'CR',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    donationAmount: '0',
    acceptTerms: false,
    acceptNewsletter: false
  });
  
  const [errors, setErrors] = useState<CheckoutErrors>({});
  
  // Membership plans data
  const membershipPlans = [
    {
      id: 'gyani',
      title: 'Gyani',
      monthlyPrice: 20,
      yearlyPrice: 15,
      annualSavings: 60,
      tagline: 'Key to the Treasure House: Deep Teachings, Meditations & Community Connection',
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings'
      ],
      hasTrial: true,
      trialDays: 10
    },
    {
      id: 'pragyani',
      title: 'Pragyani',
      monthlyPrice: 100,
      yearlyPrice: 83,
      annualSavings: 200,
      tagline: 'Virtual Ashram Experience: Exclusive Teachings, Livestream Gatherings & Community Support',
      popular: true,
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'Your Questions Prioritized during ALL live events with Shunyamurti'
      ]
    },
    {
      id: 'pragyani-plus',
      title: 'Pragyani+',
      monthlyPrice: 142,
      yearlyPrice: 142,
      annualSavings: 1170,
      tagline: 'Unlock the Ultimate Experience: Lifetime Retreats & Direct Access to Shunyamurti',
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'Lifetime Access to All Online Retreats (Valued at $1,970 per year)'
      ]
    }
  ];
  
  // Find the selected plan
  const currentPlan = membershipPlans.find(plan => plan.id === selectedPlan) || membershipPlans[0];
  
  // Calculate order summary
  const calculateOrderSummary = () => {
    const planPrice = isMonthly ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
    let discount = 0;
    
    // Apply discount if code is present and valid
    if (discountApplied && discountCode === 'freetrial') {
      discount = planPrice;
    }
    
    const subtotal = planPrice;
    const total = Math.max(0, subtotal - discount);
    
    return {
      subtotal,
      discount,
      tax: 0,
      total,
      discountCode: discountApplied ? discountCode : undefined,
      trial: currentPlan.hasTrial ? { days: currentPlan.trialDays || 10 } : undefined
    };
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof CheckoutErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof CheckoutErrors];
        return newErrors;
      });
    }
  };
  
  // Handle discount code application
  const handleApplyDiscount = () => {
    if (!discountCode) return;
    
    // In a real app, you would validate the code with an API call
    // For now, just accept 'freetrial' as a valid code
    if (discountCode.toLowerCase() === 'freetrial') {
      setDiscountApplied(true);
    } else {
      setError('Invalid discount code');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  // Handle discount removal
  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
  };
  
  // Handle social login
  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: window.location.href });
  };
  
  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({
        ...errors,
        email: !formData.email ? 'Email is required' : undefined,
        password: !formData.password ? 'Password is required' : undefined
      });
      return;
    }
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      
      if (result?.error) {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };
  
  // Handle account creation
  const handleCreateAccount = async () => {
    // Validate form fields for account creation
    const newErrors: CheckoutErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    
    try {
      // Create user account in Strapi
      const registerRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password
        })
      });
      
      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        setError(errorData.error?.message || 'Error creating account');
        return false;
      }
      
      const userData = await registerRes.json();
      
      // Sign in the user after account creation
      await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      
      setAccountCreated(true);
      return true;
    } catch (err) {
      console.error('Account creation error:', err);
      setError('An error occurred while creating your account');
      return false;
    }
  };
  
  // Handle payment submission
const handlePaymentSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setProcessing(true);
  setError('');
  
  try {
    // If not logged in, create account first
    if (!isLoggedIn) {
      const accountSuccess = await handleCreateAccount();
      if (!accountSuccess) {
        setProcessing(false);
        return;
      }
    }
    
    // Validate required fields
    const newErrors: CheckoutErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms of service';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setProcessing(false);
      return;
    }
    
    // Format data for Tilopay
    const orderSummary = calculateOrderSummary();
    const subscriptionType = isMonthly ? 'monthly' : 'yearly';
    
    const membershipDetails = {
      planId: currentPlan.id,
      planName: currentPlan.title,
      amount: orderSummary.total.toString(),
      billingType: subscriptionType,
      hasTrial: !!currentPlan.hasTrial,
      trialDays: currentPlan.trialDays || 0
    };
    
    // Format Tilopay data
    const tilopayData = formatTilopayData(formData, membershipDetails);
    
    // Extract card data for direct API
    const cardData = {
      cardNumber: formData.cardNumber.replace(/\s+/g, ''),
      expiryDate: formData.expiryDate,
      cvv: formData.cvv
    };
    
    // Process payment through Tilopay's direct API
    const result = await processRecurrentPayment(tilopayData, cardData);
    
    if (result) {
      // Handle successful payment
      const transactionId = result.transactionId || 'unknown';
      
      // Update user membership status in our backend
      await fetch('/api/membership/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipPlan: membershipDetails.planName,
          membershipType: membershipDetails.billingType,
          amount: membershipDetails.amount,
          hasTrial: membershipDetails.hasTrial,
          trialDays: membershipDetails.trialDays,
          memberEmail: formData.email || session?.user?.email,
          orderNumber: tilopayData.orderNumber,
          orderAuth: transactionId,
          donationAmount: formData.donationAmount || '0'
        }),
      });
      
      // Redirect to success page
      router.push(`/membership/success?code=1&description=Payment+Successful&auth=${transactionId}&order=${tilopayData.orderNumber}&returnData=${tilopayData.returnData}`);
    } else {
      throw new Error('Failed to process payment');
    }
    
  } catch (err: any) {
    console.error('Payment error:', err);
    setError(err.message || 'There was an error processing your payment. Please try again.');
    setProcessing(false);
  }
};
  // Initialize form data with user info if logged in
  useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || ''
      }));
    }
  }, [isLoggedIn, session]);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/membership" className="inline-flex items-center text-gray-500 hover:text-gray-800">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <form onSubmit={handlePaymentSubmit}>
              {/* Account Section */}
              <AccountSection 
                isLoggedIn={isLoggedIn}
                userEmail={session?.user?.email}
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onContinue={() => {}}
                showLogin={showLogin}
                setShowLogin={setShowLogin}
                onSocialLogin={handleSocialLogin}
                onLoginSubmit={handleLoginSubmit}
                accountCreated={accountCreated}
              />
              
              {/* Plan Selection Section */}
              <PlanSelectionSection
                plans={membershipPlans}
                selectedPlan={selectedPlan}
                isMonthly={isMonthly}
                onSelectPlan={setSelectedPlan}
                onToggleBilling={() => router.push(`/membership/checkout?plan=${selectedPlan}&billing=${isMonthly ? 'yearly' : 'monthly'}`)}
              />
              
              {/* Payment Information Section */}
              <PaymentInfoSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
                processing={processing}
              />
              
              {/* Invoice Information Section */}
              <InvoiceInfoSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />
              
              {/* Donation Section */}
              <DonationSection
                donationAmount={formData.donationAmount}
                onChange={(amount) => setFormData(prev => ({ ...prev, donationAmount: amount }))}
              />
              
              {/* Submit buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-70"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm payment'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <OrderSummary
              plan={currentPlan}
              isMonthly={isMonthly}
              orderSummary={calculateOrderSummary()}
              discountCode={discountCode}
              onDiscountChange={setDiscountCode}
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
              formData={formData}
            />
          </div>
        </div>
      </div>
      
      {/* Success Modal - only used when not redirecting to Tilopay */}
      {showSuccessModal && (
        <SuccessModal 
          onClose={() => setShowSuccessModal(false)}
          onSignUp={() => router.push('/dashboard')}
        />
      )}
    </div>
  );
}