import { Metadata } from 'next';
import MembershipPageClient from '@/components/membership/MembershipPageClient';

// Metadata for the page (properly exported at the page level)
export const metadata: Metadata = {
  title: 'Membership - Sat Yoga',
  description: 'Join our spiritual community and unlock exclusive content, courses, and resources to support your spiritual journey.',
};

// Server component that renders the client component
export default function MembershipPage() {
  return <MembershipPageClient />;
}