import { getFastapiUrl } from './api-utils';
/**
 * Blog API client for FastAPI backend
 */

const FASTAPI_URL = getFastapiUrl();

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name?: string;
  author_image?: string;
  read_time?: number;
  is_featured: boolean;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  category_id?: string;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  category?: BlogCategory;
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get blog posts with pagination and filters
 */
export async function getBlogPosts(
  page: number = 1,
  page_size: number = 10,
  search?: string,
  category_id?: string,
  is_featured?: boolean,
  is_published?: boolean  // undefined = all posts, true = only published, false = only drafts
): Promise<BlogPostListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  // Only add is_published filter if explicitly provided
  if (is_published !== undefined) {
    params.append('is_published', is_published.toString());
  }

  if (search) params.append('search', search);
  if (category_id) params.append('category_id', category_id);
  if (is_featured !== undefined) params.append('is_featured', is_featured.toString());

  const response = await fetch(`${FASTAPI_URL}/api/blog/posts?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return response.json();
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetch(`${FASTAPI_URL}/api/blog/posts/slug/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Blog post not found');
    }
    throw new Error('Failed to fetch blog post');
  }

  return response.json();
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(id: string): Promise<BlogPost> {
  const response = await fetch(`${FASTAPI_URL}/api/blog/posts/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Blog post not found');
    }
    throw new Error('Failed to fetch blog post');
  }

  return response.json();
}

/**
 * Create a new blog post (admin only)
 */
export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create blog post');
  }

  return response.json();
}

/**
 * Update a blog post (admin only)
 */
export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update blog post');
  }

  return response.json();
}

/**
 * Delete a blog post (admin only)
 */
export async function deleteBlogPost(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete blog post');
  }
}

/**
 * Get all blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const response = await fetch(`${FASTAPI_URL}/api/blog/categories`);

  if (!response.ok) {
    throw new Error('Failed to fetch blog categories');
  }

  return response.json();
}

/**
 * Create a blog category (admin only)
 */
export async function createBlogCategory(category: Partial<BlogCategory>): Promise<BlogCategory> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create category');
  }

  return response.json();
}

/**
 * Update a blog category (admin only)
 */
export async function updateBlogCategory(id: string, category: Partial<BlogCategory>): Promise<BlogCategory> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update category');
  }

  return response.json();
}

/**
 * Delete a blog category (admin only)
 */
export async function deleteBlogCategory(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete category');
  }
}

/**
 * Upload an image for blog posts (admin only)
 */
export async function uploadBlogImage(file: File): Promise<{ url: string; filename: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${FASTAPI_URL}/api/blog/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload image');
  }

  return response.json();
}

// ============================================================================
// Blog Comment API Functions
// ============================================================================

export interface BlogCommentUserInfo {
  id: string;
  full_name: string;
  email: string;
  profile_image?: string;
}

export interface BlogComment {
  id: string;
  blog_post_id: string;
  user_id: string;
  user: BlogCommentUserInfo;
  content: string;
  is_approved: boolean;
  parent_comment_id?: string;
  created_at: string;
  updated_at?: string;
  replies: BlogComment[];
}

export interface BlogCommentListResponse {
  comments: BlogComment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Get comments for a blog post
 */
export async function getBlogPostComments(
  postId: string,
  page: number = 1,
  page_size: number = 20,
  include_unapproved: boolean = false
): Promise<BlogCommentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
    include_unapproved: include_unapproved.toString(),
  });

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${FASTAPI_URL}/api/blog/posts/${postId}/comments?${params}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

/**
 * Create a new comment on a blog post (authenticated users)
 */
export async function createBlogComment(
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<BlogComment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      parent_comment_id: parentCommentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create comment');
  }

  return response.json();
}

/**
 * Update a comment (author or admin only)
 */
export async function updateBlogComment(
  commentId: string,
  content?: string,
  isApproved?: boolean
): Promise<BlogComment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const updateData: Record<string, any> = {};
  if (content !== undefined) updateData.content = content;
  if (isApproved !== undefined) updateData.is_approved = isApproved;

  const response = await fetch(`${FASTAPI_URL}/api/blog/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update comment');
  }

  return response.json();
}

/**
 * Delete a comment (author or admin only)
 */
export async function deleteBlogComment(commentId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete comment');
  }
}

/**
 * Approve a comment (admin only)
 */
export async function approveBlogComment(commentId: string): Promise<BlogComment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/comments/${commentId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to approve comment');
  }

  return response.json();
}

/**
 * Get all comments across all posts (admin only)
 */
export async function getAllBlogComments(
  page: number = 1,
  page_size: number = 20,
  isApproved?: boolean
): Promise<BlogCommentListResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  if (isApproved !== undefined) {
    params.append('is_approved', isApproved.toString());
  }

  const response = await fetch(`${FASTAPI_URL}/api/blog/comments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all comments');
  }

  return response.json();
}
