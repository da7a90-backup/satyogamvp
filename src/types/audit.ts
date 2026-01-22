/**
 * Types for Audit Log system
 */

export type ActionType =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'membership_tier_changed'
  | 'admin_promoted'
  | 'admin_demoted'
  | 'teaching_created'
  | 'teaching_updated'
  | 'teaching_deleted'
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'retreat_created'
  | 'retreat_updated'
  | 'retreat_deleted'
  | 'retreat_application_approved'
  | 'retreat_application_rejected'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'form_created'
  | 'form_updated'
  | 'form_deleted'
  | 'content_updated'
  | 'settings_changed'
  | 'bulk_action';

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_name: string;
  admin_email: string;
  action_type: ActionType;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  target_user_id?: string;
  target_user_name?: string;
  target_user_email?: string;
  changes?: Record<string, { before: any; after: any }>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLogStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  actions_by_admin: Record<string, number>;
  recent_activity: Array<{
    id: string;
    admin_name: string;
    action_type: string;
    entity_type: string;
    entity_name?: string;
    created_at: string;
  }>;
  period_days: number;
}

export interface AuditLogFilters {
  action_type?: ActionType;
  entity_type?: string;
  admin_id?: string;
  target_user_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}
