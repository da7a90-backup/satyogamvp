"""Google Analytics 4 Service."""

from typing import Dict, Any, Optional
import httpx
from datetime import datetime

from ..core.config import settings


class GA4Service:
    """Service for tracking events with Google Analytics 4."""

    def __init__(self):
        self.measurement_id = settings.GA4_MEASUREMENT_ID
        self.api_secret = settings.GA4_API_SECRET
        self.api_url = "https://www.google-analytics.com/mp/collect"

    async def track_event(
        self,
        client_id: str,
        event_name: str,
        event_params: Optional[Dict[str, Any]] = None,
        user_properties: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Track an event in Google Analytics 4.

        Args:
            client_id: Unique identifier for the user
            event_name: Name of the event
            event_params: Event parameters
            user_properties: User properties

        Returns:
            True if successful
        """
        if not self.measurement_id or not self.api_secret:
            return False

        try:
            payload = {
                "client_id": client_id,
                "events": [
                    {
                        "name": event_name,
                        "params": event_params or {},
                    }
                ],
            }

            if user_properties:
                payload["user_properties"] = user_properties

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}?measurement_id={self.measurement_id}&api_secret={self.api_secret}",
                    json=payload,
                    timeout=10.0,
                )
                return response.status_code in [200, 201, 202, 204]

        except Exception as e:
            print(f"GA4 track error: {e}")
            return False

    # Predefined event tracking methods
    async def track_page_view(self, client_id: str, page_location: str, page_title: str = None):
        """Track page view."""
        return await self.track_event(
            client_id,
            "page_view",
            {
                "page_location": page_location,
                "page_title": page_title,
            },
        )

    async def track_signup(self, client_id: str, method: str = "email"):
        """Track user signup."""
        return await self.track_event(
            client_id,
            "sign_up",
            {"method": method},
        )

    async def track_login(self, client_id: str, method: str = "email"):
        """Track user login."""
        return await self.track_event(
            client_id,
            "login",
            {"method": method},
        )

    async def track_purchase(
        self,
        client_id: str,
        transaction_id: str,
        value: float,
        currency: str,
        items: list,
    ):
        """Track purchase/payment."""
        return await self.track_event(
            client_id,
            "purchase",
            {
                "transaction_id": transaction_id,
                "value": value,
                "currency": currency,
                "items": items,
            },
        )

    async def track_donation(self, client_id: str, value: float, currency: str = "USD"):
        """Track donation."""
        return await self.track_event(
            client_id,
            "donation",
            {
                "value": value,
                "currency": currency,
            },
        )

    async def track_subscription(
        self, client_id: str, tier: str, value: float, currency: str = "USD"
    ):
        """Track subscription."""
        return await self.track_event(
            client_id,
            "subscription",
            {
                "tier": tier,
                "value": value,
                "currency": currency,
            },
        )


# Singleton instance
ga4_service = GA4Service()
