import { Metadata } from 'next';
import MembershipCheckoutClient from '@/components/membership/MembershipCheckoutClient';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Checkout - Sat Yoga Membership',
  description: 'Complete your membership registration and begin your spiritual journey with Sat Yoga.',
};

// Server component that renders the client component
export default function MembershipCheckoutPage() {
  return <MembershipCheckoutClient />;
}