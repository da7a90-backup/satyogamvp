"""Mock implementations for external services."""

from typing import Dict, Any, Optional, List
from unittest.mock import AsyncMock


class MockMixpanelService:
    """Mock Mixpanel service for testing."""

    def __init__(self):
        self.token = "test_token"
        self.events = []

    async def track_event(
        self,
        event_name: str,
        distinct_id: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Mock track event."""
        self.events.append({
            "event_name": event_name,
            "distinct_id": distinct_id,
            "properties": properties or {},
        })
        return True

    async def track_user_registered(
        self,
        user_id: str,
        email: str,
        membership_tier: str,
    ) -> bool:
        """Mock track user registration."""
        return await self.track_event(
            "User Registered",
            user_id,
            {"email": email, "membership_tier": membership_tier}
        )

    async def track_user_login(
        self,
        user_id: str,
        email: str,
    ) -> bool:
        """Mock track user login."""
        return await self.track_event(
            "User Login",
            user_id,
            {"email": email}
        )

    async def track_teaching_view(
        self,
        user_id: str,
        teaching_id: str,
        teaching_title: str,
        content_type: str,
    ) -> bool:
        """Mock track teaching view."""
        return await self.track_event(
            "Teaching Viewed",
            user_id,
            {
                "teaching_id": teaching_id,
                "teaching_title": teaching_title,
                "content_type": content_type,
            }
        )

    async def track_payment_initiated(
        self,
        user_id: str,
        payment_type: str,
        amount: float,
    ) -> bool:
        """Mock track payment initiated."""
        return await self.track_event(
            "Payment Initiated",
            user_id,
            {"payment_type": payment_type, "amount": amount}
        )

    async def track_payment_completed(
        self,
        user_id: str,
        payment_type: str,
        amount: float,
        payment_id: str,
    ) -> bool:
        """Mock track payment completed."""
        return await self.track_event(
            "Payment Completed",
            user_id,
            {
                "payment_type": payment_type,
                "amount": amount,
                "payment_id": payment_id,
            }
        )

    def get_tracked_events(self) -> List[Dict[str, Any]]:
        """Get all tracked events for testing."""
        return self.events

    def clear_events(self):
        """Clear tracked events."""
        self.events = []


class MockGA4Service:
    """Mock Google Analytics 4 service for testing."""

    def __init__(self):
        self.measurement_id = "G-TEST123"
        self.api_secret = "test_secret"
        self.events = []

    async def track_event(
        self,
        client_id: str,
        event_name: str,
        event_params: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Mock track event."""
        self.events.append({
            "client_id": client_id,
            "event_name": event_name,
            "event_params": event_params or {},
        })
        return True

    async def track_page_view(
        self,
        client_id: str,
        page_title: str,
        page_path: str,
    ) -> bool:
        """Mock track page view."""
        return await self.track_event(
            client_id,
            "page_view",
            {"page_title": page_title, "page_path": page_path}
        )

    async def track_purchase(
        self,
        client_id: str,
        transaction_id: str,
        value: float,
        currency: str,
        items: List[Dict[str, Any]],
    ) -> bool:
        """Mock track purchase."""
        return await self.track_event(
            client_id,
            "purchase",
            {
                "transaction_id": transaction_id,
                "value": value,
                "currency": currency,
                "items": items,
            }
        )

    def get_tracked_events(self) -> List[Dict[str, Any]]:
        """Get all tracked events for testing."""
        return self.events

    def clear_events(self):
        """Clear tracked events."""
        self.events = []


class MockSendGridService:
    """Mock SendGrid email service for testing."""

    def __init__(self):
        self.api_key = "test_api_key"
        self.from_email = "test@satyoga.org"
        self.sent_emails = []

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Mock send email."""
        self.sent_emails.append({
            "to_email": to_email,
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content,
        })
        return True

    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
    ) -> bool:
        """Mock send welcome email."""
        return await self.send_email(
            to_email,
            "Welcome to Sat Yoga!",
            f"<h1>Welcome {user_name}!</h1>",
            f"Welcome {user_name}!",
        )

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_link: str,
    ) -> bool:
        """Mock send password reset email."""
        return await self.send_email(
            to_email,
            "Reset Your Password",
            f"<p>Click here to reset: {reset_link}</p>",
            f"Reset your password: {reset_link}",
        )

    async def send_payment_confirmation_email(
        self,
        to_email: str,
        payment_id: str,
        amount: float,
        payment_type: str,
    ) -> bool:
        """Mock send payment confirmation email."""
        return await self.send_email(
            to_email,
            "Payment Confirmation",
            f"<p>Payment of ${amount} confirmed</p>",
            f"Payment of ${amount} confirmed",
        )

    async def send_enrollment_confirmation_email(
        self,
        to_email: str,
        course_title: str,
    ) -> bool:
        """Mock send enrollment confirmation email."""
        return await self.send_email(
            to_email,
            "Course Enrollment Confirmed",
            f"<p>You're enrolled in {course_title}</p>",
            f"You're enrolled in {course_title}",
        )

    def get_sent_emails(self) -> List[Dict[str, Any]]:
        """Get all sent emails for testing."""
        return self.sent_emails

    def clear_sent_emails(self):
        """Clear sent emails."""
        self.sent_emails = []


# Create singleton instances for easy access
mock_mixpanel = MockMixpanelService()
mock_ga4 = MockGA4Service()
mock_sendgrid = MockSendGridService()
