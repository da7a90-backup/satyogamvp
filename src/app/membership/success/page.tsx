import { Metadata } from 'next';
import MembershipSuccessPageComponent  from '@/components/membership/SuccessPage';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Checkout - Sat Yoga Membership',
  description: 'Complete your membership registration and begin your spiritual journey with Sat Yoga.',
};

// Server component that renders the client component
export default function MembershipSuccessPage() {
  return <MembershipSuccessPageComponent />;
}