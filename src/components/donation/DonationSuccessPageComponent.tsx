'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DonationSuccessPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [donationDetails, setDonationDetails] = useState<any>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Parse the return data from Tilopay and process donation success
    const processDonationSuccess = async () => {
      try {
        const returnData = searchParams.get('returnData');
        const orderCode = searchParams.get('code');
        const orderAuth = searchParams.get('auth');
        const orderNumber = searchParams.get('order');
        const sdkResult = searchParams.get('result');
        
        // Handle SDK payment result (if coming from direct payment)
        if (sdkResult) {
          try {
            const parsedResult = JSON.parse(decodeURIComponent(sdkResult));
            setDonationDetails({
              donationType: 'donation',
              donationCategory: 'Direct Payment',
              amount: parsedResult.amount || '0',
              donorName: 'Anonymous',
              donorEmail: '',
              message: 'Thank you for your donation!',
              orderNumber: parsedResult.orderNumber || parsedResult.transactionId
            });
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error parsing SDK result:', err);
          }
        }
        
        if (!returnData || !orderCode) {
          setError('No donation information found.');
          setLoading(false);
          return;
        }
        
        // Verify payment success from Tilopay response
        if (orderCode !== '1') {
          setError('Donation was not successful. Please contact support if you believe this is an error.');
          setLoading(false);
          return;
        }
        
        // Decode the base64 encoded return data
        const decodedData = atob(returnData);
        const parsedData = JSON.parse(decodedData);
        setDonationDetails(parsedData);
        
        // Optional: Record donation in your system
        const recordDonation = async () => {
          try {
            const response = await fetch('/api/donations/record', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                donationCategory: parsedData.donationCategory,
                amount: parsedData.amount,
                donorName: parsedData.donorName,
                donorEmail: parsedData.donorEmail,
                message: parsedData.message,
                orderNumber: orderNumber,
                orderAuth: orderAuth,
                timestamp: new Date().toISOString()
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to record donation');
              // We don't show this error to the user since payment was successful
              // Just log it and allow the user to continue
            }
          } catch (err) {
            console.error('Error recording donation:', err);
          }
        };
        
        await recordDonation();
        setLoading(false);
        
      } catch (err) {
        console.error('Error processing donation success:', err);
        setError('An error occurred while processing your donation information.');
        setLoading(false);
      }
    };
    
    processDonationSuccess();
  }, [searchParams]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Processing your donation...</p>
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
                href="/donate"
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
              >
                Return to Donate Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-lg w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Generous Donation!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Your contribution helps us create a more spiritual and ecological culture. 
            We are deeply grateful for your support in the process of human and planetary rebirth.
          </p>
          
          {donationDetails?.donorEmail && (
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to{' '}
              <span className="font-medium">{donationDetails.donorEmail}</span> with your donation receipt.
            </p>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Donation Details</h3>
            
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-green-700">Category:</span>
                <span className="font-medium text-green-800">{donationDetails?.donationCategory || 'General Donation'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-700">Amount:</span>
                <span className="font-bold text-green-800 text-lg">${parseFloat(donationDetails?.amount || 0).toFixed(2)}</span>
              </div>
              
              {donationDetails?.donorName && donationDetails.donorName !== 'Anonymous' && (
                <div className="flex justify-between">
                  <span className="text-green-700">Donor:</span>
                  <span className="font-medium text-green-800">{donationDetails.donorName}</span>
                </div>
              )}
              
              {donationDetails?.orderNumber && (
                <div className="flex justify-between">
                  <span className="text-green-700">Reference:</span>
                  <span className="font-mono text-sm text-green-800">{donationDetails.orderNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          {donationDetails?.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Message:</h4>
              <p className="text-blue-700 text-sm italic">"{donationDetails.message}"</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 mb-6 text-sm">
              Your donation supports our mission to foster spiritual growth and ecological awareness. 
              Together, we can create positive change in the world.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/"
                className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Return Home
              </Link>
              
              <Link 
                href="/about"
                className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Learn More About Our Mission
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              For questions about your donation, please contact us at{' '}
              <a href="mailto:support@satyoga.org" className="text-green-600 hover:text-green-700">
                support@satyoga.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}