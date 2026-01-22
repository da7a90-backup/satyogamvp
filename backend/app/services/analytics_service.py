"""Analytics service for data aggregation and metrics calculation."""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, extract
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal
import logging

from ..models.user import User, MembershipTierEnum
from ..models.payment import Payment, PaymentStatus, PaymentType
from ..models.course import Course, CourseEnrollment, EnrollmentStatus
from ..models.retreat import Retreat, RetreatRegistration, RegistrationStatus
from ..models.product import Product, Order, OrderStatus, UserProductAccess
from ..models.teaching import Teaching
from ..models.analytics import AnalyticsEvent, UserAnalytics
from ..models.membership import Subscription, SubscriptionStatus

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics data aggregation and calculations."""

    @staticmethod
    def parse_timeframe(timeframe: str, custom_start: Optional[datetime] = None, custom_end: Optional[datetime] = None) -> Tuple[datetime, datetime]:
        """
        Parse timeframe string into start and end datetime objects.

        Args:
            timeframe: One of '7d', '30d', '90d', 'this_month', 'last_month', 'this_year', 'last_year', 'lifetime', 'custom'
            custom_start: Custom start datetime (required if timeframe='custom')
            custom_end: Custom end datetime (required if timeframe='custom')

        Returns:
            Tuple of (start_datetime, end_datetime)
        """
        now = datetime.utcnow()

        if timeframe == '7d':
            return (now - timedelta(days=7), now)
        elif timeframe == '30d':
            return (now - timedelta(days=30), now)
        elif timeframe == '90d':
            return (now - timedelta(days=90), now)
        elif timeframe == 'this_month':
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return (start_of_month, now)
        elif timeframe == 'last_month':
            first_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month_end = first_of_this_month - timedelta(seconds=1)
            last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return (last_month_start, last_month_end)
        elif timeframe == 'this_year':
            start_of_year = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            return (start_of_year, now)
        elif timeframe == 'last_year':
            this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            last_year_end = this_year_start - timedelta(seconds=1)
            last_year_start = last_year_end.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            return (last_year_start, last_year_end)
        elif timeframe == 'lifetime':
            return (datetime(2020, 1, 1), now)  # Assuming platform started in 2020
        elif timeframe == 'custom':
            if not custom_start or not custom_end:
                raise ValueError("custom_start and custom_end required for custom timeframe")
            return (custom_start, custom_end)
        else:
            raise ValueError(f"Invalid timeframe: {timeframe}")

    @staticmethod
    def calculate_growth_percentage(current_value: float, previous_value: float) -> float:
        """Calculate percentage growth between two values."""
        if previous_value == 0:
            return 100.0 if current_value > 0 else 0.0
        return round(((current_value - previous_value) / previous_value) * 100, 2)

    @staticmethod
    def get_dashboard_summary(
        db: Session,
        timeframe: str = '30d',
        custom_start: Optional[datetime] = None,
        custom_end: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive dashboard summary with key metrics.

        Returns:
            Dict with stats for users, revenue, courses, products, and growth percentages
        """
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe, custom_start, custom_end)

        # Calculate previous period for comparison
        period_length = end_date - start_date
        previous_start = start_date - period_length
        previous_end = start_date

        # Total users
        total_users = db.query(func.count(User.id)).scalar() or 0
        new_users_current = db.query(func.count(User.id)).filter(
            User.created_at.between(start_date, end_date)
        ).scalar() or 0
        new_users_previous = db.query(func.count(User.id)).filter(
            User.created_at.between(previous_start, previous_end)
        ).scalar() or 0

        # Active users (logged in or had activity in period)
        active_users = db.query(func.count(func.distinct(UserAnalytics.user_id))).filter(
            UserAnalytics.last_active_at.between(start_date, end_date)
        ).scalar() or 0

        # Revenue
        revenue_current = db.query(func.sum(Payment.amount)).filter(
            and_(
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(start_date, end_date)
            )
        ).scalar() or Decimal(0)

        revenue_previous = db.query(func.sum(Payment.amount)).filter(
            and_(
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(previous_start, previous_end)
            )
        ).scalar() or Decimal(0)

        # Active courses
        active_courses = db.query(func.count(Course.id)).filter(
            Course.is_published == True
        ).scalar() or 0

        # Course enrollments
        enrollments_current = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.enrolled_at.between(start_date, end_date)
        ).scalar() or 0

        enrollments_previous = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.enrolled_at.between(previous_start, previous_end)
        ).scalar() or 0

        # Products sold (orders completed)
        products_sold_current = db.query(func.count(Order.id)).filter(
            and_(
                Order.status == OrderStatus.COMPLETED,
                Order.created_at.between(start_date, end_date)
            )
        ).scalar() or 0

        products_sold_previous = db.query(func.count(Order.id)).filter(
            and_(
                Order.status == OrderStatus.COMPLETED,
                Order.created_at.between(previous_start, previous_end)
            )
        ).scalar() or 0

        # Retreat registrations
        retreat_registrations = db.query(func.count(RetreatRegistration.id)).filter(
            RetreatRegistration.registered_at.between(start_date, end_date)
        ).scalar() or 0

        # Calculate growth percentages
        users_growth = AnalyticsService.calculate_growth_percentage(
            float(new_users_current), float(new_users_previous)
        )
        revenue_growth = AnalyticsService.calculate_growth_percentage(
            float(revenue_current), float(revenue_previous)
        )
        enrollments_growth = AnalyticsService.calculate_growth_percentage(
            float(enrollments_current), float(enrollments_previous)
        )
        products_growth = AnalyticsService.calculate_growth_percentage(
            float(products_sold_current), float(products_sold_previous)
        )

        return {
            "timeframe": timeframe,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "users": {
                "total": total_users,
                "new": new_users_current,
                "active": active_users,
                "growth_percentage": users_growth
            },
            "revenue": {
                "total": float(revenue_current),
                "previous_period": float(revenue_previous),
                "growth_percentage": revenue_growth
            },
            "courses": {
                "active": active_courses,
                "enrollments": enrollments_current,
                "growth_percentage": enrollments_growth
            },
            "products": {
                "sold": products_sold_current,
                "growth_percentage": products_growth
            },
            "retreats": {
                "registrations": retreat_registrations
            }
        }

    @staticmethod
    def get_activity_log(
        db: Session,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get recent user activity across the platform.

        Returns:
            List of activity events with user info, action type, and timestamp
        """
        activities = []

        # Recent user registrations
        recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
        for user in recent_users:
            activities.append({
                "id": f"user_reg_{user.id}",
                "user": user.name,
                "user_id": str(user.id),
                "action": "signed up",
                "item": "platform",
                "item_type": "registration",
                "timestamp": user.created_at.isoformat(),
                "time_ago": AnalyticsService._get_time_ago(user.created_at)
            })

        # Recent course enrollments
        recent_enrollments = db.query(
            CourseEnrollment, User, Course
        ).join(User).join(Course).order_by(
            CourseEnrollment.enrolled_at.desc()
        ).limit(5).all()

        for enrollment, user, course in recent_enrollments:
            activities.append({
                "id": f"enrollment_{enrollment.id}",
                "user": user.name,
                "user_id": str(user.id),
                "action": "enrolled in",
                "item": course.title,
                "item_type": "course",
                "timestamp": enrollment.enrolled_at.isoformat(),
                "time_ago": AnalyticsService._get_time_ago(enrollment.enrolled_at)
            })

        # Recent payments
        recent_payments = db.query(
            Payment, User
        ).outerjoin(User).filter(
            Payment.status == PaymentStatus.COMPLETED
        ).order_by(Payment.updated_at.desc()).limit(5).all()

        for payment, user in recent_payments:
            user_name = user.name if user else "Anonymous"
            activities.append({
                "id": f"payment_{payment.id}",
                "user": user_name,
                "user_id": str(user.id) if user else None,
                "action": "purchased",
                "item": f"{payment.payment_type.value} (${float(payment.amount)})",
                "item_type": "payment",
                "timestamp": payment.updated_at.isoformat(),
                "time_ago": AnalyticsService._get_time_ago(payment.updated_at)
            })

        # Recent retreat registrations
        recent_retreat_regs = db.query(
            RetreatRegistration, User, Retreat
        ).join(User).join(Retreat).order_by(
            RetreatRegistration.registered_at.desc()
        ).limit(5).all()

        for reg, user, retreat in recent_retreat_regs:
            activities.append({
                "id": f"retreat_reg_{reg.id}",
                "user": user.name,
                "user_id": str(user.id),
                "action": "registered for",
                "item": retreat.title,
                "item_type": "retreat",
                "timestamp": reg.registered_at.isoformat(),
                "time_ago": AnalyticsService._get_time_ago(reg.registered_at)
            })

        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)

        # Apply pagination
        return activities[offset:offset + limit]

    @staticmethod
    def _get_time_ago(timestamp: datetime) -> str:
        """Convert timestamp to human-readable 'time ago' string."""
        now = datetime.utcnow()
        diff = now - timestamp

        if diff.days > 365:
            years = diff.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
        elif diff.days > 30:
            months = diff.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        elif diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "just now"

    @staticmethod
    def get_top_events(
        db: Session,
        start_date: datetime,
        end_date: datetime,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top analytics events by count in the specified period."""
        events = db.query(
            AnalyticsEvent.event_name,
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            AnalyticsEvent.created_at.between(start_date, end_date)
        ).group_by(
            AnalyticsEvent.event_name
        ).order_by(
            func.count(AnalyticsEvent.id).desc()
        ).limit(limit).all()

        return [{"event_name": event.event_name, "count": event.count} for event in events]

    # ==================== SALES & REVENUE ANALYTICS ====================

    @staticmethod
    def get_sales_summary(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get sales and revenue summary."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Total sales (completed orders)
        total_sales = db.query(func.count(Order.id)).filter(
            and_(
                Order.status == OrderStatus.COMPLETED,
                Order.created_at.between(start_date, end_date)
            )
        ).scalar() or 0

        # Total revenue
        total_revenue = db.query(func.sum(Payment.amount)).filter(
            and_(
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(start_date, end_date)
            )
        ).scalar() or Decimal(0)

        # Average order value
        aov = float(total_revenue / total_sales) if total_sales > 0 else 0

        # Conversion rate (completed orders / unique visitors - simplified as active users)
        unique_visitors = db.query(func.count(func.distinct(UserAnalytics.user_id))).filter(
            UserAnalytics.last_active_at.between(start_date, end_date)
        ).scalar() or 1

        conversion_rate = round((total_sales / unique_visitors) * 100, 2)

        return {
            "total_sales": total_sales,
            "total_revenue": float(total_revenue),
            "average_order_value": round(aov, 2),
            "conversion_rate": conversion_rate
        }

    @staticmethod
    def get_popular_products(db: Session, timeframe: str = '30d', limit: int = 10) -> List[Dict[str, Any]]:
        """Get top-selling products."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Get products from completed orders
        popular = db.query(
            Product.title,
            Product.id,
            func.count(UserProductAccess.id).label('sales_count')
        ).join(UserProductAccess).filter(
            UserProductAccess.granted_at.between(start_date, end_date)
        ).group_by(Product.id, Product.title).order_by(
            func.count(UserProductAccess.id).desc()
        ).limit(limit).all()

        return [
            {
                "product_id": str(p.id),
                "title": p.title,
                "sales_count": p.sales_count
            } for p in popular
        ]

    # ==================== CUSTOMER ANALYTICS ====================

    @staticmethod
    def get_customer_summary(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get customer analytics summary."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # New vs returning customers
        new_customers = db.query(func.count(User.id)).filter(
            User.created_at.between(start_date, end_date)
        ).scalar() or 0

        # Users with previous purchases
        returning_customers = db.query(func.count(func.distinct(Payment.user_id))).filter(
            and_(
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(start_date, end_date),
                Payment.user_id.isnot(None)
            )
        ).scalar() or 0

        # Customer lifetime value (average)
        total_clv = db.query(func.sum(UserAnalytics.total_spent)).scalar() or Decimal(0)
        total_customers = db.query(func.count(User.id)).scalar() or 1
        avg_clv = float(total_clv) / total_customers

        return {
            "new_customers": new_customers,
            "returning_customers": returning_customers,
            "average_clv": round(avg_clv, 2),
            "total_customers": total_customers
        }

    @staticmethod
    def get_customer_segmentation(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get customer segmentation by membership tier."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Segment by membership tier
        segments = db.query(
            User.membership_tier,
            func.count(User.id).label('count')
        ).group_by(User.membership_tier).all()

        segmentation = {}
        for tier, count in segments:
            segmentation[tier.value] = count

        return {
            "by_membership_tier": segmentation,
            "timeframe": timeframe
        }

    # ==================== COURSE ANALYTICS ====================

    @staticmethod
    def get_course_enrollment(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get course enrollment metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        total_enrollments = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.enrolled_at.between(start_date, end_date)
        ).scalar() or 0

        # Calculate previous period
        period_length = end_date - start_date
        prev_start = start_date - period_length
        prev_enrollments = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.enrolled_at.between(prev_start, start_date)
        ).scalar() or 0

        growth_rate = AnalyticsService.calculate_growth_percentage(
            float(total_enrollments), float(prev_enrollments)
        )

        return {
            "total_enrollments": total_enrollments,
            "growth_rate": growth_rate,
            "timeframe": timeframe
        }

    @staticmethod
    def get_course_engagement(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get course engagement metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Completion rate
        total_enrolled = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.enrolled_at <= end_date
        ).scalar() or 1

        completed = db.query(func.count(CourseEnrollment.id)).filter(
            and_(
                CourseEnrollment.status == EnrollmentStatus.COMPLETED,
                CourseEnrollment.completed_at.between(start_date, end_date)
            )
        ).scalar() or 0

        completion_rate = round((completed / total_enrolled) * 100, 2)

        # Active users (enrolled and active in period)
        active_users = db.query(func.count(func.distinct(CourseEnrollment.user_id))).filter(
            CourseEnrollment.enrolled_at.between(start_date, end_date)
        ).scalar() or 0

        return {
            "completion_rate": completion_rate,
            "active_users": active_users,
            "completed_courses": completed
        }

    # ==================== TEACHING ANALYTICS ====================

    @staticmethod
    def get_teaching_views(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get teaching view metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Total views from analytics events
        total_views = db.query(func.count(AnalyticsEvent.id)).filter(
            and_(
                AnalyticsEvent.event_name.ilike('%teaching%view%'),
                AnalyticsEvent.created_at.between(start_date, end_date)
            )
        ).scalar() or 0

        # Unique viewers
        unique_viewers = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
            and_(
                AnalyticsEvent.event_name.ilike('%teaching%view%'),
                AnalyticsEvent.created_at.between(start_date, end_date),
                AnalyticsEvent.user_id.isnot(None)
            )
        ).scalar() or 0

        return {
            "total_views": total_views,
            "unique_viewers": unique_viewers,
            "timeframe": timeframe
        }

    # ==================== MEMBERSHIP ANALYTICS ====================

    @staticmethod
    def get_membership_tiers(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get membership tier breakdown."""
        # Current tier distribution
        tier_counts = db.query(
            User.membership_tier,
            func.count(User.id).label('count')
        ).group_by(User.membership_tier).all()

        tiers = {}
        for tier, count in tier_counts:
            tiers[tier.value] = count

        # Active subscriptions by tier
        active_subs = db.query(
            Subscription.tier,
            func.count(Subscription.id).label('count')
        ).filter(
            Subscription.status == SubscriptionStatus.ACTIVE
        ).group_by(Subscription.tier).all()

        active_by_tier = {}
        for tier, count in active_subs:
            active_by_tier[tier] = count

        return {
            "tier_distribution": tiers,
            "active_subscriptions": active_by_tier
        }

    @staticmethod
    def get_membership_conversion(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get free trial to paid conversion metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Users who started trial
        trials_started = db.query(func.count(Subscription.id)).filter(
            and_(
                Subscription.trial_end_date.between(start_date, end_date),
                Subscription.trial_end_date.isnot(None)
            )
        ).scalar() or 0

        # Trials converted to paid
        trials_converted = db.query(func.count(Subscription.id)).filter(
            and_(
                Subscription.trial_end_date.between(start_date, end_date),
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.trial_end_date.isnot(None)
            )
        ).scalar() or 0

        conversion_rate = round((trials_converted / trials_started) * 100, 2) if trials_started > 0 else 0

        return {
            "trials_started": trials_started,
            "trials_converted": trials_converted,
            "conversion_rate": conversion_rate
        }

    # ==================== RETREAT ANALYTICS ====================

    @staticmethod
    def get_retreat_registration(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get retreat registration metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        total_registrations = db.query(func.count(RetreatRegistration.id)).filter(
            RetreatRegistration.registered_at.between(start_date, end_date)
        ).scalar() or 0

        # Calculate growth
        period_length = end_date - start_date
        prev_start = start_date - period_length
        prev_registrations = db.query(func.count(RetreatRegistration.id)).filter(
            RetreatRegistration.registered_at.between(prev_start, start_date)
        ).scalar() or 0

        growth_rate = AnalyticsService.calculate_growth_percentage(
            float(total_registrations), float(prev_registrations)
        )

        return {
            "total_registrations": total_registrations,
            "growth_rate": growth_rate,
            "timeframe": timeframe
        }

    @staticmethod
    def get_retreat_revenue(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Get retreat revenue metrics."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        total_revenue = db.query(func.sum(Payment.amount)).filter(
            and_(
                Payment.payment_type == PaymentType.RETREAT,
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(start_date, end_date)
            )
        ).scalar() or Decimal(0)

        return {
            "total_revenue": float(total_revenue),
            "timeframe": timeframe
        }

    # ==================== CROSS ANALYTICS ====================

    @staticmethod
    def get_ltv_metrics(db: Session, timeframe: str = '30d') -> Dict[str, Any]:
        """Calculate customer lifetime value metrics."""
        # Average LTV across all users
        avg_ltv = db.query(func.avg(UserAnalytics.total_spent)).scalar() or Decimal(0)

        # LTV by membership tier
        ltv_by_tier = db.query(
            User.membership_tier,
            func.avg(UserAnalytics.total_spent).label('avg_ltv')
        ).join(UserAnalytics).group_by(User.membership_tier).all()

        tier_ltv = {}
        for tier, ltv in ltv_by_tier:
            tier_ltv[tier.value] = float(ltv or 0)

        return {
            "average_ltv": float(avg_ltv),
            "ltv_by_tier": tier_ltv
        }

    # ==================== TREND DATA FOR CHARTS ====================

    @staticmethod
    def get_revenue_trend(db: Session, timeframe: str = '30d') -> List[Dict[str, Any]]:
        """Get revenue trend data for charts."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Determine grouping based on timeframe
        if timeframe in ['7d']:
            # Group by day
            date_format = func.date(Payment.created_at)
            interval = 'day'
        elif timeframe in ['30d', 'this_month', 'last_month']:
            # Group by day
            date_format = func.date(Payment.created_at)
            interval = 'day'
        elif timeframe in ['90d', 'this_year', 'last_year', 'lifetime']:
            # Group by week
            date_format = func.date(Payment.created_at)
            interval = 'week'
        else:
            # Default to day
            date_format = func.date(Payment.created_at)
            interval = 'day'

        # Query revenue by date
        trend_data = db.query(
            date_format.label('date'),
            func.sum(Payment.amount).label('revenue')
        ).filter(
            and_(
                Payment.status == PaymentStatus.COMPLETED,
                Payment.created_at.between(start_date, end_date)
            )
        ).group_by(date_format).order_by(date_format).all()

        return [
            {
                "date": str(item.date),
                "revenue": float(item.revenue or 0)
            } for item in trend_data
        ]

    @staticmethod
    def get_user_growth_trend(db: Session, timeframe: str = '30d') -> List[Dict[str, Any]]:
        """Get user growth trend data for charts."""
        start_date, end_date = AnalyticsService.parse_timeframe(timeframe)

        # Group by date
        date_format = func.date(User.created_at)

        trend_data = db.query(
            date_format.label('date'),
            func.count(User.id).label('new_users')
        ).filter(
            User.created_at.between(start_date, end_date)
        ).group_by(date_format).order_by(date_format).all()

        # Calculate cumulative
        cumulative = 0
        result = []
        for item in trend_data:
            cumulative += item.new_users
            result.append({
                "date": str(item.date),
                "new_users": item.new_users,
                "total_users": cumulative
            })

        return result
