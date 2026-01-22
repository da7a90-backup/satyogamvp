"""Analytics router for event tracking and admin analytics."""

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_current_user, require_admin
from ..models.user import User
from ..models.analytics import AnalyticsEvent, UserAnalytics
from ..schemas.analytics import (
    AnalyticsEventCreate,
    AnalyticsEventResponse,
    UserAnalyticsResponse,
)
from ..services import mixpanel_service, ga4_service
from ..services.analytics_service import AnalyticsService

router = APIRouter()


@router.post("/track", response_model=AnalyticsEventResponse)
async def track_event(
    event_data: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Track an analytics event from the frontend.
    Works for both authenticated and anonymous users.
    """
    # Determine user ID
    user_id = None
    distinct_id = None

    if current_user:
        user_id = current_user.id
        distinct_id = str(current_user.id)
    elif event_data.user_id:
        # Use provided user_id (could be anonymous session ID)
        distinct_id = event_data.user_id
    else:
        # Generate anonymous ID from IP + User Agent
        distinct_id = f"anon_{hash(f'{event_data.ip_address}_{event_data.user_agent}')}"

    # Get IP and User Agent from request if not provided
    ip_address = event_data.ip_address or request.client.host
    user_agent = event_data.user_agent or request.headers.get("user-agent")

    # Store event in database
    analytics_event = AnalyticsEvent(
        user_id=user_id,
        event_name=event_data.event_name,
        event_properties=event_data.event_properties,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(analytics_event)
    db.commit()
    db.refresh(analytics_event)

    # Track in Mixpanel (async, don't wait)
    await mixpanel_service.track_event(
        event_data.event_name,
        distinct_id,
        event_data.event_properties,
    )

    # Track in Google Analytics 4 (async, don't wait)
    await ga4_service.track_event(
        distinct_id,
        event_data.event_name.lower().replace(" ", "_"),
        event_data.event_properties,
    )

    # Update user analytics if authenticated
    if current_user:
        user_analytics = (
            db.query(UserAnalytics)
            .filter(UserAnalytics.user_id == current_user.id)
            .first()
        )

        if user_analytics:
            # Update last_active_at
            from datetime import datetime
            user_analytics.last_active_at = datetime.utcnow()

            # Increment session count if it's a login or session start event
            if event_data.event_name.lower() in ["login", "session_start", "page_view"]:
                user_analytics.total_sessions += 1

            # Update specific counters based on event type
            if "teaching" in event_data.event_name.lower() and "view" in event_data.event_name.lower():
                user_analytics.teachings_viewed += 1
            elif "course" in event_data.event_name.lower() and "enroll" in event_data.event_name.lower():
                user_analytics.courses_enrolled += 1
            elif "retreat" in event_data.event_name.lower() and "register" in event_data.event_name.lower():
                user_analytics.retreats_attended += 1

            db.commit()

    return analytics_event


@router.get("/user/{user_id}", response_model=UserAnalyticsResponse)
async def get_user_analytics(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics for a specific user (admin or self only)."""
    # Check permissions - only admin or the user themselves
    if str(current_user.id) != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    user_analytics = (
        db.query(UserAnalytics)
        .filter(UserAnalytics.user_id == uuid.UUID(user_id))
        .first()
    )

    if not user_analytics:
        raise HTTPException(status_code=404, detail="User analytics not found")

    return user_analytics


@router.get("/events/user/{user_id}")
async def get_user_events(
    user_id: str,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent events for a user (admin or self only)."""
    # Check permissions
    if str(current_user.id) != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.user_id == uuid.UUID(user_id))
        .order_by(AnalyticsEvent.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {"events": events, "total": len(events)}


# ==================== ADMIN ANALYTICS ENDPOINTS ====================


@router.get("/dashboard/summary")
async def get_dashboard_summary(
    timeframe: str = Query("30d", description="Timeframe: 7d, 30d, 90d, this_month, last_month, this_year, last_year, lifetime, custom"),
    custom_start: Optional[datetime] = Query(None, description="Custom start date (ISO format)"),
    custom_end: Optional[datetime] = Query(None, description="Custom end date (ISO format)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get dashboard summary with key metrics and growth percentages.

    Admin only endpoint.
    """
    try:
        summary = AnalyticsService.get_dashboard_summary(
            db, timeframe, custom_start, custom_end
        )
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/dashboard/activity-log")
async def get_activity_log(
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get recent activity log across the platform.

    Returns user registrations, enrollments, payments, retreat registrations.
    Admin only endpoint.
    """
    activities = AnalyticsService.get_activity_log(db, limit, offset)
    return {
        "activities": activities,
        "limit": limit,
        "offset": offset,
        "total": len(activities)
    }


@router.get("/dashboard/events")
async def get_dashboard_events(
    timeframe: str = Query("7d", description="Timeframe for events"),
    limit: int = Query(10, ge=1, le=50, description="Number of top events"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get top analytics events for the dashboard.

    Admin only endpoint.
    """
    try:
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)
        top_events = AnalyticsService.get_top_events(db, start_date, end_date, limit)

        # Get total event count for percentage calculation
        total_events = sum(event['count'] for event in top_events)

        # Add percentage to each event
        for event in top_events:
            event['percentage'] = round((event['count'] / total_events * 100), 2) if total_events > 0 else 0

        return {
            "timeframe": timeframe,
            "top_events": top_events,
            "total_events": total_events
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== SALES & REVENUE ANALYTICS ====================

@router.get("/sales/summary")
async def get_sales_summary(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get sales and revenue summary. Admin only."""
    try:
        summary = AnalyticsService.get_sales_summary(db, timeframe)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sales/products/popular")
async def get_popular_products(
    timeframe: str = Query("30d"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get top-selling products. Admin only."""
    try:
        products = AnalyticsService.get_popular_products(db, timeframe, limit)
        return {"products": products, "timeframe": timeframe}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== CUSTOMER ANALYTICS ====================

@router.get("/customers/summary")
async def get_customer_summary(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get customer analytics summary. Admin only."""
    try:
        summary = AnalyticsService.get_customer_summary(db, timeframe)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/customers/segmentation")
async def get_customer_segmentation(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get customer segmentation. Admin only."""
    try:
        segmentation = AnalyticsService.get_customer_segmentation(db, timeframe)
        return segmentation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== COURSE ANALYTICS ====================

@router.get("/courses/enrollment")
async def get_course_enrollment(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get course enrollment metrics. Admin only."""
    try:
        enrollment = AnalyticsService.get_course_enrollment(db, timeframe)
        return enrollment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/courses/engagement")
async def get_course_engagement(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get course engagement metrics. Admin only."""
    try:
        engagement = AnalyticsService.get_course_engagement(db, timeframe)
        return engagement
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== TEACHING ANALYTICS ====================

@router.get("/teachings/views")
async def get_teaching_views(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get teaching view metrics. Admin only."""
    try:
        views = AnalyticsService.get_teaching_views(db, timeframe)
        return views
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== MEMBERSHIP ANALYTICS ====================

@router.get("/membership/tiers")
async def get_membership_tiers(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get membership tier breakdown. Admin only."""
    try:
        tiers = AnalyticsService.get_membership_tiers(db, timeframe)
        return tiers
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/membership/conversion")
async def get_membership_conversion(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get free trial to paid conversion metrics. Admin only."""
    try:
        conversion = AnalyticsService.get_membership_conversion(db, timeframe)
        return conversion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== RETREAT ANALYTICS ====================

@router.get("/retreats/registration")
async def get_retreat_registration(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get retreat registration metrics. Admin only."""
    try:
        registration = AnalyticsService.get_retreat_registration(db, timeframe)
        return registration
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/retreats/revenue")
async def get_retreat_revenue(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get retreat revenue metrics. Admin only."""
    try:
        revenue = AnalyticsService.get_retreat_revenue(db, timeframe)
        return revenue
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== CROSS ANALYTICS ====================

@router.get("/cross/ltv")
async def get_ltv_metrics(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get customer lifetime value metrics. Admin only."""
    try:
        ltv = AnalyticsService.get_ltv_metrics(db, timeframe)
        return ltv
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== TREND DATA FOR CHARTS ====================

@router.get("/trends/revenue")
async def get_revenue_trend(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get revenue trend data for charts. Admin only."""
    try:
        trend = AnalyticsService.get_revenue_trend(db, timeframe)
        return {"trend": trend, "timeframe": timeframe}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/trends/users")
async def get_user_growth_trend(
    timeframe: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get user growth trend data for charts. Admin only."""
    try:
        trend = AnalyticsService.get_user_growth_trend(db, timeframe)
        return {"trend": trend, "timeframe": timeframe}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
