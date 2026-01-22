"""Recommendations router for Shunyamurti Recommends (Books & Documentaries)."""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from ..core.database import get_db
from ..core.deps import get_current_user, require_admin
from ..models.user import User, MembershipTierEnum
from ..models.recommendation import Recommendation, RecommendationType
from ..schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
    RecommendationListResponse,
)
from ..services.media_service import MediaService
from ..services.cloudflare_service import CloudflareService

router = APIRouter()


def user_can_access_recommendations(user: Optional[User]) -> bool:
    """
    Check if user has GYANI or higher tier (GYANI, PRAGYANI, PRAGYANI_PLUS).
    FREE tier users are NOT allowed access.

    Returns:
        bool: True if user has GYANI+ access, False otherwise
    """
    if not user:
        return False

    return user.membership_tier in [
        MembershipTierEnum.GYANI,
        MembershipTierEnum.PRAGYANI,
        MembershipTierEnum.PRAGYANI_PLUS
    ]


# ============================================================================
# USER ENDPOINTS - Require GYANI+ Access
# ============================================================================

@router.get("/", response_model=RecommendationListResponse)
async def get_recommendations(
    recommendation_type: Optional[str] = Query(None, regex="^(book|documentary)$"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get list of recommendations (requires GYANI+ membership).

    Access: GYANI, PRAGYANI, PRAGYANI_PLUS only
    """
    # Check if user has GYANI+ access
    if not user_can_access_recommendations(current_user):
        raise HTTPException(
            status_code=403,
            detail="This feature requires Gyani membership or higher. Please upgrade your membership to access Shunyamurti Recommends."
        )

    query = db.query(Recommendation)

    # Apply filters
    if recommendation_type:
        query = query.filter(Recommendation.recommendation_type == recommendation_type)
    if category:
        query = query.filter(Recommendation.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Recommendation.title.ilike(search_filter)) |
            (Recommendation.description.ilike(search_filter)) |
            (Recommendation.author.ilike(search_filter))
        )

    # Order by display_order first, then by published_date desc
    recommendations = query.order_by(
        Recommendation.display_order.asc(),
        Recommendation.published_date.desc()
    ).offset(skip).limit(limit).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Process recommendations and resolve CDN URLs
    result = []
    for rec in recommendations:
        rec_data = {
            "id": str(rec.id),
            "slug": rec.slug,
            "title": rec.title,
            "description": rec.description,
            "recommendation_type": rec.recommendation_type,
            "author": rec.author,
            "amazon_url": rec.amazon_url,
            "cover_image_url": rec.cover_image_url,
            "youtube_id": rec.youtube_id,
            "duration": rec.duration,
            "thumbnail_url": rec.thumbnail_url,
            "category": rec.category,
            "access_level": rec.access_level,
            "display_order": rec.display_order,
            "published_date": rec.published_date,
            "created_at": rec.created_at,
            "updated_at": rec.updated_at,
        }

        # Resolve media paths to CDN URLs
        rec_data = media_service.resolve_dict(rec_data)
        result.append(rec_data)

    total = query.count()

    return {
        "recommendations": result,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{slug}", response_model=RecommendationResponse)
async def get_recommendation(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a single recommendation by slug (requires GYANI+ membership).

    Access: GYANI, PRAGYANI, PRAGYANI_PLUS only
    """
    # Check if user has GYANI+ access
    if not user_can_access_recommendations(current_user):
        raise HTTPException(
            status_code=403,
            detail="This feature requires Gyani membership or higher. Please upgrade your membership to access Shunyamurti Recommends."
        )

    recommendation = db.query(Recommendation).filter(Recommendation.slug == slug).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    rec_data = {
        "id": str(recommendation.id),
        "slug": recommendation.slug,
        "title": recommendation.title,
        "description": recommendation.description,
        "recommendation_type": recommendation.recommendation_type,
        "author": recommendation.author,
        "amazon_url": recommendation.amazon_url,
        "cover_image_url": recommendation.cover_image_url,
        "youtube_id": recommendation.youtube_id,
        "duration": recommendation.duration,
        "thumbnail_url": recommendation.thumbnail_url,
        "category": recommendation.category,
        "access_level": recommendation.access_level,
        "display_order": recommendation.display_order,
        "published_date": recommendation.published_date,
        "created_at": recommendation.created_at,
        "updated_at": recommendation.updated_at,
    }

    # Resolve media paths to CDN URLs
    rec_data = media_service.resolve_dict(rec_data)

    return rec_data


# ============================================================================
# ADMIN ENDPOINTS - Recommendations Management
# ============================================================================

@router.get("/admin/list", response_model=RecommendationListResponse)
async def get_all_recommendations_admin(
    recommendation_type: Optional[str] = Query(None, regex="^(book|documentary)$"),
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all recommendations (admin only)."""
    query = db.query(Recommendation)

    if recommendation_type:
        query = query.filter(Recommendation.recommendation_type == recommendation_type)
    if category:
        query = query.filter(Recommendation.category == category)

    recommendations = query.order_by(
        Recommendation.display_order.asc(),
        Recommendation.created_at.desc()
    ).offset(skip).limit(limit).all()

    total = query.count()

    return {
        "recommendations": [RecommendationResponse.model_validate(rec) for rec in recommendations],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/admin/create", response_model=RecommendationResponse)
async def create_recommendation(
    recommendation_data: RecommendationCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new recommendation (admin only)."""
    # Check if slug already exists
    existing = db.query(Recommendation).filter(Recommendation.slug == recommendation_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Recommendation with this slug already exists")

    recommendation = Recommendation(**recommendation_data.model_dump())
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return RecommendationResponse.model_validate(recommendation)


@router.put("/admin/{recommendation_id}", response_model=RecommendationResponse)
async def update_recommendation(
    recommendation_id: str,
    recommendation_data: RecommendationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a recommendation (admin only)."""
    recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(recommendation_id)).first()

    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    # Update fields
    for field, value in recommendation_data.model_dump(exclude_unset=True).items():
        setattr(recommendation, field, value)

    recommendation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(recommendation)

    return RecommendationResponse.model_validate(recommendation)


@router.delete("/admin/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a recommendation (admin only)."""
    recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(recommendation_id)).first()

    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    db.delete(recommendation)
    db.commit()

    return {"message": "Recommendation deleted successfully"}


@router.get("/admin/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation_admin(
    recommendation_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a single recommendation by ID (admin only)."""
    recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(recommendation_id)).first()

    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    return RecommendationResponse.model_validate(recommendation)


@router.post("/admin/upload-cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    alt_text: Optional[str] = None,
    current_user: User = Depends(require_admin),
) -> Dict[str, Any]:
    """
    Upload book cover image to Cloudflare Images (admin only).
    Max file size: 10MB
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Read file content
    file_content = await file.read()

    # Check file size (10MB max)
    max_size = 10 * 1024 * 1024
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )

    try:
        # Upload to Cloudflare Images
        cloudflare_service = CloudflareService()

        result = await cloudflare_service.upload_image(
            file_content=file_content,
            filename=file.filename or "cover.jpg",
            alt_text=alt_text or "Book cover image",
            require_signed_urls=False
        )

        return {
            "success": True,
            "image_id": result["image_id"],
            "url": result["url"],
            "variants": result.get("variants", []),
            "message": "Cover image uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload cover image: {str(e)}"
        )
