"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface AnalyticsContextType {
  track: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  identify: (userId: string, properties?: Record<string, any>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Check if we're in preview mode by checking window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preview = params.get('preview') === 'true';
      setIsPreviewMode(preview);
    }
  }, [pathname]); // Re-check when pathname changes

  const track = useCallback(async (eventName: string, properties: Record<string, any> = {}) => {
    // Skip tracking in preview mode
    if (isPreviewMode) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      // Add page context to all events
      const eventProperties = {
        ...properties,
        page_path: pathname,
        page_url: typeof window !== 'undefined' ? window.location.href : pathname,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      const response = await fetch(`${FASTAPI_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken ? { 'Authorization': `Bearer ${session.user.accessToken}` } : {}),
        },
        body: JSON.stringify({
          event_name: eventName,
          event_properties: eventProperties,
          user_id: session?.user?.id || undefined,
        }),
      });

      if (!response.ok) {
        console.error('Analytics tracking failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [session, pathname, isPreviewMode]);

  const identify = useCallback(async (userId: string, properties: Record<string, any> = {}) => {
    // Identify is handled server-side on login/signup
    // This is a no-op on the frontend but kept for API compatibility
    console.log('User identified:', userId, properties);
  }, []);

  // Track page views automatically (skip in preview mode)
  useEffect(() => {
    if (status === 'loading' || isPreviewMode) return;

    const pageTitle = typeof document !== 'undefined' ? document.title : 'Unknown Page';

    track('Page View', {
      page_title: pageTitle,
      authenticated: !!session,
    });
  }, [pathname, session, status, track, isPreviewMode]);

  return (
    <AnalyticsContext.Provider value={{ track, identify }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
