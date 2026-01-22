"""Users router."""

from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dateutil.rrule import rrulestr
from pydantic import BaseModel
import uuid

from ..core.database import get_db
from ..core.deps import get_current_user, require_admin
from ..core.security import get_password_hash
from ..models.user import User, MembershipTierEnum
from ..models.product import UserProductAccess, Product, Order
from ..models.event import Event, UserCalendar
from ..models.retreat import Retreat, RetreatRegistration, RegistrationStatus, AccessType
from ..models.audit_log import ActionType
from ..schemas.product import PurchaseItemResponse, ProductResponse
from ..schemas.user import UserResponse, UserUpdate, UserListResponse, UserCreate
from ..services.media_service import MediaService
from ..services.audit_service import AuditService
from ..services import sendgrid_service

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "membership_tier": current_user.membership_tier.value,
    }


@router.put("/profile")
async def update_profile(
    name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    if name:
        current_user.name = name
        db.commit()

    return {"message": "Profile updated successfully"}


@router.get("/me/tour-status")
async def get_tour_status(current_user: User = Depends(get_current_user)):
    """Check if user has completed the dashboard tour."""
    return {
        "has_seen_dashboard_tour": current_user.has_seen_dashboard_tour,
        "user_id": str(current_user.id)
    }


@router.post("/me/complete-tour")
async def complete_tour(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark dashboard tour as completed for current user."""
    current_user.has_seen_dashboard_tour = True
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Dashboard tour marked as completed",
        "has_seen_dashboard_tour": current_user.has_seen_dashboard_tour
    }


@router.get("/me/purchases", response_model=List[PurchaseItemResponse])
async def get_my_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's purchased products."""
    # Import presigned URL service
    from app.services.r2_presigned_url_service import R2PresignedURLService

    # Query UserProductAccess with joined Product and Order data
    accesses = (
        db.query(UserProductAccess)
        .join(Product, UserProductAccess.product_id == Product.id)
        .outerjoin(Order, UserProductAccess.order_id == Order.id)
        .filter(UserProductAccess.user_id == current_user.id)
        .order_by(UserProductAccess.granted_at.desc())
        .all()
    )

    # Format response
    purchases = []
    for access in accesses:
        # Check if access is expired
        is_expired = False
        if access.expires_at:
            is_expired = datetime.utcnow() > access.expires_at

        # Get order details if available
        order_number = None
        amount_paid = None
        if access.order:
            order_number = access.order.order_number
            amount_paid = float(access.order.total_amount)

        # Create ProductResponse with access info
        product_data = ProductResponse.model_validate(access.product)
        product_data.has_access = not is_expired

        # Convert private R2 URLs to presigned URLs for MP3s
        if product_data.portal_media and isinstance(product_data.portal_media, dict):
            if 'mp3' in product_data.portal_media and product_data.portal_media['mp3']:
                presigned_mp3s = []
                for mp3_url in product_data.portal_media['mp3']:
                    # Check if it's a private R2 URL
                    if 'r2.cloudflarestorage.com' in mp3_url:
                        try:
                            # Extract the object key from the R2 URL
                            r2_key = R2PresignedURLService.extract_r2_key_from_url(mp3_url)
                            if r2_key:
                                # Generate presigned URL (valid for 24 hours for purchased content)
                                presigned_url = R2PresignedURLService.generate_presigned_url(
                                    object_key=r2_key,
                                    expiration=86400  # 24 hours
                                )
                                presigned_mp3s.append(presigned_url)
                                print(f"[PURCHASES] Converted private R2 URL to presigned URL for: {r2_key[:50]}...")
                            else:
                                # Couldn't extract key, keep original URL
                                presigned_mp3s.append(mp3_url)
                                print(f"[PURCHASES] Could not extract R2 key from URL: {mp3_url[:50]}...")
                        except Exception as e:
                            # If presigned URL generation fails, keep original URL
                            presigned_mp3s.append(mp3_url)
                            print(f"[PURCHASES] Error generating presigned URL: {e}")
                    else:
                        # Already public or different format, keep as-is
                        presigned_mp3s.append(mp3_url)

                # Replace the mp3 array with presigned URLs
                product_data.portal_media['mp3'] = presigned_mp3s

        # Get retreat slug if product is linked to retreat
        if access.product.retreat_id:
            print(f"[PURCHASES] Product {access.product.slug} has retreat_id: {access.product.retreat_id}")
            retreat = db.query(Retreat).filter(Retreat.id == access.product.retreat_id).first()
            if retreat:
                print(f"[PURCHASES] Found retreat: {retreat.slug}")
                product_data.retreat_slug = retreat.slug
            else:
                print(f"[PURCHASES] Retreat not found for ID: {access.product.retreat_id}")
        else:
            print(f"[PURCHASES] Product {access.product.slug} has NO retreat_id")

        purchase = PurchaseItemResponse(
            id=access.id,
            product=product_data,
            order_id=access.order_id,
            order_number=order_number,
            amount_paid=amount_paid,
            granted_at=access.granted_at,
            expires_at=access.expires_at,
            is_expired=is_expired,
        )
        purchases.append(purchase)

    return purchases


@router.get("/my-calendar", response_model=dict)
async def get_my_calendar(
    upcoming_only: bool = Query(False, description="Only show upcoming events"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all calendar events for the current user:
    - User's registered events (from UserCalendar)
    - User's registered retreats (from RetreatRegistration)
    Expands recurring events based on recurrence rules.
    """
    calendar_events = []
    media_service = MediaService(db)

    # Get user's registered events from UserCalendar
    user_calendar_entries = (
        db.query(UserCalendar)
        .filter(UserCalendar.user_id == current_user.id)
        .filter(UserCalendar.event_id.isnot(None))
        .all()
    )

    for entry in user_calendar_entries:
        event = entry.event
        if not event or not event.is_published:
            continue

        # Expand recurring events or add single event
        if event.is_recurring and event.recurrence_rule:
            expanded = _expand_recurring_event(event, upcoming_only)
            calendar_events.extend(expanded)
        else:
            # Single event
            if upcoming_only and event.start_datetime < datetime.utcnow():
                continue
            calendar_events.append(_format_event_data(event, media_service))

    # Get user's registered retreats
    registrations = (
        db.query(RetreatRegistration)
        .filter(RetreatRegistration.user_id == current_user.id)
        .filter(RetreatRegistration.status != RegistrationStatus.CANCELLED)
        .all()
    )

    for registration in registrations:
        retreat = registration.retreat
        if not retreat or not retreat.is_published:
            continue

        # Check if access is still valid for limited access
        can_access = True
        if registration.access_type == AccessType.LIMITED_12DAY:
            if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
                can_access = False

        if upcoming_only and retreat.start_date and retreat.start_date < datetime.utcnow():
            continue

        calendar_events.append(_format_retreat_data(retreat, registration, can_access, media_service))

    # Filter by event type if specified
    if event_type:
        calendar_events = [e for e in calendar_events if e.get("eventType") == event_type.lower()]

    # Sort by start date
    calendar_events.sort(key=lambda x: x.get("startDate") or "")

    # Paginate
    total = len(calendar_events)
    calendar_events = calendar_events[skip:skip + limit]

    return {
        "events": calendar_events,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


def _expand_recurring_event(event: Event, upcoming_only: bool = False) -> List[dict]:
    """Expand a recurring event into multiple occurrences based on rrule."""
    expanded_events = []

    try:
        # Parse the recurrence rule
        if isinstance(event.recurrence_rule, dict):
            rrule_str = event.recurrence_rule.get("rrule", "")
        else:
            rrule_str = str(event.recurrence_rule)

        if not rrule_str:
            return []

        # Create rrule from string
        # DTSTART should be in the rrule or we use event start_datetime
        rrule = rrulestr(rrule_str, dtstart=event.start_datetime)

        # Get occurrences for next 12 months
        now = datetime.utcnow()
        until = now + timedelta(days=365)

        # If we want all events (not just upcoming), start from event's original date
        start_from = now if upcoming_only else event.start_datetime

        occurrences = list(rrule.between(start_from, until, inc=True))

        # Format each occurrence as a separate event
        for occurrence in occurrences[:100]:  # Limit to 100 occurrences
            event_data = _format_event_data(event, None)
            # Override the start/end dates with occurrence
            if event.end_datetime and event.start_datetime:
                duration = event.end_datetime - event.start_datetime
                event_data["startDate"] = occurrence.isoformat()
                event_data["endDate"] = (occurrence + duration).isoformat()
                event_data["date"] = occurrence.strftime("%b %d, %Y")
            else:
                event_data["startDate"] = occurrence.isoformat()
                event_data["date"] = occurrence.strftime("%b %d, %Y")

            expanded_events.append(event_data)

    except Exception as e:
        # If rrule parsing fails, just return the single event
        print(f"Error expanding recurring event {event.id}: {e}")
        return [_format_event_data(event, None)]

    return expanded_events


def _format_event_data(event: Event, media_service: Optional[MediaService] = None) -> dict:
    """Format an Event into calendar event data."""
    now = datetime.utcnow()

    # Determine status
    status = "upcoming"
    if event.start_datetime and event.end_datetime:
        if now >= event.start_datetime and now <= event.end_datetime:
            status = "live"
        elif now > event.end_datetime:
            status = "past"
    elif event.start_datetime:
        if now > event.start_datetime:
            status = "past"

    # Determine action type and URL
    action_type = "view"
    action_url = f"/calendar/{event.slug}"

    # Check if it's a zoom event (has location with zoom link)
    if event.location and ("zoom" in event.location.lower() or "meet" in event.location.lower()):
        action_type = "join_zoom"
        # Extract zoom URL if available (would need to parse from location or have separate field)

    # Calculate duration
    duration = "TBA"
    if event.start_datetime and event.end_datetime:
        delta = event.end_datetime - event.start_datetime
        hours = delta.seconds // 3600
        if delta.days > 0:
            duration = f"{delta.days + 1} day{'s' if delta.days > 0 else ''}"
        elif hours > 0:
            duration = f"{hours} hour{'s' if hours > 1 else ''}"
        else:
            duration = "Less than 1 hour"

    event_data = {
        "id": str(event.id),
        "slug": event.slug,
        "title": event.title,
        "description": event.description or "",
        "startDate": event.start_datetime.isoformat() if event.start_datetime else None,
        "endDate": event.end_datetime.isoformat() if event.end_datetime else None,
        "date": event.start_datetime.strftime("%b %d, %Y") if event.start_datetime else "TBA",
        "duration": duration,
        "type": "event",
        "eventType": event.type.value,
        "location": event.location or "TBA",
        "locationType": "Online" if event.location and "online" in event.location.lower() else "Onsite",
        "imageUrl": event.thumbnail_url or "",
        "status": status,
        "actionUrl": action_url,
        "actionType": action_type,
        "isRecurring": event.is_recurring,
        "recurrenceRule": event.recurrence_rule if event.is_recurring else None,
    }

    # Resolve image URLs if media service provided
    if media_service:
        event_data = media_service.resolve_dict(event_data)

    return event_data


def _format_retreat_data(
    retreat: Retreat,
    registration: RetreatRegistration,
    can_access: bool,
    media_service: Optional[MediaService] = None
) -> dict:
    """Format a Retreat into calendar event data."""
    now = datetime.utcnow()

    # Determine status
    status = "upcoming"
    if retreat.start_date and retreat.end_date:
        if now >= retreat.start_date and now <= retreat.end_date:
            status = "live"
        elif now > retreat.end_date:
            status = "past"
    elif retreat.start_date:
        if now > retreat.start_date:
            status = "past"

    # Determine action type and URL
    action_type = "view_portal"
    if retreat.type.value == "online":
        action_url = f"/dashboard/user/retreats/{retreat.slug}"
    else:
        action_url = f"/retreats/ashram/{retreat.slug}"

    if not can_access:
        action_type = "expired"

    # Calculate duration
    duration = "TBA"
    if retreat.start_date and retreat.end_date:
        delta = retreat.end_date - retreat.start_date
        days = delta.days + 1  # Inclusive
        duration = f"{days} day{'s' if days > 1 else ''}"

    retreat_data = {
        "id": str(retreat.id),
        "slug": retreat.slug,
        "title": retreat.title,
        "description": retreat.subtitle or retreat.description or "",
        "startDate": retreat.start_date.isoformat() if retreat.start_date else None,
        "endDate": retreat.end_date.isoformat() if retreat.end_date else None,
        "date": retreat.start_date.strftime("%b %d, %Y") if retreat.start_date else "TBA",
        "duration": duration,
        "type": "retreat",
        "eventType": retreat.type.value,
        "location": retreat.location or ("Online" if retreat.type.value == "online" else "Sat Yoga Ashram"),
        "locationType": "Online" if retreat.type.value == "online" else "Onsite",
        "imageUrl": retreat.thumbnail_url or "",
        "status": status,
        "actionUrl": action_url,
        "actionType": action_type,
        "isRecurring": False,
        "recurrenceRule": None,
        "registrationStatus": registration.status.value,
        "accessType": registration.access_type.value,
        "canAccess": can_access,
    }

    # Resolve image URLs if media service provided
    if media_service:
        retreat_data = media_service.resolve_dict(retreat_data)

    return retreat_data


# ============================================================================
# ADMIN ENDPOINTS - User Management
# ============================================================================

@router.get("/admin/users", response_model=UserListResponse)
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    membership_tier: Optional[MembershipTierEnum] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all users with filtering (admin only)."""
    query = db.query(User)

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_filter)) | (User.email.ilike(search_filter))
        )

    if membership_tier:
        query = query.filter(User.membership_tier == membership_tier)

    # Get total count
    total = query.count()

    # Get users with pagination
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return UserListResponse(
        users=[UserResponse.model_validate(user) for user in users],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific user by ID (admin only)."""
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.model_validate(user)


@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a user (admin only)."""
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Track changes for audit log
    changes: Dict[str, Dict[str, Any]] = {}
    action_types = []

    # Update fields and track changes
    if update_data.name is not None and update_data.name != user.name:
        changes["name"] = {"before": user.name, "after": update_data.name}
        user.name = update_data.name

    if update_data.email is not None and update_data.email != user.email:
        # Check if email already exists
        existing = db.query(User).filter(
            User.email == update_data.email,
            User.id != user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        changes["email"] = {"before": user.email, "after": update_data.email}
        user.email = update_data.email

    if update_data.membership_tier is not None and update_data.membership_tier != user.membership_tier:
        changes["membership_tier"] = {
            "before": user.membership_tier.value,
            "after": update_data.membership_tier.value
        }
        user.membership_tier = update_data.membership_tier
        action_types.append(ActionType.MEMBERSHIP_TIER_CHANGED)

    if update_data.is_admin is not None and update_data.is_admin != user.is_admin:
        changes["is_admin"] = {"before": user.is_admin, "after": update_data.is_admin}
        user.is_admin = update_data.is_admin
        if update_data.is_admin:
            action_types.append(ActionType.ADMIN_PROMOTED)
        else:
            action_types.append(ActionType.ADMIN_DEMOTED)

    # Commit user updates
    db.commit()
    db.refresh(user)

    # Create audit log entries for each significant action
    if changes:
        # Get IP address and user agent
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        # Determine primary action type
        if not action_types:
            action_types.append(ActionType.USER_UPDATED)

        # Create audit log for each action type
        for action_type in action_types:
            AuditService.create_audit_log(
                db=db,
                admin=current_user,
                action_type=action_type,
                entity_type="user",
                entity_id=user.id,
                entity_name=user.name,
                target_user=user,
                changes=changes,
                reason=update_data.reason,
                ip_address=ip_address,
                user_agent=user_agent,
            )

    return UserResponse.model_validate(user)


@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a user (admin only)."""
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Store user info before deletion for audit log
    user_name = user.name
    user_email = user.email
    user_id_uuid = user.id

    # Delete user
    db.delete(user)
    db.commit()

    # Create audit log
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuditService.create_audit_log(
        db=db,
        admin=current_user,
        action_type=ActionType.USER_DELETED,
        entity_type="user",
        entity_id=user_id_uuid,
        entity_name=user_name,
        target_user=None,  # User is already deleted
        changes={"deleted_email": user_email},
        reason=None,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return {"message": "User deleted successfully"}


@router.get("/admin/stats")
async def get_user_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get user statistics (admin only)."""
    from sqlalchemy import func

    total_users = db.query(func.count(User.id)).scalar()

    # Count by membership tier
    tier_counts = {}
    for tier in MembershipTierEnum:
        count = db.query(func.count(User.id)).filter(User.membership_tier == tier).scalar()
        tier_counts[tier.value] = count

    # Count admins
    admin_count = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()

    return {
        "total_users": total_users,
        "by_membership_tier": tier_counts,
        "admin_count": admin_count
    }


class CreateUserRequest(BaseModel):
    """Schema for creating a new user (admin only)."""
    name: str
    email: str
    membership_tier: str = "FREE"
    is_admin: bool = False


class CreateAdminRequest(BaseModel):
    """Schema for creating a new admin user."""
    name: str
    email: str
    password: str
    reason: str  # Required reason for creating admin


@router.post("/admin/users", response_model=UserResponse)
async def create_user(
    user_data: CreateUserRequest,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new user (admin only). Default password is 'changeme123'."""
    # Check if user with email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Validate membership tier
    try:
        tier_enum = MembershipTierEnum(user_data.membership_tier.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid membership tier: {user_data.membership_tier}")

    # Create new user with default password
    default_password = "changeme123"
    new_user = User(
        id=uuid.uuid4(),
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(default_password),
        membership_tier=tier_enum,
        is_admin=user_data.is_admin,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create audit log
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuditService.create_audit_log(
        db=db,
        admin=current_user,
        action_type=ActionType.USER_CREATED,
        entity_type="user",
        entity_id=new_user.id,
        entity_name=new_user.name,
        target_user=new_user,
        changes={
            "membership_tier": {"before": None, "after": tier_enum.value},
            "is_admin": {"before": None, "after": user_data.is_admin},
            "created_by": current_user.email,
        },
        reason=f"User created by admin: {current_user.email}",
        ip_address=ip_address,
        user_agent=user_agent,
    )

    # Send welcome email with login credentials
    try:
        tier_display = {
            "FREE": "Free",
            "GYANI": "Gyani",
            "PRAGYANI": "Pragyani",
            "PRAGYANI_PLUS": "Pragyani Plus",
        }.get(tier_enum.value, tier_enum.value)

        subject = "Welcome to Sat Yoga Institute"
        content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #7D1A13;">Welcome to Sat Yoga Institute!</h2>

                <p>Dear {new_user.name},</p>

                <p>Your account has been created by an administrator. You now have access to the Sat Yoga Institute platform.</p>

                <div style="background-color: #f8f9fa; border-left: 4px solid #7D1A13; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #7D1A13;">Your Login Credentials</h3>
                    <ul style="margin-bottom: 0;">
                        <li><strong>Email:</strong> {new_user.email}</li>
                        <li><strong>Temporary Password:</strong> {default_password}</li>
                        <li><strong>Membership Tier:</strong> {tier_display}</li>
                        {"<li><strong>Role:</strong> Administrator</li>" if user_data.is_admin else ""}
                    </ul>
                </div>

                <div style="margin: 30px 0;">
                    <a href="{request.base_url}login"
                       style="display: inline-block; padding: 12px 30px; background-color: #7D1A13; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Login to Your Account
                    </a>
                </div>

                <p style="color: #666; font-size: 14px;">
                    <strong>Important:</strong> For security reasons, please change your password after your first login by visiting your profile settings.
                </p>

                <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>

                <p>With gratitude,<br>
                Sat Yoga Institute Team</p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """

        await sendgrid_service.send_email(
            to_email=new_user.email,
            subject=subject,
            html_content=content,
        )
    except Exception as e:
        # Log error but don't fail user creation if email fails
        print(f"Failed to send welcome email to {new_user.email}: {e}")

    return UserResponse.model_validate(new_user)


@router.post("/admin/users/create-admin", response_model=UserResponse)
async def create_admin_user(
    admin_data: CreateAdminRequest,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new admin user (admin only). Requires a reason."""
    # Check if user with email already exists
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create new user with admin privileges
    new_admin = User(
        id=uuid.uuid4(),
        name=admin_data.name,
        email=admin_data.email,
        password_hash=get_password_hash(admin_data.password),
        membership_tier=MembershipTierEnum.FREE,
        is_admin=True,
        is_active=True,
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # Create audit log
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuditService.create_audit_log(
        db=db,
        admin=current_user,
        action_type=ActionType.USER_CREATED,
        entity_type="user",
        entity_id=new_admin.id,
        entity_name=new_admin.name,
        target_user=new_admin,
        changes={
            "is_admin": {"before": False, "after": True},
            "created_by": current_user.email,
        },
        reason=admin_data.reason,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return UserResponse.model_validate(new_admin)
