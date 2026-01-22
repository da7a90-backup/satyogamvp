"""Retreats router with registration and portal access."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user, get_current_admin
from ..models.user import User
from ..services.media_service import MediaService
from ..models.retreat import (
    Retreat,
    RetreatPortal,
    RetreatRegistration,
    RetreatForumPost,
    RetreatForumPostLike,
    RetreatType,
    AccessType,
    RegistrationStatus,
    ForumCategory,
)
from ..models.payment import Payment, PaymentStatus
from ..models.user import User
from ..schemas.retreat import (
    RetreatResponse,
    RetreatCreate,
    RetreatUpdate,
    RetreatRegistrationCreate,
    RetreatRegistrationResponse,
    RetreatForumPostCreate,
    RetreatForumPostResponse,
    PortalCreate,
    PortalUpdate,
    RetreatPortalResponse,
    PortalMediaItem,
    PortalMediaUpdate,
    PortalMediaResponse,
    PublishToStoreRequest,
    PublishToStoreResponse,
)
from ..services import mixpanel_service

router = APIRouter()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def user_can_access_retreat(user: User, retreat: Retreat, db: Session) -> dict:
    """
    Check if user can access a retreat.
    Returns access info dict with can_access, reason, registration status.
    """
    # Check if retreat is published
    if not retreat.is_published:
        return {
            "can_access": False,
            "reason": "Retreat is not yet published",
            "is_registered": False,
        }

    # Check if user is registered
    registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == user.id,
            RetreatRegistration.retreat_id == retreat.id,
        )
        .first()
    )

    if not registration:
        return {
            "can_access": False,
            "reason": "Not registered for this retreat",
            "is_registered": False,
        }

    # Check registration status
    if registration.status == RegistrationStatus.CANCELLED:
        return {
            "can_access": False,
            "reason": "Registration was cancelled",
            "is_registered": True,
            "registration": registration,
        }

    # For online retreats with limited access, check expiration
    if registration.access_type == AccessType.LIMITED_12DAY:
        if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
            return {
                "can_access": False,
                "reason": "12-day access period has expired",
                "is_registered": True,
                "registration": registration,
            }

    return {
        "can_access": True,
        "reason": "Registered",
        "is_registered": True,
        "registration": registration,
    }


# ============================================================================
# RETREAT ENDPOINTS
# ============================================================================

@router.get("/", response_model=dict)
async def get_retreats(
    skip: int = 0,
    limit: int = 50,
    retreat_type: Optional[RetreatType] = None,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get all published retreats."""
    query = db.query(Retreat).filter(Retreat.is_published == True)

    # Filter by type if specified
    if retreat_type:
        query = query.filter(Retreat.type == retreat_type)

    # Order by start date (upcoming first, then by created date)
    query = query.order_by(Retreat.start_date.asc())

    retreats = query.offset(skip).limit(limit).all()
    total = query.count()

    # Initialize media service to resolve image paths to CDN URLs
    media_service = MediaService(db)

    # Build response
    result = []
    for retreat in retreats:
        # Compute fixed_date for card display from start_date and end_date
        fixed_date = None
        if retreat.start_date and retreat.end_date:
            start = retreat.start_date
            end = retreat.end_date
            start_month = start.strftime('%B')
            end_month = end.strftime('%B')
            year = start.year
            if start.month == end.month:
                fixed_date = f"{start_month} {start.day}-{end.day}, {year}"
            else:
                fixed_date = f"{start_month} {start.day}-{end_month} {end.day}, {year}"

        retreat_data = {
            "id": str(retreat.id),
            "slug": retreat.slug,
            "title": retreat.title,
            "subtitle": retreat.subtitle,
            "description": retreat.description,
            "type": retreat.type.value,
            "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
            "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
            "fixed_date": fixed_date,
            "location": retreat.location,
            "price_lifetime": float(retreat.price_lifetime) if retreat.price_lifetime else None,
            "price_limited": float(retreat.price_limited) if retreat.price_limited else None,
            "price_onsite": float(retreat.price_onsite) if retreat.price_onsite else None,
            "price": float(retreat.price_lifetime or retreat.price_limited or retreat.price_onsite or 195),  # Default price for card display
            "thumbnail_url": retreat.thumbnail_url,
            "hero_background": retreat.hero_background,
            "duration_days": retreat.duration_days,
            "has_audio": retreat.has_audio,
            "has_video": retreat.has_video,
            "is_published": retreat.is_published,
            "is_registered": False,
            "max_participants": retreat.max_participants,
            "booking_tagline": retreat.booking_tagline,
            "intro1_content": retreat.intro1_content,
            "images": retreat.images,
        }

        # Check registration if user is logged in
        if user:
            registration = (
                db.query(RetreatRegistration)
                .filter(
                    RetreatRegistration.user_id == user.id,
                    RetreatRegistration.retreat_id == retreat.id,
                )
                .first()
            )

            if registration:
                retreat_data["is_registered"] = True
                retreat_data["registration_status"] = registration.status.value
                retreat_data["access_type"] = registration.access_type.value if registration.access_type else None

        # Resolve all image paths to CDN URLs
        retreat_data = media_service.resolve_dict(retreat_data)

        result.append(retreat_data)

    return {"retreats": result, "total": total, "skip": skip, "limit": limit}


# NOTE: Specific routes like /my-registrations MUST come before /{slug} dynamic route
# Otherwise FastAPI will treat "my-registrations" as a slug parameter

@router.get("/my-registrations", response_model=dict)
async def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all retreats the user is registered for."""
    registrations = (
        db.query(RetreatRegistration)
        .filter(RetreatRegistration.user_id == current_user.id)
        .all()
    )

    # Initialize media service to resolve image paths to CDN URLs
    media_service = MediaService(db)

    result = []
    for registration in registrations:
        retreat = registration.retreat

        # Check if access is still valid
        can_access = True
        if registration.access_type == AccessType.LIMITED_12DAY:
            if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
                can_access = False

        # Compute fixed_date for card display
        fixed_date = None
        if retreat.start_date and retreat.end_date:
            start = retreat.start_date
            end = retreat.end_date
            start_month = start.strftime('%B')
            end_month = end.strftime('%B')
            year = start.year
            if start.month == end.month:
                fixed_date = f"{start_month} {start.day}-{end.day}, {year}"
            else:
                fixed_date = f"{start_month} {start.day}-{end_month} {end.day}, {year}"

        retreat_data = {
            "id": str(retreat.id),
            "slug": retreat.slug,
            "title": retreat.title,
            "subtitle": retreat.subtitle,
            "description": retreat.description,
            "type": retreat.type.value,
            "thumbnail_url": retreat.thumbnail_url,
            "hero_background": retreat.hero_background,
            "duration_days": retreat.duration_days,
            "has_audio": retreat.has_audio,
            "has_video": retreat.has_video,
            "price": float(retreat.price_lifetime or retreat.price_limited or retreat.price_onsite or 195),
            "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
            "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
            "fixed_date": fixed_date,
            "booking_tagline": retreat.booking_tagline,
            "intro1_content": retreat.intro1_content,
            "images": retreat.images,
        }

        # Resolve image paths to CDN URLs
        retreat_data = media_service.resolve_dict(retreat_data)

        result.append({
            "id": str(registration.id),
            "retreat": retreat_data,
            "registered_at": registration.registered_at.isoformat(),
            "status": registration.status.value,
            "access_type": registration.access_type.value if registration.access_type else None,
            "access_expires_at": registration.access_expires_at.isoformat() if registration.access_expires_at else None,
            "can_access": can_access,
        })

    return {"registrations": result}


@router.get("/{slug}", response_model=dict)
async def get_retreat(
    slug: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get a single retreat by slug with full details."""
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()

    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Initialize media service to resolve image paths to CDN URLs
    media_service = MediaService(db)

    # Compute fixed_date for card display
    fixed_date = None
    if retreat.start_date and retreat.end_date:
        start = retreat.start_date
        end = retreat.end_date
        start_month = start.strftime('%B')
        end_month = end.strftime('%B')
        year = start.year
        if start.month == end.month:
            fixed_date = f"{start_month} {start.day}-{end.day}, {year}"
        else:
            fixed_date = f"{start_month} {start.day}-{end_month} {end.day}, {year}"

    # Basic retreat data
    retreat_data = {
        "id": str(retreat.id),
        "slug": retreat.slug,
        "title": retreat.title,
        "subtitle": retreat.subtitle,
        "description": retreat.description,
        "type": retreat.type.value,
        "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
        "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
        "fixed_date": fixed_date,
        "location": retreat.location,
        "price_lifetime": float(retreat.price_lifetime) if retreat.price_lifetime else None,
        "price_limited": float(retreat.price_limited) if retreat.price_limited else None,
        "price_onsite": float(retreat.price_onsite) if retreat.price_onsite else None,
        "price": float(retreat.price_lifetime or retreat.price_limited or retreat.price_onsite or 195),  # Computed price for cards
        "thumbnail_url": media_service.resolve_url(retreat.thumbnail_url) if retreat.thumbnail_url else None,
        "max_participants": retreat.max_participants,
        "is_published": retreat.is_published,
        "can_access": False,
        "is_registered": False,
        # Selling page content
        "booking_tagline": retreat.booking_tagline,
        "intro1_title": retreat.intro1_title,
        "intro1_content": retreat.intro1_content,
        "intro2_title": retreat.intro2_title,
        "intro2_content": retreat.intro2_content,
        "intro3_title": retreat.intro3_title,
        "intro3_content": retreat.intro3_content,
        "intro3_media": media_service.resolve_url(retreat.intro3_media) if retreat.intro3_media else None,
        "agenda_title": retreat.agenda_title,
        "agenda_items": retreat.agenda_items,
        "included_title": retreat.included_title,
        "included_items": retreat.included_items,
        "schedule_tagline": retreat.schedule_tagline,
        "schedule_title": retreat.schedule_title,
        "schedule_items": retreat.schedule_items,
        # Media
        "hero_background": media_service.resolve_url(retreat.hero_background) if retreat.hero_background else None,
        "images": media_service.resolve_list(retreat.images) if retreat.images else [],
        "duration_days": retreat.duration_days,
        "has_audio": retreat.has_audio,
        "has_video": retreat.has_video,
        "video_url": media_service.resolve_url(retreat.video_url) if retreat.video_url else None,
        "video_thumbnail": media_service.resolve_url(retreat.video_thumbnail) if retreat.video_thumbnail else None,
        "video_type": retreat.video_type,
        # Testimonials
        "testimonial_tagline": retreat.testimonial_tagline,
        "testimonial_heading": retreat.testimonial_heading,
        "testimonial_data": retreat.testimonial_data,
        # Pricing options
        "price_options": retreat.price_options,
        "member_discount_percentage": retreat.member_discount_percentage,
        "scholarship_available": retreat.scholarship_available,
        "scholarship_deadline": retreat.scholarship_deadline,
        "application_url": retreat.application_url,
        # Portal page data
        "invitation_video_url": media_service.resolve_url(retreat.invitation_video_url) if retreat.invitation_video_url else None,
        "announcement": retreat.announcement,
        "about_content": retreat.about_content,
        "about_image_url": media_service.resolve_url(retreat.about_image_url) if retreat.about_image_url else None,
        "preparation_instructions": retreat.preparation_instructions,
        "faq_data": retreat.faq_data,
        "live_schedule": retreat.live_schedule,
        # Card display
        "duration_days": retreat.duration_days,
        "has_audio": retreat.has_audio,
        "has_video": retreat.has_video,
        # Forum control
        "forum_enabled": retreat.forum_enabled,
        # Past retreat portal media
        "is_past_retreat": retreat.end_date and retreat.end_date < datetime.utcnow(),
        "is_published_to_store": retreat.is_published_to_store or False,
        "store_product_id": str(retreat.store_product_id) if retreat.store_product_id else None,
        "store_product_image_url": None,  # Will be set below if product exists
    }

    # Resolve product_component_data images through MediaService
    if retreat.product_component_data:
        product_component_data = retreat.product_component_data.copy()
        if 'images' in product_component_data and product_component_data['images']:
            product_component_data['images'] = media_service.resolve_list(product_component_data['images'])
        retreat_data["product_component_data"] = product_component_data
    else:
        retreat_data["product_component_data"] = None

    # Add portal media for past retreats (if available)
    if retreat.end_date and retreat.end_date < datetime.utcnow():
        if retreat.past_retreat_portal_media:
            # Use admin-edited media from retreat
            retreat_data["portal_media"] = retreat.past_retreat_portal_media
        elif retreat.is_published_to_store and retreat.store_product_id:
            # Fetch media from linked store product
            from ..models.product import Product
            product = db.query(Product).filter(Product.id == retreat.store_product_id).first()
            if product:
                if product.portal_media:
                    retreat_data["portal_media"] = product.portal_media
                else:
                    retreat_data["portal_media"] = []
            else:
                retreat_data["portal_media"] = []
        else:
            retreat_data["portal_media"] = []

        # Always fetch product image for past retreats with store_product_id (for fallback in cards)
        if retreat.is_published_to_store and retreat.store_product_id:
            from ..models.product import Product
            product = db.query(Product).filter(Product.id == retreat.store_product_id).first()
            if product:
                retreat_data["store_product_image_url"] = product.featured_image or product.thumbnail_url or None
    else:
        retreat_data["portal_media"] = None  # Not a past retreat

    # Check access if user is logged in
    if user:
        access_info = user_can_access_retreat(user, retreat, db)
        retreat_data["can_access"] = access_info["can_access"]
        retreat_data["is_registered"] = access_info["is_registered"]

        if access_info["is_registered"]:
            registration = access_info["registration"]
            retreat_data["registered_at"] = registration.registered_at.isoformat()
            retreat_data["registration_status"] = registration.status.value
            retreat_data["access_type"] = registration.access_type.value if registration.access_type else None

            if registration.access_expires_at:
                retreat_data["access_expires_at"] = registration.access_expires_at.isoformat()

            # Include portal content if user has access and it's an online retreat
            if access_info["can_access"] and retreat.type == RetreatType.ONLINE:
                portals = (
                    db.query(RetreatPortal)
                    .filter(RetreatPortal.retreat_id == retreat.id)
                    .order_by(RetreatPortal.order_index)
                    .all()
                )

                retreat_data["portals"] = [
                    {
                        "id": str(portal.id),
                        "title": portal.title,
                        "description": portal.description,
                        "content": portal.content,
                        "order": portal.order_index,
                    }
                    for portal in portals
                ]

    return retreat_data


# ============================================================================
# REGISTRATION ENDPOINTS
# ============================================================================

@router.post("/register", response_model=dict)
async def register_for_retreat(
    registration_data: RetreatRegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Register user for a retreat.
    Requires payment verification for paid retreats.
    Handles different access types for online retreats.
    """
    retreat = db.query(Retreat).filter(Retreat.id == registration_data.retreat_id).first()

    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if already registered
    existing_registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == current_user.id,
            RetreatRegistration.retreat_id == retreat.id,
        )
        .first()
    )

    if existing_registration:
        raise HTTPException(
            status_code=400, detail="Already registered for this retreat"
        )

    # Determine price based on retreat type and access type
    required_price = None
    access_type = None

    if retreat.type == RetreatType.ONLINE:
        # For online retreats, user must specify access type
        if not registration_data.access_type:
            raise HTTPException(
                status_code=400,
                detail="Access type required for online retreats (lifetime or limited_12day)"
            )

        access_type = registration_data.access_type

        if access_type == AccessType.LIFETIME:
            required_price = retreat.price_lifetime
        elif access_type == AccessType.LIMITED_12DAY:
            required_price = retreat.price_limited

    else:
        # Onsite retreats use onsite price
        required_price = retreat.price_onsite

    # Verify payment if retreat has a price
    if required_price and required_price > 0:
        if not registration_data.payment_id:
            raise HTTPException(
                status_code=400,
                detail=f"Payment required for this retreat (${required_price})"
            )

        # Verify payment
        payment = (
            db.query(Payment)
            .filter(
                Payment.id == registration_data.payment_id,
                Payment.user_id == current_user.id,
                Payment.status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        if not payment:
            raise HTTPException(
                status_code=400,
                detail="Valid payment not found"
            )

        # Verify payment amount matches
        if float(payment.amount) < float(required_price):
            raise HTTPException(
                status_code=400,
                detail=f"Payment amount (${payment.amount}) is less than required (${required_price})"
            )

    # Calculate access expiration for 12-day access
    # IMPORTANT: 12-day period starts AFTER the retreat ends
    access_expires_at = None
    if access_type == AccessType.LIMITED_12DAY:
        if retreat.end_date:
            # 12 days after retreat end date
            access_expires_at = retreat.end_date + timedelta(days=12)
        else:
            # Fallback: if no end date, start from now
            access_expires_at = datetime.utcnow() + timedelta(days=12)

    # Create registration
    registration = RetreatRegistration(
        user_id=current_user.id,
        retreat_id=retreat.id,
        access_type=access_type,
        access_expires_at=access_expires_at,
        status=RegistrationStatus.CONFIRMED if required_price == 0 or registration_data.payment_id else RegistrationStatus.PENDING,
        application_data=registration_data.application_data,
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    # Track analytics
    await mixpanel_service.track_event(
        "Retreat Registration",
        str(current_user.id),
        {
            "retreat_id": str(retreat.id),
            "retreat_title": retreat.title,
            "retreat_type": retreat.type.value,
            "access_type": access_type.value if access_type else None,
        }
    )

    return {
        "message": "Successfully registered for retreat",
        "registration": {
            "id": str(registration.id),
            "retreat_id": str(registration.retreat_id),
            "registered_at": registration.registered_at.isoformat(),
            "status": registration.status.value,
            "access_type": registration.access_type.value if registration.access_type else None,
            "access_expires_at": registration.access_expires_at.isoformat() if registration.access_expires_at else None,
        },
    }


@router.post("/cancel/{registration_id}", response_model=dict)
async def cancel_registration(
    registration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a retreat registration."""
    registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.id == registration_id,
            RetreatRegistration.user_id == current_user.id,
        )
        .first()
    )

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    if registration.status == RegistrationStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Registration already cancelled")

    # Update status
    registration.status = RegistrationStatus.CANCELLED
    db.commit()

    return {
        "message": "Registration cancelled successfully",
        "registration_id": str(registration.id),
    }


@router.get("/{slug}/members", response_model=dict)
async def get_retreat_members(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get list of members registered for a retreat (only for registered users)."""
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if user is registered
    user_registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == current_user.id,
            RetreatRegistration.retreat_id == retreat.id,
        )
        .first()
    )

    if not user_registration:
        raise HTTPException(
            status_code=403,
            detail="You must be registered for this retreat to view members"
        )

    # Get all confirmed registrations for this retreat
    registrations = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.retreat_id == retreat.id,
            RetreatRegistration.status == RegistrationStatus.CONFIRMED,
        )
        .all()
    )

    # Build member list
    members = []
    for registration in registrations:
        user = db.query(User).filter(User.id == registration.user_id).first()
        if user:
            members.append({
                "id": str(user.id),
                "name": user.name,
                "avatar_url": user.profile.avatar_url if (user.profile and user.profile.avatar_url) else None,
                "registered_at": registration.registered_at.isoformat(),
            })

    # Sort by registration date (most recent first)
    members.sort(key=lambda x: x["registered_at"], reverse=True)

    return {
        "members": members,
        "total": len(members),
    }


# ============================================================================
# FORUM ENDPOINTS
# ============================================================================

def get_post_like_info(post_id: str, user_id: str, db: Session) -> tuple[int, bool]:
    """Get like count and whether current user has liked a post."""
    like_count = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id
    ).count()

    is_liked = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id,
        RetreatForumPostLike.user_id == user_id
    ).first() is not None

    return like_count, is_liked


def get_nested_replies(post_id: str, user_id: str, db: Session) -> list:
    """Recursively get all nested replies for a post."""
    replies = (
        db.query(RetreatForumPost)
        .filter(RetreatForumPost.parent_id == post_id)
        .order_by(RetreatForumPost.created_at.asc())
        .all()
    )

    replies_data = []
    for reply in replies:
        reply_user = db.query(User).filter(User.id == reply.user_id).first()
        reply_like_count, reply_is_liked = get_post_like_info(str(reply.id), user_id, db)

        # Recursively get nested replies
        nested_replies = get_nested_replies(str(reply.id), user_id, db)

        replies_data.append({
            "id": str(reply.id),
            "retreat_id": str(reply.retreat_id),
            "user_id": str(reply.user_id),
            "parent_id": str(reply.parent_id) if reply.parent_id else None,
            "title": reply.title,
            "category": reply.category.value if reply.category else None,
            "content": reply.content,
            "created_at": reply.created_at.isoformat(),
            "updated_at": reply.updated_at.isoformat(),
            "user_name": reply_user.name if reply_user else "Unknown",
            "user_photo": reply_user.profile.avatar_url if (reply_user and reply_user.profile) else None,
            "like_count": reply_like_count,
            "is_liked_by_user": reply_is_liked,
            "replies": nested_replies
        })

    return replies_data


@router.get("/{slug}/forum", response_model=dict)
async def get_forum_posts(
    slug: str,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get forum posts for a retreat (only for registered users)."""
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if user is registered
    registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == current_user.id,
            RetreatRegistration.retreat_id == retreat.id,
        )
        .first()
    )

    if not registration:
        raise HTTPException(
            status_code=403,
            detail="You must be registered for this retreat to view the forum"
        )

    # Check if 12-day access has expired
    if registration.access_type == AccessType.LIMITED_12DAY:
        if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
            raise HTTPException(
                status_code=403,
                detail="Your 12-day access to this retreat has expired"
            )

    # Check if forum is enabled by admin
    if not retreat.forum_enabled:
        raise HTTPException(
            status_code=403,
            detail="Forum is not yet available for this retreat"
        )

    # Get top-level posts (no parent)
    posts = (
        db.query(RetreatForumPost)
        .filter(
            RetreatForumPost.retreat_id == retreat.id,
            RetreatForumPost.parent_id == None
        )
        .order_by(RetreatForumPost.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    total = db.query(RetreatForumPost).filter(
        RetreatForumPost.retreat_id == retreat.id,
        RetreatForumPost.parent_id == None
    ).count()

    # Build response with user data and replies
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()

        # Get all nested replies recursively
        replies_data = get_nested_replies(str(post.id), str(current_user.id), db)

        # Get like info for the post
        post_like_count, post_is_liked = get_post_like_info(str(post.id), str(current_user.id), db)

        result.append({
            "id": str(post.id),
            "retreat_id": str(post.retreat_id),
            "user_id": str(post.user_id),
            "parent_id": None,
            "title": post.title,
            "category": post.category.value if post.category else None,
            "content": post.content,
            "created_at": post.created_at.isoformat(),
            "updated_at": post.updated_at.isoformat(),
            "user_name": user.name if user else "Unknown",
            "user_photo": user.profile.avatar_url if (user and user.profile) else None,
            "like_count": post_like_count,
            "is_liked_by_user": post_is_liked,
            "replies": replies_data
        })

    return {
        "posts": result,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/{slug}/forum", response_model=dict)
async def create_forum_post(
    slug: str,
    post_data: RetreatForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a forum post for a retreat (only for registered users)."""
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if user is registered
    registration = (
        db.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == current_user.id,
            RetreatRegistration.retreat_id == retreat.id,
        )
        .first()
    )

    if not registration:
        raise HTTPException(
            status_code=403,
            detail="You must be registered for this retreat to post in the forum"
        )

    # Check if 12-day access has expired
    if registration.access_type == AccessType.LIMITED_12DAY:
        if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
            raise HTTPException(
                status_code=403,
                detail="Your 12-day access to this retreat has expired"
            )

    # Check if forum is enabled by admin
    if not retreat.forum_enabled:
        raise HTTPException(
            status_code=403,
            detail="Forum is not yet available for this retreat"
        )

    # Check if past retreat (don't allow posting to past retreat forums)
    if retreat.end_date and datetime.utcnow() > retreat.end_date:
        # Allow some grace period (30 days after retreat ends)
        grace_period_end = retreat.end_date + timedelta(days=30)
        if datetime.utcnow() > grace_period_end:
            raise HTTPException(
                status_code=403,
                detail="Forum is closed for this past retreat"
            )

    # Validate title and category for top-level posts
    if not post_data.parent_id:
        # Top-level post - title is required
        if not post_data.title or not post_data.title.strip():
            raise HTTPException(
                status_code=400,
                detail="Title is required for new posts"
            )

        # Validate category if provided
        if post_data.category:
            try:
                category_enum = ForumCategory(post_data.category)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid category. Must be one of: {', '.join([c.value for c in ForumCategory])}"
                )
        else:
            # Default to general if no category specified
            category_enum = ForumCategory.GENERAL
    else:
        # Reply - title and category should be None
        category_enum = None

    # Create post
    post = RetreatForumPost(
        retreat_id=retreat.id,
        user_id=current_user.id,
        parent_id=post_data.parent_id,
        title=post_data.title if not post_data.parent_id else None,
        category=category_enum,
        content=post_data.content
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return {
        "message": "Post created successfully",
        "post": {
            "id": str(post.id),
            "retreat_id": str(post.retreat_id),
            "user_id": str(post.user_id),
            "parent_id": str(post.parent_id) if post.parent_id else None,
            "title": post.title,
            "category": post.category.value if post.category else None,
            "content": post.content,
            "created_at": post.created_at.isoformat(),
            "user_name": current_user.name,
            "user_photo": current_user.profile.avatar_url if (current_user.profile) else None,
            "like_count": 0,
            "is_liked_by_user": False
        }
    }


@router.post("/{slug}/forum/{post_id}/like", response_model=dict)
async def like_forum_post(
    slug: str,
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like a forum post or reply."""
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Get post
    post = db.query(RetreatForumPost).filter(RetreatForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Verify post belongs to this retreat
    if str(post.retreat_id) != str(retreat.id):
        raise HTTPException(status_code=400, detail="Post does not belong to this retreat")

    # Check if already liked
    existing_like = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id,
        RetreatForumPostLike.user_id == current_user.id
    ).first()

    if existing_like:
        return {
            "message": "Post already liked",
            "like_count": db.query(RetreatForumPostLike).filter(
                RetreatForumPostLike.post_id == post_id
            ).count()
        }

    # Create like
    like = RetreatForumPostLike(
        post_id=post.id,
        user_id=current_user.id
    )
    db.add(like)
    db.commit()

    like_count = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id
    ).count()

    return {
        "message": "Post liked successfully",
        "like_count": like_count
    }


@router.delete("/{slug}/forum/{post_id}/like", response_model=dict)
async def unlike_forum_post(
    slug: str,
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unlike a forum post or reply."""
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.slug == slug).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Get post
    post = db.query(RetreatForumPost).filter(RetreatForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Verify post belongs to this retreat
    if str(post.retreat_id) != str(retreat.id):
        raise HTTPException(status_code=400, detail="Post does not belong to this retreat")

    # Find and delete like
    like = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id,
        RetreatForumPostLike.user_id == current_user.id
    ).first()

    if not like:
        raise HTTPException(status_code=400, detail="Post not liked")

    db.delete(like)
    db.commit()

    like_count = db.query(RetreatForumPostLike).filter(
        RetreatForumPostLike.post_id == post_id
    ).count()

    return {
        "message": "Post unliked successfully",
        "like_count": like_count
    }


@router.get("/happening-now", response_model=dict)
async def get_happening_now(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get any happening now sessions for retreats the user is registered for.
    Returns the session details, retreat info, and access status.
    """
    # Get all user's active registrations
    registrations = db.query(RetreatRegistration).filter(
        RetreatRegistration.user_id == current_user.id,
        RetreatRegistration.status != RegistrationStatus.CANCELLED
    ).all()

    if not registrations:
        return {
            "happening_now": None,
            "message": "No active retreat registrations found"
        }

    # Check each registered retreat for happening now sessions
    for registration in registrations:
        retreat = db.query(Retreat).filter(Retreat.id == registration.retreat_id).first()
        if not retreat or not retreat.live_schedule:
            continue

        # Check if user still has access
        access_info = user_can_access_retreat(current_user, retreat, db)
        if not access_info["can_access"]:
            continue

        # Find happening now session
        for day in retreat.live_schedule:
            for session in day.get("sessions", []):
                if session.get("is_happening_now"):
                    return {
                        "happening_now": {
                            "session": session,
                            "retreat": {
                                "id": str(retreat.id),
                                "slug": retreat.slug,
                                "title": retreat.title,
                                "thumbnail_url": retreat.thumbnail_url
                            },
                            "day": {
                                "date": day.get("date"),
                                "day_label": day.get("day_label")
                            }
                        }
                    }

    return {
        "happening_now": None,
        "message": "No happening now sessions at this time"
    }


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@router.post("/admin/retreats", response_model=RetreatResponse)
async def create_retreat(
    retreat_data: RetreatCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new retreat (admin only)."""
    from ..core.deps import get_current_admin

    # Check if slug already exists
    existing = db.query(Retreat).filter(Retreat.slug == retreat_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Retreat with slug '{retreat_data.slug}' already exists"
        )

    # Create retreat
    retreat = Retreat(**retreat_data.model_dump())
    db.add(retreat)
    db.commit()
    db.refresh(retreat)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Retreat Created",
        {
            "retreat_id": str(retreat.id),
            "retreat_slug": retreat.slug,
            "retreat_title": retreat.title,
            "retreat_type": retreat.type.value if hasattr(retreat.type, 'value') else retreat.type,
            "is_published": retreat.is_published,
        }
    )

    return retreat


@router.put("/admin/retreats/{retreat_id}", response_model=RetreatResponse)
async def update_retreat(
    retreat_id: str,
    retreat_data: RetreatUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a retreat (admin only)."""
    from ..core.deps import get_current_admin

    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Update fields
    update_data = retreat_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(retreat, field, value)

    db.commit()
    db.refresh(retreat)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Retreat Updated",
        {
            "retreat_id": str(retreat.id),
            "retreat_slug": retreat.slug,
            "updated_fields": list(update_data.keys()),
        }
    )

    return retreat


@router.delete("/admin/retreats/{retreat_id}", response_model=dict)
async def delete_retreat(
    retreat_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a retreat (admin only)."""
    from ..core.deps import get_current_admin
    from ..models.product import Product

    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if any products link to this retreat
    linked_products = db.query(Product).filter(Product.retreat_id == retreat_id).count()
    if linked_products > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete retreat. {linked_products} product(s) are linked to this retreat. Please unlink them first."
        )

    # Delete retreat (cascades to portals, registrations, forum posts)
    db.delete(retreat)
    db.commit()

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Retreat Deleted",
        {
            "retreat_id": str(retreat_id),
            "retreat_slug": retreat.slug,
        }
    )

    return {"message": "Retreat deleted successfully"}


@router.post("/admin/retreats/{retreat_id}/portals", response_model=RetreatPortalResponse)
async def create_or_update_portal(
    retreat_id: str,
    portal_data: PortalCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create or update a retreat portal (admin only)."""
    from ..core.deps import get_current_admin
    from ..schemas.retreat import PortalCreate

    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if portal already exists at this order_index
    existing_portal = db.query(RetreatPortal).filter(
        RetreatPortal.retreat_id == retreat_id,
        RetreatPortal.order_index == portal_data.order_index
    ).first()

    if existing_portal:
        # Update existing portal
        existing_portal.title = portal_data.title
        existing_portal.description = portal_data.description
        existing_portal.content = portal_data.content.model_dump()
        db.commit()
        db.refresh(existing_portal)
        portal = existing_portal
    else:
        # Create new portal
        portal = RetreatPortal(
            retreat_id=retreat_id,
            title=portal_data.title,
            description=portal_data.description,
            content=portal_data.content.model_dump(),
            order_index=portal_data.order_index
        )
        db.add(portal)
        db.commit()
        db.refresh(portal)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Portal Updated",
        {
            "retreat_id": str(retreat_id),
            "portal_id": str(portal.id),
            "day_count": len(portal_data.content.days),
        }
    )

    return portal


@router.put("/admin/retreats/{retreat_id}/portals/{portal_id}", response_model=RetreatPortalResponse)
async def update_portal(
    retreat_id: str,
    portal_id: str,
    portal_data: PortalUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a retreat portal (admin only)."""
    from ..core.deps import get_current_admin
    from ..schemas.retreat import PortalUpdate

    # Get portal
    portal = db.query(RetreatPortal).filter(
        RetreatPortal.id == portal_id,
        RetreatPortal.retreat_id == retreat_id
    ).first()

    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    # Update fields
    update_data = portal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "content" and value is not None:
            setattr(portal, field, value.model_dump())
        else:
            setattr(portal, field, value)

    db.commit()
    db.refresh(portal)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Portal Updated",
        {
            "retreat_id": str(retreat_id),
            "portal_id": str(portal_id),
        }
    )

    return portal


@router.get("/admin/retreats/{retreat_id}/portal-media", response_model=PortalMediaResponse)
async def get_retreat_portal_media(
    retreat_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Get past retreat portal media for editing (admin only).

    Returns the current portal media configuration for a retreat,
    including whether it's a past retreat and published to store.
    """
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()

    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if retreat is past (end_date < now)
    is_past_retreat = retreat.end_date and retreat.end_date < datetime.utcnow()

    # Parse existing portal media or initialize empty list
    media_items = []
    if retreat.past_retreat_portal_media:
        for item in retreat.past_retreat_portal_media:
            media_items.append(PortalMediaItem(**item))

    return PortalMediaResponse(
        retreat_id=retreat.id,
        retreat_title=retreat.title,
        retreat_slug=retreat.slug,
        is_past_retreat=is_past_retreat,
        is_published_to_store=retreat.is_published_to_store or False,
        store_product_id=retreat.store_product_id,
        media_items=media_items
    )


@router.put("/admin/retreats/{retreat_id}/portal-media", response_model=PortalMediaResponse)
async def update_retreat_portal_media(
    retreat_id: str,
    media_data: PortalMediaUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Update past retreat portal media (admin only).

    Stores admin-edited media items (title, subtitle, description, video_url, audio_url, order)
    in the past_retreat_portal_media JSONB field. This allows admins to replace live/zoom
    links with edited recordings after a retreat ends.

    This is a draft save - does NOT publish to store yet.
    """
    # Get retreat
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()

    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Check if retreat is past
    is_past_retreat = retreat.end_date and retreat.end_date < datetime.utcnow()

    # Convert media items to JSON
    media_json = [item.model_dump() for item in media_data.media_items]

    # Update retreat portal media
    retreat.past_retreat_portal_media = media_json

    db.commit()
    db.refresh(retreat)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Portal Media Updated",
        {
            "retreat_id": str(retreat_id),
            "media_items_count": len(media_json),
        }
    )

    return PortalMediaResponse(
        retreat_id=retreat.id,
        retreat_title=retreat.title,
        retreat_slug=retreat.slug,
        is_past_retreat=is_past_retreat,
        is_published_to_store=retreat.is_published_to_store or False,
        store_product_id=retreat.store_product_id,
        media_items=media_data.media_items
    )


@router.post("/admin/retreats/{retreat_id}/publish-to-store", response_model=PublishToStoreResponse)
async def publish_retreat_to_store(
    retreat_id: str,
    publish_data: PublishToStoreRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Publish a past retreat to Dharma Bandhara store (admin only).
    Creates a Product with RETREAT_PORTAL_ACCESS type, links it to the retreat,
    and copies portal media. Accepts comprehensive product fields for selling page.
    """
    from ..models.product import Product, ProductType
    import uuid

    # Validate retreat exists
    retreat = db.query(Retreat).filter(Retreat.id == retreat_id).first()
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")

    # Validate it's a past retreat
    if not retreat.end_date or retreat.end_date >= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Only past retreats (end_date < now) can be published to store"
        )

    # Validate portal media has been configured
    if not retreat.past_retreat_portal_media or len(retreat.past_retreat_portal_media) == 0:
        raise HTTPException(
            status_code=400,
            detail="Portal media must be configured before publishing to store"
        )

    # Check if already published
    if retreat.is_published_to_store and retreat.store_product_id:
        existing_product = db.query(Product).filter(Product.id == retreat.store_product_id).first()
        if existing_product:
            raise HTTPException(
                status_code=400,
                detail=f"Retreat already published to store. Product ID: {retreat.store_product_id}"
            )

    # Check if product slug is already taken
    existing_product = db.query(Product).filter(Product.slug == publish_data.slug).first()
    if existing_product:
        raise HTTPException(
            status_code=400,
            detail=f"Product slug '{publish_data.slug}' is already in use"
        )

    # Create Product with all provided fields
    new_product = Product(
        id=uuid.uuid4(),
        slug=publish_data.slug,
        title=publish_data.title,
        type=ProductType.RETREAT_PORTAL_ACCESS,
        price=publish_data.price,
        regular_price=publish_data.regular_price,
        sale_price=publish_data.sale_price,
        member_discount=publish_data.member_discount,
        description=publish_data.description,
        short_description=publish_data.short_description,
        thumbnail_url=publish_data.thumbnail_url,
        featured_image=publish_data.featured_image,
        images=publish_data.images,
        sku=publish_data.sku,
        woo_type=publish_data.woo_type,
        categories=publish_data.categories,
        tags=publish_data.tags,
        portal_media=retreat.past_retreat_portal_media,  # Copy from retreat
        has_video_category=any(item.get("video_url") for item in retreat.past_retreat_portal_media),
        has_audio_category=any(item.get("audio_url") for item in retreat.past_retreat_portal_media),
        retreat_id=retreat.id,  # Link back to retreat
        is_available=publish_data.is_available,
        in_stock=publish_data.in_stock,
        stock_quantity=publish_data.stock_quantity,
        published=publish_data.published,
        featured=publish_data.featured,
        weight=publish_data.weight,
        allow_reviews=publish_data.allow_reviews,
        external_url=publish_data.external_url,
    )

    db.add(new_product)

    # Update retreat flags and link to product
    retreat.is_published_to_store = True
    retreat.store_product_id = new_product.id

    db.commit()
    db.refresh(new_product)
    db.refresh(retreat)

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Retreat Published to Store",
        {
            "retreat_id": str(retreat_id),
            "retreat_slug": retreat.slug,
            "product_id": str(new_product.id),
            "product_slug": new_product.slug,
            "media_items_count": len(retreat.past_retreat_portal_media),
        }
    )

    # Generate portal URL
    portal_url = f"/dashboard/user/purchases/{new_product.slug}"

    return PublishToStoreResponse(
        product_id=new_product.id,
        product_slug=new_product.slug,
        product_title=new_product.title,
        retreat_id=retreat.id,
        portal_url=portal_url,
        message=f"Retreat successfully published to Dharma Bandhara store as '{new_product.title}'"
    )


@router.delete("/admin/retreats/{retreat_id}/portals/{portal_id}", response_model=dict)
async def delete_portal(
    retreat_id: str,
    portal_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a retreat portal (admin only)."""
    from ..core.deps import get_current_admin

    # Get portal
    portal = db.query(RetreatPortal).filter(
        RetreatPortal.id == portal_id,
        RetreatPortal.retreat_id == retreat_id
    ).first()

    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    db.delete(portal)
    db.commit()

    # Track event
    mixpanel_service.track_event(
        current_admin.id,
        "Admin: Portal Deleted",
        {
            "retreat_id": str(retreat_id),
            "portal_id": str(portal_id),
        }
    )

    return {"message": "Portal deleted successfully"}
