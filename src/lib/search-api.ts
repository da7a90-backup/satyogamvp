import { getFastapiUrl } from './api-utils';
/**
 * Search API Client
 * Handles unified search across all content types
 */


export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  slug: string;
  url: string;
  type: 'teaching' | 'course' | 'product' | 'retreat' | 'blog' | 'page';
  category?: string;
  price?: number;
  retreat_type?: string;
  eyebrow?: string;
  author?: string;
  read_time?: number;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: {
    teachings: SearchResult[];
    courses: SearchResult[];
    products: SearchResult[];
    retreats: SearchResult[];
    blogs: SearchResult[];
    pages: SearchResult[];
  };
}

/**
 * Search across all content types
 */
export async function searchSite(query: string, limit: number = 5): Promise<SearchResponse> {
  if (!query || query.trim().length === 0) {
    return {
      query: '',
      total_results: 0,
      results: {
        teachings: [],
        courses: [],
        products: [],
        retreats: [],
        blogs: [],
        pages: [],
      },
    };
  }

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
    });

    const response = await fetch(`${getFastapiUrl()}/api/search?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results on error
    return {
      query,
      total_results: 0,
      results: {
        teachings: [],
        courses: [],
        products: [],
        retreats: [],
        blogs: [],
        pages: [],
      },
    };
  }
}

/**
 * Debounced search function
 * Returns a promise that resolves after the debounce delay
 */
export function debounceSearch(
  query: string,
  limit: number = 5,
  delay: number = 300
): Promise<SearchResponse> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(async () => {
      const results = await searchSite(query, limit);
      resolve(results);
    }, delay);

    // Store timeout ID for potential cancellation
    // Note: In a real implementation, you'd want to handle cleanup
    return () => clearTimeout(timeoutId);
  });
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: keyof SearchResponse['results']): string {
  const displayNames: Record<keyof SearchResponse['results'], string> = {
    teachings: 'Teachings',
    courses: 'Courses',
    products: 'Store Products',
    retreats: 'Retreats',
    blogs: 'Blog Posts',
    pages: 'Pages',
  };
  return displayNames[category];
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: keyof SearchResponse['results']): string {
  const icons: Record<keyof SearchResponse['results'], string> = {
    teachings: '🎥',
    courses: '📚',
    products: '🛍️',
    retreats: '🧘',
    blogs: '📝',
    pages: '📄',
  };
  return icons[category];
}
