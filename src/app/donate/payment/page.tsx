// app/donate/payment/page.tsx
import { Metadata } from 'next';
import { DonationPaymentWrapper } from '@/components/donation/DonationPaymentWrapper';

export const metadata: Metadata = {
  title: 'Complete Your Donation - Sat Yoga',
  description: 'Complete your donation to Sat Yoga and contribute to our mission.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export default function DonationPaymentPage() {
  return <DonationPaymentWrapper />;
}
