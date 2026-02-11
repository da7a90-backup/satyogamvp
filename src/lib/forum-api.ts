/**
 * Forum API client for interacting with the FastAPI backend
 */

import { getFastapiUrl } from './api-utils';

const FASTAPI_URL = getFastapiUrl();

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  thread_count: number;
  post_count: number;
  latest_thread?: ForumThreadSummary;
  created_at: string;
  updated_at: string;
}

export interface ForumUserSummary {
  id: string;
  name: string;
  membership_tier: string;
}

export interface ForumThreadSummary {
  id: string;
  title: string;
  slug: string;
  user: ForumUserSummary;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  post_count: number;
  created_at: string;
  last_post_at: string;
}

export interface ForumThread extends ForumThreadSummary {
  category: ForumCategory;
  updated_at: string;
}

export interface ForumThreadDetail extends ForumThread {
  posts: ForumPost[];
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user: ForumUserSummary;
  parent_post_id?: string;
  content: string;
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  reaction_counts: Record<string, number>;
  user_reaction?: string;
  reply_count: number;
  replies: ForumPost[];
  attachments: ForumAttachment[];
  can_edit: boolean;
  can_delete: boolean;
}

export interface ForumAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface CreateThreadRequest {
  title: string;
  category_id: string;
  initial_post_content: string;
  attachments?: string[];
}

export interface CreatePostRequest {
  thread_id: string;
  content: string;
  parent_post_id?: string;
  mentioned_user_ids?: string[];
  attachments?: string[];
}

/**
 * Get authentication token from NextAuth session
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    return session?.user?.accessToken || session?.user?.jwt || null;
  } catch (error) {
    console.error('Failed to get session token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${FASTAPI_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

/**
 * Forum API methods
 */
export const forumApi = {
  // File Upload
  async uploadFile(file: File): Promise<{ url: string; filename: string; content_type: string; size: number }> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${FASTAPI_URL}/api/forum/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  // Categories
  async getCategories(): Promise<{ categories: ForumCategory[]; total: number }> {
    return apiRequest('/api/forum/categories');
  },

  async getCategory(categoryId: string): Promise<ForumCategory> {
    return apiRequest(`/api/forum/categories/${categoryId}`);
  },

  // Threads
  async getThreads(params?: {
    category_id?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<{
    threads: ForumThreadSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id);
    if (params?.search) query.append('search', params.search);
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiRequest(`/api/forum/threads?${query.toString()}`);
  },

  async getThread(threadId: string): Promise<ForumThreadDetail> {
    return apiRequest(`/api/forum/threads/${threadId}`);
  },

  async createThread(data: CreateThreadRequest): Promise<ForumThread> {
    return apiRequest('/api/forum/threads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateThread(
    threadId: string,
    data: { title?: string; category_id?: string }
  ): Promise<ForumThread> {
    return apiRequest(`/api/forum/threads/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteThread(threadId: string): Promise<void> {
    return apiRequest(`/api/forum/threads/${threadId}`, {
      method: 'DELETE',
    });
  },

  async pinThread(threadId: string): Promise<ForumThread> {
    return apiRequest(`/api/forum/threads/${threadId}/pin`, {
      method: 'POST',
    });
  },

  async lockThread(threadId: string): Promise<ForumThread> {
    return apiRequest(`/api/forum/threads/${threadId}/lock`, {
      method: 'POST',
    });
  },

  // Posts
  async createPost(data: CreatePostRequest): Promise<ForumPost> {
    return apiRequest('/api/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePost(
    postId: string,
    data: { content: string; mentioned_user_ids?: string[] }
  ): Promise<ForumPost> {
    return apiRequest(`/api/forum/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deletePost(postId: string): Promise<void> {
    return apiRequest(`/api/forum/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Reactions
  async toggleReaction(
    postId: string,
    reactionType: string
  ): Promise<{ message: string; action: string; reaction_type?: string }> {
    return apiRequest(`/api/forum/posts/${postId}/react?reaction_type=${reactionType}`, {
      method: 'POST',
    });
  },

  // Reports
  async reportPost(postId: string, reason: string): Promise<any> {
    return apiRequest('/api/forum/reports', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, reason }),
    });
  },

  // User Activity
  async getMyThreads(params?: {
    skip?: number;
    limit?: number;
  }): Promise<{
    threads: ForumThreadSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiRequest(`/api/forum/my-threads?${query.toString()}`);
  },

  async getMyPosts(params?: {
    skip?: number;
    limit?: number;
  }): Promise<{
    posts: ForumPost[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiRequest(`/api/forum/my-posts?${query.toString()}`);
  },

  // Mentions
  async getMentions(unread_only: boolean = false): Promise<{
    mentions: any[];
    unread_count: number;
    total: number;
  }> {
    return apiRequest(`/api/forum/mentions?unread_only=${unread_only}`);
  },

  async markMentionRead(mentionId: string): Promise<void> {
    return apiRequest(`/api/forum/mentions/${mentionId}/read`, {
      method: 'PATCH',
    });
  },
};
