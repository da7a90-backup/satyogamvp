"""Audit Logs router."""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid

from ..core.database import get_db
from ..core.deps import require_admin
from ..models.user import User
from ..models.audit_log import ActionType
from ..schemas.audit_log import AuditLogListResponse, AuditLogResponse, AuditLogStats
from ..services.audit_service import AuditService

router = APIRouter()


@router.get("/", response_model=AuditLogListResponse)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action_type: Optional[ActionType] = Query(None, description="Filter by action type"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    admin_id: Optional[str] = Query(None, description="Filter by admin ID"),
    target_user_id: Optional[str] = Query(None, description="Filter by target user ID"),
    search: Optional[str] = Query(None, description="Search in reason, names, or entity names"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get audit logs with filtering and pagination (admin only).

    Filters:
    - action_type: Filter by specific action type
    - entity_type: Filter by entity type (user, teaching, product, etc.)
    - admin_id: Filter by admin who performed the action
    - target_user_id: Filter by user who was affected
    - search: Search in reason, admin_name, target_user_name, or entity_name
    - start_date/end_date: Filter by date range
    """
    # Convert string IDs to UUID if provided
    admin_uuid = uuid.UUID(admin_id) if admin_id else None
    target_user_uuid = uuid.UUID(target_user_id) if target_user_id else None

    # Get logs using the service
    logs, total = AuditService.get_audit_logs(
        db=db,
        skip=skip,
        limit=limit,
        action_type=action_type,
        entity_type=entity_type,
        admin_id=admin_uuid,
        target_user_id=target_user_uuid,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )

    # Convert to response models
    log_responses = [AuditLogResponse.model_validate(log) for log in logs]

    return AuditLogListResponse(
        logs=log_responses,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/user/{user_id}", response_model=AuditLogListResponse)
async def get_user_audit_history(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get all audit logs related to a specific user (admin only).
    Returns logs where the user was either the admin performing the action
    or the target of the action.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    logs, total = AuditService.get_user_audit_history(
        db=db,
        user_id=user_uuid,
        skip=skip,
        limit=limit,
    )

    log_responses = [AuditLogResponse.model_validate(log) for log in logs]

    return AuditLogListResponse(
        logs=log_responses,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/stats", response_model=AuditLogStats)
async def get_audit_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to include in statistics"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get audit log statistics for the last N days (admin only).

    Returns:
    - Total number of actions
    - Actions by type
    - Actions by admin
    - Recent activity
    """
    stats = AuditService.get_audit_stats(db=db, days=days)

    return AuditLogStats(**stats)


@router.get("/{log_id}", response_model=AuditLogResponse)
async def get_audit_log_by_id(
    log_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific audit log entry by ID (admin only)."""
    try:
        log_uuid = uuid.UUID(log_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid log ID format")

    from ..models.audit_log import AuditLog
    log = db.query(AuditLog).filter(AuditLog.id == log_uuid).first()

    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")

    return AuditLogResponse.model_validate(log)
