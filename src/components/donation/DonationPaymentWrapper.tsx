'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DonationPaymentForm } from './DonationComponents';

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
  
  const handleSuccess = () => {
    router.push('/thank-you');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/donate" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Donation Options
      </Link>
      
      <DonationPaymentForm
        amount={amount}
        category={category}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
};