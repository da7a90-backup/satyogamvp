#!/usr/bin/env python3
"""
Seed onsite retreats (Shakti, Darshan, Sevadhari) with form slugs and product component data.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat, RetreatType
from datetime import datetime

db = SessionLocal()

try:
    print("🌱 Seeding onsite retreats with form slugs and product data...")

    # ============================================================================
    # SHAKTI SATURATION IMMERSION RETREAT
    # ============================================================================
    shakti = db.query(Retreat).filter(Retreat.slug == "shakti").first()

    if not shakti:
        print("Creating new Shakti retreat record...")
        shakti = Retreat(
            slug="shakti",
            title="Shakti Saturation Immersion",
            subtitle="A one-month transformative journey at the Sat Yoga Ashram",
            description="The Shakti Saturation Immersion is a life-changing rite of passage. Over four weeks, you can restore and redirect your existence, guided by profound teachings and the support of an ascending tribal community.",
            type=RetreatType.ONSITE_SHAKTI,
            price_onsite=3950.00,
            location="Sat Yoga Ashram, Costa Rica",
            is_published=True,
            hero_background="/ssi.jpg"
        )
        db.add(shakti)
        db.flush()
        print(f"✅ Created Shakti retreat (ID: {shakti.id})")
    else:
        print(f"Found existing Shakti retreat (ID: {shakti.id})")

    # Update with application form slug and product component data
    shakti.application_form_slug = "shakti-retreat-application"
    shakti.product_component_data = {
        "retreatType": "onsite",
        "tagline": "PROGRAM CONTRIBUTION",
        "title": "Shakti Saturation Immersion",
        "basePrice": 3950,
        "description": "The Shakti Saturation Immersion is a life-changing rite of passage. Over four weeks, you can restore and redirect your existence, guided by profound teachings and the support of an ascending tribal community.",
        "accommodation": "Accommodation: Stay in a charming cabin with a balcony and private bath.",
        "meals": "Meals: Delectable vegetarian cuisine, with vegan and gluten-free options.",
        "dateLabel": "Select a date",
        "dateOptions": ["Dec. 17th - Jan. 13th, 2025"],
        "memberLabel": "Are you a member?",
        "memberOptions": ["Select an option"],
        "buttonText": "Begin application",
        "membershipText": "Discover our",
        "membershipLink": "memberships",
        "membershipLinkUrl": "/memberships",
        "membershipNote": "to receive discounts",
        "images": [
            {"src": "/SSI Gallery 1.jpg", "alt": "Teaching session"},
            {"src": "/SSI Gallery 2.jpg", "alt": "Shunyamurti with student"},
            {"src": "/SSI Gallery 3.jpg", "alt": "Community gathering"},
            {"src": "/SSI Gallery 4.jpg", "alt": "Ashram activities"}
        ]
    }
    print("✅ Updated Shakti with form slug and product data")

    # ============================================================================
    # DARSHAN RETREAT
    # ============================================================================
    darshan = db.query(Retreat).filter(Retreat.slug == "darshan").first()

    if not darshan:
        print("Creating new Darshan retreat record...")
        darshan = Retreat(
            slug="darshan",
            title="Private Darshan Retreat",
            subtitle="A 7-day personal encounter with Shunyamurti",
            description="The Darshan Retreat with Shunyamurti is a sacred seven-day retreat designed to elevate your spiritual journey through direct transmission. This retreat offers a unique opportunity for a personal encounter with Shunyamurti, including a transformative one-on-one session.",
            type=RetreatType.ONSITE_DARSHAN,
            price_onsite=1750.00,
            location="Sat Yoga Ashram, Costa Rica",
            is_published=True,
            hero_background="/darshan.jpg"
        )
        db.add(darshan)
        db.flush()
        print(f"✅ Created Darshan retreat (ID: {darshan.id})")
    else:
        print(f"Found existing Darshan retreat (ID: {darshan.id})")

    # Update with application form slug and product component data
    darshan.application_form_slug = "darshan-retreat-application"
    darshan.product_component_data = {
        "retreatType": "onsite",
        "tagline": "RETREAT CONTRIBUTION AND DATES",
        "title": "Private Darshan Retreat",
        "basePrice": 1750,
        "description": "The Darshan Retreat with Shunyamurti is a sacred seven-day retreat designed to elevate your spiritual journey through direct transmission. This retreat offers a unique opportunity for a personal encounter with Shunyamurti, including a transformative one-on-one session.",
        "accommodation": "Stay in a charming cabin, with a private room that includes its own bathroom and balcony.",
        "meals": "Nourishing vegetarian meals. We offer vegan and gluten-free options to those on specialized diets.",
        "dateLabel": "Select a date",
        "dateOptions": ["Jan. 21th - Jan. 27th, 2025"],
        "memberLabel": "Are you a member?",
        "memberOptions": ["Select an option"],
        "buttonText": "Begin application",
        "membershipText": "Discover our",
        "membershipLink": "memberships",
        "membershipLinkUrl": "/memberships",
        "membershipNote": "to receive discounts",
        "images": [
            {"src": "/darshangallery1.jpg", "alt": "Teaching session"},
            {"src": "/darshangallery2.jpg", "alt": "Shunyamurti with student"},
            {"src": "/darshangallery3.jpg", "alt": "Community gathering"},
            {"src": "/darshangallery4.jpg", "alt": "Ashram activities"}
        ]
    }
    print("✅ Updated Darshan with form slug and product data")

    # ============================================================================
    # SEVADHARI RETREAT
    # ============================================================================
    sevadhari = db.query(Retreat).filter(Retreat.slug == "sevadhari").first()

    if not sevadhari:
        print("Creating new Sevadhari retreat record...")
        sevadhari = Retreat(
            slug="sevadhari",
            title="Become a Sevadhari",
            subtitle="Live, study, and serve at the Sat Yoga Ashram for 3-6 months or longer",
            description="Join our spiritual community as a Sevadhari (karma yogi) and experience transformative growth through selfless service, meditation, and teachings.",
            type=RetreatType.ONSITE_SEVADHARI,
            price_onsite=0.00,  # No cost for Sevadhari
            location="Sat Yoga Ashram, Costa Rica",
            is_published=True,
            hero_background="/sevadhari.jpg"
        )
        db.add(sevadhari)
        db.flush()
        print(f"✅ Created Sevadhari retreat (ID: {sevadhari.id})")
    else:
        print(f"Found existing Sevadhari retreat (ID: {sevadhari.id})")

    # Update with application form slug and product component data
    sevadhari.application_form_slug = "sevadhari-retreat-application"
    sevadhari.product_component_data = {
        "retreatType": "onsite",
        "tagline": "KARMA YOGA PROGRAM",
        "title": "Sevadhari Program",
        "basePrice": 0,
        "description": "Join our spiritual community as a Sevadhari (karma yogi) and experience transformative growth through selfless service, meditation, and teachings. Live, study, and serve at the ashram for 3-6 months or longer.",
        "accommodation": "Stay in shared or private accommodations based on availability.",
        "meals": "Nourishing vegetarian meals. We offer vegan and gluten-free options to those on specialized diets.",
        "dateLabel": "Select a date",
        "dateOptions": ["Rolling admissions"],
        "memberLabel": "Are you a member?",
        "memberOptions": ["Select an option"],
        "buttonText": "Begin application",
        "membershipText": "Discover our",
        "membershipLink": "memberships",
        "membershipLinkUrl": "/memberships",
        "membershipNote": "for community benefits",
        "images": [
            {"src": "/SD GALLERY 1.jpg", "alt": "Seva work"},
            {"src": "/SD GALLERY 2.jpg", "alt": "Community service"},
            {"src": "/SD GALLERY 3.jpg", "alt": "Meditation practice"},
            {"src": "/SD GALLERY 4.jpg", "alt": "Ashram life"}
        ]
    }
    print("✅ Updated Sevadhari with form slug and product data")

    # Commit all changes
    db.commit()
    print("\n" + "="*60)
    print("✅ Successfully seeded all onsite retreats!")
    print("="*60)
    print(f"\nSeeded retreats:")
    print(f"  1. Shakti Saturation Immersion (slug: shakti)")
    print(f"     - Form: shakti-retreat-application")
    print(f"     - Price: $3,950")
    print(f"  2. Private Darshan Retreat (slug: darshan)")
    print(f"     - Form: darshan-retreat-application")
    print(f"     - Price: $1,750")
    print(f"  3. Sevadhari Program (slug: sevadhari)")
    print(f"     - Form: sevadhari-retreat-application")
    print(f"     - Price: Free")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding onsite retreats: {e}")
    import traceback
    traceback.print_exc()
    raise

finally:
    db.close()
