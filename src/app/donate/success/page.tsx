// app/donate/success/page.tsx
import { Metadata } from 'next';
import DonationSuccessPageComponent from '@/components/donation/DonationSuccessPageComponent';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Donation Successful - Sat Yoga',
  description: 'Thank you for your generous donation to Sat Yoga. Your contribution helps create a more spiritual and ecological culture.',
};

// Server component that renders the client component
export default function DonationSuccessPage() {
  return <DonationSuccessPageComponent />;
}