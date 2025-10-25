"""SendGrid Email Service."""

from typing import Dict, List, Optional, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Personalization
import re

from ..core.config import settings


class SendGridService:
    """Service for sending emails via SendGrid."""

    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.client = SendGridAPIClient(self.api_key) if self.api_key else None

    def _replace_template_variables(
        self, html_content: str, variables: Dict[str, Any]
    ) -> str:
        """Replace template variables like {{name}} with actual values."""
        for key, value in variables.items():
            # Replace {{variable}} and {{ variable }}
            html_content = re.sub(
                r"{{\s*" + key + r"\s*}}",
                str(value),
                html_content,
            )
        return html_content

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send a single email.

        Args:
            to_email: Recipient email
            subject: Email subject
            html_content: HTML content (can contain {{variables}})
            to_name: Recipient name
            from_email: Sender email (optional, uses default)
            from_name: Sender name (optional, uses default)
            variables: Variables to replace in template

        Returns:
            True if successful
        """
        if not self.client:
            print("SendGrid API key not configured")
            return False

        try:
            # Replace template variables
            if variables:
                html_content = self._replace_template_variables(html_content, variables)

            message = Mail(
                from_email=Email(from_email or self.from_email, from_name or self.from_name),
                to_emails=To(to_email, to_name),
                subject=subject,
                html_content=Content("text/html", html_content),
            )

            response = self.client.send(message)
            return response.status_code in [200, 201, 202]

        except Exception as e:
            print(f"SendGrid send error: {e}")
            return False

    async def send_bulk_email(
        self,
        recipients: List[Dict[str, str]],
        subject: str,
        html_content: str,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ) -> bool:
        """
        Send bulk emails with personalization.

        Args:
            recipients: List of dicts with 'email', 'name', and optional 'variables'
            subject: Email subject
            html_content: HTML template
            from_email: Sender email
            from_name: Sender name

        Returns:
            True if successful
        """
        if not self.client:
            print("SendGrid API key not configured")
            return False

        try:
            message = Mail(
                from_email=Email(from_email or self.from_email, from_name or self.from_name)
            )
            message.subject = subject

            # Add personalizations for each recipient
            for recipient in recipients:
                personalization = Personalization()
                personalization.add_to(
                    To(recipient["email"], recipient.get("name"))
                )

                # Replace variables for this recipient
                variables = recipient.get("variables", {})
                personalized_content = self._replace_template_variables(
                    html_content, variables
                ) if variables else html_content

                personalization.subject = subject
                message.add_personalization(personalization)

            message.add_content(Content("text/html", html_content))

            response = self.client.send(message)
            return response.status_code in [200, 201, 202]

        except Exception as e:
            print(f"SendGrid bulk send error: {e}")
            return False

    # Predefined email templates
    async def send_welcome_email(self, to_email: str, name: str, membership_tier: str):
        """Send welcome email to new user."""
        subject = "Welcome to Sat Yoga!"
        html_content = f"""
        <html>
            <body>
                <h1>Welcome to Sat Yoga, {name}!</h1>
                <p>Thank you for joining our community.</p>
                <p>Your membership tier: <strong>{membership_tier}</strong></p>
                <p>Start exploring our teachings, courses, and retreats.</p>
                <p><a href="{settings.FRONTEND_URL}/dashboard">Go to Dashboard</a></p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, to_name=name)

    async def send_payment_confirmation(
        self, to_email: str, name: str, amount: float, item_name: str
    ):
        """Send payment confirmation email."""
        subject = "Payment Confirmation - Sat Yoga"
        html_content = f"""
        <html>
            <body>
                <h1>Payment Confirmed</h1>
                <p>Dear {name},</p>
                <p>Your payment of <strong>${amount:.2f}</strong> for <strong>{item_name}</strong> has been confirmed.</p>
                <p>Thank you for your support!</p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, to_name=name)

    async def send_course_enrollment_email(
        self, to_email: str, name: str, course_title: str
    ):
        """Send course enrollment confirmation."""
        subject = f"Enrolled in {course_title}"
        html_content = f"""
        <html>
            <body>
                <h1>Course Enrollment Confirmed</h1>
                <p>Dear {name},</p>
                <p>You are now enrolled in <strong>{course_title}</strong>.</p>
                <p><a href="{settings.FRONTEND_URL}/dashboard/user/courses">View Your Courses</a></p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, to_name=name)


# Singleton instance
sendgrid_service = SendGridService()
