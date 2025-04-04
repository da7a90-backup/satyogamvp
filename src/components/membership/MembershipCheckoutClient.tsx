'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Types
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface OrderSummary {
  plan: string;
  subtotal: number;
  discount: number;
  total: number;
  discountCode: string;
}

// Order Summary Component
const OrderSummary: React.FC<{
  plan: string;
  subtotal: number;
  discount: number;
  total: number;
  discountCode: string;
  onRemoveDiscount: () => void;
}> = ({ plan, subtotal, discount, total, discountCode, onRemoveDiscount }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Level 1: {plan}</h2>
      
      <div className="mb-6">
        <div className="text-3xl font-bold">${total}<span className="text-lg font-normal text-gray-500">/mo</span></div>
        <div className="text-sm text-gray-500 mt-1">10 days Gyani free trial</div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Includes:</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-900 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Featured Teaching</span>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-900 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Full-Length Teachings Library / Satsangs</span>
          </li>
        </ul>
        <button className="text-purple-600 text-sm font-medium mt-3">View more</button>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Discount code</h3>
        {discountCode ? (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium">"{discountCode}"</span>
            <button onClick={onRemoveDiscount} className="text-purple-600 font-medium">Remove</button>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter discount code"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              Apply
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discountCode && (
          <div className="flex justify-between text-green-600 mb-2">
            <span>Discount "{discountCode}"</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Contact Information Form Component
const ContactInformationForm: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
}> = ({ formData, setFormData, errors }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-purple-600 mb-4">Contact information</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded`}
            placeholder="First name"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className={`w-full p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded`}
            placeholder="Last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
          placeholder="you@company.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium mb-1">
          Country
        </label>
        <select
          id="country"
          value={formData.country}
          onChange={(e) => setFormData({...formData, country: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded appearance-none"
        >
          <option value="">Select one...</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="CR">Costa Rica</option>
          <option value="MX">Mexico</option>
          <option value="UK">United Kingdom</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Street adress
        </label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Insert adress"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="city" className="block text-sm font-medium mb-1">
          City
        </label>
        <input
          id="city"
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Insert city"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State / Province
          </label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="First name"
          />
        </div>
        
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
            ZIP / Postal code
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Last name"
          />
        </div>
      </div>
    </div>
  );
};

// Subscription Plan Component
const SubscriptionPlanForm: React.FC<{
  plans: SubscriptionPlan[];
  selectedPlan: string;
  setSelectedPlan: (id: string) => void;
}> = ({ plans, selectedPlan, setSelectedPlan }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-purple-600 mb-4">Choose your plan</h2>
      <p className="text-gray-700 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-gray-900"
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-medium">{plan.name}</span>
                  <span className="ml-2 text-gray-700">${plan.price}</span>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Payment Information Form Component
const PaymentInformationForm: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  processing: boolean;
}> = ({ formData, setFormData, errors, processing }) => {
  return (
    <div>
      <h2 className="text-xl font-medium text-purple-600 mb-4">Payment information</h2>
      
      <div className="mb-4">
        <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
          Card number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <input
            id="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
            className={`w-full pl-10 pr-3 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded`}
            placeholder="0000 0000 0000 0000"
          />
        </div>
        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
            Expiry
          </label>
          <input
            id="expiryDate"
            type="text"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            className={`w-full p-2 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded`}
            placeholder="MM/YY"
          />
          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
        </div>
        
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium mb-1">
            CVV
          </label>
          <input
            id="cvv"
            type="text"
            value={formData.cvv}
            onChange={(e) => setFormData({...formData, cvv: e.target.value})}
            className={`w-full p-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded`}
            maxLength={4}
          />
          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
        </div>
      </div>
    </div>
  );
};

// Main Checkout Client Component
export default function MembershipCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'gyani';
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Processing state
  const [processing, setProcessing] = useState(false);
  
  // Subscription plans
  const [subscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: 'gyani-monthly',
      name: 'Gyani $20',
      price: 20,
      description: 'Monthly subscription'
    },
    {
      id: 'gyani-yearly',
      name: 'Gyani $200',
      price: 200,
      description: 'Yearly subscription'
    }
  ]);
  
  // Selected plan
  const [selectedPlan, setSelectedPlan] = useState<string>('gyani-monthly');
  
  // Order summary details
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    plan: 'Gyani',
    subtotal: 110.00,
    discount: 10.00,
    total: 100.00,
    discountCode: 'WELCOME10'
  });
  
  // Remove discount code
  const handleRemoveDiscount = () => {
    setOrderSummary({
      ...orderSummary,
      discountCode: '',
      discount: 0,
      total: orderSummary.subtotal
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    const newErrors: FormErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and start processing
    setErrors({});
    setProcessing(true);
    
    // Simulate form submission
    setTimeout(() => {
      setProcessing(false);
      // Redirect to thank you page
      router.push('/membership/thank-you');
    }, 2000);
  };

  return (
    <>
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <ContactInformationForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
              
              <SubscriptionPlanForm 
                plans={subscriptionPlans}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
              />
              
              <PaymentInformationForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                processing={processing}
              />
              
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
              plan={orderSummary.plan}
              subtotal={orderSummary.subtotal}
              discount={orderSummary.discount}
              total={orderSummary.total}
              discountCode={orderSummary.discountCode}
              onRemoveDiscount={handleRemoveDiscount}
            />
          </div>
        </div>
      </div>
    </>
  );
}