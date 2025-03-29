const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN

export async function submitApplication(data: FormData) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/retreat-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.dir(error.error.details.errors)
      throw new Error(error || 'Failed to submit application')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting application:', error)
    throw error
  }
}


export async function getProgramDates(programType: string) {
    try {
      const response = await fetch(`${STRAPI_URL}/api/program-dates?populate=*&filters[program]=${programType}`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch program dates')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching program dates:', error)
      throw error
    }
  }

  // lib/api.ts

interface FetchAPIOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Helper function to fetch data from Strapi API
 * @param path The API endpoint path (should start with /)
 * @param options Fetch options
 * @returns The response data
 */
export async function fetchAPI<T>(path: string, options: FetchAPIOptions = {}): Promise<StrapiResponse<T>> {
  const defaultOptions: FetchAPIOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { 
      // Configure cache behavior (can be adjusted per endpoint)
      revalidate: 60, // revalidate data every 60 seconds
    },
  };
  
  const mergedOptions: FetchAPIOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  // Get API URL from environment variable with fallback
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  const response = await fetch(`${apiUrl}/api${path}`, mergedOptions);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Parse the rich text content from Strapi
 * @param content Rich text content from Strapi
 * @returns Parsed content
 */
export function parseRichText(content: any): string {
  if (!content) return '';
  
  // If content is an array of blocks (Strapi v4 format)
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (block.type === 'paragraph') {
          return block.children
            .map((child: any) => child.text)
            .join('');
        }
        return '';
      })
      .join('\n');
  }
  
  // If content is a string (older format)
  return content;
}

/**
 * Get the full URL for a media item from Strapi
 * @param media Media object from Strapi
 * @returns The full URL for the media
 */
export function getStrapiMedia(media: any): string | null {
  if (!media) return null;
  
  // Handle different Strapi versions media format
  const imageUrl = media.url || (media.data && media.data.attributes && media.data.attributes.url);
  
  if (!imageUrl) return null;
  
  // If the URL is a full URL, return it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, prefix with the Strapi URL
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  return `${strapiUrl}${imageUrl}`;
}