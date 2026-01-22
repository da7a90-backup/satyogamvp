/**
 * React hooks for Google Analytics 4 tracking
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import GA4 from '@/lib/ga4-tracking';

/**
 * Automatically track page views on route changes
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      GA4.trackPageView(url);
    }
  }, [pathname, searchParams]);
}

/**
 * Track scroll depth
 */
export function useScrollTracking(thresholds: number[] = [25, 50, 75, 90, 100]) {
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Track each threshold only once
      thresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !trackedRef.current.has(threshold)) {
          trackedRef.current.add(threshold);
          GA4.trackScroll(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds]);
}

/**
 * Track video engagement
 */
export function useVideoTracking(videoRef: React.RefObject<HTMLVideoElement>, videoData: {
  id: string;
  title: string;
}) {
  const progressTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      GA4.trackVideoStart({
        id: videoData.id,
        title: videoData.title,
        duration: video.duration,
      });
    };

    const handleTimeUpdate = () => {
      const percent = Math.round((video.currentTime / video.duration) * 100);
      const milestones = [25, 50, 75];

      milestones.forEach(milestone => {
        if (percent >= milestone && !progressTracked.current.has(milestone)) {
          progressTracked.current.add(milestone);
          GA4.trackVideoProgress({
            id: videoData.id,
            title: videoData.title,
            current_time: video.currentTime,
            duration: video.duration,
            percent_watched: milestone,
          });
        }
      });
    };

    const handleEnded = () => {
      GA4.trackVideoComplete({
        id: videoData.id,
        title: videoData.title,
        duration: video.duration,
      });
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef, videoData]);
}

/**
 * Track form interactions
 */
export function useFormTracking(formName: string) {
  const formStartedRef = useRef(false);

  const trackFormStart = () => {
    if (!formStartedRef.current) {
      GA4.trackFormStart(formName);
      formStartedRef.current = true;
    }
  };

  const trackFormSubmit = (success: boolean) => {
    GA4.trackFormSubmit(formName, success);
  };

  const trackFormError = (errorMessage: string) => {
    GA4.trackFormError(formName, errorMessage);
  };

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
  };
}

/**
 * Track button clicks
 */
export function useButtonTracking() {
  const trackClick = (buttonName: string, location?: string) => {
    GA4.trackButtonClick(buttonName, location);
  };

  return { trackClick };
}

/**
 * Track search queries
 */
export function useSearchTracking() {
  const trackSearch = (searchTerm: string) => {
    GA4.trackSearch(searchTerm);
  };

  return { trackSearch };
}

/**
 * Track errors
 */
export function useErrorTracking() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      GA4.trackError({
        message: event.message,
        stack: event.error?.stack,
        page: window.location.pathname,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      GA4.trackError({
        message: `Unhandled promise rejection: ${event.reason}`,
        page: window.location.pathname,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

/**
 * Set user data for tracking
 */
export function useUserTracking(user?: {
  id: string;
  membershipTier?: string;
  email?: string;
}) {
  useEffect(() => {
    if (user?.id) {
      GA4.setUserId(user.id);

      if (user.membershipTier) {
        GA4.setUserProperties({
          membership_tier: user.membershipTier,
          user_type: 'authenticated',
        });
      }
    }
  }, [user]);
}

export default {
  usePageTracking,
  useScrollTracking,
  useVideoTracking,
  useFormTracking,
  useButtonTracking,
  useSearchTracking,
  useErrorTracking,
  useUserTracking,
};
