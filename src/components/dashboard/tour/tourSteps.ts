/**
 * Dashboard Tour Configuration
 * Defines all steps for the interactive dashboard tour
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;
  actionLabel?: string;
  highlightPadding?: number; // Padding around highlighted element in pixels
}

export const tourSteps: TourStep[] = [
  {
    id: 'calendar',
    title: 'Stay Organized with Your Calendar',
    description: 'Your personal calendar shows all upcoming events, retreats, and live sessions. Click on any date to see details, and easily navigate through months to plan ahead. Events are color-coded for easy identification.',
    targetSelector: '[data-tour="calendar"]', // We'll add this data attribute to the calendar component
    position: 'left',
    mediaType: 'image',
    mediaUrl: '/tour/calendar-preview.png',
    actionLabel: 'View Calendar',
    highlightPadding: 16,
  },
  {
    id: 'sidebar',
    title: 'Navigate Your Dashboard',
    description: 'The sidebar is your navigation hub. Access your courses, retreats, library of teachings, purchases, and settings. The Quick Access section gives you one-click access to your most-used features. Your membership tier is displayed under the Library section, showing your current access level.',
    targetSelector: '[data-tour="sidebar"]',
    position: 'right',
    mediaType: 'none',
    highlightPadding: 8,
  },
  {
    id: 'notifications',
    title: 'Stay Updated with Notifications',
    description: 'The notifications bell keeps you informed about new teachings, upcoming events, course updates, and important announcements. Click the bell icon to view all your notifications and never miss an important update.',
    targetSelector: '[data-tour="notifications"]',
    position: 'bottom',
    mediaType: 'image',
    mediaUrl: '/tour/notifications-preview.png',
    highlightPadding: 12,
  },
  {
    id: 'website-link',
    title: 'Return to Main Website',
    description: 'Need to explore our courses, retreats, or store? Click the "Go to website" button in the top right to return to the main Sat Yoga website at any time. You can always come back to your dashboard by clicking "Login" and selecting "Dashboard".',
    targetSelector: '[data-tour="website-link"]',
    position: 'bottom',
    highlightPadding: 12,
  },
];

/**
 * Get tour step by ID
 */
export function getTourStep(stepId: string): TourStep | undefined {
  return tourSteps.find(step => step.id === stepId);
}

/**
 * Get total number of tour steps
 */
export function getTotalSteps(): number {
  return tourSteps.length;
}

/**
 * Get step index (1-based) by ID
 */
export function getStepIndex(stepId: string): number {
  const index = tourSteps.findIndex(step => step.id === stepId);
  return index === -1 ? 0 : index + 1;
}
