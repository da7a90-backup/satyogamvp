"""Teachings router with membership-aware access control."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models.user import User, MembershipTierEnum
from ..models.teaching import Teaching, TeachingAccess, TeachingFavorite, TeachingComment, AccessLevel
from ..schemas.teaching import CommentCreate, CommentUpdate, CommentResponse, CommentListResponse
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

    # Gyani teachings - for Gyani tier and above
    if teaching.access_level == AccessLevel.GYANI:
        if user.membership_tier in [MembershipTierEnum.GYANI, MembershipTierEnum.PRAGYANI, MembershipTierEnum.PRAGYANI_PLUS]:
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
    limit: int = Query(50, ge=1, le=1000),  # Increased max limit for teachings page
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

    # Get teachings - order by id to get variety of content types
    teachings = query.order_by(Teaching.id.desc()).offset(skip).limit(limit).all()

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

        # Only include URLs and player IDs if user can access
        if access_info["can_access"]:
            teaching_data["video_url"] = teaching.video_url
            teaching_data["audio_url"] = teaching.audio_url
            teaching_data["text_content"] = teaching.text_content
            teaching_data["cloudflare_ids"] = teaching.cloudflare_ids if teaching.cloudflare_ids else []
            teaching_data["podbean_ids"] = teaching.podbean_ids if teaching.podbean_ids else []
            teaching_data["youtube_ids"] = teaching.youtube_ids if teaching.youtube_ids else []
            teaching_data["dash_preview_duration"] = teaching.dash_preview_duration
        else:
            teaching_data["video_url"] = None
            teaching_data["audio_url"] = None
            teaching_data["text_content"] = None
            teaching_data["cloudflare_ids"] = []
            teaching_data["podbean_ids"] = []
            teaching_data["youtube_ids"] = []
            teaching_data["dash_preview_duration"] = None

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

    # Only include URLs and player IDs if user can access
    if access_info["can_access"]:
        teaching_data["video_url"] = teaching.video_url
        teaching_data["audio_url"] = teaching.audio_url
        teaching_data["text_content"] = teaching.text_content
        teaching_data["cloudflare_ids"] = teaching.cloudflare_ids if teaching.cloudflare_ids else []
        teaching_data["podbean_ids"] = teaching.podbean_ids if teaching.podbean_ids else []
        teaching_data["youtube_ids"] = teaching.youtube_ids if teaching.youtube_ids else []
        teaching_data["dash_preview_duration"] = teaching.dash_preview_duration
    else:
        teaching_data["video_url"] = None
        teaching_data["audio_url"] = None
        teaching_data["text_content"] = None
        teaching_data["cloudflare_ids"] = []
        teaching_data["podbean_ids"] = []
        teaching_data["youtube_ids"] = []
        teaching_data["dash_preview_duration"] = None

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


@router.get("/history/list")
async def get_watch_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's watch history (teachings they've accessed)."""
    # Get unique teachings from teaching_accesses, ordered by most recent access
    history = (
        db.query(Teaching, TeachingAccess.accessed_at)
        .join(TeachingAccess)
        .filter(TeachingAccess.user_id == current_user.id)
        .order_by(TeachingAccess.accessed_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    seen_ids = set()
    for teaching, accessed_at in history:
        # Skip duplicates (same teaching accessed multiple times)
        if teaching.id in seen_ids:
            continue
        seen_ids.add(teaching.id)

        access_info = user_can_access_teaching(current_user, teaching)
        result.append({
            "id": str(teaching.id),
            "slug": teaching.slug,
            "title": teaching.title,
            "description": teaching.description,
            "thumbnail_url": teaching.thumbnail_url,
            "content_type": teaching.content_type.value,
            "duration": teaching.duration,
            "published_date": teaching.published_date,
            "accessed_at": accessed_at,
            "access_type": access_info["access_type"],
        })

    return {"history": result, "total": len(result)}


@router.post("/{teaching_id}/comments", response_model=CommentResponse)
async def create_comment(
    teaching_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a comment on a teaching."""
    teaching = db.query(Teaching).filter(Teaching.id == teaching_id).first()
    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    # Create comment
    comment = TeachingComment(
        user_id=current_user.id,
        teaching_id=teaching_id,
        parent_id=comment_data.parent_id,
        content=comment_data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Build response with user info
    response = CommentResponse.from_orm(comment)
    response.user_name = current_user.name
    response.user_avatar = current_user.profile.avatar_url if current_user.profile else None
    response.replies = []

    return response


@router.get("/{teaching_id}/comments", response_model=CommentListResponse)
async def get_comments(
    teaching_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get all comments for a teaching."""
    teaching = db.query(Teaching).filter(Teaching.id == teaching_id).first()
    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    # Get top-level comments (no parent)
    comments = (
        db.query(TeachingComment)
        .filter(
            TeachingComment.teaching_id == teaching_id,
            TeachingComment.parent_id == None
        )
        .order_by(TeachingComment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Build response with user info and replies
    result = []
    for comment in comments:
        comment_data = CommentResponse.from_orm(comment)
        comment_data.user_name = comment.user.name
        comment_data.user_avatar = comment.user.profile.avatar_url if comment.user.profile else None

        # Get replies
        replies = (
            db.query(TeachingComment)
            .filter(TeachingComment.parent_id == comment.id)
            .order_by(TeachingComment.created_at.asc())
            .all()
        )
        comment_data.replies = [
            CommentResponse(
                **{
                    **reply.__dict__,
                    "user_name": reply.user.name,
                    "user_avatar": reply.user.profile.avatar_url if reply.user.profile else None,
                    "replies": []
                }
            )
            for reply in replies
        ]

        result.append(comment_data)

    total = db.query(TeachingComment).filter(
        TeachingComment.teaching_id == teaching_id,
        TeachingComment.parent_id == None
    ).count()

    return CommentListResponse(comments=result, total=total)


@router.put("/{teaching_id}/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    teaching_id: str,
    comment_id: str,
    comment_data: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a comment."""
    comment = db.query(TeachingComment).filter(
        TeachingComment.id == comment_id,
        TeachingComment.teaching_id == teaching_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    comment.content = comment_data.content
    db.commit()
    db.refresh(comment)

    response = CommentResponse.from_orm(comment)
    response.user_name = current_user.name
    response.user_avatar = current_user.profile.avatar_url if current_user.profile else None
    response.replies = []

    return response


@router.delete("/{teaching_id}/comments/{comment_id}")
async def delete_comment(
    teaching_id: str,
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a comment."""
    comment = db.query(TeachingComment).filter(
        TeachingComment.id == comment_id,
        TeachingComment.teaching_id == teaching_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}
