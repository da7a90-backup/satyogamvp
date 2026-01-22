"""Teachings router with membership-aware access control."""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user, require_admin
from ..models.user import User, MembershipTierEnum
from ..models.teaching import Teaching, TeachingAccess, TeachingFavorite, TeachingComment, TeachingWatchLater, AccessLevel
from ..schemas.teaching import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentListResponse,
    TeachingCreate,
    TeachingUpdate,
    TeachingResponse,
)
from ..services import mixpanel_service
from ..services.media_service import MediaService
from ..services.cloudflare_service import CloudflareService
import uuid

router = APIRouter()


def user_can_access_teaching(user: Optional[User], teaching: Teaching) -> dict:
    """
    Determine if user can access a teaching based on membership tier.

    Returns dict with:
        - can_access: bool
        - access_type: "free" | "preview" | "restricted" | "full"
        - preview_duration: int (minutes) if preview
    """
    # Free teachings - everyone can access fully
    if teaching.access_level == 'free':
        return {
            "can_access": True,
            "access_type": "free",
            "preview_duration": teaching.preview_duration,
        }

    # Preview teachings - available as preview for non-logged-in users
    if teaching.access_level == 'preview':
        if not user or user.membership_tier == MembershipTierEnum.FREE:
            # Non-logged in or free users get preview
            return {
                "can_access": True,
                "access_type": "preview",
                "preview_duration": teaching.preview_duration or 30,
            }
        else:
            # Paid members get full access
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }

    # No user and not free/preview - restricted
    if not user:
        return {
            "can_access": False,
            "access_type": "restricted",
            "preview_duration": None,
        }

    # Gyani teachings - for Gyani tier and above
    if teaching.access_level == 'gyani':
        if user.membership_tier in [MembershipTierEnum.GYANI, MembershipTierEnum.PRAGYANI, MembershipTierEnum.PRAGYANI_PLUS]:
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }
        else:
            return {
                "can_access": False,
                "access_type": "restricted",
                "preview_duration": None,
            }

    # Pragyani teachings
    if teaching.access_level == 'pragyani':
        if user.membership_tier in [MembershipTierEnum.PRAGYANI, MembershipTierEnum.PRAGYANI_PLUS]:
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }
        else:
            return {
                "can_access": False,
                "access_type": "restricted",
                "preview_duration": None,
            }

    # Pragyani+ teachings
    if teaching.access_level == 'pragyani_plus':
        if user.membership_tier == MembershipTierEnum.PRAGYANI_PLUS:
            return {
                "can_access": True,
                "access_type": "full",
                "preview_duration": None,
            }
        else:
            return {
                "can_access": False,
                "access_type": "restricted",
                "preview_duration": None,
            }

    return {
        "can_access": False,
        "access_type": "restricted",
        "preview_duration": None,
    }


@router.get("/")
async def get_teachings(
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    access_level: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[str] = None,
    of_the_month: Optional[str] = None,
    pinned: Optional[str] = None,
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
    if access_level:
        query = query.filter(Teaching.access_level == access_level)
    if search:
        # Search in title and description
        search_filter = f"%{search}%"
        query = query.filter(
            (Teaching.title.ilike(search_filter)) | (Teaching.description.ilike(search_filter))
        )
    if featured is not None:
        query = query.filter(Teaching.featured == featured)
    if of_the_month is not None:
        query = query.filter(Teaching.of_the_month == of_the_month)
    if pinned is not None:
        query = query.filter(Teaching.pinned == pinned)

    # Get teachings - order by published_date desc to get most recent first
    teachings = query.order_by(Teaching.published_date.desc()).offset(skip).limit(limit).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Process teachings based on user access
    result = []
    for teaching in teachings:
        access_info = user_can_access_teaching(user, teaching)

        teaching_data = {
            "id": str(teaching.id),
            "slug": teaching.slug,
            "title": teaching.title,
            "description": teaching.description,
            "content_type": teaching.content_type,
            "access_level": teaching.access_level,
            "thumbnail_url": teaching.thumbnail_url,
            "duration": teaching.duration,
            "published_date": teaching.published_date,
            "category": teaching.category,
            "tags": teaching.tags,
            "topic": teaching.topic,
            "filter_tags": teaching.filter_tags if teaching.filter_tags else [],
            "view_count": teaching.view_count,
            "featured": teaching.featured,
            "of_the_month": teaching.of_the_month,
            "pinned": teaching.pinned,
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

        # Resolve all media paths to CDN URLs
        teaching_data = media_service.resolve_dict(teaching_data)
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
            teaching.content_type,
        )

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    teaching_data = {
        "id": str(teaching.id),
        "slug": teaching.slug,
        "title": teaching.title,
        "description": teaching.description,
        "content_type": teaching.content_type,
        "access_level": teaching.access_level,
        "thumbnail_url": teaching.thumbnail_url,
        "duration": teaching.duration,
        "published_date": teaching.published_date,
        "category": teaching.category,
        "tags": teaching.tags,
        "topic": teaching.topic,
        "filter_tags": teaching.filter_tags if teaching.filter_tags else [],
        "view_count": teaching.view_count,
        "featured": teaching.featured,
        "of_the_month": teaching.of_the_month,
        "pinned": teaching.pinned,
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

    # Resolve all media paths to CDN URLs
    teaching_data = media_service.resolve_dict(teaching_data)

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
        .join(TeachingFavorite, Teaching.id == TeachingFavorite.teaching_id)
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
            "description": teaching.description,
            "thumbnail_url": teaching.thumbnail_url,
            "content_type": teaching.content_type if isinstance(teaching.content_type, str) else teaching.content_type.value,
            "category": teaching.category,
            "tags": teaching.tags,
            "topic": teaching.topic,
            "filter_tags": teaching.filter_tags if teaching.filter_tags else [],
            "duration": teaching.duration,
            "published_date": str(teaching.published_date) if teaching.published_date else None,
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
        .join(TeachingAccess, Teaching.id == TeachingAccess.teaching_id)
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
            "content_type": teaching.content_type if isinstance(teaching.content_type, str) else teaching.content_type.value,
            "category": teaching.category,
            "tags": teaching.tags,
            "topic": teaching.topic,
            "filter_tags": teaching.filter_tags if teaching.filter_tags else [],
            "duration": teaching.duration,
            "published_date": str(teaching.published_date) if teaching.published_date else None,
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


# ============================================================================
# ADMIN ENDPOINTS - Teachings Management
# ============================================================================

@router.get("/admin/teachings", response_model=List[TeachingResponse])
async def get_all_teachings_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    category: Optional[str] = None,
    access_level: Optional[str] = None,
    hidden_tag: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all teachings including unpublished (admin only)."""
    query = db.query(Teaching)

    if category:
        query = query.filter(Teaching.category == category)

    if access_level:
        query = query.filter(Teaching.access_level == access_level)

    if hidden_tag:
        query = query.filter(Teaching.hidden_tag == hidden_tag)

    teachings = query.order_by(Teaching.created_at.desc()).offset(skip).limit(limit).all()

    return [TeachingResponse.model_validate(teaching) for teaching in teachings]


@router.post("/admin/teachings", response_model=TeachingResponse)
async def create_teaching(
    teaching_data: TeachingCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new teaching (admin only)."""
    # Check if slug already exists
    existing = db.query(Teaching).filter(Teaching.slug == teaching_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teaching with this slug already exists")

    teaching = Teaching(**teaching_data.model_dump())
    db.add(teaching)
    db.commit()
    db.refresh(teaching)

    return TeachingResponse.model_validate(teaching)


@router.put("/admin/teachings/{teaching_id}", response_model=TeachingResponse)
async def update_teaching(
    teaching_id: str,
    teaching_data: TeachingUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a teaching (admin only)."""
    teaching = db.query(Teaching).filter(Teaching.id == uuid.UUID(teaching_id)).first()

    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    # Update fields
    for field, value in teaching_data.model_dump(exclude_unset=True).items():
        setattr(teaching, field, value)

    teaching.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(teaching)

    return TeachingResponse.model_validate(teaching)


@router.delete("/admin/teachings/{teaching_id}")
async def delete_teaching(
    teaching_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a teaching (admin only)."""
    teaching = db.query(Teaching).filter(Teaching.id == uuid.UUID(teaching_id)).first()

    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    db.delete(teaching)
    db.commit()

    return {"message": "Teaching deleted successfully"}


@router.post("/admin/teachings/upload-video")
async def upload_video_to_cloudflare(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    current_user: User = Depends(require_admin),
) -> Dict[str, Any]:
    """
    Upload video to Cloudflare Stream (admin only).
    Max file size: 5GB
    """
    # Validate file type
    allowed_types = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/avi", "video/mov"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Read file content
    file_content = await file.read()

    # Check file size (5GB max)
    max_size = 5 * 1024 * 1024 * 1024  # 5GB in bytes
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 5GB."
        )

    try:
        # Upload to Cloudflare Stream
        cloudflare_service = CloudflareService()
        metadata = {}
        if title:
            metadata["title"] = title

        result = await cloudflare_service.upload_video_to_stream(
            file_content=file_content,
            filename=file.filename or "video.mp4",
            metadata=metadata
        )

        return {
            "success": True,
            "stream_uid": result["stream_uid"],
            "status": result["status"],
            "duration": result.get("duration"),
            "thumbnail_url": result["thumbnail_url"],
            "embed_url": result["embed_url"],
            "playback_url": result["playback_url"],
            "message": "Video uploaded successfully to Cloudflare Stream"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload video: {str(e)}"
        )


@router.post("/admin/teachings/upload-thumbnail")
async def upload_thumbnail_to_cloudflare(
    file: UploadFile = File(...),
    alt_text: Optional[str] = None,
    current_user: User = Depends(require_admin),
) -> Dict[str, Any]:
    """
    Upload thumbnail image to Cloudflare Images (admin only).
    Max file size: 10MB
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Read file content
    file_content = await file.read()

    # Check file size (10MB max for images)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 10MB."
        )

    try:
        # Upload to Cloudflare Images
        cloudflare_service = CloudflareService()

        result = await cloudflare_service.upload_image(
            file_content=file_content,
            filename=file.filename or "thumbnail.jpg",
            alt_text=alt_text,
            require_signed_urls=False
        )

        return {
            "success": True,
            "image_id": result["image_id"],
            "url": result["url"],
            "variants": result.get("variants", []),
            "message": "Thumbnail uploaded successfully to Cloudflare Images"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload thumbnail: {str(e)}"
        )


@router.get("/admin/teachings/{teaching_id}", response_model=TeachingResponse)
async def get_teaching_admin(
    teaching_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a single teaching by ID (admin only)."""
    teaching = db.query(Teaching).filter(Teaching.id == uuid.UUID(teaching_id)).first()

    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")

    return TeachingResponse.model_validate(teaching)
