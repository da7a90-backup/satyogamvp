"""Teachings router with membership-aware access control."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models.user import User, MembershipTierEnum
from ..models.teaching import Teaching, TeachingAccess, TeachingFavorite, AccessLevel
from ..services import mixpanel_service

router = APIRouter()


def user_can_access_teaching(user: Optional[User], teaching: Teaching) -> dict:
    """
    Determine if user can access a teaching based on membership tier.

    Returns dict with:
        - can_access: bool
        - access_type: "full" | "preview" | "none"
        - preview_duration: int (seconds) if preview
    """
    # Free teachings - everyone can access
    if teaching.access_level == AccessLevel.FREE:
        return {
            "can_access": True,
            "access_type": "full",
            "preview_duration": None,
        }

    # No user - only free content
    if not user:
        return {
            "can_access": False,
            "access_type": "none",
            "preview_duration": None,
        }

    # Preview teachings - depends on membership
    if teaching.access_level == AccessLevel.PREVIEW:
        if user.membership_tier == MembershipTierEnum.FREE:
            # Free users get preview only
            return {
                "can_access": True,
                "access_type": "preview",
                "preview_duration": teaching.preview_duration or 300,  # 5 min default
            }
        else:
            # Paid members get full access
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }

    # Pragyani teachings
    if teaching.access_level == AccessLevel.PRAGYANI:
        if user.membership_tier in [MembershipTierEnum.PRAGYANI, MembershipTierEnum.PRAGYANI_PLUS]:
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }
        else:
            return {
                "can_access": False,
                "access_type": "none",
                "preview_duration": None,
            }

    # Pragyani+ teachings
    if teaching.access_level == AccessLevel.PRAGYANI_PLUS:
        if user.membership_tier == MembershipTierEnum.PRAGYANI_PLUS:
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }
        else:
            return {
                "can_access": False,
                "access_type": "none",
                "preview_duration": None,
            }

    return {
        "can_access": False,
        "access_type": "none",
        "preview_duration": None,
    }


@router.get("/")
async def get_teachings(
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get list of teachings, filtered by user's membership level."""
    query = db.query(Teaching)

    # Apply filters
    if category:
        query = query.filter(Teaching.category == category)
    if content_type:
        query = query.filter(Teaching.content_type == content_type)

    # Get teachings
    teachings = query.order_by(Teaching.published_date.desc()).offset(skip).limit(limit).all()

    # Process teachings based on user access
    result = []
    for teaching in teachings:
        access_info = user_can_access_teaching(user, teaching)

        teaching_data = {
            "id": str(teaching.id),
            "slug": teaching.slug,
            "title": teaching.title,
            "description": teaching.description,
            "content_type": teaching.content_type.value,
            "access_level": teaching.access_level.value,
            "thumbnail_url": teaching.thumbnail_url,
            "duration": teaching.duration,
            "published_date": teaching.published_date,
            "category": teaching.category,
            "tags": teaching.tags,
            "view_count": teaching.view_count,
            # Access info
            "can_access": access_info["can_access"],
            "access_type": access_info["access_type"],
            "preview_duration": access_info["preview_duration"],
        }

        # Only include URLs if user can access
        if access_info["can_access"]:
            teaching_data["video_url"] = teaching.video_url
            teaching_data["audio_url"] = teaching.audio_url
            teaching_data["text_content"] = teaching.text_content
        else:
            teaching_data["video_url"] = None
            teaching_data["audio_url"] = None
            teaching_data["text_content"] = None

        result.append(teaching_data)

    return {
        "teachings": result,
        "total": query.count(),
        "skip": skip,
        "limit": limit,
    }


@router.get("/{slug}")
async def get_teaching(
    slug: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get a single teaching by slug."""
    teaching = db.query(Teaching).filter(Teaching.slug == slug).first()
    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    # Check access
    access_info = user_can_access_teaching(user, teaching)

    # Track view
    if user and access_info["can_access"]:
        teaching_access = TeachingAccess(
            user_id=user.id,
            teaching_id=teaching.id,
        )
        db.add(teaching_access)

        # Increment view count
        teaching.view_count += 1
        db.commit()

        # Track in analytics
        await mixpanel_service.track_teaching_view(
            str(user.id),
            str(teaching.id),
            teaching.title,
            teaching.content_type.value,
        )

    teaching_data = {
        "id": str(teaching.id),
        "slug": teaching.slug,
        "title": teaching.title,
        "description": teaching.description,
        "content_type": teaching.content_type.value,
        "access_level": teaching.access_level.value,
        "thumbnail_url": teaching.thumbnail_url,
        "duration": teaching.duration,
        "published_date": teaching.published_date,
        "category": teaching.category,
        "tags": teaching.tags,
        "view_count": teaching.view_count,
        # Access info
        "can_access": access_info["can_access"],
        "access_type": access_info["access_type"],
        "preview_duration": access_info["preview_duration"],
    }

    # Only include URLs if user can access
    if access_info["can_access"]:
        teaching_data["video_url"] = teaching.video_url
        teaching_data["audio_url"] = teaching.audio_url
        teaching_data["text_content"] = teaching.text_content
    else:
        teaching_data["video_url"] = None
        teaching_data["audio_url"] = None
        teaching_data["text_content"] = None

    return teaching_data


@router.post("/{teaching_id}/favorite")
async def toggle_favorite(
    teaching_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add or remove teaching from favorites."""
    teaching = db.query(Teaching).filter(Teaching.id == teaching_id).first()
    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    # Check if already favorited
    favorite = (
        db.query(TeachingFavorite)
        .filter(
            TeachingFavorite.user_id == current_user.id,
            TeachingFavorite.teaching_id == teaching_id,
        )
        .first()
    )

    if favorite:
        # Remove from favorites
        db.delete(favorite)
        db.commit()
        return {"message": "Removed from favorites", "is_favorite": False}
    else:
        # Add to favorites
        favorite = TeachingFavorite(
            user_id=current_user.id,
            teaching_id=teaching_id,
        )
        db.add(favorite)
        db.commit()
        return {"message": "Added to favorites", "is_favorite": True}


@router.get("/favorites/list")
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's favorite teachings."""
    favorites = (
        db.query(Teaching)
        .join(TeachingFavorite)
        .filter(TeachingFavorite.user_id == current_user.id)
        .all()
    )

    result = []
    for teaching in favorites:
        access_info = user_can_access_teaching(current_user, teaching)
        result.append({
            "id": str(teaching.id),
            "slug": teaching.slug,
            "title": teaching.title,
            "thumbnail_url": teaching.thumbnail_url,
            "content_type": teaching.content_type.value,
            "access_type": access_info["access_type"],
        })

    return {"favorites": result}
