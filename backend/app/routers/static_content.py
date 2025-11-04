"""
Static Content API Routers - FAQs, Contact, Membership, Donations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.static_content import (
    FAQCategory, FAQ, ContactInfo, FormField,
    MembershipPricing, DonationProject
)
from app.services.media_service import MediaService
from typing import Dict, Any, List, Optional

# =============================================================================
# FAQ ROUTER
# =============================================================================

faq_router = APIRouter(prefix="/faqs", tags=["FAQs"])


@faq_router.get("/categories")
async def get_faq_categories(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get all FAQ categories"""

    categories = db.query(FAQCategory).filter(
        FAQCategory.is_active == True
    ).order_by(FAQCategory.order_index).all()

    return [
        {
            "id": cat.category_id,
            "label": cat.label,
            "order": cat.order_index
        }
        for cat in categories
    ]


@faq_router.get("")
async def get_faqs(
    category: Optional[str] = None,
    page: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get FAQs, optionally filtered by category or page"""

    query = db.query(FAQ).filter(FAQ.is_active == True)

    if category and category != "all":
        query = query.filter(FAQ.category_id == category)

    if page:
        query = query.filter(FAQ.page == page)

    faqs = query.order_by(FAQ.order_index).all()

    return [
        {
            "id": faq.id,
            "category": faq.category_id,
            "question": faq.question,
            "answer": faq.answer,
            "page": faq.page
        }
        for faq in faqs
    ]


# =============================================================================
# CONTACT ROUTER
# =============================================================================

contact_router = APIRouter(prefix="/contact", tags=["Contact"])


@contact_router.get("/info")
async def get_contact_info(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get contact page information"""

    contact = db.query(ContactInfo).filter(
        ContactInfo.is_active == True
    ).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")

    media_service = MediaService(db)

    return {
        "tagline": contact.tagline,
        "heading": contact.heading,
        "description": contact.description,
        "email": contact.email,
        "phone": contact.phone,
        "address": contact.address,
        "heroImage": media_service.resolve_url(contact.hero_image) if contact.hero_image else None,
        "mapImage": media_service.resolve_url(contact.map_image) if contact.map_image else None,
        "formFields": contact.form_fields if contact.form_fields else [],
        "privacyPolicyText": contact.privacy_policy_text,
        "privacyPolicyLink": contact.privacy_policy_link,
        "submitButtonText": contact.submit_button_text,
        "successMessage": contact.success_message,
        "errorMessage": contact.error_message
    }


@contact_router.get("/form-fields")
async def get_contact_form_fields(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get contact form field configuration"""

    fields = db.query(FormField).filter(
        FormField.form_type == "contact",
        FormField.is_active == True
    ).order_by(FormField.order_index).all()

    return [
        {
            "id": field.field_id,
            "label": field.label,
            "type": field.field_type,
            "placeholder": field.placeholder,
            "required": field.required,
            "rows": field.rows,
            "options": field.options,
            "gridColumn": field.grid_column
        }
        for field in fields
    ]


# =============================================================================
# MEMBERSHIP PRICING ROUTER
# =============================================================================

membership_router = APIRouter(prefix="/membership", tags=["Membership"])


@membership_router.get("/pricing")
async def get_membership_pricing(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get all membership pricing tiers with features"""

    tiers = db.query(MembershipPricing).filter(
        MembershipPricing.is_active == True
    ).order_by(MembershipPricing.order_index).all()

    result = []
    for tier in tiers:
        tier_data = {
            "name": tier.tier_name,
            "slug": tier.tier_slug,
            "monthlyPrice": float(tier.monthly_price) if tier.monthly_price else None,
            "yearlyPrice": float(tier.yearly_price),
            "yearlySavings": tier.yearly_savings,
            "description": tier.description,
            "trialBadge": tier.trial_badge,
            "recommended": tier.recommended,
            "yearlyOnly": tier.yearly_only,
            "highlightBox": tier.highlight_box,
            "features": [
                {
                    "type": feature.feature_type,
                    "title": feature.title,
                    "content": feature.content
                }
                for feature in tier.features
            ]
        }
        result.append(tier_data)

    return result


@membership_router.get("/pricing/{tier_slug}")
async def get_tier_pricing(
    tier_slug: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get specific membership tier details"""

    tier = db.query(MembershipPricing).filter(
        MembershipPricing.tier_slug == tier_slug,
        MembershipPricing.is_active == True
    ).first()

    if not tier:
        raise HTTPException(status_code=404, detail=f"Tier '{tier_slug}' not found")

    return {
        "name": tier.tier_name,
        "slug": tier.tier_slug,
        "monthlyPrice": float(tier.monthly_price) if tier.monthly_price else None,
        "yearlyPrice": float(tier.yearly_price),
        "yearlySavings": tier.yearly_savings,
        "description": tier.description,
        "trialBadge": tier.trial_badge,
        "recommended": tier.recommended,
        "yearlyOnly": tier.yearly_only,
        "highlightBox": tier.highlight_box,
        "features": [
            {
                "type": feature.feature_type,
                "title": feature.title,
                "content": feature.content
            }
            for feature in tier.features
        ]
    }


# =============================================================================
# DONATIONS ROUTER
# =============================================================================

donations_router = APIRouter(prefix="/donations", tags=["Donations"])


@donations_router.get("/projects")
async def get_donation_projects(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get all donation projects"""

    media_service = MediaService(db)

    projects = db.query(DonationProject).filter(
        DonationProject.is_active == True
    ).order_by(DonationProject.order_index).all()

    return [
        {
            "id": project.project_id,
            "name": project.project_name,
            "title": project.title,
            "description": project.description,
            "image": media_service.resolve_url(project.image_url)
        }
        for project in projects
    ]


@donations_router.get("/projects/{project_id}")
async def get_donation_project(
    project_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get specific donation project details"""

    media_service = MediaService(db)

    project = db.query(DonationProject).filter(
        DonationProject.project_id == project_id,
        DonationProject.is_active == True
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

    return {
        "id": project.project_id,
        "name": project.project_name,
        "title": project.title,
        "description": project.description,
        "image": media_service.resolve_url(project.image_url)
    }


# =============================================================================
# ONLINE RETREATS ROUTER
# =============================================================================

online_retreats_router = APIRouter(prefix="/online-retreats", tags=["Online Retreats"])


@online_retreats_router.get("")
async def get_online_retreats(
    limit: int = 10,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all active online retreats with proper pricing structure"""

    from app.models.static_content import OnlineRetreat

    retreats = db.query(OnlineRetreat).filter(
        OnlineRetreat.is_active == True
    ).order_by(OnlineRetreat.fixed_date.desc()).limit(limit).all()

    media_service = MediaService(db)

    result = []
    for retreat in retreats:
        retreat_data = {
            "slug": retreat.slug,
            "title": retreat.title,
            "subtitle": retreat.subtitle,
            "fixed_date": retreat.fixed_date,
            "location": retreat.location,
            "duration": retreat.duration,
            "booking_tagline": retreat.booking_tagline,

            # Pricing structure (multiple options)
            "base_price": float(retreat.base_price) if retreat.base_price else None,
            "price_options": retreat.price_options,
            "member_discount_percentage": retreat.member_discount_percentage,
            "scholarship_available": retreat.scholarship_available,
            "scholarship_deadline": retreat.scholarship_deadline,
            "application_url": retreat.application_url,

            # Media
            "hero_background": media_service.resolve_url(retreat.hero_background) if retreat.hero_background else None,
            "images": media_service.resolve_list(retreat.images) if retreat.images else [],
            "video_url": media_service.resolve_url(retreat.video_url) if retreat.video_url else None,
            "video_thumbnail": media_service.resolve_url(retreat.video_thumbnail) if retreat.video_thumbnail else None,
            "video_type": retreat.video_type,

            # Content sections
            "intro1_title": retreat.intro1_title,
            "intro1_content": retreat.intro1_content,
            "intro2_title": retreat.intro2_title,
            "intro2_content": retreat.intro2_content,
            "intro3_title": retreat.intro3_title,
            "intro3_content": retreat.intro3_content,

            # Schedule
            "schedule_tagline": retreat.schedule_tagline,
            "schedule_title": retreat.schedule_title,
            "schedule_items": retreat.schedule_items,

            # Agenda (for retreat page)
            "agenda_title": retreat.agenda_title,
            "agenda_items": retreat.agenda_items,
            "included_title": retreat.included_title,
            "included_items": retreat.included_items,

            # Testimonials
            "testimonial_tagline": retreat.testimonial_tagline,
            "testimonial_heading": retreat.testimonial_heading,
            "testimonial_data": retreat.testimonial_data
        }
        result.append(retreat_data)

    return {"retreats": result, "total": len(result)}
