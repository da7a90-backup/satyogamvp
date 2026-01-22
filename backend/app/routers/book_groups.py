"""
Book Groups API Router
Handles all book group endpoints for users and admins.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.deps import get_current_user, get_current_admin
from ..models.book_group import BookGroup, BookGroupSession, BookGroupAccess, BookGroupStatus
from ..models.user import User
from ..models.product import Product
from ..schemas import book_group as schemas
from ..services.book_group_service import BookGroupService

router = APIRouter()


# ===== USER ENDPOINTS =====

@router.get("/", response_model=schemas.BookGroupList)
def get_book_groups(
    status: Optional[BookGroupStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of book groups with filtering and pagination."""
    query = db.query(BookGroup).filter(BookGroup.is_published == True)

    # Filter by status
    if status:
        query = query.filter(BookGroup.status == status)

    # Search by title or description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BookGroup.title.ilike(search_term),
                BookGroup.description.ilike(search_term)
            )
        )

    # Get total count
    total = query.count()

    # Paginate
    offset = (page - 1) * page_size
    book_groups = query.order_by(BookGroup.start_date.desc()).offset(offset).limit(page_size).all()

    # Build card responses
    items = []
    for bg in book_groups:
        session_count = len(bg.sessions)
        has_video = any(s.video_url for s in bg.sessions)
        has_audio = any(s.audio_url for s in bg.sessions)

        items.append(schemas.BookGroupCard(
            id=str(bg.id),
            slug=bg.slug,
            title=bg.title,
            short_description=bg.short_description,
            thumbnail=bg.thumbnail,
            thumbnail_gravity=bg.thumbnail_gravity,
            status=bg.status,
            session_count=session_count,
            has_video=has_video,
            has_audio=has_audio,
            start_date=bg.start_date,
            is_featured=bg.is_featured
        ))

    return schemas.BookGroupList(
        total=total,
        items=items,
        page=page,
        page_size=page_size
    )


@router.get("/featured", response_model=Optional[schemas.FeaturedBookGroup])
def get_featured_book_group(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the featured 'Coming up' book group."""
    book_group = db.query(BookGroup).filter(
        BookGroup.is_featured == True,
        BookGroup.is_published == True,
        BookGroup.status.in_([BookGroupStatus.UPCOMING, BookGroupStatus.LIVE])
    ).first()

    if not book_group:
        return None

    # Find next upcoming session
    next_session = db.query(BookGroupSession).filter(
        BookGroupSession.book_group_id == book_group.id,
        BookGroupSession.session_date >= datetime.utcnow()
    ).order_by(BookGroupSession.session_date).first()

    next_session_date = next_session.session_date if next_session else book_group.start_date
    days_until = None
    zoom_enabled = False

    if next_session_date:
        days_until = (next_session_date - datetime.utcnow()).days
        zoom_enabled = next_session.zoom_enabled if next_session else False

    return schemas.FeaturedBookGroup(
        id=str(book_group.id),
        slug=book_group.slug,
        title=book_group.title,
        description=book_group.description,
        hero_image=book_group.hero_image,
        book_cover_image=book_group.book_cover_image,
        hero_image_gravity=book_group.hero_image_gravity,
        start_date=book_group.start_date,
        meeting_day_of_week=book_group.meeting_day_of_week,
        meeting_time=book_group.meeting_time,
        zoom_enabled=zoom_enabled,
        next_session_date=next_session_date,
        days_until_next_session=days_until
    )


@router.get("/{slug}", response_model=schemas.BookGroupPortal)
def get_book_group_portal(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full book group portal with all sessions."""
    book_group = db.query(BookGroup).filter(
        BookGroup.slug == slug,
        BookGroup.is_published == True
    ).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    # Check access
    has_access, access_type, reason = BookGroupService.check_user_access(db, current_user, book_group)

    if not has_access:
        raise HTTPException(status_code=403, detail=f"Access denied: {reason}")

    # Build response
    portal_sessions = []
    for session in book_group.sessions:
        portal_sessions.append(schemas.BookGroupPortalSession(
            id=str(session.id),
            book_group_id=str(session.book_group_id),
            week_number=session.week_number,
            title=session.title,
            description=session.description,
            session_date=session.session_date,
            zoom_link=session.zoom_link if session.zoom_enabled else None,
            zoom_enabled=session.zoom_enabled,
            zoom_meeting_id=session.zoom_meeting_id if session.zoom_enabled else None,
            zoom_password=session.zoom_password if session.zoom_enabled else None,
            video_url=session.video_url,
            audio_url=session.audio_url,
            transcript_url=session.transcript_url,
            duration_minutes=session.duration_minutes,
            downloads=session.downloads,
            order_index=session.order_index,
            is_published=session.is_published,
            created_at=session.created_at,
            updated_at=session.updated_at
        ))

    return schemas.BookGroupPortal(
        id=str(book_group.id),
        slug=book_group.slug,
        title=book_group.title,
        description=book_group.description,
        short_description=book_group.short_description,
        hero_image=book_group.hero_image,
        book_cover_image=book_group.book_cover_image,
        thumbnail=book_group.thumbnail,
        hero_image_gravity=book_group.hero_image_gravity,
        thumbnail_gravity=book_group.thumbnail_gravity,
        status=book_group.status,
        is_featured=book_group.is_featured,
        is_published=book_group.is_published,
        start_date=book_group.start_date,
        end_date=book_group.end_date,
        meeting_day_of_week=book_group.meeting_day_of_week,
        meeting_time=book_group.meeting_time,
        duration_minutes=book_group.duration_minutes,
        requires_purchase=book_group.requires_purchase,
        store_product_id=str(book_group.store_product_id) if book_group.store_product_id else None,
        has_transcription=book_group.has_transcription,
        has_audio=book_group.has_audio,
        has_downloads=book_group.has_downloads,
        created_at=book_group.created_at,
        updated_at=book_group.updated_at,
        sessions=portal_sessions,
        session_count=len(portal_sessions),
        has_access=has_access,
        access_type=access_type
    )


@router.get("/{slug}/access", response_model=schemas.BookGroupAccessCheck)
def check_book_group_access(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has access to a book group."""
    book_group = db.query(BookGroup).filter(BookGroup.slug == slug).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    has_access, access_type, reason = BookGroupService.check_user_access(db, current_user, book_group)

    return schemas.BookGroupAccessCheck(
        has_access=has_access,
        access_type=access_type,
        reason=reason
    )


@router.post("/{slug}/calendar-reminder", response_model=schemas.CalendarReminderResponse)
def add_calendar_reminder(
    slug: str,
    data: schemas.CalendarReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add book group to user's calendar."""
    book_group = db.query(BookGroup).filter(BookGroup.slug == slug).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    # Check access
    has_access, _, _ = BookGroupService.check_user_access(db, current_user, book_group)
    if not has_access:
        raise HTTPException(status_code=403, detail="You don't have access to this book group")

    calendar_entry = BookGroupService.add_calendar_reminder(
        db=db,
        user_id=str(current_user.id),
        book_group_id=str(book_group.id),
        custom_title=data.custom_title
    )

    return schemas.CalendarReminderResponse(
        success=True,
        message="Book group added to your calendar",
        calendar_id=str(calendar_entry.id)
    )


# ===== ADMIN ENDPOINTS =====

@router.post("/", response_model=schemas.BookGroupInDB)
def create_book_group(
    data: schemas.BookGroupCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new book group (admin only)."""
    # Check if slug already exists
    existing = db.query(BookGroup).filter(BookGroup.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Book group with this slug already exists")

    book_group = BookGroup(**data.model_dump())
    db.add(book_group)
    db.commit()
    db.refresh(book_group)

    return book_group


@router.put("/{book_group_id}", response_model=schemas.BookGroupInDB)
def update_book_group(
    book_group_id: str,
    data: schemas.BookGroupUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a book group (admin only)."""
    book_group = db.query(BookGroup).filter(BookGroup.id == book_group_id).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    # Update fields
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(book_group, field, value)

    db.commit()
    db.refresh(book_group)

    return book_group


@router.delete("/{book_group_id}")
def delete_book_group(
    book_group_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a book group (admin only)."""
    book_group = db.query(BookGroup).filter(BookGroup.id == book_group_id).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    db.delete(book_group)
    db.commit()

    return {"success": True, "message": "Book group deleted"}


@router.post("/{book_group_id}/sessions", response_model=schemas.BookGroupSessionInDB)
def create_session(
    book_group_id: str,
    data: schemas.BookGroupSessionCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a session to a book group (admin only)."""
    book_group = db.query(BookGroup).filter(BookGroup.id == book_group_id).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    session = BookGroupSession(**data.model_dump(), book_group_id=book_group_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.put("/{book_group_id}/sessions/{session_id}", response_model=schemas.BookGroupSessionInDB)
def update_session(
    book_group_id: str,
    session_id: str,
    data: schemas.BookGroupSessionUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a book group session (admin only)."""
    session = db.query(BookGroupSession).filter(
        BookGroupSession.id == session_id,
        BookGroupSession.book_group_id == book_group_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Update fields
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    return session


@router.delete("/{book_group_id}/sessions/{session_id}")
def delete_session(
    book_group_id: str,
    session_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a book group session (admin only)."""
    session = db.query(BookGroupSession).filter(
        BookGroupSession.id == session_id,
        BookGroupSession.book_group_id == book_group_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    return {"success": True, "message": "Session deleted"}


@router.post("/{book_group_id}/mark-completed")
def mark_completed(
    book_group_id: str,
    data: schemas.BookGroupMarkCompleted,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mark a book group as completed (admin only)."""
    book_group = db.query(BookGroup).filter(BookGroup.id == book_group_id).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    BookGroupService.mark_completed(
        db=db,
        book_group=book_group,
        replace_zoom_with_videos=data.replace_zoom_with_videos
    )

    return {"success": True, "message": "Book group marked as completed"}


@router.post("/{book_group_id}/convert-to-product", response_model=dict)
def convert_to_product(
    book_group_id: str,
    data: schemas.BookGroupConvertToProduct,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Convert a completed book group to a store product (admin only)."""
    book_group = db.query(BookGroup).filter(BookGroup.id == book_group_id).first()

    if not book_group:
        raise HTTPException(status_code=404, detail="Book group not found")

    if book_group.status != BookGroupStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Book group must be completed before converting to product")

    product = BookGroupService.convert_to_product(
        db=db,
        book_group=book_group,
        product_title=data.product_title,
        product_description=data.product_description,
        price=data.price,
        regular_price=data.regular_price,
        member_discount=data.member_discount,
        categories=data.categories,
        tags=data.tags
    )

    return {
        "success": True,
        "message": "Book group converted to product",
        "product_id": str(product.id),
        "product_slug": product.slug
    }


@router.get("/admin/all", response_model=List[schemas.BookGroupAdmin])
def get_all_book_groups_admin(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all book groups with admin metadata."""
    book_groups = db.query(BookGroup).order_by(BookGroup.created_at.desc()).all()

    result = []
    for bg in book_groups:
        # Count sessions
        session_count = len(bg.sessions)

        # Count users with access
        access_count = db.query(BookGroupAccess).filter(
            BookGroupAccess.book_group_id == bg.id
        ).count()

        # Get store product title if linked
        store_product_title = None
        if bg.store_product_id:
            product = db.query(Product).filter(Product.id == bg.store_product_id).first()
            if product:
                store_product_title = product.title

        result.append(schemas.BookGroupAdmin(
            id=str(bg.id),
            slug=bg.slug,
            title=bg.title,
            description=bg.description,
            short_description=bg.short_description,
            hero_image=bg.hero_image,
            book_cover_image=bg.book_cover_image,
            thumbnail=bg.thumbnail,
            hero_image_gravity=bg.hero_image_gravity,
            thumbnail_gravity=bg.thumbnail_gravity,
            status=bg.status,
            is_featured=bg.is_featured,
            is_published=bg.is_published,
            start_date=bg.start_date,
            end_date=bg.end_date,
            meeting_day_of_week=bg.meeting_day_of_week,
            meeting_time=bg.meeting_time,
            duration_minutes=bg.duration_minutes,
            requires_purchase=bg.requires_purchase,
            store_product_id=str(bg.store_product_id) if bg.store_product_id else None,
            has_transcription=bg.has_transcription,
            has_audio=bg.has_audio,
            has_downloads=bg.has_downloads,
            created_at=bg.created_at,
            updated_at=bg.updated_at,
            sessions=[schemas.BookGroupSessionInDB.model_validate(s) for s in bg.sessions],
            session_count=session_count,
            access_count=access_count,
            store_product_title=store_product_title
        ))

    return result
