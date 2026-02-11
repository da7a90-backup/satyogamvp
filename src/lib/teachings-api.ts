import { getFastapiUrl } from './api-utils';
/**
 * Server-side functions to fetch teachings data from backend API
 * Transforms backend response to match frontend interface
 */

// Frontend interface (matches TeachingLibrary component)
interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'preview' | 'restricted';
  mediaType: 'video' | 'audio' | 'text';
  pageCount?: number;
  slug: string;
  categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
}

interface TeachingLibraryData {
  isLoggedIn: boolean;
  sectionTitle: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  featuredTeaching: Teaching;
  categories: Array<{
    label: string;
    key: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  }>;
  allTeachings: Teaching[];
  totalCount: number;
}

// Backend API types
interface APITeaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: 'VIDEO' | 'AUDIO' | 'TEXT';
  access_level: 'FREE' | 'PREVIEW' | 'PRAGYANI' | 'PRAGYANI_PLUS';
  thumbnail_url?: string;
  duration?: number;
  published_date: string;
  category?: string;
  can_access: boolean;
  access_type: 'full' | 'preview' | 'none';
}

/**
 * Transform backend teaching to frontend format
 */
function transformTeaching(apiTeaching: any): Teaching {
  // Use category field directly from database (already normalized)
  // Database categories: 'video_teaching', 'guided_meditation', 'essay', 'qa'
  const categoryField = apiTeaching.category?.toLowerCase().replace(/\s+/g, '_') || 'video_teaching';

  let categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay' = 'video_teaching';

  if (categoryField === 'essay' || categoryField === 'essays') {
    categoryType = 'essay';
  } else if (categoryField === 'guided_meditation' || categoryField.includes('meditation')) {
    categoryType = 'guided_meditation';
  } else if (categoryField === 'qa' || categoryField === 'q&a' || categoryField === 'q_&_a') {
    categoryType = 'qa';
  } else {
    // Default to video_teaching for anything else
    categoryType = 'video_teaching';
  }

  // Determine access type - use backend's access_type directly
  const accessType: 'free' | 'preview' | 'restricted' =
    apiTeaching.access_type === 'free' ? 'free' :
    apiTeaching.access_type === 'preview' ? 'preview' :
    'restricted';

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '45 minutes'; // Default
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Map content type to media type
  const contentTypeStr = String(apiTeaching.content_type).replace('ContentType.', '').toLowerCase();

  let mediaType: 'video' | 'audio' | 'text' = 'video';
  if (contentTypeStr === 'essay') {
    mediaType = 'text';
  } else if (contentTypeStr === 'audio') {
    mediaType = 'audio';
  } else {
    // video and meditation both display as video
    mediaType = 'video';
  }

  return {
    id: apiTeaching.id,
    thumbnail: apiTeaching.thumbnail_url || 'https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/98b66756-25e9-42fe-4b4a-2c51caf39b00/public',
    title: apiTeaching.title,
    description: apiTeaching.description || '',
    date: formatDate(apiTeaching.published_date),
    duration: formatDuration(apiTeaching.duration),
    accessType,
    mediaType,
    slug: apiTeaching.slug,
    categoryType,
    ...(apiTeaching.content_type === 'TEXT' && { pageCount: 2 }), // Estimate for essays
  };
}

/**
 * Fetch teachings data from backend API (server-side)
 */
export async function getTeachingsData(isLoggedIn: boolean): Promise<TeachingLibraryData> {
  // Use 127.0.0.1 instead of localhost for server-side fetching
  const API_BASE_URL = getFastapiUrl();

  console.log('===== [getTeachingsData] START =====');
  console.log('[getTeachingsData] Environment:', process.env.NODE_ENV);
  console.log('[getTeachingsData] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('[getTeachingsData] NEXT_PUBLIC_FASTAPI_URL:', process.env.NEXT_PUBLIC_FASTAPI_URL);
  console.log('[getTeachingsData] Final API_BASE_URL:', API_BASE_URL);
  console.log('[getTeachingsData] Fetching from:', `${getFastapiUrl()}/api/teachings?limit=1000`);
  console.log('[getTeachingsData] isLoggedIn:', isLoggedIn);

  try {
    // Fetch teachings from backend with timeout
    // Using high limit to get all teachings (we have 693 total)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log('[getTeachingsData] Starting fetch...');
    const fetchStart = Date.now();

    const response = await fetch(`${getFastapiUrl()}/api/teachings?limit=1000`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const fetchDuration = Date.now() - fetchStart;
    console.log('[getTeachingsData] Fetch completed in', fetchDuration, 'ms');
    console.log('[getTeachingsData] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[getTeachingsData] API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[getTeachingsData] Error response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    console.log('[getTeachingsData] Parsing JSON response...');
    const data = await response.json();
    console.log('[getTeachingsData] Received', data.total, 'teachings from API');
    console.log('[getTeachingsData] First teaching raw data:', JSON.stringify(data.teachings[0], null, 2));

    // Transform to frontend format
    const transformedTeachings: Teaching[] = data.teachings.map(transformTeaching);

    // Debug: Count teachings by category type
    const categoryCounts = transformedTeachings.reduce((acc, t) => {
      acc[t.categoryType] = (acc[t.categoryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[getTeachingsData] Category distribution:', categoryCounts);
    console.log('[getTeachingsData] Sample transformed teaching:', JSON.stringify(transformedTeachings[0], null, 2));

    // Sort by date (newest first)
    transformedTeachings.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Select featured teaching (first free or accessible teaching)
    const featuredTeaching = transformedTeachings.find(t => t.accessType === 'free') || transformedTeachings[0];

    if (!featuredTeaching) {
      console.error('[getTeachingsData] ERROR: No featured teaching found!');
      throw new Error('No teachings available');
    }

    console.log('[getTeachingsData] Featured teaching:', featuredTeaching.title);
    console.log('[getTeachingsData] Total transformed teachings:', transformedTeachings.length);
    console.log('===== [getTeachingsData] SUCCESS =====');

    // Create library data
    return {
      isLoggedIn,
      sectionTitle: 'Teachings Library',
      viewAllLink: {
        text: 'View all',
        url: '/teachings'
      },
      featuredTeaching,
      categories: [
        { label: 'Video teachings', key: 'video_teaching' },
        { label: 'Guided meditations', key: 'guided_meditation' },
        { label: 'Q&A', key: 'qa' },
        { label: 'Essays', key: 'essay' },
      ],
      allTeachings: transformedTeachings,
      totalCount: data.total,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('===== [getTeachingsData] ERROR =====');
    console.error('[getTeachingsData] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[getTeachingsData] Error message:', errorMessage);
    console.error('[getTeachingsData] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[getTeachingsData] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // If it's an abort error, the fetch timed out
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[getTeachingsData] !!!! FETCH TIMED OUT AFTER 10 SECONDS !!!!');
    }

    console.warn('[getTeachingsData] Returning fallback data due to error');

    // Return fallback/empty data instead of throwing
    // This allows the page to render even if the API is down
    const fallbackTeaching: Teaching = {
      id: '1',
      thumbnail: '/default-thumbnail.jpg',
      title: 'Welcome to Sat Yoga Teachings',
      description: 'Explore our collection of teachings, meditations, and wisdom.',
      date: 'October 25, 2025',
      duration: '45 minutes',
      accessType: 'free',
      mediaType: 'video',
      slug: 'welcome',
      categoryType: 'video_teaching',
    };

    console.log('[getTeachingsData] Returning fallback data');

    return {
      isLoggedIn,
      sectionTitle: 'Teachings Library',
      viewAllLink: {
        text: 'View all',
        url: '/teachings'
      },
      featuredTeaching: fallbackTeaching,
      categories: [
        { label: 'Video teachings', key: 'video_teaching' },
        { label: 'Guided meditations', key: 'guided_meditation' },
        { label: 'Q&A', key: 'qa' },
        { label: 'Essays', key: 'essay' },
      ],
      allTeachings: [fallbackTeaching],
      totalCount: 0,
    };
  }
}
