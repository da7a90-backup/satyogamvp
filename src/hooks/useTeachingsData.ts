/**
 * Custom hook to fetch teachings data from backend API
 * Transforms backend response to match frontend interface
 */

import { useEffect, useState } from 'react';
import { backendAPI, Teaching as APITeaching } from '@/lib/backend-api';

// Frontend interface (matches TeachingLibrary component)
interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'restricted';
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

/**
 * Transform backend teaching to frontend format
 */
function transformTeaching(apiTeaching: APITeaching): Teaching {
  // Determine category type based on content_type and tags
  let categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay' = 'video_teaching';

  if (apiTeaching.content_type === 'TEXT') {
    categoryType = 'essay';
  } else if (apiTeaching.category?.toLowerCase().includes('meditation')) {
    categoryType = 'guided_meditation';
  } else if (apiTeaching.category?.toLowerCase().includes('q&a') || apiTeaching.category?.toLowerCase().includes('qa')) {
    categoryType = 'qa';
  }

  // Determine access type
  const accessType: 'free' | 'restricted' =
    apiTeaching.access_level === 'FREE' || apiTeaching.can_access
      ? 'free'
      : 'restricted';

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '45 minutes'; // Default
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return {
    id: apiTeaching.id,
    thumbnail: apiTeaching.thumbnail_url || '/default-thumbnail.jpg',
    title: apiTeaching.title,
    description: apiTeaching.description || '',
    date: formatDate(apiTeaching.published_date),
    duration: formatDuration(apiTeaching.duration),
    accessType,
    mediaType: apiTeaching.content_type.toLowerCase() as 'video' | 'audio' | 'text',
    slug: apiTeaching.slug,
    categoryType,
    ...(apiTeaching.content_type === 'TEXT' && { pageCount: 2 }), // Estimate for essays
  };
}

/**
 * Hook to fetch teachings data from backend
 */
export function useTeachingsData(isLoggedIn: boolean): {
  data: TeachingLibraryData | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<TeachingLibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch teachings from backend
        const response = await backendAPI.teachings.getTeachings({
          limit: 100, // Get more teachings for better filtering
        });

        // Transform to frontend format
        const transformedTeachings = response.teachings.map(transformTeaching);

        // Sort by date (newest first)
        transformedTeachings.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Select featured teaching (first free or accessible teaching)
        const featuredTeaching = transformedTeachings.find(t => t.accessType === 'free') || transformedTeachings[0];

        if (!featuredTeaching) {
          throw new Error('No teachings available');
        }

        // Create library data
        const libraryData: TeachingLibraryData = {
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
          totalCount: response.total,
        };

        setData(libraryData);
      } catch (err) {
        console.error('Error fetching teachings:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch teachings'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoggedIn]);

  return { data, loading, error };
}
