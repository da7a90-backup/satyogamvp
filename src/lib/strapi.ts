/**
 * Utility functions for interacting with the Strapi API
 */

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";

/**
 * Get auth token from local storage
 */
export const getToken = (): string | null => {
  //   if (typeof window === "undefined") {
  //     // For server-side rendering, use the environment variable directly
  //     return process.env.NEXT_PUBLIC_STRAPI_TOKEN || null;
  //   }
  //   // For client-side, we could either use localStorage or the environment variable
  //   return (
  //     localStorage.getItem("jwt") || process.env.NEXT_PUBLIC_STRAPI_TOKEN || null
  //   );

  return process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || null;
};

/**
 * Basic headers for API requests
 */
export const getHeaders = (includeAuth = true): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Fetch data from Strapi API with better error handling
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: getHeaders(),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return await response.json();
}

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
    // Add publication state if provided
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

/**
 * Blog specific API methods
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
    return fetchAPI("/api/blog-posts", {
      method: "POST",
      body: JSON.stringify({ data: postData }),
    });
  },

  /**
   * Update an existing blog post
   */
  updatePost: async (id: string, postData: any) => {
    return fetchAPI(`/api/blog-posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: postData }),
    });
  },

  /**
   * Delete a blog post
   */
  deletePost: async (id: string) => {
    return fetchAPI(`/api/blog-posts/${id}`, {
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
    return fetchAPI("/api/blog-categories", {
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

      // Add more detailed console logging to see the response structure
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
      // Make sure we have valid integers for both IDs
      const categoryIdInt = parseInt(categoryId, 10);
      const currentPostIdInt = parseInt(currentPostId, 10);

      // Skip category filter if categoryId is invalid
      if (isNaN(categoryIdInt)) {
        console.warn("Invalid category ID, fetching recent posts instead");

        // Fallback to just get latest posts excluding current post
        const url = buildStrapiUrl(
          "/api/blog-posts",
          {
            id: { $ne: currentPostIdInt }, // Exclude current post only
          },
          { pageSize: limit },
          ["publishedAt:desc"],
          ["featuredImage", "author", "category"]
        );

        return await fetchAPI(url);
      }

      // Use proper category filtering with valid integers
      const url = buildStrapiUrl(
        "/api/blog-posts",
        {
          // Filter by category, ensuring it's properly formatted
          category: { id: categoryIdInt },
          // Exclude current post
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
      // Return an empty result instead of failing
      return { data: [] };
    }
  },
};


/**
 * Homepage and general API methods (Updated)
 */
export const homeApi = {
  /**
   * Get homepage data with all sections and toggle states
   */
  getHomePageData: async () => {
    try {
      // Try multiple approaches to get the data with proper population
      const populateString = [
        'hero.backgroundImage',
        'hero.backgroundVideo',
        'aboutSection.mainImage',
        'aboutSection.galleryImages',
        'shunyamurtiSection.authorImage',
        'learningOptions.tabs',
        'ashramSection.mainImage',
        'ashramSection.galleryImages',
        'platformSection.mainImage',
        'platformSection.galleryImages',
        'membershipCta.backgroundImage',
        'membershipCta.backgroundVideo',
        'seo.metaImage'
      ].join(',');

      const url = `/api/home-page?populate=${populateString}`;
      console.log("Fetching homepage data from:", url);

      const result: any = await fetchAPI(url);
      console.log("Homepage API response structure:", Object.keys(result));

      if (result.data && result.data.attributes) {
        console.log("Homepage attributes available:", Object.keys(result.data.attributes));
        return result.data.attributes;
      } else {
        console.log("Unexpected homepage data structure, returning empty object");
        return {};
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      throw error;
    }
  },

  /**
   * Get featured blog posts for homepage (Updated)
   */
  getFeaturedBlogPosts: async (limit = 5) => {
    try {
      const url = buildStrapiUrl(
        "/api/blog-posts",
        { publishedAt: { $notNull: true } }, // Only published posts
        { pageSize: limit },
        ["publishedAt:desc"],
        ["featuredImage", "author.avatar", "category"]
      );
      
      console.log("Fetching blog posts from:", url);
      const response: any = await fetchAPI(url);
      
      console.log(`Blog API returned ${response.data?.length || 0} posts`);
      return response;
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      return { data: [] };
    }
  },

  /**
   * Get upcoming events (Updated)
   */
  getUpcomingEvents: async (type = "all", limit = 10) => {
    try {
      const now = new Date().toISOString();
      let filters: any = {
        startDate: { $gt: now },
        publishedAt: { $notNull: true }
      };

      if (type === "onsite" || type === "online") {
        filters.locationType = { $eq: type };
      }

      const url = buildStrapiUrl(
        "/api/events",
        filters,
        { pageSize: limit },
        "startDate:asc",
        ["featuredImage", "location"]
      );

      return fetchAPI(url);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error;
    }
  },
};

// Add this helper function to handle media URLs
export const getStrapiMediaUrl = (media: any): string => {
  if (!media) return '';
  
  // Handle both single media and media arrays
  const mediaItem = Array.isArray(media) ? media[0] : media;
  
  if (mediaItem?.data?.attributes?.url) {
    const url = mediaItem.data.attributes.url;
    // If URL is relative, prepend the Strapi base URL
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  }
  
  return '';
};

// Update the existing default export
export default {
  fetchAPI,
  blogApi,
  homeApi,
  getToken,
  getHeaders,
  buildStrapiUrl,
  getStrapiMediaUrl,
};
