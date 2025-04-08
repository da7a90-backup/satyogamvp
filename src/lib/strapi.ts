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
  pagination?: { page?: number; pageSize?: number },
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
};

export default {
  fetchAPI,
  blogApi,
  getToken,
  getHeaders,
  buildStrapiUrl,
};
