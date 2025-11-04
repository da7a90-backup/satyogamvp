/**
 * Static Content API Client
 *
 * Fetches homepage, FAQ, contact, membership, and donation data
 * from FastAPI backend (migrated from frontend static files)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ContentAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ContentAPIError';
  }
}

/**
 * Base fetch with error handling
 */
async function contentFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`[Static Content API] Fetching: ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store', // Disable Next.js caching during development
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Static Content API] Error ${response.status}:`, errorData);
      throw new ContentAPIError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log(`[Static Content API] Success:`, endpoint, data);
    return data;
  } catch (error) {
    if (error instanceof ContentAPIError) {
      throw error;
    }
    console.error(`[Static Content API] Network error:`, error);
    throw new ContentAPIError(
      'Network error',
      0,
      error
    );
  }
}

/**
 * Static Content API
 */
export const staticContentAPI = {
  /**
   * Get homepage data (all sections)
   */
  getHomepage: async () => {
    return contentFetch('/api/pages/homepage');
  },

  /**
   * Get page data by slug
   */
  getPage: async (slug: string) => {
    return contentFetch(`/api/pages/${slug}`);
  },

  /**
   * Get all FAQs or filter by category
   */
  getFAQs: async (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return contentFetch(`/api/faqs${query}`);
  },

  /**
   * Get FAQ categories
   */
  getFAQCategories: async () => {
    return contentFetch('/api/faqs/categories');
  },

  /**
   * Get contact page info
   */
  getContactInfo: async () => {
    return contentFetch('/api/contact/info');
  },

  /**
   * Get contact form fields configuration
   */
  getContactFormFields: async () => {
    return contentFetch('/api/contact/form-fields');
  },

  /**
   * Get membership pricing tiers
   */
  getMembershipPricing: async () => {
    return contentFetch('/api/membership/pricing');
  },

  /**
   * Get donation projects
   */
  getDonationProjects: async () => {
    return contentFetch('/api/donations/projects');
  },

  /**
   * Get courses page data
   */
  getCoursesPageData: async () => {
    return contentFetch('/api/courses/page-data');
  },

  /**
   * Get online retreats
   */
  getOnlineRetreats: async () => {
    return contentFetch('/api/online-retreats');
  },

  /**
   * Get single online retreat by slug
   */
  getOnlineRetreat: async (slug: string) => {
    return contentFetch(`/api/online-retreats/${slug}`);
  },

  /**
   * Get galleries for a page
   */
  getGallery: async (page: string, section?: string) => {
    const query = section ? `?page=${page}&section=${section}` : `?page=${page}`;
    return contentFetch(`/api/galleries${query}`);
  },
};

// Export default
export default staticContentAPI;
