'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import TourModal from './TourModal';
import TourSpotlight from './TourSpotlight';
import { tourSteps, getStepIndex } from './tourSteps';
import { shouldShowTour, markTourCompleted } from '@/lib/tour-api';

interface DashboardTourProps {
  /** Force tour to start regardless of user's status */
  forceStart?: boolean;
  /** Callback when tour is completed or skipped */
  onComplete?: () => void;
}

export default function DashboardTour({ forceStart = false, onComplete }: DashboardTourProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [modalPosition, setModalPosition] = useState({ top: 100, left: 100 });
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if tour should be shown on mount
  useEffect(() => {
    async function checkTourStatus() {
      // Never show tour on admin routes
      if (pathname?.startsWith('/dashboard/admin')) {
        console.log('[DashboardTour] Admin route detected, hiding tour');
        setIsActive(false);
        setIsCheckingStatus(false);
        return;
      }

      if (!session?.user) {
        console.log('[DashboardTour] No session, hiding tour');
        setIsCheckingStatus(false);
        return;
      }

      // Check if user is an admin - admins should not see the tour
      const userRole = (session.user as any)?.role;
      console.log('[DashboardTour] User role detected:', userRole);

      if (userRole === 'admin') {
        console.log('[DashboardTour] Admin detected, hiding tour');
        setIsActive(false);
        setIsCheckingStatus(false);
        return;
      }

      // Get auth token from session
      const token = (session?.user as any)?.accessToken || '';

      if (!token) {
        console.warn('No auth token available for tour status check');
        setIsCheckingStatus(false);
        return;
      }

      if (forceStart) {
        // Force start regardless of status
        setIsActive(true);
        setIsCheckingStatus(false);
        return;
      }

      try {
        const shouldShow = await shouldShowTour(token);
        setIsActive(shouldShow);
      } catch (error) {
        console.error('Error checking tour status:', error);
        // Don't show tour on error
        setIsActive(false);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkTourStatus();
  }, [session, forceStart, pathname]);

  // Listen for manual tour trigger event
  useEffect(() => {
    const handleStartTour = () => {
      // Never allow tour on admin routes
      if (pathname?.startsWith('/dashboard/admin')) {
        console.log('[DashboardTour] Cannot start tour on admin route');
        return;
      }

      // Don't allow admins to manually start the tour
      const userRole = (session?.user as any)?.role;
      if (userRole === 'admin') {
        console.log('[DashboardTour] Admin cannot manually start tour');
        return;
      }

      setIsActive(true);
      setCurrentStepIndex(0);
    };

    window.addEventListener('start-dashboard-tour', handleStartTour);

    return () => {
      window.removeEventListener('start-dashboard-tour', handleStartTour);
    };
  }, [session, pathname]);

  // Calculate modal position based on highlighted element
  const handleElementFound = (rect: DOMRect) => {
    const currentStep = tourSteps[currentStepIndex];
    const modalWidth = 567;
    const modalHeight = currentStep.mediaType !== 'none' ? 571 : 280; // Adjust based on content
    const padding = 24;

    // Get scroll position
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Calculate absolute positions (viewport + scroll)
    const elementTop = rect.top + scrollY;
    const elementLeft = rect.left + scrollX;
    const elementBottom = rect.bottom + scrollY;
    const elementRight = rect.right + scrollX;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'left':
        // Position modal to the left of element
        left = elementLeft - modalWidth - padding;
        top = elementTop + (rect.height / 2) - (modalHeight / 2);
        break;
      case 'right':
        // Position modal to the right of element
        left = elementRight + padding;
        top = elementTop + (rect.height / 2) - (modalHeight / 2);
        break;
      case 'top':
        // Position modal above element
        left = elementLeft + (rect.width / 2) - (modalWidth / 2);
        top = elementTop - modalHeight - padding;
        break;
      case 'bottom':
        // Position modal below element
        left = elementLeft + (rect.width / 2) - (modalWidth / 2);
        top = elementBottom + padding;
        break;
      case 'center':
        // Position modal in center of viewport (fixed position)
        left = (window.innerWidth / 2) - (modalWidth / 2) + scrollX;
        top = (window.innerHeight / 2) - (modalHeight / 2) + scrollY;
        break;
    }

    // Ensure modal stays within document bounds (not just viewport)
    const docWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
      window.innerWidth + scrollX
    );
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight + scrollY
    );

    const minLeft = scrollX + 20;
    const maxLeft = docWidth - modalWidth - 20;
    const minTop = scrollY + 20;
    const maxTop = docHeight - modalHeight - 20;

    left = Math.max(minLeft, Math.min(left, maxLeft));
    top = Math.max(minTop, Math.min(top, maxTop));

    setModalPosition({ top, left });
  };

  const handleNext = async () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Tour completed
      await completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = async () => {
    await completeTour();
  };

  const handleClose = async () => {
    await completeTour();
  };

  const completeTour = async () => {
    if (!session?.user) return;

    const token = (session?.user as any)?.accessToken || '';
    if (token) {
      try {
        await markTourCompleted(token);
      } catch (error) {
        console.error('Error marking tour as completed:', error);
      }
    }

    setIsActive(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowRight':
          if (currentStepIndex < tourSteps.length - 1) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          if (currentStepIndex > 0) {
            handlePrevious();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex]);

  // Don't render anything while checking status
  if (isCheckingStatus) {
    return null;
  }

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  const currentStep = tourSteps[currentStepIndex];

  // Calculate full document height
  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    document.documentElement.clientHeight
  );

  return (
    <div
      className="absolute z-[9997]"
      style={{
        top: 0,
        left: 0,
        width: '100%',
        height: documentHeight,
        pointerEvents: 'none',
      }}
    >
      {/* Spotlight overlay */}
      <TourSpotlight
        targetSelector={currentStep.targetSelector}
        padding={currentStep.highlightPadding}
        onElementFound={handleElementFound}
      />

      {/* Tour Modal */}
      <div style={{ pointerEvents: 'auto' }}>
        <TourModal
          step={currentStep}
          currentStepIndex={currentStepIndex + 1}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          onClose={handleClose}
          position={modalPosition}
        />
      </div>
    </div>
  );
}
