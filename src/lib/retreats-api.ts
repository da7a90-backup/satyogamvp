import { getFastapiUrl } from './api-utils';
/**
 * Retreats API Client
 * Handles all communication with the FastAPI backend for retreats
 */

const FASTAPI_URL = getFastapiUrl();

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fastapi_token');
}

/**
 * Create headers with authentication
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * API Error class
 */
export class RetreatsAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'RetreatsAPIError';
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface Retreat {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  price_lifetime: number | null;
  price_limited: number | null;
  price_onsite: number | null;
  thumbnail_url: string | null;
  duration_days: number | null;
  has_audio: boolean;
  has_video: boolean;
  is_published: boolean;
  is_registered: boolean;
  registration_status?: string;
  access_type?: string | null;
  max_participants?: number | null;

  // Portal page data
  invitation_video_url?: string | null;
  announcement?: string | null;
  about_content?: string | null;
  about_image_url?: string | null;
  preparation_instructions?: Array<{ title: string; description: string }>;
  faq_data?: Array<{ question: string; answer: string }>;
  live_schedule?: Array<LiveScheduleDay>;

  // Portal content (only if registered and has access)
  portals?: Array<RetreatPortalDay>;
  can_access?: boolean;
  registered_at?: string;
  access_expires_at?: string | null;
}

export interface LiveScheduleDay {
  date: string;
  day_label: string;
  is_live: boolean;
  sessions: Array<{
    time: string;
    title: string;
    zoom_link?: string;
    youtube_live_id?: string;
    thumbnail_url?: string;
  }>;
}

export interface RetreatPortalDay {
  id: string;
  title: string;
  description?: string;
  content?: {
    days: Array<{
      day_number: number;
      title: string;
      sessions: Array<PortalSession>;
    }>;
  };
  order_index: number;
}

export interface PortalSession {
  time: string;
  session_title: string;
  type: 'teaching' | 'livestream' | 'essay' | 'video' | 'meditation';
  teaching_id?: string;
  zoom_link?: string;
  youtube_live_id?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  has_video: boolean;
  has_audio: boolean;
  is_text: boolean;
  description?: string;
  date?: string;
  page_count?: number;
}

export interface RetreatRegistration {
  id: string;
  retreat: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    type: string;
    thumbnail_url?: string;
    start_date?: string | null;
    end_date?: string | null;
  };
  registered_at: string;
  status: string;
  access_type: string | null;
  access_expires_at: string | null;
  can_access: boolean;
}

export interface ForumPost {
  id: string;
  retreat_id: string;
  user_id: string;
  parent_id: string | null;
  title?: string | null;
  category?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_photo: string | null;
  like_count: number;
  is_liked_by_user: boolean;
  replies: ForumPost[];
}

// ============================================================================
// TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transform retreat data from API format to component-expected format
 * Adds computed fields like 'price' and 'fixed_date' for card display
 */
export function transformRetreatForCard(retreatData: any): any {
  return {
    ...retreatData,
    // Compute display price from pricing tiers
    price: retreatData.price ||
           retreatData.price_lifetime ||
           retreatData.price_limited ||
           retreatData.price_onsite ||
           195,

    // Compute fixed_date from start_date and end_date if not provided
    fixed_date: retreatData.fixed_date || computeFixedDate(retreatData.start_date, retreatData.end_date),
  };
}

/**
 * Compute a formatted date string from start and end dates
 * Examples: "December 27-29, 2025" or "September 29-October 1, 2025"
 */
function computeFixedDate(startDate: string | null, endDate: string | null): string | null {
  if (!startDate || !endDate) return null;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    // If same month: "December 27-29, 2025"
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }

    // Different months: "September 29-October 1, 2025"
    return `${startMonth} ${startDay}-${endMonth} ${endDay}, ${year}`;
  } catch (error) {
    console.error('Error computing fixed_date:', error);
    return null;
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all retreats with optional type filter
 */
export async function getRetreats(
  retreatType?: string,
  skipVal: number = 0,
  limitVal: number = 50
): Promise<{ retreats: Retreat[]; total: number }> {
  const headers = getAuthHeaders();
  const params = new URLSearchParams({
    skip: skipVal.toString(),
    limit: limitVal.toString(),
  });

  if (retreatType) {
    params.append('retreat_type', retreatType);
  }

  const url = `${FASTAPI_URL}/api/retreats/?${params}`;
  console.log('[Retreats API] Fetching from URL:', url);
  console.log('[Retreats API] Headers:', headers);

  const response = await fetch(url, {
    headers,
    credentials: 'include',
  });

  console.log('[Retreats API] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('[Retreats API] Error response:', errorData);
    throw new RetreatsAPIError(
      'Failed to fetch retreats',
      response.status,
      errorData
    );
  }

  const data = await response.json();
  console.log('[Retreats API] Success response:', data);

  // Transform retreats to add computed fields for card display
  if (data.retreats && Array.isArray(data.retreats)) {
    data.retreats = data.retreats.map(transformRetreatForCard);
  }

  return data;
}

/**
 * Get a single retreat by slug with full details
 */
export async function getRetreatBySlug(slug: string): Promise<Retreat> {
  const headers = getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/retreats/${slug}`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to fetch retreat',
      response.status,
      await response.json()
    );
  }

  const data = await response.json();
  return transformRetreatForCard(data);
}

/**
 * Get user's retreat registrations
 */
export async function getMyRegistrations(): Promise<{
  registrations: RetreatRegistration[];
}> {
  const headers = getAuthHeaders();

  // Debug: log token
  const token = getAuthToken();
  console.log('[Retreats API] Token exists:', !!token, token?.substring(0, 20));
  console.log('[Retreats API] Fetching my-registrations from:', `${FASTAPI_URL}/api/retreats/my-registrations`);

  const response = await fetch(`${FASTAPI_URL}/api/retreats/my-registrations`, {
    headers,
    credentials: 'include',
  });

  // If not authenticated (403), return empty list instead of erroring
  if (response.status === 403) {
    console.warn('[Retreats API] 403 Forbidden - not authenticated, returning empty list');
    return { registrations: [] };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Retreats API] Error response:', response.status, errorData);
    throw new RetreatsAPIError(
      'Failed to fetch registrations',
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Register for a retreat
 */
export async function registerForRetreat(
  retreatId: string,
  accessType: 'lifetime' | 'limited_12day' | 'onsite',
  paymentId?: string
): Promise<{ message: string; registration: any }> {
  const headers = getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/retreats/register`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      retreat_id: retreatId,
      access_type: accessType,
      payment_id: paymentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new RetreatsAPIError(
      error.detail || 'Failed to register',
      response.status,
      error
    );
  }

  return response.json();
}

/**
 * Cancel retreat registration
 */
export async function cancelRegistration(
  registrationId: string
): Promise<{ message: string }> {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/retreats/cancel/${registrationId}`,
    {
      method: 'POST',
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to cancel registration',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Get members registered for a retreat
 */
export async function getRetreatMembers(
  slug: string
): Promise<{ members: Array<{
  id: string;
  name: string;
  avatar_url: string | null;
  registered_at: string;
}>; total: number }> {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/retreats/${slug}/members`,
    {
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to fetch retreat members',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Get forum posts for a retreat
 */
export async function getForumPosts(
  slug: string,
  skip: number = 0,
  limit: number = 50
): Promise<{ posts: ForumPost[]; total: number }> {
  const headers = getAuthHeaders();
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${FASTAPI_URL}/api/retreats/${slug}/forum?${params}`,
    {
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to fetch forum posts',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Create a forum post
 */
export async function createForumPost(
  slug: string,
  content: string,
  parentId?: string,
  title?: string,
  category?: string
): Promise<{ message: string; post: ForumPost }> {
  const headers = getAuthHeaders();
  const body: any = {
    content,
    parent_id: parentId,
  };

  // Only include title and category for top-level posts
  if (!parentId) {
    if (title) body.title = title;
    if (category) body.category = category;
  }

  const response = await fetch(`${FASTAPI_URL}/api/retreats/${slug}/forum`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to create post',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Like a forum post or reply
 */
export async function likeForumPost(
  slug: string,
  postId: string
): Promise<{ message: string; like_count: number }> {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/retreats/${slug}/forum/${postId}/like`,
    {
      method: 'POST',
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to like post',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Unlike a forum post or reply
 */
export async function unlikeForumPost(
  slug: string,
  postId: string
): Promise<{ message: string; like_count: number }> {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${FASTAPI_URL}/api/retreats/${slug}/forum/${postId}/like`,
    {
      method: 'DELETE',
      headers,
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to unlike post',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Add retreat to user's calendar
 * Uses existing UserCalendar model in backend
 */
export async function addToCalendar(retreatId: string): Promise<{ message: string }> {
  const headers = getAuthHeaders();
  const response = await fetch(`${FASTAPI_URL}/api/calendar/add-retreat`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      retreat_id: retreatId,
    }),
  });

  if (!response.ok) {
    throw new RetreatsAPIError(
      'Failed to add to calendar',
      response.status,
      await response.json()
    );
  }

  return response.json();
}

/**
 * Get online retreats specifically (convenience wrapper)
 * Fetches retreats with type=online and transforms for card display
 */
export async function getOnlineRetreats(limit?: number): Promise<Retreat[]> {
  try {
    const result = await getRetreats('online', 0, limit || 50);
    return result.retreats;
  } catch (error) {
    console.error('Error fetching online retreats:', error);
    return [];
  }
}
