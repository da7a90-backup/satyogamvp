/**
 * Hidden Tags API Client
 * Manages which content entities appear on specific marketing pages
 */

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export type EntityType = 'teaching' | 'blog' | 'product' | 'retreat' | 'event';

export interface HiddenTag {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  page_tag: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface HiddenTagWithEntity extends HiddenTag {
  entity_data: Record<string, any>;
}

export interface HiddenTagCreate {
  entity_id: string;
  entity_type: EntityType;
  page_tag: string;
  order_index?: number;
}

export interface HiddenTagUpdate {
  entity_id?: string;
  entity_type?: EntityType;
  page_tag?: string;
  order_index?: number;
}

export interface HiddenTagReorder {
  tag_id: string;
  new_order_index: number;
}

/**
 * Get all hidden tags (with optional filters)
 */
export async function getHiddenTags(params?: {
  page_tag?: string;
  entity_type?: EntityType;
  skip?: number;
  limit?: number;
}): Promise<HiddenTag[]> {
  const searchParams = new URLSearchParams();
  if (params?.page_tag) searchParams.set('page_tag', params.page_tag);
  if (params?.entity_type) searchParams.set('entity_type', params.entity_type);
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${FASTAPI_URL}/api/hidden-tags?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch hidden tags: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get tags for a specific page with enriched entity data
 * This is the primary endpoint for marketing pages
 */
export async function getPageTagsWithEntities(
  pageTag: string,
  entityType?: EntityType
): Promise<HiddenTagWithEntity[]> {
  const searchParams = new URLSearchParams();
  if (entityType) searchParams.set('entity_type', entityType);

  const url = `${FASTAPI_URL}/api/hidden-tags/page/${pageTag}?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch page tags: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single hidden tag by ID
 */
export async function getHiddenTag(tagId: string): Promise<HiddenTag> {
  const url = `${FASTAPI_URL}/api/hidden-tags/${tagId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch hidden tag: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new hidden tag (admin only)
 */
export async function createHiddenTag(
  tag: HiddenTagCreate,
  token: string
): Promise<HiddenTag> {
  const url = `${FASTAPI_URL}/api/hidden-tags`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(tag),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create hidden tag');
  }

  return response.json();
}

/**
 * Create multiple hidden tags at once (admin only)
 */
export async function createHiddenTagsBulk(
  tags: HiddenTagCreate[],
  token: string
): Promise<HiddenTag[]> {
  const url = `${FASTAPI_URL}/api/hidden-tags/bulk`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ tags }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create hidden tags');
  }

  return response.json();
}

/**
 * Update a hidden tag (admin only)
 */
export async function updateHiddenTag(
  tagId: string,
  update: HiddenTagUpdate,
  token: string
): Promise<HiddenTag> {
  const url = `${FASTAPI_URL}/api/hidden-tags/${tagId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update hidden tag');
  }

  return response.json();
}

/**
 * Reorder multiple tags within a page section (admin only)
 */
export async function reorderTags(
  pageTag: string,
  reorders: HiddenTagReorder[],
  token: string
): Promise<{ message: string }> {
  const url = `${FASTAPI_URL}/api/hidden-tags/reorder`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ page_tag: pageTag, reorders }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reorder tags');
  }

  return response.json();
}

/**
 * Delete a hidden tag (admin only)
 */
export async function deleteHiddenTag(
  tagId: string,
  token: string
): Promise<void> {
  const url = `${FASTAPI_URL}/api/hidden-tags/${tagId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete hidden tag');
  }
}

/**
 * Get available entities of a specific type that can be tagged (admin only)
 */
export async function getAvailableEntities(
  entityType: EntityType,
  token: string,
  params?: {
    page_tag?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.page_tag) searchParams.set('page_tag', params.page_tag);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${FASTAPI_URL}/api/hidden-tags/available/${entityType}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch available entities: ${response.statusText}`);
  }

  return response.json();
}
