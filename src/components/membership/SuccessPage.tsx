'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function MembershipSuccessPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Parse the return data from Tilopay and update user membership in Strapi
    const processPaymentSuccess = async () => {
      try {
        const returnData = searchParams.get('returnData');
        const orderCode = searchParams.get('code');
        const orderAuth = searchParams.get('auth');
        const orderNumber = searchParams.get('order');
        
        if (!returnData || !orderCode) {
          setError('No order information found.');
          setLoading(false);
          return;
        }
        
        // Verify payment success from Tilopay response
        if (orderCode !== '1') {
          setError('Payment was not successful. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Decode the base64 encoded return data
        const decodedData = atob(returnData);
        const parsedData = JSON.parse(decodedData);
        setOrderDetails(parsedData);
        
        // Update user membership in Strapi
        const updateMembershipStatus = async () => {
          try {
            const response = await fetch('/api/membership/update-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                membershipPlan: parsedData.membershipPlan,
                membershipType: parsedData.membershipType,
                amount: parsedData.amount,
                hasTrial: parsedData.hasTrial,
                trialDays: parsedData.trialDays,
                memberEmail: parsedData.memberEmail,
                orderNumber: orderNumber,
                orderAuth: orderAuth,
                donationAmount: parsedData.donationAmount
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to update membership status');
              // We don't show this error to the user since payment was successful
              // Just log it and allow the user to continue
            }
          } catch (err) {
            console.error('Error updating membership:', err);
          }
        };
        
        await updateMembershipStatus();
        setLoading(false);
        
      } catch (err) {
        console.error('Error processing payment success:', err);
        setError('An error occurred while processing your order information.');
        setLoading(false);
      }
    };
    
    processPaymentSuccess();
  }, [searchParams]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Processing your order...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="flex justify-center">
              <Link 
                href="/membership"
                className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700"
              >
                Return to Membership Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {orderDetails?.membershipPlan}!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your subscription. We have sent a confirmation email to{' '}
            <span className="font-medium">{orderDetails?.memberEmail}</span> with details about your membership.
          </p>
          
          {orderDetails?.hasTrial && (
            <div className="bg-blue-50 p-4 rounded-md text-blue-700 mb-6">
              <p>
                Your {orderDetails.trialDays}-day free trial has started. You won't be charged until{' '}
                {new Date(Date.now() + orderDetails.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              </p>
            </div>
          )}
          
          <div className="border-t border-b border-gray-200 py-4 my-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{orderDetails?.membershipPlan} ({orderDetails?.membershipType})</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">${parseFloat(orderDetails?.amount || 0).toFixed(2)}/mo</span>
            </div>
            
            {parseFloat(orderDetails?.donationAmount || 0) > 0 && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Donation:</span>
                <span className="font-medium">${parseFloat(orderDetails?.donationAmount || 0).toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/dashboard"
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800"
            >
              Go to Dashboard
            </Link>
            
            <Link 
              href="/"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}