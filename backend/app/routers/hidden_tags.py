"""
Hidden Tags API Router
Manages which content entities appear on specific marketing pages
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID

from app.core.deps import get_current_admin, get_db
from app.models.user import User
from app.models.hidden_tag import HiddenTag, EntityType
from app.models.teaching import Teaching
from app.models.blog import BlogPost
from app.models.product import Product
from app.models.retreat import Retreat
from app.models.event import Event
from app.schemas.hidden_tag import (
    HiddenTagCreate,
    HiddenTagUpdate,
    HiddenTagResponse,
    HiddenTagBulkCreate,
    HiddenTagReorderBulk,
    HiddenTagWithEntity,
)
from app.services.media_service import MediaService

router = APIRouter()


@router.get("/", response_model=List[HiddenTagResponse])
async def list_hidden_tags(
    page_tag: Optional[str] = None,
    entity_type: Optional[EntityType] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    List all hidden tags with optional filtering.
    Public endpoint (no auth required) for marketing pages to fetch content.
    """
    query = db.query(HiddenTag)

    if page_tag:
        query = query.filter(HiddenTag.page_tag == page_tag)

    if entity_type:
        query = query.filter(HiddenTag.entity_type == entity_type)

    tags = query.order_by(HiddenTag.order_index.asc()).offset(skip).limit(limit).all()

    return tags


@router.get("/page/{page_tag}", response_model=List[HiddenTagWithEntity])
async def get_page_tags_with_entities(
    page_tag: str,
    entity_type: Optional[EntityType] = None,
    db: Session = Depends(get_db),
):
    """
    Get all tags for a specific page with enriched entity data.
    This is the primary endpoint for marketing pages to fetch featured content.

    Example: GET /api/hidden-tags/page/homepage/teachings
    Returns teachings with full data (title, thumbnail, etc.)
    """
    query = db.query(HiddenTag).filter(HiddenTag.page_tag == page_tag)

    if entity_type:
        query = query.filter(HiddenTag.entity_type == entity_type)

    tags = query.order_by(HiddenTag.order_index.asc()).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Enrich with entity data
    result = []
    for tag in tags:
        entity_data = {}

        # Fetch the actual entity based on type
        if tag.entity_type == EntityType.TEACHING:
            teaching = db.query(Teaching).filter(Teaching.id == tag.entity_id).first()
            if teaching:
                entity_data = {
                    "id": str(teaching.id),
                    "slug": teaching.slug,
                    "title": teaching.title,
                    "description": teaching.description,
                    "thumbnail_url": teaching.thumbnail_url,
                    "duration": teaching.duration,
                    "published_date": teaching.published_date.isoformat() if teaching.published_date else None,
                    "access_level": teaching.access_level,
                }

        elif tag.entity_type == EntityType.BLOG:
            blog = db.query(BlogPost).filter(BlogPost.id == tag.entity_id).first()
            if blog:
                entity_data = {
                    "id": str(blog.id),
                    "slug": blog.slug,
                    "title": blog.title,
                    "excerpt": blog.excerpt,
                    "featured_image": blog.featured_image,
                    "author_name": blog.author_name,
                    "author_image": blog.author_image,
                    "category": {"id": str(blog.category.id), "name": blog.category.name, "slug": blog.category.slug} if blog.category else None,
                    "read_time": blog.read_time,
                    "published_at": blog.published_at.isoformat() if blog.published_at else None,
                }

        elif tag.entity_type == EntityType.PRODUCT:
            product = db.query(Product).filter(Product.id == tag.entity_id).first()
            if product:
                entity_data = {
                    "id": str(product.id),
                    "slug": product.slug,
                    "name": product.name,
                    "title": product.name,
                    "description": product.description,
                    "short_description": product.short_description,
                    "price": float(product.price) if product.price else None,
                    "featured_image": product.featured_image,
                    "type": product.type.value if hasattr(product.type, 'value') else product.type,
                    "categories": product.categories,
                    "featured": product.featured,
                }

        elif tag.entity_type == EntityType.RETREAT:
            retreat = db.query(Retreat).filter(Retreat.id == tag.entity_id).first()
            if retreat:
                entity_data = {
                    "id": str(retreat.id),
                    "slug": retreat.slug,
                    "title": retreat.title,
                    "description": retreat.description,
                    "short_description": retreat.short_description,
                    "featured_image": retreat.featured_image,
                    "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
                    "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
                    "location": retreat.location,
                    "retreat_type": retreat.retreat_type,
                    "price": float(retreat.price) if retreat.price else None,
                }

        elif tag.entity_type == EntityType.EVENT:
            event = db.query(Event).filter(Event.id == tag.entity_id).first()
            if event:
                entity_data = {
                    "id": str(event.id),
                    "slug": event.slug,
                    "title": event.title,
                    "description": event.description,
                    "event_type": event.event_type,
                    "start_time": event.start_time.isoformat() if event.start_time else None,
                    "end_time": event.end_time.isoformat() if event.end_time else None,
                    "location": event.location,
                    "is_online": event.is_online,
                }

        # Resolve media paths to CDN URLs
        entity_data = media_service.resolve_dict(entity_data)

        # Build response
        tag_response = HiddenTagWithEntity(
            id=tag.id,
            entity_id=tag.entity_id,
            entity_type=tag.entity_type,
            page_tag=tag.page_tag,
            order_index=tag.order_index,
            created_at=tag.created_at,
            updated_at=tag.updated_at,
            entity_data=entity_data,
        )
        result.append(tag_response)

    return result


@router.get("/{tag_id}", response_model=HiddenTagResponse)
async def get_hidden_tag(
    tag_id: UUID,
    db: Session = Depends(get_db),
):
    """Get a single hidden tag by ID"""
    tag = db.query(HiddenTag).filter(HiddenTag.id == tag_id).first()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hidden tag not found"
        )

    return tag


@router.post("/", response_model=HiddenTagResponse, status_code=status.HTTP_201_CREATED)
async def create_hidden_tag(
    tag_data: HiddenTagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new hidden tag (admin only)"""
    # Check if entity exists based on type
    entity_exists = False

    if tag_data.entity_type == EntityType.TEACHING:
        entity_exists = db.query(Teaching).filter(Teaching.id == tag_data.entity_id).first() is not None
    elif tag_data.entity_type == EntityType.BLOG:
        entity_exists = db.query(BlogPost).filter(BlogPost.id == tag_data.entity_id).first() is not None
    elif tag_data.entity_type == EntityType.PRODUCT:
        entity_exists = db.query(Product).filter(Product.id == tag_data.entity_id).first() is not None
    elif tag_data.entity_type == EntityType.RETREAT:
        entity_exists = db.query(Retreat).filter(Retreat.id == tag_data.entity_id).first() is not None
    elif tag_data.entity_type == EntityType.EVENT:
        entity_exists = db.query(Event).filter(Event.id == tag_data.entity_id).first() is not None

    if not entity_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{tag_data.entity_type.value} with ID {tag_data.entity_id} not found"
        )

    # Check for duplicate
    existing = db.query(HiddenTag).filter(
        and_(
            HiddenTag.entity_id == tag_data.entity_id,
            HiddenTag.entity_type == tag_data.entity_type,
            HiddenTag.page_tag == tag_data.page_tag,
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This entity is already tagged for this page"
        )

    # Create tag
    tag = HiddenTag(**tag_data.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)

    return tag


@router.post("/bulk", response_model=List[HiddenTagResponse], status_code=status.HTTP_201_CREATED)
async def create_hidden_tags_bulk(
    bulk_data: HiddenTagBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create multiple hidden tags at once (admin only)"""
    created_tags = []

    for tag_data in bulk_data.tags:
        # Check for duplicate
        existing = db.query(HiddenTag).filter(
            and_(
                HiddenTag.entity_id == tag_data.entity_id,
                HiddenTag.entity_type == tag_data.entity_type,
                HiddenTag.page_tag == tag_data.page_tag,
            )
        ).first()

        if not existing:
            tag = HiddenTag(**tag_data.model_dump())
            db.add(tag)
            created_tags.append(tag)

    db.commit()

    for tag in created_tags:
        db.refresh(tag)

    return created_tags


@router.put("/{tag_id}", response_model=HiddenTagResponse)
async def update_hidden_tag(
    tag_id: UUID,
    tag_update: HiddenTagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update a hidden tag (admin only)"""
    tag = db.query(HiddenTag).filter(HiddenTag.id == tag_id).first()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hidden tag not found"
        )

    # Update fields
    update_data = tag_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)

    db.commit()
    db.refresh(tag)

    return tag


@router.put("/reorder")
async def reorder_tags(
    reorder_data: HiddenTagReorderBulk,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Reorder multiple tags within a page section (admin only)"""
    for reorder in reorder_data.reorders:
        tag = db.query(HiddenTag).filter(
            and_(
                HiddenTag.id == reorder.tag_id,
                HiddenTag.page_tag == reorder_data.page_tag,
            )
        ).first()

        if tag:
            tag.order_index = reorder.new_order_index

    db.commit()

    return {"message": f"Reordered {len(reorder_data.reorders)} tags successfully"}


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hidden_tag(
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a hidden tag (admin only)"""
    tag = db.query(HiddenTag).filter(HiddenTag.id == tag_id).first()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hidden tag not found"
        )

    db.delete(tag)
    db.commit()


@router.get("/available/{entity_type}")
async def get_available_entities(
    entity_type: EntityType,
    page_tag: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Get available entities of a specific type that can be tagged.
    Optionally filter out entities already tagged for a specific page.
    Used in admin UI for selecting entities to tag.
    """
    # Get already tagged entity IDs for this page
    tagged_ids = []
    if page_tag:
        tagged = db.query(HiddenTag.entity_id).filter(
            and_(
                HiddenTag.entity_type == entity_type,
                HiddenTag.page_tag == page_tag,
            )
        ).all()
        tagged_ids = [str(t[0]) for t in tagged]

    # Initialize media service
    media_service = MediaService(db)

    # Query based on entity type
    result = []

    if entity_type == EntityType.TEACHING:
        query = db.query(Teaching)
        if search:
            query = query.filter(Teaching.title.ilike(f"%{search}%"))
        if tagged_ids:
            query = query.filter(Teaching.id.notin_(tagged_ids))

        teachings = query.order_by(Teaching.published_date.desc()).offset(skip).limit(limit).all()

        for t in teachings:
            data = {
                "id": str(t.id),
                "slug": t.slug,
                "title": t.title,
                "thumbnail_url": t.thumbnail_url,
                "published_date": t.published_date.isoformat() if t.published_date else None,
            }
            result.append(media_service.resolve_dict(data))

    elif entity_type == EntityType.BLOG:
        query = db.query(BlogPost).filter(BlogPost.is_published == True)
        if search:
            query = query.filter(BlogPost.title.ilike(f"%{search}%"))
        if tagged_ids:
            query = query.filter(BlogPost.id.notin_(tagged_ids))

        blogs = query.order_by(BlogPost.published_at.desc()).offset(skip).limit(limit).all()

        for b in blogs:
            data = {
                "id": str(b.id),
                "slug": b.slug,
                "title": b.title,
                "featured_image": b.featured_image,
                "published_at": b.published_at.isoformat() if b.published_at else None,
            }
            result.append(media_service.resolve_dict(data))

    elif entity_type == EntityType.PRODUCT:
        query = db.query(Product)
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
        if tagged_ids:
            query = query.filter(Product.id.notin_(tagged_ids))

        products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

        for p in products:
            data = {
                "id": str(p.id),
                "slug": p.slug,
                "name": p.name,
                "featured_image": p.featured_image,
                "type": p.type.value if hasattr(p.type, 'value') else p.type,
            }
            result.append(media_service.resolve_dict(data))

    elif entity_type == EntityType.RETREAT:
        query = db.query(Retreat)
        if search:
            query = query.filter(Retreat.title.ilike(f"%{search}%"))
        if tagged_ids:
            query = query.filter(Retreat.id.notin_(tagged_ids))

        retreats = query.order_by(Retreat.start_date.desc()).offset(skip).limit(limit).all()

        for r in retreats:
            data = {
                "id": str(r.id),
                "slug": r.slug,
                "title": r.title,
                "featured_image": r.featured_image,
                "retreat_type": r.retreat_type,
                "start_date": r.start_date.isoformat() if r.start_date else None,
            }
            result.append(media_service.resolve_dict(data))

    elif entity_type == EntityType.EVENT:
        query = db.query(Event)
        if search:
            query = query.filter(Event.title.ilike(f"%{search}%"))
        if tagged_ids:
            query = query.filter(Event.id.notin_(tagged_ids))

        events = query.order_by(Event.start_time.desc()).offset(skip).limit(limit).all()

        for e in events:
            data = {
                "id": str(e.id),
                "slug": e.slug,
                "title": e.title,
                "event_type": e.event_type,
                "start_time": e.start_time.isoformat() if e.start_time else None,
            }
            result.append(data)

    return result
