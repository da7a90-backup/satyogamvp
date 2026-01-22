import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MembershipCheckoutClient from '@/components/membership/MembershipCheckoutClient';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Checkout - Sat Yoga Membership',
  description: 'Complete your membership registration and begin your spiritual journey with Sat Yoga.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function MembershipCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; frequency?: string; trial?: string }>;
}) {
  // Get session to check authentication
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?redirect=/membership/checkout');
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  const { tier, frequency, trial } = params;

  // Validate required params
  if (!tier || !frequency) {
    redirect('/membership');
  }

  // Validate tier
  const validTiers = ['gyani', 'pragyani', 'pragyani_plus'];
  if (!validTiers.includes(tier)) {
    redirect('/membership');
  }

  // Validate frequency
  if (frequency !== 'monthly' && frequency !== 'annual') {
    redirect('/membership');
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MembershipCheckoutClient
        tier={tier}
        frequency={frequency}
        trial={trial === 'true'}
        session={session}
      />
    </Suspense>
  );
}
