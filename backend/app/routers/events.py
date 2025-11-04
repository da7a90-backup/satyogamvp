"""Events router - Calendar events API."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..models.event import Event
from ..services.media_service import MediaService

router = APIRouter()


@router.get("/")
async def get_events(
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[str] = Query(None, description="Filter by event type (retreat, course, etc.)"),
    upcoming_only: bool = Query(False, description="Only show upcoming events"),
    db: Session = Depends(get_db),
):
    """
    Get all published events for the calendar page.

    Query params:
    - skip: Number of events to skip (pagination)
    - limit: Maximum number of events to return
    - event_type: Filter by event type (optional)
    - upcoming_only: Only show events that haven't ended yet
    """
    query = db.query(Event).filter(Event.is_published == True)

    # Filter by event type if specified
    if event_type:
        query = query.filter(Event.type == event_type.upper())

    # Filter to upcoming events only
    if upcoming_only:
        now = datetime.utcnow()
        query = query.filter(Event.start_datetime >= now)

    # Order by start date ascending (earliest first)
    query = query.order_by(Event.start_datetime.asc())

    events = query.offset(skip).limit(limit).all()
    total = query.count()

    # Initialize media service
    media_service = MediaService(db)

    # Build response
    result = []
    for event in events:
        # Determine the event URL based on type and location
        if event.type.value == "retreat" and event.location and "online" in event.location.lower():
            event_url = f"/retreats/online/{event.slug}"
        else:
            event_url = f"/calendar/{event.slug}"

        event_data = {
            "id": str(event.id),
            "slug": event.slug,
            "title": event.title,
            "subtitle": event.description[:200] if event.description else "",
            "description": event.description or "",
            "type": event.type.value,
            "date": event.start_datetime.strftime("%b %d, %Y") if event.start_datetime else "",
            "startDate": event.start_datetime.isoformat() if event.start_datetime else None,
            "endDate": event.end_datetime.isoformat() if event.end_datetime else None,
            "duration": _calculate_duration(event.start_datetime, event.end_datetime),
            "locationType": "Online" if event.location and "online" in event.location.lower() else "Onsite",
            "location": event.location or "TBA",
            "imageUrl": event.thumbnail_url or "",
            "eventUrl": event_url,
        }

        # Resolve all image paths to CDN URLs
        event_data = media_service.resolve_dict(event_data)
        result.append(event_data)

    return {"events": result, "total": total, "skip": skip, "limit": limit}


@router.get("/{slug}")
async def get_event(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get a single event by slug with full details."""
    event = db.query(Event).filter(
        Event.slug == slug,
        Event.is_published == True
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Build full response
    event_data = {
        "id": str(event.id),
        "slug": event.slug,
        "title": event.title,
        "subtitle": event.description[:200] if event.description else "",
        "description": event.description or "",
        "type": event.type.value,
        "startDate": event.start_datetime.isoformat() if event.start_datetime else None,
        "endDate": event.end_datetime.isoformat() if event.end_datetime else None,
        "duration": _calculate_duration(event.start_datetime, event.end_datetime),
        "location": event.location or "TBA",
        "imageUrl": event.thumbnail_url or "",
        "isRecurring": event.is_recurring,
        "recurrenceRule": event.recurrence_rule if event.is_recurring else None,
        "maxParticipants": event.max_participants,
    }

    # Initialize media service and resolve all image paths to CDN URLs
    media_service = MediaService(db)
    event_data = media_service.resolve_dict(event_data)

    return event_data


def _calculate_duration(start_datetime: datetime, end_datetime: datetime) -> str:
    """Calculate duration string from start and end datetimes (inclusive)."""
    if not start_datetime or not end_datetime:
        return "TBA"

    delta = end_datetime - start_datetime
    days = delta.days
    hours = delta.seconds // 3600

    # For multi-day events, add 1 to make the count inclusive
    # (e.g., Dec 27-29 is 3 days: 27, 28, 29)
    if days > 0:
        inclusive_days = days + 1
        return f"{inclusive_days} day{'s' if inclusive_days > 1 else ''}"
    elif hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''}"
    else:
        return "Less than 1 hour"
