"""Email marketing router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import re
import uuid

from ..core.database import get_db
from ..core.deps import get_current_user, require_admin
from ..models.user import User
from ..models.email import (
    NewsletterSubscriber,
    SubscriberStatus,
    EmailTemplate,
    EmailCampaign,
    EmailAutomation,
    CampaignStatus,
    EmailSent,
)
from ..schemas.email import (
    NewsletterSubscribeRequest,
    NewsletterSubscriberResponse,
    EmailTemplateCreate,
    EmailTemplateUpdate,
    EmailTemplateResponse,
    EmailCampaignCreate,
    EmailCampaignUpdate,
    EmailCampaignResponse,
    EmailAutomationCreate,
    EmailAutomationUpdate,
    EmailAutomationResponse,
    SendEmailRequest,
)
from ..services import sendgrid_service

router = APIRouter()


# ============================================================================
# NEWSLETTER ENDPOINTS
# ============================================================================

@router.post("/newsletter/subscribe")
async def subscribe_newsletter(
    data: NewsletterSubscribeRequest,
    db: Session = Depends(get_db),
):
    """Subscribe to newsletter."""
    subscriber = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == data.email)
        .first()
    )

    if subscriber:
        if subscriber.status == SubscriberStatus.UNSUBSCRIBED:
            subscriber.status = SubscriberStatus.ACTIVE
            db.commit()
            # Send welcome email
            await sendgrid_service.send_newsletter_welcome(data.email, data.name or "Friend")
            return {"message": "Resubscribed successfully"}
        return {"message": "Already subscribed"}

    # Create new subscriber
    subscriber = NewsletterSubscriber(
        email=data.email,
        name=data.name,
        status=SubscriberStatus.ACTIVE,
    )
    db.add(subscriber)
    db.commit()

    # Send welcome email
    await sendgrid_service.send_newsletter_welcome(data.email, data.name or "Friend")

    return {"message": "Subscribed successfully"}


@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter."""
    subscriber = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == email)
        .first()
    )

    if not subscriber:
        return {"message": "Email not found"}

    subscriber.status = SubscriberStatus.UNSUBSCRIBED
    from datetime import datetime
    subscriber.unsubscribed_at = datetime.utcnow()
    db.commit()

    return {"message": "Unsubscribed successfully"}


@router.get("/subscribers", response_model=List[NewsletterSubscriberResponse])
async def get_subscribers(
    status: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all newsletter subscribers (admin only)."""
    query = db.query(NewsletterSubscriber)

    if status:
        query = query.filter(NewsletterSubscriber.status == status)

    subscribers = query.order_by(NewsletterSubscriber.subscribed_at.desc()).offset(offset).limit(limit).all()

    return subscribers


# ============================================================================
# EMAIL TEMPLATE ENDPOINTS
# ============================================================================

def extract_variables(html_content: str) -> List[str]:
    """Extract template variables like {{name}}, {{email}} from HTML."""
    pattern = r"\{\{\s*(\w+)\s*\}\}"
    variables = re.findall(pattern, html_content)
    return list(set(variables))  # Remove duplicates


@router.post("/templates", response_model=EmailTemplateResponse)
async def create_template(
    template_data: EmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new email template (admin only)."""
    # Auto-extract variables if not provided
    if not template_data.variables:
        template_data.variables = extract_variables(template_data.html_content)

    template = EmailTemplate(
        name=template_data.name,
        subject=template_data.subject,
        html_content=template_data.html_content,
        beefree_template_id=template_data.beefree_template_id,
        beefree_json=template_data.beefree_json,
        variables=template_data.variables,
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    return template


@router.get("/templates", response_model=List[EmailTemplateResponse])
async def get_templates(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all email templates (admin only)."""
    templates = (
        db.query(EmailTemplate)
        .order_by(EmailTemplate.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return templates


@router.get("/templates/{template_id}", response_model=EmailTemplateResponse)
async def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific email template (admin only)."""
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == uuid.UUID(template_id))
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template


@router.put("/templates/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: str,
    template_data: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update an email template (admin only)."""
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == uuid.UUID(template_id))
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Update fields
    for field, value in template_data.dict(exclude_unset=True).items():
        setattr(template, field, value)

    # Re-extract variables if HTML was updated
    if template_data.html_content:
        template.variables = extract_variables(template_data.html_content)

    from datetime import datetime
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)

    return template


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete an email template (admin only)."""
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == uuid.UUID(template_id))
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()

    return {"message": "Template deleted successfully"}


@router.post("/templates/test")
async def send_test_email(
    email_data: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Send a test email using a template (admin only)."""
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == email_data.template_id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Send test email
    success = await sendgrid_service.send_email(
        to_email=email_data.to_email,
        subject=template.subject,
        html_content=template.html_content,
        to_name=email_data.to_name,
        variables=email_data.variables,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send test email")

    return {"message": "Test email sent successfully"}


# ============================================================================
# EMAIL CAMPAIGN ENDPOINTS
# ============================================================================

@router.post("/campaigns", response_model=EmailCampaignResponse)
async def create_campaign(
    campaign_data: EmailCampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new email campaign (admin only)."""
    # Verify template exists
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == campaign_data.template_id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    campaign = EmailCampaign(
        name=campaign_data.name,
        template_id=campaign_data.template_id,
        subject=campaign_data.subject,
        from_name=campaign_data.from_name,
        from_email=campaign_data.from_email,
        segment_filter=campaign_data.segment_filter,
        scheduled_at=campaign_data.scheduled_at,
        status=CampaignStatus.SCHEDULED if campaign_data.scheduled_at else CampaignStatus.DRAFT,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


@router.get("/campaigns", response_model=List[EmailCampaignResponse])
async def get_campaigns(
    status: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all email campaigns (admin only)."""
    query = db.query(EmailCampaign)

    if status:
        query = query.filter(EmailCampaign.status == status)

    campaigns = (
        query.order_by(EmailCampaign.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return campaigns


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific email campaign (admin only)."""
    campaign = (
        db.query(EmailCampaign)
        .filter(EmailCampaign.id == uuid.UUID(campaign_id))
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign


@router.put("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def update_campaign(
    campaign_id: str,
    campaign_data: EmailCampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update an email campaign (admin only)."""
    campaign = (
        db.query(EmailCampaign)
        .filter(EmailCampaign.id == uuid.UUID(campaign_id))
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Don't allow editing sent campaigns
    if campaign.status == CampaignStatus.SENT:
        raise HTTPException(status_code=400, detail="Cannot edit sent campaign")

    # Update fields
    for field, value in campaign_data.dict(exclude_unset=True).items():
        setattr(campaign, field, value)

    from datetime import datetime
    campaign.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(campaign)

    return campaign


@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Send a campaign immediately (admin only)."""
    campaign = (
        db.query(EmailCampaign)
        .filter(EmailCampaign.id == uuid.UUID(campaign_id))
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status == CampaignStatus.SENT:
        raise HTTPException(status_code=400, detail="Campaign already sent")

    # Get template
    template = db.query(EmailTemplate).filter(EmailTemplate.id == campaign.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Get subscribers based on segment filter
    query = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.status == SubscriberStatus.ACTIVE
    )

    # Apply segment filters if any
    # TODO: Implement actual segment filtering logic based on campaign.segment_filter

    subscribers = query.all()

    if not subscribers:
        raise HTTPException(status_code=400, detail="No active subscribers found")

    # Send emails (in bulk)
    recipients = [
        {
            "email": sub.email,
            "name": sub.name,
            "variables": {
                "name": sub.name or "Friend",
                "email": sub.email,
            },
        }
        for sub in subscribers
    ]

    success = await sendgrid_service.send_bulk_email(
        recipients=recipients,
        subject=campaign.subject,
        html_content=template.html_content,
        from_email=campaign.from_email,
        from_name=campaign.from_name,
    )

    if not success:
        campaign.status = CampaignStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to send campaign")

    # Update campaign status
    from datetime import datetime
    campaign.status = CampaignStatus.SENT
    campaign.sent_at = datetime.utcnow()
    campaign.total_sent = len(subscribers)
    db.commit()

    return {
        "message": f"Campaign sent to {len(subscribers)} subscribers",
        "total_sent": len(subscribers),
    }


# ============================================================================
# EMAIL AUTOMATION ENDPOINTS
# ============================================================================

@router.post("/automations", response_model=EmailAutomationResponse)
async def create_automation(
    automation_data: EmailAutomationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new email automation (admin only)."""
    # Verify template exists
    template = (
        db.query(EmailTemplate)
        .filter(EmailTemplate.id == automation_data.template_id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    automation = EmailAutomation(
        name=automation_data.name,
        trigger_type=automation_data.trigger_type,
        trigger_config=automation_data.trigger_config,
        template_id=automation_data.template_id,
        delay_minutes=automation_data.delay_minutes,
        is_active=automation_data.is_active,
    )
    db.add(automation)
    db.commit()
    db.refresh(automation)

    return automation


@router.get("/automations", response_model=List[EmailAutomationResponse])
async def get_automations(
    is_active: bool = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all email automations (admin only)."""
    query = db.query(EmailAutomation)

    if is_active is not None:
        query = query.filter(EmailAutomation.is_active == is_active)

    automations = (
        query.order_by(EmailAutomation.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return automations


@router.get("/automations/{automation_id}", response_model=EmailAutomationResponse)
async def get_automation(
    automation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific email automation (admin only)."""
    automation = (
        db.query(EmailAutomation)
        .filter(EmailAutomation.id == uuid.UUID(automation_id))
        .first()
    )

    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    return automation


@router.put("/automations/{automation_id}", response_model=EmailAutomationResponse)
async def update_automation(
    automation_id: str,
    automation_data: EmailAutomationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update an email automation (admin only)."""
    automation = (
        db.query(EmailAutomation)
        .filter(EmailAutomation.id == uuid.UUID(automation_id))
        .first()
    )

    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    # Update fields
    for field, value in automation_data.dict(exclude_unset=True).items():
        setattr(automation, field, value)

    from datetime import datetime
    automation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(automation)

    return automation


@router.delete("/automations/{automation_id}")
async def delete_automation(
    automation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete an email automation (admin only)."""
    automation = (
        db.query(EmailAutomation)
        .filter(EmailAutomation.id == uuid.UUID(automation_id))
        .first()
    )

    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    db.delete(automation)
    db.commit()

    return {"message": "Automation deleted successfully"}


# ============================================================================
# TEMPLATE PREVIEW HELPERS
# ============================================================================

@router.get("/sample-user")
async def get_sample_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a random subscriber for template preview (admin only)."""
    from sqlalchemy import func
    from app.models.email import SubscriberStatus

    # Get a random subscriber from the database
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.status == SubscriberStatus.ACTIVE
    ).order_by(func.random()).first()

    if not subscriber:
        # Return a default sample user if no subscribers in database
        return {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "membership_tier": "FREE",
        }

    # If subscriber has a linked user, get their membership tier
    membership_tier = "FREE"
    if subscriber.user_id:
        user = db.query(User).filter(User.id == subscriber.user_id).first()
        if user:
            membership_tier = user.membership_tier or "FREE"

    return {
        "name": subscriber.name or "User",
        "email": subscriber.email,
        "membership_tier": membership_tier,
    }
