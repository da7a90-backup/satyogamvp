import { getFastapiUrl } from './api-utils';
/**
 * API client for Shunyamurti Recommends (Books & Documentaries)
 * Requires GYANI+ membership access
 */

const FASTAPI_URL = getFastapiUrl();

// Frontend interface
export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  description?: string;
  recommendationType: 'book' | 'documentary';

  // Book fields
  author?: string;
  amazonUrl?: string;
  coverImageUrl?: string;

  // Documentary fields
  youtubeId?: string;
  duration?: number;
  thumbnailUrl?: string;

  // Common fields
  category?: string;
  accessLevel: string;
  displayOrder: number;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationsListResponse {
  recommendations: Recommendation[];
  total: number;
  skip: number;
  limit: number;
}

export interface RecommendationsFilters {
  recommendationType?: 'book' | 'documentary';
  category?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// Backend API types
interface APIRecommendation {
  id: string;
  slug: string;
  title: string;
  description?: string;
  recommendation_type: string;
  author?: string;
  amazon_url?: string;
  cover_image_url?: string;
  youtube_id?: string;
  duration?: number;
  thumbnail_url?: string;
  category?: string;
  access_level: string;
  display_order: number;
  published_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform backend recommendation to frontend format
 */
function transformRecommendation(apiRec: APIRecommendation): Recommendation {
  return {
    id: apiRec.id,
    slug: apiRec.slug,
    title: apiRec.title,
    description: apiRec.description,
    recommendationType: apiRec.recommendation_type as 'book' | 'documentary',
    author: apiRec.author,
    amazonUrl: apiRec.amazon_url,
    coverImageUrl: apiRec.cover_image_url,
    youtubeId: apiRec.youtube_id,
    duration: apiRec.duration,
    thumbnailUrl: apiRec.thumbnail_url,
    category: apiRec.category,
    accessLevel: apiRec.access_level,
    displayOrder: apiRec.display_order,
    publishedDate: apiRec.published_date,
    createdAt: apiRec.created_at,
    updatedAt: apiRec.updated_at,
  };
}

/**
 * Get all recommendations with filters
 * Requires authentication token (GYANI+ access)
 */
export async function getRecommendations(
  token: string,
  filters?: RecommendationsFilters
): Promise<RecommendationsListResponse> {
  const params = new URLSearchParams();

  if (filters?.recommendationType) {
    params.append('recommendation_type', filters.recommendationType);
  }
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.limit !== undefined) {
    params.append('limit', filters.limit.toString());
  }

  const url = `${FASTAPI_URL}/api/recommendations/?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GYANI_PLUS_REQUIRED');
    }
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    recommendations: data.recommendations.map(transformRecommendation),
    total: data.total,
    skip: data.skip,
    limit: data.limit,
  };
}

/**
 * Get a single recommendation by slug
 * Requires authentication token (GYANI+ access)
 */
export async function getRecommendation(
  slug: string,
  token: string
): Promise<Recommendation> {
  const url = `${FASTAPI_URL}/api/recommendations/${slug}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GYANI_PLUS_REQUIRED');
    }
    if (response.status === 404) {
      throw new Error('Recommendation not found');
    }
    throw new Error(`Failed to fetch recommendation: ${response.statusText}`);
  }

  const data = await response.json();
  return transformRecommendation(data);
}

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

/**
 * Get all recommendations (admin only)
 */
export async function getRecommendationsAdmin(
  token: string,
  filters?: RecommendationsFilters
): Promise<RecommendationsListResponse> {
  const params = new URLSearchParams();

  if (filters?.recommendationType) {
    params.append('recommendation_type', filters.recommendationType);
  }
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.skip !== undefined) {
    params.append('skip', filters.skip.toString());
  }
  if (filters?.limit !== undefined) {
    params.append('limit', filters.limit.toString());
  }

  const url = `${FASTAPI_URL}/api/recommendations/admin/list?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    recommendations: data.recommendations.map(transformRecommendation),
    total: data.total,
    skip: data.skip,
    limit: data.limit,
  };
}

/**
 * Create a new recommendation (admin only)
 */
export async function createRecommendation(
  token: string,
  data: Partial<Recommendation>
): Promise<Recommendation> {
  const payload = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    recommendation_type: data.recommendationType,
    author: data.author,
    amazon_url: data.amazonUrl,
    cover_image_url: data.coverImageUrl,
    youtube_id: data.youtubeId,
    duration: data.duration,
    thumbnail_url: data.thumbnailUrl,
    category: data.category,
    access_level: data.accessLevel || 'gyani',
    display_order: data.displayOrder || 0,
    published_date: data.publishedDate,
  };

  const response = await fetch(`${FASTAPI_URL}/api/recommendations/admin/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create recommendation');
  }

  const result = await response.json();
  return transformRecommendation(result);
}

/**
 * Update a recommendation (admin only)
 */
export async function updateRecommendation(
  token: string,
  recommendationId: string,
  data: Partial<Recommendation>
): Promise<Recommendation> {
  const payload: any = {};

  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.recommendationType !== undefined) payload.recommendation_type = data.recommendationType;
  if (data.author !== undefined) payload.author = data.author;
  if (data.amazonUrl !== undefined) payload.amazon_url = data.amazonUrl;
  if (data.coverImageUrl !== undefined) payload.cover_image_url = data.coverImageUrl;
  if (data.youtubeId !== undefined) payload.youtube_id = data.youtubeId;
  if (data.duration !== undefined) payload.duration = data.duration;
  if (data.thumbnailUrl !== undefined) payload.thumbnail_url = data.thumbnailUrl;
  if (data.category !== undefined) payload.category = data.category;
  if (data.accessLevel !== undefined) payload.access_level = data.accessLevel;
  if (data.displayOrder !== undefined) payload.display_order = data.displayOrder;
  if (data.publishedDate !== undefined) payload.published_date = data.publishedDate;

  const response = await fetch(`${FASTAPI_URL}/api/recommendations/admin/${recommendationId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update recommendation');
  }

  const result = await response.json();
  return transformRecommendation(result);
}

/**
 * Delete a recommendation (admin only)
 */
export async function deleteRecommendation(
  token: string,
  recommendationId: string
): Promise<void> {
  const response = await fetch(`${FASTAPI_URL}/api/recommendations/admin/${recommendationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete recommendation');
  }
}

/**
 * Upload cover image for book (admin only)
 */
export async function uploadCoverImage(
  token: string,
  file: File,
  altText?: string
): Promise<{ imageId: string; url: string; variants: string[] }> {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) {
    formData.append('alt_text', altText);
  }

  const response = await fetch(`${FASTAPI_URL}/api/recommendations/admin/upload-cover`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload cover image');
  }

  const result = await response.json();
  return {
    imageId: result.image_id,
    url: result.url,
    variants: result.variants || [],
  };
}
