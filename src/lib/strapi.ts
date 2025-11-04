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

  /**
   * Get all blog categories (alias for getCategories)
   */
  getAllCategories: async () => {
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
 * Homepage and general API methods
 */
export const homeApi = {
  /**
   * Get homepage data with all sections
   */
  getHomePageData: async () => {
    try {
      // Try three different approaches to populate data and use the first one that works

      // Approach 1: Simple populate parameter string
      const url1 =
        "/api/home-page?populate=hero,aboutSection,shunyamurtiSection,learningOptions.tabs,membershipCta,seo";
      console.log("Trying URL approach 1:", url1);

      try {
        const result1: any = await fetchAPI(url1);
        console.log(
          "Approach 1 succeeded! Response structure:",
          Object.keys(result1)
        );

        // Check if we have the expected data structure
        if (result1.data && result1.data.attributes) {
          console.log(
            "Data attributes available:",
            Object.keys(result1.data.attributes)
          );
          return result1.data.attributes;
        } else {
          console.log(
            "Expected data structure not found in approach 1 response"
          );
          // Continue to next approach if we don't have the expected structure
        }
      } catch (error1) {
        console.log(
          "Approach 1 failed:",
          error1 instanceof Error ? error1.message : String(error1)
        );
        // Continue to next approach if this one fails
      }

      // Approach 2: Expanded populate syntax
      const url2 =
        "/api/home-page?populate[hero][populate]=*&populate[aboutSection][populate]=*&populate[shunyamurtiSection][populate]=*&populate[learningOptions][populate][tabs][populate]=*&populate[membershipCta][populate]=*&populate[seo][populate]=*";
      console.log("Trying URL approach 2:", url2);

      try {
        const result2: any = await fetchAPI(url2);
        console.log(
          "Approach 2 succeeded! Response structure:",
          Object.keys(result2)
        );

        if (result2.data && result2.data.attributes) {
          console.log(
            "Data attributes available:",
            Object.keys(result2.data.attributes)
          );
          return result2.data.attributes;
        } else {
          console.log(
            "Expected data structure not found in approach 2 response"
          );
        }
      } catch (error2) {
        console.log(
          "Approach 2 failed:",
          error2 instanceof Error ? error2.message : String(error2)
        );
      }

      // Approach 3: Deep populate with nested objects
      const populateObj = {
        populate: {
          hero: { populate: "*" },
          aboutSection: { populate: "*" },
          shunyamurtiSection: { populate: "*" },
          learningOptions: {
            populate: {
              tabs: { populate: "*" },
            },
          },
          membershipCta: { populate: "*" },
          seo: { populate: "*" },
        },
      };

      // Convert to query string manually
      const url3 = `/api/home-page?${new URLSearchParams({
        populate: JSON.stringify(populateObj.populate),
      }).toString()}`;
      console.log("Trying URL approach 3:", url3);

      try {
        const result3: any = await fetchAPI(url3);
        console.log(
          "Approach 3 succeeded! Response structure:",
          Object.keys(result3)
        );

        if (result3.data && result3.data.attributes) {
          console.log(
            "Data attributes available:",
            Object.keys(result3.data.attributes)
          );
          return result3.data.attributes;
        } else {
          console.log(
            "Expected data structure not found in approach 3 response"
          );
        }
      } catch (error3) {
        console.log(
          "Approach 3 failed:",
          error3 instanceof Error ? error3.message : String(error3)
        );
      }

      // If we get here, all approaches failed but didn't throw
      // Return a minimal structure to prevent errors
      console.log(
        "All approaches completed but didn't return valid data structure. Returning minimal structure."
      );
      return {};
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      throw error;
    }
  },
  /**
   * Get featured blog posts for homepage
   */
  getFeaturedBlogPosts: async (limit = 5) => {
    try {
      // First, try a straightforward approach with populate
      const url = `/api/blog-posts?sort=publishedAt:desc&pagination[pageSize]=${limit}&populate=featuredImage,author,category`;
      console.log("Fetching blog posts from:", url);

      // Request with detailed logging
      try {
        const response: any = await fetchAPI(url);

        // Log information about the response structure
        console.log(
          "Blog API response structure:",
          Object.keys(response).join(", "),
          response.data
            ? `Data array length: ${response.data.length}`
            : "No data array"
        );

        // Log sample of first post if available
        if (response.data && response.data.length > 0) {
          const firstPost = response.data[0];
          console.log("First post ID:", firstPost.id);
          console.log(
            "First post attributes keys:",
            Object.keys(firstPost.attributes || {}).join(", ")
          );

          // Check for image data
          if (firstPost.attributes?.featuredImage) {
            console.log(
              "Image data structure:",
              JSON.stringify(
                firstPost.attributes.featuredImage,
                null,
                2
              ).substring(0, 200) + "..."
            );
          }
        }

        return response;
      } catch (error) {
        console.error("First blog fetch approach failed:", error);

        // Try an alternative approach with deep populate
        const url2 = `/api/blog-posts?sort=publishedAt:desc&pagination[pageSize]=${limit}&populate[featuredImage][populate]=*&populate[author][populate]=*&populate[category][populate]=*`;
        console.log("Trying alternative blog fetch approach:", url2);

        const response2 = await fetchAPI(url2);
        return response2;
      }
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      // Return an empty result instead of throwing
      return { data: [] };
    }
  },
  /**
   * Get upcoming events
   */
  getUpcomingEvents: async (type = "all", limit = 10) => {
    try {
      const now = new Date().toISOString();

      // Build filters
      let filters: any = {
        startDate: {
          $gt: now,
        },
      };

      // Add location type filter if provided
      if (type === "onsite" || type === "online") {
        filters.location = {
          $eq: type.charAt(0).toUpperCase() + type.slice(1),
        };
      }

      const url = buildStrapiUrl(
        "/api/events",
        filters,
        { pageSize: limit },
        "startDate:asc",
        "*"
      );

      return fetchAPI(url);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error;
    }
  },
};

export default {
  fetchAPI,
  blogApi,
  homeApi,
  getToken,
  getHeaders,
  buildStrapiUrl,
};
