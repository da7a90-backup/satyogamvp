#!/usr/bin/env python3
"""
Seed simple static content:
- FAQ categories and questions
- Contact info and form fields
- Membership pricing
- Donation projects
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import (
    FAQCategory, FAQ, ContactInfo, FormField,
    MembershipPricing, MembershipFeature, DonationProject
)


def seed_faqs(db: Session):
    """Seed FAQ data"""
    print("\n📋 Seeding FAQs...")

    # Check if already seeded
    existing = db.query(FAQCategory).count()
    if existing > 0:
        print(f"⏭  FAQs already seeded ({existing} categories)")
        return

    # Create categories
    categories = [
        {"category_id": "all", "label": "View all", "order_index": 1},
        {"category_id": "general", "label": "General questions", "order_index": 2},
        {"category_id": "kitchen", "label": "Kitchen", "order_index": 3},
        {"category_id": "overnight", "label": "Overnight guests", "order_index": 4},
        {"category_id": "transportation", "label": "Transportation", "order_index": 5}
    ]

    for cat in categories:
        db.add(FAQCategory(**cat))

    # Sample FAQ questions
    faqs_data = [
        {
            "category_id": "general",
            "page": "faq",
            "question": "What is Sat Yoga?",
            "answer": "Sat Yoga is a spiritual institute offering ancient wisdom and consciousness technologies for personal transformation and enlightenment. We provide teachings, retreats, and a supportive community for spiritual seekers.",
            "order_index": 1
        },
        {
            "category_id": "general",
            "question": "Where is the ashram located?",
            "answer": "The Sat Yoga ashram is located in the mountains of southern Costa Rica, about 45 minutes from San Isidro de El General. The ashram sits on 600 acres of pristine rainforest.",
            "order_index": 2
        },
        {
            "category_id": "general",
            "question": "Do I need to be a member to attend a retreat?",
            "answer": "No, retreats are open to all sincere seekers. However, we recommend familiarizing yourself with Shunyamurti's teachings before attending an onsite retreat.",
            "order_index": 3
        },
        {
            "category_id": "transportation",
            "question": "How do I get to the ashram?",
            "answer": "Visitors typically fly into San Jose (SJO) airport, take a domestic flight or bus to San Isidro de El General, and then arrange transportation to the ashram. We can provide detailed directions upon registration.",
            "order_index": 1
        },
        {
            "category_id": "overnight",
            "question": "What should I bring for an onsite retreat?",
            "answer": "Bring comfortable clothing suitable for meditation, a flashlight, insect repellent, sunscreen, toiletries, and any personal medications. We provide bedding and towels.",
            "order_index": 1
        }
    ]

    for faq_data in faqs_data:
        db.add(FAQ(**faq_data))

    db.commit()
    print(f"✓ Seeded {len(categories)} FAQ categories and {len(faqs_data)} questions")


def seed_contact_info(db: Session):
    """Seed contact page info"""
    print("\n📞 Seeding Contact Info...")

    existing = db.query(ContactInfo).count()
    if existing > 0:
        print(f"⏭  Contact info already seeded")
        return

    contact = ContactInfo(
        tagline="Get in Touch",
        heading="We're Here to Help",
        description="Have questions about our teachings, retreats, or membership? We'd love to hear from you.",
        email="info@satyoga.org",
        phone="+506 2771 3099",
        address="Sat Yoga Institute\nChirripó Arriba, Rivas\nPérez Zeledón, Costa Rica",
        privacy_policy_text="By submitting this form, you agree to our privacy policy.",
        privacy_policy_link="/privacy",
        submit_button_text="Send Message",
        success_message="Thank you for your message! We'll get back to you soon.",
        error_message="Sorry, there was an error sending your message. Please try again."
    )
    db.add(contact)

    # Contact form fields
    fields = [
        {"form_type": "contact", "field_id": "name", "label": "Name", "field_type": "text", "required": True, "order_index": 1},
        {"form_type": "contact", "field_id": "email", "label": "Email", "field_type": "email", "required": True, "order_index": 2},
        {"form_type": "contact", "field_id": "phone", "label": "Phone", "field_type": "text", "required": False, "order_index": 3},
        {"form_type": "contact", "field_id": "subject", "label": "Subject", "field_type": "text", "required": True, "order_index": 4},
        {"form_type": "contact", "field_id": "message", "label": "Message", "field_type": "textarea", "required": True, "rows": 5, "order_index": 5}
    ]

    for field in fields:
        db.add(FormField(**field))

    db.commit()
    print(f"✓ Seeded contact info and {len(fields)} form fields")


def seed_membership_pricing(db: Session):
    """Seed membership pricing tiers"""
    print("\n💳 Seeding Membership Pricing...")

    existing = db.query(MembershipPricing).count()
    if existing > 0:
        print(f"⏭  Membership pricing already seeded ({existing} tiers)")
        return

    # GYANI tier
    gyani = MembershipPricing(
        tier_name="Gyani",
        tier_slug="gyani",
        monthly_price=20.00,
        yearly_price=15.00,
        yearly_savings="$60",
        description="Access essential teachings and begin your spiritual journey",
        trial_badge="7-day free trial",
        recommended=False,
        yearly_only=False,
        order_index=1
    )
    db.add(gyani)
    db.flush()

    gyani_features = [
        "Access to 500+ foundational teachings",
        "Weekly live Q&A sessions",
        "Community forum access",
        "Monthly newsletters with insights",
        "Discounts on courses and retreats (10% off)",
        "Access to guided meditations",
        "Mobile app access",
        "Cancel anytime"
    ]

    for idx, feature in enumerate(gyani_features, 1):
        db.add(MembershipFeature(tier_slug="gyani", content=feature, order_index=idx))

    # PRAGYANI tier
    pragyani = MembershipPricing(
        tier_name="Pragyani",
        tier_slug="pragyani",
        monthly_price=100.00,
        yearly_price=83.00,
        yearly_savings="$200",
        description="Full access to advanced teachings and exclusive content",
        recommended=True,
        yearly_only=False,
        order_index=2
    )
    db.add(pragyani)
    db.flush()

    pragyani_features = [
        "Everything in Gyani, plus:",
        "Access to 2000+ advanced teachings",
        "Exclusive video series and courses",
        "Priority access to live events",
        "One-on-one spiritual counseling session (yearly members)",
        "Early access to new content",
        "Discounts on courses and retreats (25% off)",
        "Ad-free experience",
        "Download teachings for offline viewing",
        "Exclusive community events",
        "Monthly group meditation sessions",
        "Access to private teachings archive"
    ]

    for idx, feature in enumerate(pragyani_features, 1):
        db.add(MembershipFeature(tier_slug="pragyani", content=feature, order_index=idx))

    # PRAGYANI PLUS tier
    pragyani_plus = MembershipPricing(
        tier_name="Pragyani Plus",
        tier_slug="pragyani-plus",
        monthly_price=None,
        yearly_price=142.00,
        yearly_savings="$1170",
        description="Ultimate access with onsite retreat included",
        yearly_only=True,
        highlight_box="Best Value - Includes 7-day onsite retreat ($1,200 value)",
        order_index=3
    )
    db.add(pragyani_plus)
    db.flush()

    plus_features = [
        "Everything in Pragyani, plus:",
        "7-day onsite retreat at the ashram (valued at $1,200)",
        "Quarterly spiritual counseling sessions",
        "Lifetime access to all teachings",
        "VIP access to all live events",
        "Personal spiritual development plan",
        "Direct communication with teachers",
        "Invitation to annual advanced practitioners retreat",
        "Contribution to ashram sustainability",
        "Supporting scholarship fund for those in need"
    ]

    for idx, feature in enumerate(plus_features, 1):
        db.add(MembershipFeature(tier_slug="pragyani-plus", content=feature, order_index=idx))

    db.commit()
    print(f"✓ Seeded 3 membership tiers with features")


def seed_donation_projects(db: Session):
    """Seed donation projects"""
    print("\n💝 Seeding Donation Projects...")

    existing = db.query(DonationProject).count()
    if existing > 0:
        print(f"⏭  Donation projects already seeded ({existing} projects)")
        return

    projects = [
        {
            "project_id": "animal-husbandry",
            "project_name": "Animal Husbandry",
            "title": "Support Our Sacred Animal Sanctuary",
            "description": "Help us care for rescued animals at our ashram sanctuary. Your donation provides food, medical care, and loving homes for horses, cows, chickens, and other animals who have found refuge with us. These beautiful beings are part of our spiritual community and teach us about compassion, presence, and unconditional love.",
            "image_url": "/images/donate/animal-husbandry.jpg",
            "order_index": 1
        },
        {
            "project_id": "broadcasting",
            "project_name": "Broadcasting & Media",
            "title": "Share the Teachings Worldwide",
            "description": "Support our mission to make Shunyamurti's teachings accessible to seekers around the world. Your contribution helps fund video production, streaming infrastructure, website development, and content distribution so that these precious teachings can reach those who need them most.",
            "image_url": "/images/donate/broadcasting.jpg",
            "order_index": 2
        },
        {
            "project_id": "off-grid",
            "project_name": "Off-Grid Infrastructure",
            "title": "Sustainable Living Systems",
            "description": "Help us develop renewable energy systems, water purification, organic gardens, and sustainable infrastructure. Your support enables us to create a model of ecological living that demonstrates harmony with nature while maintaining a thriving spiritual community.",
            "image_url": "/images/donate/off-grid.jpg",
            "order_index": 3
        },
        {
            "project_id": "scholarships",
            "project_name": "Retreat Scholarships",
            "title": "Make Retreats Accessible to All",
            "description": "Your donation provides retreat scholarships for sincere seekers who face financial barriers. Everyone deserves access to spiritual awakening regardless of economic circumstances. Help us create opportunities for dedicated practitioners to experience transformation at our ashram.",
            "image_url": "/images/donate/scholarships.jpg",
            "order_index": 4
        },
        {
            "project_id": "publishing",
            "project_name": "Publishing & Archives",
            "title": "Preserve Sacred Wisdom",
            "description": "Support the preservation, transcription, and publication of Shunyamurti's teachings. Your contribution helps us maintain our extensive archives, publish books and transcripts, and ensure these timeless teachings remain available for future generations.",
            "image_url": "/images/donate/publishing.jpg",
            "order_index": 5
        },
        {
            "project_id": "infrastructure",
            "project_name": "Ashram Infrastructure",
            "title": "Build a Sanctuary for Awakening",
            "description": "Help us maintain and improve our ashram facilities including meditation halls, accommodations, communal spaces, and sacred grounds. Your support creates a beautiful, functional space where seekers can focus on their spiritual practice in comfort and safety.",
            "image_url": "/images/donate/infrastructure.jpg",
            "order_index": 6
        }
    ]

    for project in projects:
        db.add(DonationProject(**project))

    db.commit()
    print(f"✓ Seeded {len(projects)} donation projects")


def main():
    """Run all simple content seeding"""
    db = SessionLocal()

    print("=" * 70)
    print("SEEDING SIMPLE STATIC CONTENT")
    print("=" * 70)

    try:
        seed_faqs(db)
        seed_contact_info(db)
        seed_membership_pricing(db)
        seed_donation_projects(db)

        print("\n" + "=" * 70)
        print("✅ ALL SIMPLE CONTENT SEEDED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
