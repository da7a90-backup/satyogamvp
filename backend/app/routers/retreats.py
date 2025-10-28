"""Retreats router with registration and portal access."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models.user import User
from ..models.retreat import (
    Retreat,
    RetreatPortal,
    RetreatRegistration,
    RetreatType,
    AccessType,
    RegistrationStatus,
)
from ..models.payment import Payment, PaymentStatus
from ..schemas.retreat import (
    RetreatResponse,
    RetreatRegistrationCreate,
    RetreatRegistrationResponse,
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

    # Build response
    result = []
    for retreat in retreats:
        retreat_data = {
            "id": str(retreat.id),
            "slug": retreat.slug,
            "title": retreat.title,
            "description": retreat.description,
            "type": retreat.type.value,
            "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
            "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
            "location": retreat.location,
            "price_lifetime": float(retreat.price_lifetime) if retreat.price_lifetime else None,
            "price_limited": float(retreat.price_limited) if retreat.price_limited else None,
            "price_onsite": float(retreat.price_onsite) if retreat.price_onsite else None,
            "thumbnail_url": retreat.thumbnail_url,
            "is_registered": False,
            "max_participants": retreat.max_participants,
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

        result.append(retreat_data)

    return {"retreats": result, "total": total, "skip": skip, "limit": limit}


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

    # Basic retreat data
    retreat_data = {
        "id": str(retreat.id),
        "slug": retreat.slug,
        "title": retreat.title,
        "description": retreat.description,
        "type": retreat.type.value,
        "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
        "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
        "location": retreat.location,
        "price_lifetime": float(retreat.price_lifetime) if retreat.price_lifetime else None,
        "price_limited": float(retreat.price_limited) if retreat.price_limited else None,
        "price_onsite": float(retreat.price_onsite) if retreat.price_onsite else None,
        "thumbnail_url": retreat.thumbnail_url,
        "max_participants": retreat.max_participants,
        "is_published": retreat.is_published,
        "can_access": False,
        "is_registered": False,
    }

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
    access_expires_at = None
    if access_type == AccessType.LIMITED_12DAY:
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

    result = []
    for registration in registrations:
        retreat = registration.retreat

        # Check if access is still valid
        can_access = True
        if registration.access_type == AccessType.LIMITED_12DAY:
            if registration.access_expires_at and datetime.utcnow() > registration.access_expires_at:
                can_access = False

        result.append({
            "id": str(registration.id),
            "retreat": {
                "id": str(retreat.id),
                "slug": retreat.slug,
                "title": retreat.title,
                "description": retreat.description,
                "type": retreat.type.value,
                "thumbnail_url": retreat.thumbnail_url,
                "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
                "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
            },
            "registered_at": registration.registered_at.isoformat(),
            "status": registration.status.value,
            "access_type": registration.access_type.value if registration.access_type else None,
            "access_expires_at": registration.access_expires_at.isoformat() if registration.access_expires_at else None,
            "can_access": can_access,
        })

    return {"registrations": result}


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
