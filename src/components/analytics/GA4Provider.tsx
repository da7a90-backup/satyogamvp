'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePageTracking, useScrollTracking, useErrorTracking, useUserTracking } from '@/hooks/useGA4';

interface GA4ProviderProps {
  children: React.ReactNode;
}

/**
 * GA4Provider - Wraps the app to provide automatic GA4 tracking
 *
 * Handles:
 * - Automatic page view tracking on route changes
 * - Scroll depth tracking
 * - Error tracking
 * - User identification
 */
export default function GA4Provider({ children }: GA4ProviderProps) {
  const { data: session } = useSession();

  // Track page views automatically
  usePageTracking();

  // Track scroll depth
  useScrollTracking();

  // Track errors automatically
  useErrorTracking();

  // Track user data when logged in
  useUserTracking(session?.user ? {
    id: session.user.id || '',
    membershipTier: session.user.membershipTier,
    email: session.user.email || undefined,
  } : undefined);

  return <>{children}</>;
}
