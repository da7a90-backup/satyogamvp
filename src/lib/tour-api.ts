import { getFastapiUrl } from './api-utils';
/**
 * Tour API Helper Functions
 * Handles communication with backend for tour status
 */


interface TourStatusResponse {
  has_seen_dashboard_tour: boolean;
  user_id: string;
}

interface CompleteTourResponse {
  message: string;
  has_seen_dashboard_tour: boolean;
}

/**
 * Get tour status for current user
 * @param token - Auth token
 * @returns Promise with tour status
 */
export async function getTourStatus(token: string): Promise<TourStatusResponse> {
  const response = await fetch(`${getFastapiUrl()}/api/users/me/tour-status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tour status');
  }

  return response.json();
}

/**
 * Mark tour as completed for current user
 * @param token - Auth token
 * @returns Promise with completion status
 */
export async function completeTour(token: string): Promise<CompleteTourResponse> {
  const response = await fetch(`${getFastapiUrl()}/api/users/me/complete-tour`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to complete tour');
  }

  return response.json();
}

/**
 * Check if user should see the tour
 * This checks both API status and localStorage as a fallback
 * @param token - Auth token
 * @returns Promise<boolean> - true if user should see tour
 */
export async function shouldShowTour(token: string): Promise<boolean> {
  try {
    // First check API
    const status = await getTourStatus(token);
    return !status.has_seen_dashboard_tour;
  } catch (error) {
    console.error('Error checking tour status:', error);
    // Fallback to localStorage
    const localStatus = localStorage.getItem('dashboard_tour_completed');
    return localStatus !== 'true';
  }
}

/**
 * Mark tour as completed in both API and localStorage
 * @param token - Auth token
 */
export async function markTourCompleted(token: string): Promise<void> {
  try {
    // Update API
    await completeTour(token);
    // Also update localStorage as backup
    localStorage.setItem('dashboard_tour_completed', 'true');
  } catch (error) {
    console.error('Error marking tour as completed:', error);
    // Still update localStorage even if API fails
    localStorage.setItem('dashboard_tour_completed', 'true');
  }
}
