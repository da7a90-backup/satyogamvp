'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(true);
  const [donationData, setDonationData] = useState<any>(null);
  
  useEffect(() => {
    // Check Tilopay response
    const code = searchParams.get('code');
    const description = searchParams.get('description');
    const returnData = searchParams.get('returnData');
    
    // Parse transaction status
    if (code !== null) {
      setIsSuccess(code === '1'); // code=1 means success
    }
    
    // Try to parse the return data if it exists
    if (returnData) {
      try {
        const decodedData = atob(returnData);
        setDonationData(JSON.parse(decodedData));
      } catch (error) {
        console.error('Error parsing return data:', error);
      }
    }
  }, [searchParams]);

  if (!isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-4xl font-bold mb-4">Payment Unsuccessful</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          We encountered an issue processing your donation. Your payment was not completed.
        </p>
        <p className="text-lg mb-12 max-w-2xl mx-auto">
          Please try again or contact us at support@satyoga.org if you continue to experience issues.
        </p>
        <Link href="/donate" className="inline-block bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800">
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <svg className="w-16 h-16 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <h1 className="text-4xl font-bold mb-4">Thank You for Your Donation!</h1>
      
      {donationData && donationData.donationCategory && (
        <div className="mb-6">
          <span className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
            {donationData.donationCategory} Project
          </span>
        </div>
      )}
      
      <p className="text-xl mb-4 max-w-2xl mx-auto">
        Your generous contribution of {donationData?.donationAmount ? `$${donationData.donationAmount}` : 'your donation'} will help support our mission to create a more spiritual and ecological culture and foster human and planetary rebirth.
      </p>
      
      <p className="text-lg mb-12 max-w-2xl mx-auto">
        A confirmation email has been sent with details of your donation. If you have any questions, please contact us at support@satyoga.org.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/" className="inline-block bg-white border border-gray-300 text-gray-700 rounded-md px-6 py-3 font-medium hover:bg-gray-50">
          Return to Home
        </Link>
      </div>
    </div>
  );
}