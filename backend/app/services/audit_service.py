"""Service for managing audit logs."""

from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import uuid

from ..models.audit_log import AuditLog, ActionType
from ..models.user import User
from ..schemas.audit_log import AuditLogCreate


class AuditService:
    """Service for creating and querying audit logs."""

    @staticmethod
    def create_audit_log(
        db: Session,
        admin: User,
        action_type: ActionType,
        entity_type: str,
        entity_id: Optional[uuid.UUID] = None,
        entity_name: Optional[str] = None,
        target_user: Optional[User] = None,
        changes: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """
        Create a new audit log entry.

        Args:
            db: Database session
            admin: User performing the action
            action_type: Type of action being logged
            entity_type: Type of entity affected (e.g., 'user', 'teaching', 'product')
            entity_id: ID of the affected entity
            entity_name: Name of the affected entity (for display)
            target_user: User being affected (if applicable)
            changes: Dictionary of changes made (before/after values)
            reason: Admin's reason for the action
            ip_address: IP address of the request
            user_agent: User agent of the request

        Returns:
            Created AuditLog instance
        """
        audit_log = AuditLog(
            admin_id=admin.id,
            admin_name=admin.name,
            admin_email=admin.email,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            target_user_id=target_user.id if target_user else None,
            target_user_name=target_user.name if target_user else None,
            target_user_email=target_user.email if target_user else None,
            changes=changes,
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return audit_log

    @staticmethod
    def get_audit_logs(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        action_type: Optional[ActionType] = None,
        entity_type: Optional[str] = None,
        admin_id: Optional[uuid.UUID] = None,
        target_user_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> tuple[List[AuditLog], int]:
        """
        Get audit logs with filtering and pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            action_type: Filter by action type
            entity_type: Filter by entity type
            admin_id: Filter by admin who performed the action
            target_user_id: Filter by target user
            search: Search in reason, admin_name, target_user_name, or entity_name
            start_date: Filter by created_at >= start_date
            end_date: Filter by created_at <= end_date

        Returns:
            Tuple of (list of AuditLog instances, total count)
        """
        query = db.query(AuditLog)

        # Apply filters
        if action_type:
            query = query.filter(AuditLog.action_type == action_type)

        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)

        if admin_id:
            query = query.filter(AuditLog.admin_id == admin_id)

        if target_user_id:
            query = query.filter(AuditLog.target_user_id == target_user_id)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    AuditLog.reason.ilike(search_filter),
                    AuditLog.admin_name.ilike(search_filter),
                    AuditLog.target_user_name.ilike(search_filter),
                    AuditLog.entity_name.ilike(search_filter),
                )
            )

        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)

        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)

        # Get total count
        total = query.count()

        # Get logs with pagination
        logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

        return logs, total

    @staticmethod
    def get_user_audit_history(
        db: Session,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[AuditLog], int]:
        """
        Get all audit logs related to a specific user (either as admin or target).

        Args:
            db: Database session
            user_id: ID of the user
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (list of AuditLog instances, total count)
        """
        query = db.query(AuditLog).filter(
            or_(
                AuditLog.admin_id == user_id,
                AuditLog.target_user_id == user_id,
            )
        )

        total = query.count()
        logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

        return logs, total

    @staticmethod
    def get_audit_stats(
        db: Session,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get audit log statistics for the last N days.

        Args:
            db: Database session
            days: Number of days to include in statistics

        Returns:
            Dictionary containing statistics
        """
        start_date = datetime.utcnow() - timedelta(days=days)

        query = db.query(AuditLog).filter(AuditLog.created_at >= start_date)

        # Total actions
        total_actions = query.count()

        # Actions by type
        actions_by_type = {}
        for action_type in ActionType:
            count = query.filter(AuditLog.action_type == action_type).count()
            if count > 0:
                actions_by_type[action_type.value] = count

        # Actions by admin (top 10)
        actions_by_admin_query = (
            db.query(
                AuditLog.admin_name,
                AuditLog.admin_email,
                func.count(AuditLog.id).label("count"),
            )
            .filter(AuditLog.created_at >= start_date)
            .group_by(AuditLog.admin_name, AuditLog.admin_email)
            .order_by(func.count(AuditLog.id).desc())
            .limit(10)
            .all()
        )

        actions_by_admin = {
            f"{admin_name} ({admin_email})": count
            for admin_name, admin_email, count in actions_by_admin_query
        }

        # Recent activity (last 10 actions)
        recent_activity_query = (
            query.order_by(AuditLog.created_at.desc()).limit(10).all()
        )

        recent_activity = [
            {
                "id": str(log.id),
                "admin_name": log.admin_name,
                "action_type": log.action_type.value,
                "entity_type": log.entity_type,
                "entity_name": log.entity_name,
                "created_at": log.created_at.isoformat(),
            }
            for log in recent_activity_query
        ]

        return {
            "total_actions": total_actions,
            "actions_by_type": actions_by_type,
            "actions_by_admin": actions_by_admin,
            "recent_activity": recent_activity,
            "period_days": days,
        }
