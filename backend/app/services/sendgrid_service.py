"""SendGrid Email Service."""

from typing import Dict, List, Optional, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Personalization
import re
import ssl
import certifi

from ..core.config import settings


class SendGridService:
    """Service for sending emails via SendGrid."""

    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME

        if self.api_key:
            # Create client with proper SSL configuration
            import os
            os.environ['SSL_CERT_FILE'] = certifi.where()
            self.client = SendGridAPIClient(self.api_key)
        else:
            self.client = None

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

    async def send_contact_confirmation(self, to_email: str, name: str):
        """Send contact form submission confirmation."""
        subject = "Thank You for Contacting Sat Yoga Institute"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: 'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background-color: #FAF8F1;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                }}
                .header {{
                    background: linear-gradient(135deg, #7D1A13 0%, #4E2223 100%);
                    padding: 40px 20px;
                    text-align: center;
                }}
                .logo {{
                    width: 120px;
                    height: auto;
                    margin-bottom: 20px;
                }}
                .header-text {{
                    color: #FFFFFF;
                    font-size: 28px;
                    font-weight: 600;
                    margin: 0;
                }}
                .content {{
                    padding: 40px 30px;
                    color: #384250;
                    line-height: 1.6;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #000000;
                    margin-bottom: 20px;
                }}
                .message {{
                    font-size: 16px;
                    margin-bottom: 20px;
                }}
                .highlight {{
                    background-color: #FAF8F1;
                    border-left: 4px solid #9C7E27;
                    padding: 20px;
                    margin: 30px 0;
                }}
                .highlight-text {{
                    font-size: 15px;
                    color: #384250;
                    margin: 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background-color: #7D1A13;
                    color: #FFFFFF;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .footer {{
                    background-color: #F5F5F5;
                    padding: 30px 20px;
                    text-align: center;
                    color: #6B7280;
                    font-size: 14px;
                }}
                .social-links {{
                    margin-top: 20px;
                }}
                .social-links a {{
                    color: #7D1A13;
                    text-decoration: none;
                    margin: 0 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <img src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/satyoga-logo-email/public" alt="Sat Yoga Institute" class="logo" style="width: 300px; height: auto; margin-bottom: 20px; display: block;">
                    <h1 class="header-text">Thank You for Reaching Out</h1>
                </div>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Dear {name},</p>

                    <p class="message">
                        We have received your message and deeply appreciate you taking the time to connect with us.
                    </p>

                    <div class="highlight">
                        <p class="highlight-text">
                            <strong>What happens next?</strong><br><br>
                            Our team will carefully review your inquiry and respond within 24-48 hours.
                            We are committed to providing you with the support and information you need on your spiritual journey.
                        </p>
                    </div>

                    <p class="message">
                        While you wait, we invite you to explore our teachings, retreats, and courses available on our platform.
                    </p>

                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/teachings" class="cta-button">Explore Teachings</a>
                    </div>

                    <p class="message" style="margin-top: 30px;">
                        With gratitude and blessings,<br>
                        <strong>The Sat Yoga Institute Team</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0 0 10px 0;">© 2024 Sat Yoga Institute. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica</p>
                    <div class="social-links">
                        <a href="{settings.FRONTEND_URL}">Visit Website</a> |
                        <a href="{settings.FRONTEND_URL}/about/satyoga">About Us</a> |
                        <a href="{settings.FRONTEND_URL}/contact">Contact</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, to_name=name)

    async def send_newsletter_welcome(self, to_email: str, name: str):
        """Send newsletter subscription welcome email."""
        subject = "Welcome to the Sat Yoga Community!"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: 'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background-color: #FAF8F1;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                }}
                .header {{
                    background: linear-gradient(135deg, #7D1A13 0%, #4E2223 100%);
                    padding: 50px 20px;
                    text-align: center;
                }}
                .header-text {{
                    color: #FFFFFF;
                    font-size: 32px;
                    font-weight: 600;
                    margin: 0 0 10px 0;
                }}
                .header-subtext {{
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    margin: 0;
                }}
                .content {{
                    padding: 40px 30px;
                    color: #384250;
                    line-height: 1.6;
                }}
                .greeting {{
                    font-size: 20px;
                    color: #000000;
                    margin-bottom: 20px;
                }}
                .message {{
                    font-size: 16px;
                    margin-bottom: 20px;
                }}
                .benefits {{
                    background-color: #FAF8F1;
                    border-radius: 12px;
                    padding: 30px;
                    margin: 30px 0;
                }}
                .benefit-item {{
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }}
                .benefit-icon {{
                    width: 24px;
                    height: 24px;
                    background-color: #9C7E27;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    margin-right: 15px;
                    flex-shrink: 0;
                }}
                .benefit-text {{
                    font-size: 15px;
                    color: #384250;
                }}
                .cta-container {{
                    text-align: center;
                    margin: 30px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background-color: #7D1A13;
                    color: #FFFFFF;
                    text-decoration: none;
                    padding: 16px 40px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 10px;
                }}
                .footer {{
                    background-color: #F5F5F5;
                    padding: 30px 20px;
                    text-align: center;
                    color: #6B7280;
                    font-size: 14px;
                }}
                .social-links {{
                    margin-top: 20px;
                }}
                .social-links a {{
                    color: #7D1A13;
                    text-decoration: none;
                    margin: 0 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <img src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/satyoga-logo-email/public" alt="Sat Yoga Institute" style="width: 300px; height: auto; margin-bottom: 20px; display: block;">
                    <h1 class="header-text">Welcome to Our Community!</h1>
                    <p class="header-subtext">Thank you for joining the Sat Yoga journey</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Namaste {name},</p>

                    <p class="message">
                        We're delighted to welcome you to the Sat Yoga community. By subscribing to our newsletter,
                        you've taken an important step on your spiritual journey.
                    </p>

                    <div class="benefits">
                        <h3 style="margin-top: 0; color: #000000;">What to Expect:</h3>

                        <div class="benefit-item">
                            <div class="benefit-icon">✓</div>
                            <div class="benefit-text">
                                <strong>Weekly Teachings</strong> - Profound insights and wisdom from Shunyamurti
                            </div>
                        </div>

                        <div class="benefit-item">
                            <div class="benefit-icon">✓</div>
                            <div class="benefit-text">
                                <strong>Retreat Updates</strong> - Be the first to know about upcoming online and ashram retreats
                            </div>
                        </div>

                        <div class="benefit-item">
                            <div class="benefit-icon">✓</div>
                            <div class="benefit-text">
                                <strong>Exclusive Content</strong> - Access special teachings, articles, and community events
                            </div>
                        </div>

                        <div class="benefit-item">
                            <div class="benefit-icon">✓</div>
                            <div class="benefit-text">
                                <strong>Community Connection</strong> - Join a global community of seekers on the path to Self-realization
                            </div>
                        </div>
                    </div>

                    <p class="message">
                        Don't wait for our next newsletter - start exploring our extensive library of teachings,
                        courses, and transformative content right now.
                    </p>

                    <div class="cta-container">
                        <a href="{settings.FRONTEND_URL}/teachings" class="cta-button">Browse Teachings</a>
                        <a href="{settings.FRONTEND_URL}/retreats/online" class="cta-button">View Retreats</a>
                    </div>

                    <p class="message" style="margin-top: 30px;">
                        May your journey be filled with light and truth,<br>
                        <strong>The Sat Yoga Institute Team</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0 0 10px 0;">© 2024 Sat Yoga Institute. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica</p>
                    <div class="social-links">
                        <a href="{settings.FRONTEND_URL}">Visit Website</a> |
                        <a href="{settings.FRONTEND_URL}/about/satyoga">About Us</a> |
                        <a href="{settings.FRONTEND_URL}/contact">Contact</a>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px;">
                        You're receiving this email because you subscribed to our newsletter.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, to_name=name)


# Singleton instance
sendgrid_service = SendGridService()
