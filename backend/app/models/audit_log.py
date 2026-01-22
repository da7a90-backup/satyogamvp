"""Audit Log model for tracking admin actions."""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base
from ..core.db_types import UUID_TYPE, JSON_TYPE


class ActionType(str, enum.Enum):
    """Types of admin actions that can be logged."""
    # User actions
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    MEMBERSHIP_TIER_CHANGED = "membership_tier_changed"
    ADMIN_PROMOTED = "admin_promoted"
    ADMIN_DEMOTED = "admin_demoted"

    # Teaching actions
    TEACHING_CREATED = "teaching_created"
    TEACHING_UPDATED = "teaching_updated"
    TEACHING_DELETED = "teaching_deleted"

    # Course actions
    COURSE_CREATED = "course_created"
    COURSE_UPDATED = "course_updated"
    COURSE_DELETED = "course_deleted"

    # Product actions
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DELETED = "product_deleted"

    # Retreat actions
    RETREAT_CREATED = "retreat_created"
    RETREAT_UPDATED = "retreat_updated"
    RETREAT_DELETED = "retreat_deleted"
    RETREAT_APPLICATION_APPROVED = "retreat_application_approved"
    RETREAT_APPLICATION_REJECTED = "retreat_application_rejected"

    # Event actions
    EVENT_CREATED = "event_created"
    EVENT_UPDATED = "event_updated"
    EVENT_DELETED = "event_deleted"

    # Form actions
    FORM_CREATED = "form_created"
    FORM_UPDATED = "form_updated"
    FORM_DELETED = "form_deleted"

    # Content actions
    CONTENT_UPDATED = "content_updated"

    # Other actions
    SETTINGS_CHANGED = "settings_changed"
    BULK_ACTION = "bulk_action"


class AuditLog(Base):
    """Audit log for tracking all admin actions in the system."""
    __tablename__ = "audit_logs"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)

    # Who performed the action
    admin_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    admin_name = Column(String(255), nullable=False)  # Denormalized for history even if user deleted
    admin_email = Column(String(255), nullable=False)  # Denormalized

    # Action details
    action_type = Column(Enum(ActionType), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # 'user', 'teaching', 'course', etc.
    entity_id = Column(UUID_TYPE, nullable=True, index=True)  # ID of the affected entity
    entity_name = Column(String(255), nullable=True)  # Denormalized name for display

    # Target user (if action affects a specific user)
    target_user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    target_user_name = Column(String(255), nullable=True)  # Denormalized
    target_user_email = Column(String(255), nullable=True)  # Denormalized

    # Change tracking
    changes = Column(JSON_TYPE, nullable=True)  # {"field": {"before": "old", "after": "new"}}
    reason = Column(Text, nullable=True)  # Admin's reason for the action

    # Request metadata
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    admin = relationship("User", foreign_keys=[admin_id], backref="audit_logs_as_admin")
    target_user = relationship("User", foreign_keys=[target_user_id], backref="audit_logs_as_target")
