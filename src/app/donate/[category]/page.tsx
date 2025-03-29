// app/donate/[category]/page.tsx

import { Metadata } from 'next';
import { DonationPage } from '@/components/donation/DonationComponents';
import { notFound } from 'next/navigation';

type DonationCategory = 'Broadcasting' | 'Solarization' | 'Greenhouse & Seedbank' | 'Off-Grid' | 'Custom';

interface DonationCategoryPageProps {
  params: {
    category: string;
  };
}

export function generateMetadata({ params }: DonationCategoryPageProps): Metadata {
  const validCategories = ['broadcasting', 'solarization', 'greenhouse-seedbank', 'off-grid', 'custom'];
  const category = params.category.toLowerCase();
  
  if (!validCategories.includes(category)) {
    return {
      title: 'Not Found - Sat Yoga',
    };
  }
  
  const categoryTitles: Record<string, string> = {
    'broadcasting': 'Broadcasting Donation',
    'solarization': 'Solarization Project',
    'greenhouse-seedbank': 'Greenhouse & Seedbank Initiative',
    'off-grid': 'Off-Grid Sustainability',
    'custom': 'Custom Donation',
  };
  
  return {
    title: `${categoryTitles[category]} - Sat Yoga`,
    description: `Support the Sat Yoga ${categoryTitles[category]} through your generous contribution.`,
  };
}

export default function DonationCategoryPage({ params }: DonationCategoryPageProps) {
  const slug = params.category.toLowerCase();
  
  // Map slug to category
  const categoryMapping: Record<string, DonationCategory> = {
    'broadcasting': 'Broadcasting',
    'solarization': 'Solarization',
    'greenhouse-seedbank': 'Greenhouse & Seedbank',
    'off-grid': 'Off-Grid',
    'custom': 'Custom',
  };
  
  const category = categoryMapping[slug];
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <DonationPage initialCategory={category} />
    </div>
  );
}
