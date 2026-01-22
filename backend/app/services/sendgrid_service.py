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

    async def send_verification_email(self, to_email: str, name: str, verification_token: str):
        """Send email verification link to new user."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        subject = "Verify Your Email - Sat Yoga Institute"
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
                .cta-button:hover {{
                    background-color: #5D140F;
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
                .expiry-notice {{
                    font-size: 14px;
                    color: #6B7280;
                    font-style: italic;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <img src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/satyoga-logo-email/public" alt="Sat Yoga Institute" class="logo" style="width: 300px; height: auto; margin-bottom: 20px; display: block;">
                    <h1 class="header-text">Verify Your Email Address</h1>
                </div>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Dear {name},</p>

                    <p class="message">
                        Welcome to Sat Yoga Institute! We're excited to have you join our community of spiritual seekers.
                    </p>

                    <p class="message">
                        To complete your registration and access all our teachings, courses, and retreats, please verify your email address by clicking the button below:
                    </p>

                    <div style="text-align: center;">
                        <a href="{verification_url}" class="cta-button">Verify Email Address</a>
                    </div>

                    <div class="highlight">
                        <p class="highlight-text">
                            <strong>Why verify your email?</strong><br><br>
                            Email verification ensures the security of your account and allows us to send you important updates about your courses, retreats, and spiritual teachings.
                        </p>
                    </div>

                    <p class="message">
                        If the button above doesn't work, you can copy and paste this link into your browser:
                    </p>
                    <p class="message" style="word-break: break-all; color: #7D1A13;">
                        {verification_url}
                    </p>

                    <p class="expiry-notice">
                        This verification link will expire in 7 days. If you didn't create an account with Sat Yoga Institute, please ignore this email.
                    </p>

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

    async def send_application_payment_email(
        self,
        to_email: str,
        name: str,
        retreat_title: str,
        payment_amount: float,
        payment_url: str
    ):
        """
        Send email notification when retreat application is approved and payment is required.

        Args:
            to_email: Recipient email
            name: Applicant name
            retreat_title: Title of the retreat
            payment_amount: Amount to be paid (in USD)
            payment_url: URL where user can complete payment
        """
        subject = f"Your {retreat_title} Application Has Been Approved!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #FAF8F1;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 40px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #7D1A13;
                }}
                .header h1 {{
                    color: #7D1A13;
                    margin: 0;
                    font-size: 28px;
                    font-family: Optima, serif;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .content p {{
                    margin-bottom: 15px;
                    font-size: 16px;
                }}
                .highlight {{
                    background-color: #FFF9E6;
                    border-left: 4px solid #7D1A13;
                    padding: 15px 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .payment-details {{
                    background-color: #F5F5F5;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
                .payment-details h3 {{
                    margin-top: 0;
                    color: #7D1A13;
                    font-size: 18px;
                }}
                .payment-details p {{
                    margin: 10px 0;
                }}
                .amount {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #7D1A13;
                }}
                .button {{
                    display: inline-block;
                    padding: 14px 32px;
                    background-color: #7D1A13;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    text-align: center;
                }}
                .button:hover {{
                    background-color: #5A1310;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: #666;
                }}
                .social-links {{
                    margin-top: 15px;
                }}
                .social-links a {{
                    color: #7D1A13;
                    text-decoration: none;
                    margin: 0 10px;
                }}
                .note {{
                    font-size: 14px;
                    color: #666;
                    font-style: italic;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>Application Approved!</h1>
                </div>

                <!-- Content -->
                <div class="content">
                    <p>Dear {name},</p>

                    <div class="highlight">
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">
                            Congratulations! Your application for <strong>{retreat_title}</strong> has been approved.
                        </p>
                    </div>

                    <p>
                        We are delighted to welcome you to this transformative retreat experience.
                        To secure your spot, please complete your payment at your earliest convenience.
                    </p>

                    <div class="payment-details">
                        <h3>Payment Information</h3>
                        <p><strong>Retreat:</strong> {retreat_title}</p>
                        <p><strong>Amount Due:</strong> <span class="amount">${payment_amount:.2f} USD</span></p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            (Tax is included in the total amount)
                        </p>
                    </div>

                    <div style="text-align: center;">
                        <a href="{payment_url}" class="button">Complete Payment Now</a>
                    </div>

                    <p class="note">
                        Please note: Your spot is reserved for 7 days. If payment is not received within this time,
                        your application may be offered to the next candidate on the waitlist.
                    </p>

                    <p>
                        If you have any questions about the payment process or the retreat, please don't hesitate
                        to reach out to us at <a href="mailto:info@satyoga.org">info@satyoga.org</a>.
                    </p>

                    <p>
                        We look forward to seeing you on the path!
                    </p>

                    <p style="margin-top: 30px;">
                        With blessings,<br>
                        <strong>The Sat Yoga Team</strong>
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

    async def send_welcome_application_email(
        self,
        to_email: str,
        name: str,
        password_setup_url: str
    ):
        """
        Send welcome email to users who submitted an application anonymously.
        Prompts them to set up their password to access their account.

        Args:
            to_email: Recipient email
            name: User name
            password_setup_url: URL where user can set up their password
        """
        subject = "Welcome to Sat Yoga - Set Up Your Account"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #FAF8F1;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 40px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #7D1A13;
                }}
                .header h1 {{
                    color: #7D1A13;
                    margin: 0;
                    font-size: 28px;
                    font-family: Optima, serif;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .content p {{
                    margin-bottom: 15px;
                    font-size: 16px;
                }}
                .highlight {{
                    background-color: #FFF9E6;
                    border-left: 4px solid #7D1A13;
                    padding: 15px 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .button {{
                    display: inline-block;
                    padding: 14px 32px;
                    background-color: #7D1A13;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    text-align: center;
                }}
                .button:hover {{
                    background-color: #5A1310;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: #666;
                }}
                .social-links {{
                    margin-top: 15px;
                }}
                .social-links a {{
                    color: #7D1A13;
                    text-decoration: none;
                    margin: 0 10px;
                }}
                .info-box {{
                    background-color: #F5F5F5;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>Welcome to Sat Yoga!</h1>
                </div>

                <!-- Content -->
                <div class="content">
                    <p>Dear {name},</p>

                    <p>
                        Thank you for submitting your application! We've received it and will review it shortly.
                    </p>

                    <div class="highlight">
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">
                            We've created an account for you to track your application status.
                        </p>
                    </div>

                    <p>
                        To access your account and view your application status, you'll need to set up a password.
                        You can also use this account to explore our teachings, enroll in courses, and register for retreats.
                    </p>

                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #7D1A13;">Your Account Details</h3>
                        <p><strong>Email:</strong> {to_email}</p>
                        <p style="margin-bottom: 0;"><strong>Status:</strong> Password setup required</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="{password_setup_url}" class="button">Set Up Your Password</a>
                    </div>

                    <p>
                        Once you've set up your password, you can log in at any time to:
                    </p>
                    <ul>
                        <li>Check the status of your application</li>
                        <li>Complete payment if your application is approved</li>
                        <li>Access your personal dashboard</li>
                        <li>Explore our teachings and courses</li>
                    </ul>

                    <p>
                        If you have any questions, please don't hesitate to reach out to us at
                        <a href="mailto:info@satyoga.org">info@satyoga.org</a>.
                    </p>

                    <p style="margin-top: 30px;">
                        With blessings,<br>
                        <strong>The Sat Yoga Team</strong>
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

    async def send_welcome_with_credentials(
        self,
        to_email: str,
        name: str,
        password: str,
        form_title: str
    ):
        """
        Send welcome email with login credentials to users who submitted an application
        and had an account auto-created for them.

        Args:
            to_email: Recipient email
            name: User name
            password: Generated password for the account
            form_title: Title of the form they submitted
        """
        subject = "Welcome to Sat Yoga - Your Account Has Been Created"
        login_url = f"{settings.FRONTEND_URL}/login"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #FAF8F1;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 40px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #7D1A13;
                }}
                .header h1 {{
                    color: #7D1A13;
                    margin: 0;
                    font-size: 28px;
                    font-family: Optima, serif;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .content p {{
                    margin-bottom: 15px;
                    font-size: 16px;
                }}
                .highlight {{
                    background-color: #FFF9E6;
                    border-left: 4px solid #7D1A13;
                    padding: 15px 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .credentials-box {{
                    background-color: #F5F5F5;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                    border: 1px solid #E0E0E0;
                }}
                .credentials-box h3 {{
                    margin-top: 0;
                    color: #7D1A13;
                    font-size: 18px;
                }}
                .credential-item {{
                    margin: 15px 0;
                    padding: 10px;
                    background-color: #FFFFFF;
                    border-radius: 4px;
                }}
                .credential-label {{
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 5px;
                }}
                .credential-value {{
                    font-size: 16px;
                    font-weight: 600;
                    color: #000;
                    font-family: 'Courier New', monospace;
                }}
                .button {{
                    display: inline-block;
                    padding: 14px 32px;
                    background-color: #7D1A13;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    text-align: center;
                }}
                .button:hover {{
                    background-color: #5A1310;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: #666;
                }}
                .social-links {{
                    margin-top: 15px;
                }}
                .social-links a {{
                    color: #7D1A13;
                    text-decoration: none;
                    margin: 0 10px;
                }}
                .security-note {{
                    background-color: #FFF3CD;
                    border-left: 4px solid #FFC107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>Welcome to Sat Yoga!</h1>
                </div>

                <!-- Content -->
                <div class="content">
                    <p>Dear {name},</p>

                    <p>
                        Thank you for submitting your <strong>{form_title}</strong>! We've received it and will review it shortly.
                    </p>

                    <div class="highlight">
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">
                            We've created an account for you to track your application status and access our platform.
                        </p>
                    </div>

                    <p>
                        You can now log in to your account to view your application status, explore our teachings,
                        enroll in courses, and register for retreats.
                    </p>

                    <div class="credentials-box">
                        <h3>Your Login Credentials</h3>

                        <div class="credential-item">
                            <div class="credential-label">Email Address:</div>
                            <div class="credential-value">{to_email}</div>
                        </div>

                        <div class="credential-item">
                            <div class="credential-label">Temporary Password:</div>
                            <div class="credential-value">{password}</div>
                        </div>
                    </div>

                    <div class="security-note">
                        <strong>Security Reminder:</strong> For your security, we recommend changing this password
                        after your first login. You can do this in your account settings.
                    </div>

                    <div style="text-align: center;">
                        <a href="{login_url}" class="button">Log In to Your Account</a>
                    </div>

                    <p>
                        Once logged in, you can:
                    </p>
                    <ul>
                        <li>Check the status of your application</li>
                        <li>Complete payment if your application is approved</li>
                        <li>Access your personal dashboard</li>
                        <li>Explore our extensive library of teachings</li>
                        <li>Enroll in courses and retreats</li>
                    </ul>

                    <p>
                        If you have any questions or need assistance, please don't hesitate to reach out to us at
                        <a href="mailto:info@satyoga.org">info@satyoga.org</a>.
                    </p>

                    <p style="margin-top: 30px;">
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


# Singleton instance
sendgrid_service = SendGridService()
