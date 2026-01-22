/**
 * API helper functions for Audit Logs
 */

import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogStats,
  AuditLogFilters,
} from '@/types/audit';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  token: string,
  filters: AuditLogFilters = {}
): Promise<AuditLogListResponse> {
  const params = new URLSearchParams();

  if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.action_type) params.append('action_type', filters.action_type);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.admin_id) params.append('admin_id', filters.admin_id);
  if (filters.target_user_id) params.append('target_user_id', filters.target_user_id);
  if (filters.search) params.append('search', filters.search);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(`${FASTAPI_URL}/api/audit-logs?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }

  return response.json();
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditHistory(
  token: string,
  userId: string,
  skip = 0,
  limit = 50
): Promise<AuditLogListResponse> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${FASTAPI_URL}/api/audit-logs/user/${userId}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user audit history');
  }

  return response.json();
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(
  token: string,
  days = 30
): Promise<AuditLogStats> {
  const response = await fetch(`${FASTAPI_URL}/api/audit-logs/stats?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audit stats');
  }

  return response.json();
}

/**
 * Get a specific audit log by ID
 */
export async function getAuditLogById(
  token: string,
  logId: string
): Promise<AuditLog> {
  const response = await fetch(`${FASTAPI_URL}/api/audit-logs/${logId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audit log');
  }

  return response.json();
}

/**
 * Format action type for display
 */
export function formatActionType(actionType: string): string {
  return actionType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get color for action type badge
 */
export function getActionTypeColor(actionType: string): string {
  if (actionType.includes('created')) return 'bg-green-100 text-green-800';
  if (actionType.includes('updated')) return 'bg-blue-100 text-blue-800';
  if (actionType.includes('deleted')) return 'bg-red-100 text-red-800';
  if (actionType.includes('promoted')) return 'bg-purple-100 text-purple-800';
  if (actionType.includes('demoted')) return 'bg-orange-100 text-orange-800';
  if (actionType.includes('tier_changed')) return 'bg-indigo-100 text-indigo-800';
  if (actionType.includes('approved')) return 'bg-green-100 text-green-800';
  if (actionType.includes('rejected')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}
