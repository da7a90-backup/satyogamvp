import { getFastapiUrl } from './api-utils';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
const FASTAPI_URL = getFastapiUrl();

export async function submitApplication(data: any) {
  try {
    // Get auth token from session if available
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${FASTAPI_URL}/forms/application`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'retreat_onsite',
        form_data: data,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to submit application')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting application:', error)
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


// lib/api.js

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API call response
 */
// lib/api.ts

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Record<string, any>} urlParamsObject URL params object, will be stringified
 * @param {RequestInit} options Options passed to fetch
 * @returns Parsed API call response
 */
 export async function fetchAPI(
  path: string, 
  urlParamsObject: Record<string, any> = {}, 
  options: RequestInit = {}
): Promise<any> {
  // Merge default and user options
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Build request URL
  const queryString = Object.keys(urlParamsObject)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(urlParamsObject[key])}`
    )
    .join('&');
    
  const requestUrl = `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  }${path}${queryString ? `?${queryString}` : ''}`;

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions);

  // Handle response
  if (!response.ok) {
    console.error(response.statusText);
    throw new Error(`An error occurred please try again`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Get full Strapi URL from path
 * @param {string} path Path of the file
 * @returns {string} Full Strapi URL
 */
export function getStrapiMedia(path: string) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('//')) return path;
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'
  }${path}`;
}

/**
 * Fetch homepage data
 */
export async function getHomePageData() {
  try {
    const homeData = await fetchAPI('/api/homepage', {
      populate: {
        hero: {
          populate: '*',
        },
        aboutSection: {
          populate: '*',
        },
        shunyamurtiSection: {
          populate: '*',
        },
        learningOptions: {
          populate: {
            tabs: {
              populate: '*',
            },
          },
        },
        membershipCta: {
          populate: '*',
        },
        seo: {
          populate: '*',
        },
      },
    });
    
    return homeData.data.attributes;
  } catch (error) {
    console.error("Error fetching home page data:", error);
    throw error;
  }
}

/**
 * Fetch blog posts with pagination
 */
export async function getBlogPosts(page = 1, pageSize = 6, featured = false) {
  try {
    const filters = featured ? { isFeatured: { $eq: true } } : {};
    
    const data = await fetchAPI('/api/blog-posts', {
      populate: {
        featuredImage: '*',
        author: {
          populate: '*',
        },
        category: {
          populate: '*',
        },
      },
      sort: ['publishedAt:desc'],
      pagination: {
        page,
        pageSize,
      },
      filters,
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug: any) {
  try {
    const data = await fetchAPI('/api/blog-posts', {
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: {
        featuredImage: '*',
        author: {
          populate: '*',
        },
        category: {
          populate: '*',
        },
        seo: {
          populate: '*',
        },
      },
    });
    
    return data.data[0];
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw error;
  }
}

/**
 * Fetch upcoming events
 */
export async function getUpcomingEvents(type = 'all', limit = 10) {
  try {
    const now = new Date().toISOString();
    
    // Filter for dates in the future
    const filters: any = {
      startDate: {
        $gt: now,
      },
    };
    
    // Add location type filter if provided
    if (type === 'onsite' || type === 'online') {
      filters.location = {
        $eq: type.charAt(0).toUpperCase() + type.slice(1),
      };
    }
    
    const data = await fetchAPI('/api/events', {
      filters,
      sort: ['startDate:asc'],
      populate: '*',
      pagination: {
        limit,
      },
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string) {
  try {
    const data = await fetchAPI('/api/events', {
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: '*',
    });
    
    return data.data[0];
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}

/**
 * Fetch membership plans
 */
export async function getMembershipPlans() {
  try {
    const data = await fetchAPI('/api/memberships', {
      populate: {
        features: '*',
      },
      sort: ['displayOrder'],
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching membership plans:", error);
    throw error;
  }
}

/**
 * Fetch program dates for a specific program type
 */
export async function getProgramDates(programType: any) {
  try {
    const data = await fetchAPI('/api/program-dates', {
      filters: {
        program: {
          $eq: programType,
        },
      },
      sort: ['start_date:asc'],
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching program dates:", error);
    throw error;
  }
}