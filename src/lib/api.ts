// lib/api.ts

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

// Teaching-related TypeScript interfaces
export interface Teaching {
  id: number;
  attributes: {
    title: string;
    slug: string;
    contenttype: 'teaching' | 'guided_meditation' | 'essay' | 'qa_with_shunyamurti' | 'book_group';
    description?: string;
    content?: any;
    summary?: string;
    featuredImage?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          alternativeText?: string;
          caption?: string;
          width?: number;
          height?: number;
        };
      };
    };
    videoUrl?: string;
    videoPlatform: 'youtube' | 'rumble' | 'cloudflare' | 'none';
    videoId?: string;
    audioUrl?: string;
    audioPlatform: 'podbean' | 'direct' | 'none';
    duration?: string;
    access: 'anon' | 'free' | 'gyani' | 'pragyani' | 'pragyaniplus';
    hiddenTags?: string;
    wordpressId?: number;
    transcription?: string;
    source_file?: string;
    publishDate?: string;
    createdAt: string;
    updatedAt: string;
    previewDuration?: number;
  };
}

export interface TeachingCreateData {
  title: string;
  contenttype: 'teaching' | 'guided_meditation' | 'essay' | 'qa_with_shunyamurti' | 'book_group';
  description?: string;
  content?: any;
  summary?: string;
  featuredImage?: number;
  videoUrl?: string;
  videoPlatform: 'youtube' | 'rumble' | 'cloudflare' | 'none';
  videoId?: string;
  audioUrl?: string;
  audioPlatform: 'podbean' | 'direct' | 'none';
  duration?: string;
  access: 'anon' | 'free' | 'gyani' | 'pragyani' | 'pragyaniplus';
  hiddenTags?: string;
  wordpressId?: number;
  transcription?: string;
  source_file?: string;
  previewDuration?: number;
}

export interface TeachingFilters {
  contenttype?: 'teaching' | 'guided_meditation' | 'essay' | 'qa_with_shunyamurti' | 'book_group';
  access?: 'anon' | 'free' | 'gyani' | 'pragyani' | 'pragyaniplus';
  hiddenTags?: string;
  search?: string;
  videoPlatform?: 'youtube' | 'rumble' | 'cloudflare' | 'none';
  audioPlatform?: 'podbean' | 'direct' | 'none';
}

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

/**
 * Helper to make requests to Strapi API endpoints
 * @param {string} urlOrPath Either a full URL (if pre-built) or path with parameters
 * @param {Record<string, any>} urlParamsObject URL params object (for backward compatibility)
 * @param {RequestInit} options Options passed to fetch
 * @returns Parsed API call response
 */
 export async function fetchAPI(
  urlOrPath: string, 
  urlParamsObject: Record<string, any> = {}, 
  options: RequestInit = {}
): Promise<any> {
  // Merge default and user options
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    ...options,
  };

  let requestUrl: string;

  // Check if urlOrPath is already a full URL (contains query parameters or starts with http)
  if (urlOrPath.includes('?') || urlOrPath.startsWith('http')) {
    requestUrl = urlOrPath.startsWith('http') 
      ? urlOrPath 
      : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${urlOrPath}`;
  } else {
    // Legacy support: build URL with parameters
    requestUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${urlOrPath}`;
    
    // Only add query string if we have parameters and it's a GET request
    if (Object.keys(urlParamsObject).length > 0 && (!options.method || options.method === 'GET')) {
      const queryString = Object.keys(urlParamsObject)
        .map(
          (key) => `${encodeURIComponent(key)}=${encodeURIComponent(urlParamsObject[key])}`
        )
        .join('&');
        
      requestUrl = `${requestUrl}?${queryString}`;
    }
  }

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions);

  // Handle response
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, response.statusText, errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
 * Helper functions for hidden tags
 */
export const hiddenTagsHelpers = {
  /**
   * Check if a teaching has a specific hidden tag
   */
  hasHiddenTag: (teaching: Teaching, tag: string): boolean => {
    if (!teaching.attributes.hiddenTags) return false;
    return teaching.attributes.hiddenTags.toLowerCase().includes(tag.toLowerCase());
  },

  /**
   * Get all hidden tags from a teaching as an array
   */
  getHiddenTags: (teaching: Teaching): string[] => {
    if (!teaching.attributes.hiddenTags) return [];
    return teaching.attributes.hiddenTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  },

  /**
   * Add a hidden tag to a teaching's hiddenTags string
   */
  addHiddenTag: (currentTags: string | undefined, newTag: string): string => {
    const tags = currentTags ? currentTags.split(',').map(t => t.trim()) : [];
    if (!tags.includes(newTag)) {
      tags.push(newTag);
    }
    return tags.join(', ');
  },

  /**
   * Remove a hidden tag from a teaching's hiddenTags string
   */
  removeHiddenTag: (currentTags: string | undefined, tagToRemove: string): string => {
    if (!currentTags) return '';
    const tags = currentTags.split(',').map(t => t.trim()).filter(t => t !== tagToRemove);
    return tags.join(', ');
  }
};

/**
 * Teachings API - Complete CRUD operations for teachings collection
 */
export const teachingsApi = {
  /**
   * Get all teachings with filtering and pagination
   */
  getTeachings: async (
    page = 1,
    pageSize = 10,
    filters?: TeachingFilters,
    sort = "createdAt:desc"
  ): Promise<StrapiResponse<Teaching[]>> => {
    try {
      const strapiFilters: Record<string, any> = {};

      // Build filters for Strapi
      if (filters) {
        if (filters.contenttype) {
          strapiFilters.contenttype = { $eq: filters.contenttype };
        }
        if (filters.access) {
          strapiFilters.access = { $eq: filters.access };
        }
        if (filters.videoPlatform) {
          strapiFilters.videoPlatform = { $eq: filters.videoPlatform };
        }
        if (filters.audioPlatform) {
          strapiFilters.audioPlatform = { $eq: filters.audioPlatform };
        }
        if (filters.search) {
          strapiFilters.$or = [
            { title: { $containsi: filters.search } },
            { description: { $containsi: filters.search } },
            { summary: { $containsi: filters.search } },
          ];
        }
        // Hidden tags filtering - search within the text field
        if (filters.hiddenTags) {
          strapiFilters.hiddenTags = { $containsi: filters.hiddenTags };
        }
      }

      // Use buildStrapiUrl to properly format the query
      const url = buildStrapiUrl(
        '/api/teachings',
        Object.keys(strapiFilters).length > 0 ? strapiFilters : undefined,
        { page, pageSize },
        sort,
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data;
    } catch (error) {
      console.error("Error fetching teachings:", error);
      throw error;
    }
  },

  /**
   * Get a single teaching by ID
   */
  getTeachingById: async (id: string | number): Promise<Teaching | null> => {
    try {
      const url = buildStrapiUrl(
        `/api/teachings/${id}`,
        undefined,
        undefined,
        undefined,
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data.data;
    } catch (error) {
      console.error(`Error fetching teaching with ID "${id}":`, error);
      return null;
    }
  },

  /**
   * Get a single teaching by slug
   */
  getTeachingBySlug: async (slug: string): Promise<Teaching | null> => {
    try {
      const url = buildStrapiUrl(
        '/api/teachings',
        { slug: { $eq: slug } },
        undefined,
        undefined,
        ['featuredImage']
      );

      const data = await fetchAPI(url);

      if (!data || !data.data || data.data.length === 0) {
        return null;
      }

      return data.data[0];
    } catch (error) {
      console.error(`Error fetching teaching with slug "${slug}":`, error);
      return null;
    }
  },

  /**
   * Get teachings by hidden tags (for featured/preview content)
   */
  getTeachingsByHiddenTags: async (
    tag: string,
    limit = 3
  ): Promise<Teaching[]> => {
    try {
      const url = buildStrapiUrl(
        '/api/teachings',
        { hiddenTags: { $containsi: tag } },
        { pageSize: limit },
        'createdAt:desc',
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching teachings with hidden tag "${tag}":`, error);
      return [];
    }
  },

  /**
   * Get teachings by content type
   */
  getTeachingsByContentType: async (
    contentType: 'teaching' | 'guided_meditation' | 'essay' | 'qa_with_shunyamurti' | 'book_group',
    limit = 10
  ): Promise<Teaching[]> => {
    try {
      const url = buildStrapiUrl(
        '/api/teachings',
        { contenttype: { $eq: contentType } },
        { pageSize: limit },
        'createdAt:desc',
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching teachings with content type "${contentType}":`, error);
      return [];
    }
  },

  /**
   * Get teachings by access level (for membership gating)
   */
  getTeachingsByAccess: async (
    access: 'anon' | 'free' | 'gyani' | 'pragyani' | 'pragyaniplus',
    limit = 10
  ): Promise<Teaching[]> => {
    try {
      const url = buildStrapiUrl(
        '/api/teachings',
        { access: { $eq: access } },
        { pageSize: limit },
        'createdAt:desc',
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching teachings with access level "${access}":`, error);
      return [];
    }
  },

  /**
   * Create a new teaching
   */
  createTeaching: async (teachingData: TeachingCreateData): Promise<Teaching> => {
    try {
      const data = await fetchAPI('/api/teachings', {}, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({ data: teachingData }),
      });

      return data.data;
    } catch (error) {
      console.error("Error creating teaching:", error);
      throw error;
    }
  },

  /**
   * Update an existing teaching
   */
  updateTeaching: async (id: string | number, teachingData: Partial<TeachingCreateData>): Promise<Teaching> => {
    try {
      const data = await fetchAPI(`/api/teachings/${id}`, {}, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({ data: teachingData }),
      });

      return data.data;
    } catch (error) {
      console.error(`Error updating teaching with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Delete a teaching
   */
  deleteTeaching: async (id: string | number): Promise<void> => {
    try {
      await fetchAPI(`/api/teachings/${id}`, {}, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      });
    } catch (error) {
      console.error(`Error deleting teaching with ID "${id}":`, error);
      throw error;
    }
  },

  /**
   * Get featured teaching (latest with specific hidden tag)
   */
  getFeaturedTeaching: async (): Promise<Teaching | null> => {
    try {
      const url = buildStrapiUrl(
        '/api/teachings',
        { hiddenTags: { $containsi: 'featured' } },
        { pageSize: 1 },
        'createdAt:desc',
        ['featuredImage']
      );

      const data = await fetchAPI(url);
      return data.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching featured teaching:", error);
      return null;
    }
  },

  /**
   * Get preview teachings for anonymous users (first 3 of each category)
   */
  getPreviewTeachings: async (): Promise<{
    teachings: Teaching[];
    guided_meditations: Teaching[];
    essays: Teaching[];
    qa_sessions: Teaching[];
  }> => {
    try {
      const [teachings, guided_meditations, essays, qa_sessions] = await Promise.all([
        teachingsApi.getTeachingsByHiddenTags('preview_teaching', 3),
        teachingsApi.getTeachingsByHiddenTags('preview_meditation', 3),
        teachingsApi.getTeachingsByHiddenTags('preview_essay', 3),
        teachingsApi.getTeachingsByHiddenTags('preview_qa', 3),
      ]);

      return {
        teachings,
        guided_meditations,
        essays,
        qa_sessions,
      };
    } catch (error) {
      console.error("Error fetching preview teachings:", error);
      return {
        teachings: [],
        guided_meditations: [],
        essays: [],
        qa_sessions: [],
      };
    }
  },

  /**
   * Get teachings for homepage (with 'homepage' hidden tag)
   */
  getHomepageTeachings: async (limit = 6): Promise<Teaching[]> => {
    try {
      return await teachingsApi.getTeachingsByHiddenTags('homepage', limit);
    } catch (error) {
      console.error("Error fetching homepage teachings:", error);
      return [];
    }
  },

  /**
   * Search teachings by title, description, or tags
   */
  searchTeachings: async (
    query: string,
    page = 1,
    pageSize = 10,
    filters?: Partial<TeachingFilters>
  ): Promise<StrapiResponse<Teaching[]>> => {
    try {
      const searchFilters: TeachingFilters = {
        search: query,
        ...filters
      };

      return await teachingsApi.getTeachings(page, pageSize, searchFilters, 'createdAt:desc');
    } catch (error) {
      console.error(`Error searching teachings with query "${query}":`, error);
      throw error;
    }
  },
  
};

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

/**
 * Blog specific API methods (keeping existing functionality)
 */
export const blogApi = {
  /**
   * Get all blog posts with pagination
   */
  getPosts: async (
    page = 1,
    pageSize = 10,
    search = "",
    sort = "createdAt:desc"
  ) => {
    const filters = search ? { title: { $containsi: search } } : undefined;
    const url = buildStrapiUrl(
      "/api/blog-posts",
      filters,
      { page, pageSize },
      sort,
      ["category", "author"]
    );
    return fetchAPI(url);
  },

  /**
   * Get a single blog post by ID
   */
  getPost: async (id: string) => {
    return fetchAPI(`/api/blog-posts/${id}?populate=category,author`);
  },

  /**
   * Create a new blog post
   */
  createPost: async (postData: any) => {
    return fetchAPI("/api/blog-posts", {}, {
      method: "POST",
      body: JSON.stringify({ data: postData }),
    });
  },

  /**
   * Update an existing blog post
   */
  updatePost: async (id: string, postData: any) => {
    return fetchAPI(`/api/blog-posts/${id}`, {}, {
      method: "PUT",
      body: JSON.stringify({ data: postData }),
    });
  },

  /**
   * Delete a blog post
   */
  deletePost: async (id: string) => {
    return fetchAPI(`/api/blog-posts/${id}`, {}, {
      method: "DELETE",
    });
  },

  /**
   * Get all blog categories
   */
  getCategories: async () => {
    return fetchAPI("/api/blog-categories?sort=name:asc");
  },

  createCategory: async (categoryData: any) => {
    return fetchAPI("/api/blog-categories", {}, {
      method: "POST",
      body: JSON.stringify({ data: categoryData }),
    });
  },

  /**
   * Get a single blog post by slug
   */
  getBlogPostBySlug: async (slug: string) => {
    try {
      const url = buildStrapiUrl(
        "/api/blog-posts",
        { slug: { $eq: slug } },
        undefined,
        undefined,
        ["featuredImage", "author", "category", "seo"]
      );

      console.log(`Fetching blog post with slug: ${slug}`);

      const data: any = await fetchAPI(url);
      console.log("Blog post data structure:", JSON.stringify(data, null, 2));

      if (!data || !data.data || data.data.length === 0) {
        return null;
      }

      return data.data[0];
    } catch (error) {
      console.error(`Error fetching blog post with slug "${slug}":`, error);
      return null;
    }
  },

  /**
   * Get related blog posts (posts in the same category)
   */
  getRelatedPosts: async (
    categoryId: string,
    currentPostId: string,
    limit = 2
  ) => {
    try {
      const categoryIdInt = parseInt(categoryId, 10);
      const currentPostIdInt = parseInt(currentPostId, 10);

      if (isNaN(categoryIdInt)) {
        console.warn("Invalid category ID, fetching recent posts instead");

        const url = buildStrapiUrl(
          "/api/blog-posts",
          {
            id: { $ne: currentPostIdInt },
          },
          { pageSize: limit },
          ["publishedAt:desc"],
          ["featuredImage", "author", "category"]
        );

        return await fetchAPI(url);
      }

      const url = buildStrapiUrl(
        "/api/blog-posts",
        {
          category: { id: categoryIdInt },
          id: { $ne: currentPostIdInt },
        },
        { pageSize: limit },
        ["publishedAt:desc"],
        ["featuredImage", "author", "category"]
      );

      return await fetchAPI(url);
    } catch (error) {
      console.error(
        `Error fetching related posts for category "${categoryId}":`,
        error
      );
      return { data: [] };
    }
  },
  
};

/**
 * Helper to build Strapi URL with filters and pagination
 */
export const buildStrapiUrl = (
  endpoint: string,
  filters?: Record<string, unknown>,
  pagination?: { page?: number; pageSize?: number; publicationState?: string },
  sort?: string | string[],
  populate?: string | string[]
): string => {
  const params = new URLSearchParams();

  // Add filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value as Record<string, unknown>).forEach(
          ([operator, operatorValue]) => {
            params.append(
              `filters[${key}][${operator}]`,
              String(operatorValue)
            );
          }
        );
      } else {
        params.append(`filters[${key}]`, String(value));
      }
    });
  }

  // Add pagination
  if (pagination) {
    if (pagination.page) {
      params.append("pagination[page]", String(pagination.page));
    }
    if (pagination.pageSize) {
      params.append("pagination[pageSize]", String(pagination.pageSize));
    }
    if (pagination.publicationState) {
      params.append("publicationState", pagination.publicationState);
    }
  }

  // Add sorting
  if (sort) {
    if (Array.isArray(sort)) {
      sort.forEach((s) => {
        params.append("sort", s);
      });
    } else {
      params.append("sort", sort);
    }
  }

  // Add population
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => {
        params.append("populate", p);
      });
    } else {
      params.append("populate", populate);
    }
  }

  const queryString = params.toString();
  return `${endpoint}${queryString ? `?${queryString}` : ""}`;
};