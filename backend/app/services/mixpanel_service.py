"""Mixpanel Analytics Service."""

from typing import Dict, Any, Optional
from datetime import datetime
import httpx

from ..core.config import settings


class MixpanelService:
    """Service for tracking events with Mixpanel."""

    def __init__(self):
        self.token = settings.MIXPANEL_TOKEN
        self.api_url = "https://api.mixpanel.com"

    async def track_event(
        self,
        event_name: str,
        distinct_id: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Track an event in Mixpanel.

        Args:
            event_name: Name of the event
            distinct_id: Unique identifier for the user
            properties: Additional event properties

        Returns:
            True if successful
        """
        if not self.token:
            return False

        try:
            event_data = {
                "event": event_name,
                "properties": {
                    "token": self.token,
                    "distinct_id": distinct_id,
                    "time": int(datetime.utcnow().timestamp()),
                    **(properties or {}),
                },
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/track",
                    json=[event_data],
                    timeout=10.0,
                )
                return response.status_code == 200

        except Exception as e:
            print(f"Mixpanel track error: {e}")
            return False

    async def identify_user(
        self, distinct_id: str, properties: Dict[str, Any]
    ) -> bool:
        """
        Set user properties in Mixpanel.

        Args:
            distinct_id: Unique identifier for the user
            properties: User properties to set

        Returns:
            True if successful
        """
        if not self.token:
            return False

        try:
            engagement_data = {
                "$token": self.token,
                "$distinct_id": distinct_id,
                "$set": properties,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/engage",
                    json=[engagement_data],
                    timeout=10.0,
                )
                return response.status_code == 200

        except Exception as e:
            print(f"Mixpanel identify error: {e}")
            return False

    # Predefined event tracking methods
    async def track_page_view(
        self, user_id: str, page_url: str, page_title: str = None
    ):
        """Track page view."""
        return await self.track_event(
            "Page View",
            user_id,
            {"page_url": page_url, "page_title": page_title},
        )

    async def track_signup(self, user_id: str, email: str, membership_tier: str):
        """Track user signup."""
        return await self.track_event(
            "User Signup",
            user_id,
            {"email": email, "membership_tier": membership_tier},
        )

    async def track_login(self, user_id: str, email: str):
        """Track user login."""
        return await self.track_event(
            "User Login",
            user_id,
            {"email": email},
        )

    async def track_payment(
        self,
        user_id: str,
        amount: float,
        currency: str,
        payment_type: str,
        item_id: str = None,
    ):
        """Track payment completion."""
        return await self.track_event(
            "Payment Completed",
            user_id,
            {
                "amount": amount,
                "currency": currency,
                "payment_type": payment_type,
                "item_id": item_id,
            },
        )

    async def track_course_enrollment(self, user_id: str, course_id: str, course_title: str):
        """Track course enrollment."""
        return await self.track_event(
            "Course Enrolled",
            user_id,
            {"course_id": course_id, "course_title": course_title},
        )

    async def track_teaching_view(
        self, user_id: str, teaching_id: str, teaching_title: str, content_type: str
    ):
        """Track teaching view."""
        return await self.track_event(
            "Teaching Viewed",
            user_id,
            {
                "teaching_id": teaching_id,
                "teaching_title": teaching_title,
                "content_type": content_type,
            },
        )

    async def track_retreat_registration(
        self, user_id: str, retreat_id: str, retreat_title: str, retreat_type: str
    ):
        """Track retreat registration."""
        return await self.track_event(
            "Retreat Registered",
            user_id,
            {
                "retreat_id": retreat_id,
                "retreat_title": retreat_title,
                "retreat_type": retreat_type,
            },
        )


# Singleton instance
mixpanel_service = MixpanelService()
