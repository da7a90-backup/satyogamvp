"""Pydantic schemas for Audit Log."""

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Dict, Any
from ..models.audit_log import ActionType


class AuditLogCreate(BaseModel):
    """Schema for creating an audit log entry."""
    admin_id: UUID4
    admin_name: str
    admin_email: str
    action_type: ActionType
    entity_type: str
    entity_id: Optional[UUID4] = None
    entity_name: Optional[str] = None
    target_user_id: Optional[UUID4] = None
    target_user_name: Optional[str] = None
    target_user_email: Optional[str] = None
    changes: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(BaseModel):
    """Schema for audit log response."""
    id: UUID4
    admin_id: Optional[UUID4]
    admin_name: str
    admin_email: str
    action_type: ActionType
    entity_type: str
    entity_id: Optional[UUID4]
    entity_name: Optional[str]
    target_user_id: Optional[UUID4]
    target_user_name: Optional[str]
    target_user_email: Optional[str]
    changes: Optional[Dict[str, Any]]
    reason: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    """Schema for paginated audit log list."""
    logs: List[AuditLogResponse]
    total: int
    skip: int
    limit: int


class AuditLogStats(BaseModel):
    """Schema for audit log statistics."""
    total_actions: int
    actions_by_type: Dict[str, int]
    actions_by_admin: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
