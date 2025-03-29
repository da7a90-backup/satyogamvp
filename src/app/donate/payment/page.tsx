// app/donate/payment/page.tsx
import { Metadata } from 'next';
import { DonationPaymentWrapper } from '@/components/donation/DonationPaymentWrapper';

export const metadata: Metadata = {
  title: 'Complete Your Donation - Sat Yoga',
  description: 'Complete your donation to Sat Yoga and contribute to our mission.',
};

export default function DonationPaymentPage() {
  return <DonationPaymentWrapper />;
}
