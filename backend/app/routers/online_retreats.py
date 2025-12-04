"""Online Retreats router - Full content for online retreat detail pages."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..models.static_content import OnlineRetreat
from ..services.media_service import MediaService

router = APIRouter()


@router.get("/", response_model=dict)
async def get_online_retreats(
    skip: int = 0,
    limit: int = 50,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
):
    """
    Get all published online retreats.

    Query params:
    - upcoming_only: Filter to only show retreats that haven't ended yet
    """
    query = db.query(OnlineRetreat).filter(OnlineRetreat.is_active == True)

    # TODO: Filter by upcoming if needed
    # This requires parsing fixed_date strings to extract end dates

    # Order by fixed_date descending (newest first)
    query = query.order_by(OnlineRetreat.fixed_date.desc())

    retreats = query.offset(skip).limit(limit).all()
    total = query.count()

    # Initialize media service
    media_service = MediaService(db)

    # Build response
    result = []
    for retreat in retreats:
        retreat_data = {
            "id": retreat.id,
            "slug": retreat.slug,
            "title": retreat.title,
            "subtitle": retreat.subtitle,
            "fixed_date": retreat.fixed_date,
            "location": retreat.location,
            "duration": retreat.duration,
            "price": float(retreat.base_price) if retreat.base_price else None,
            "booking_tagline": retreat.booking_tagline,
            "hero_background": retreat.hero_background,
            "images": retreat.images or [],
            "intro1_content": retreat.intro1_content or [],  # Add description for cards
            "video_url": retreat.video_url,
            "video_thumbnail": retreat.video_thumbnail,
            "video_type": retreat.video_type,
        }

        # Resolve all image paths to CDN URLs
        retreat_data = media_service.resolve_dict(retreat_data)
        result.append(retreat_data)

    return {"retreats": result, "total": total, "skip": skip, "limit": limit}


@router.get("/{slug}", response_model=dict)
async def get_online_retreat(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get a single online retreat by slug with full details."""
    retreat = db.query(OnlineRetreat).filter(
        OnlineRetreat.slug == slug,
        OnlineRetreat.is_active == True
    ).first()

    if not retreat:
        raise HTTPException(status_code=404, detail="Online retreat not found")

    # Build full response with all content
    retreat_data = {
        "id": retreat.id,
        "slug": retreat.slug,
        "title": retreat.title,
        "subtitle": retreat.subtitle,
        "fixed_date": retreat.fixed_date,
        "location": retreat.location,
        "duration": retreat.duration,
        "price": float(retreat.base_price) if retreat.base_price else None,
        "booking_tagline": retreat.booking_tagline,

        # Intro sections
        "intro1_title": retreat.intro1_title,
        "intro1_content": retreat.intro1_content or [],
        "intro2_title": retreat.intro2_title,
        "intro2_content": retreat.intro2_content or [],
        "intro3_media": retreat.intro3_media,

        # Agenda/Schedule
        "agenda_title": retreat.agenda_title,
        "agenda_items": retreat.agenda_items or [],

        # Included items
        "included_title": retreat.included_title,
        "included_items": retreat.included_items or [],

        # Media
        "hero_background": retreat.hero_background,
        "images": retreat.images or [],
        "video_url": retreat.video_url,
        "video_thumbnail": retreat.video_thumbnail,
        "video_type": retreat.video_type,

        # Testimonials
        "testimonials": retreat.testimonial_data or [],
    }

    # Initialize media service and resolve all image paths to CDN URLs
    media_service = MediaService(db)
    retreat_data = media_service.resolve_dict(retreat_data)

    return retreat_data
