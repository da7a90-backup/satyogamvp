'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DonationPaymentForm } from './DonationPaymentForm';

// Define the donation category type for type safety
type DonationCategory = 'Broadcasting' | 'Solarization' | 'Greenhouse & Seedbank' | 'Off-Grid' | 'Custom';

export const DonationPaymentWrapper: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get donation details from URL parameters
  const amount = searchParams.get('amount') || '45.00';
  const categoryParam = searchParams.get('category') || 'Broadcasting';
  
  // Type cast the category (with validation)
  const isValidCategory = (category: string): category is DonationCategory => {
    return ['Broadcasting', 'Solarization', 'Greenhouse & Seedbank', 'Off-Grid', 'Custom'].includes(category);
  };
  
  const category = isValidCategory(categoryParam) ? categoryParam : 'Broadcasting';
  
  const handleCancel = () => {
    router.push('/donate');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-4">
        <Link href="/donate" className="inline-flex items-center text-gray-600 hover:text-gray-900 ml-4">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>
      
      <div className="container mx-auto my-8">
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <DonationPaymentForm
            amount={amount}
            category={category}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};