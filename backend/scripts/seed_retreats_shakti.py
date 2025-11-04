#!/usr/bin/env python3
"""
Seed retreats/shakti page data
Migrates from Shakti.tsx component
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent
import json

db = SessionLocal()

try:
    print("🌱 Seeding retreats/shakti page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="hero",
        section_type="hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        tagline="Ashram Onsite Retreats",
        heading="Shakti Saturation Immersion",
        subheading="A one-month transformative journey at the Sat Yoga Ashram",
        background_image="/ssi.jpg"
    )
    db.add(hero_content)

    # 2. INTRO SECTION (TwoPaneComponent)
    intro_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="intro",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(intro_section)
    db.flush()

    intro_content = SectionContent(
        section_id=intro_section.id,
        heading="A Life-Changing Discovery of Your True Nature",
        title_line_height="120%",
        content=[
            "The Shakti Saturation process is an adventure in Self-discovery! The curriculum has been specially designed to serve our growing global community of seekers of healing and inner peace, and lovers of Truth.",
            "This onsite program is open to all who delight in the Sat Yoga teachings, and who are ready to engage in the inner work of attaining Total Presence.",
            "Whether you are joining us for a month or considering extending your stay, this intensive reconfiguration of identity will serve as an exhilarating introduction to life at the Ashram—and your personal divinization.",
            "Your days will be filled with mind-clearing wisdom, sweet inner silence, and heart-healing self-acceptance. The understanding of our supportive spiritual community will assist in enabling you to drop all your old projections, defensiveness, and self-doubt.",
            "Through this profound peeling away of the past, your life will feel renewed. You may experience a paradigm shift into a more beautiful reality. And you will be able to rebuild your life on the bedrock of the Real Self—and live in freedom, in a state of grace."
        ]
    )
    db.add(intro_content)

    # 3. QUOTE SECTION
    quote_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="quote",
        section_type="quote",
        order_index=3,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."
    )
    db.add(quote_content)

    # 4. IMAGE CAROUSEL SECTION
    carousel_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="carousel",
        section_type="image_carousel",
        order_index=4,
        is_active=True
    )
    db.add(carousel_section)
    db.flush()

    carousel_content = SectionContent(
        section_id=carousel_section.id,
        secondary_images=[
            {"src": "/SSI Gallery 1.jpg", "alt": "Teaching session"},
            {"src": "/SSI Gallery 2.jpg", "alt": "Shunyamurti with student"},
            {"src": "/SSI Gallery 3.jpg", "alt": "Community gathering"},
            {"src": "/SSI Gallery 4.jpg", "alt": "Ashram activities"},
            {"src": "/SSI Gallery 5.jpg", "alt": "Group learning"},
            {"src": "/SSI Gallery 6.jpg", "alt": "Meditation practice"},
            {"src": "/SSI Gallery 7.jpg", "alt": "Meditation practice"},
            {"src": "/SSI Gallery 8.jpg", "alt": "Meditation practice"}
        ]
    )
    db.add(carousel_content)

    # 5. TESTIMONIALS SECTION
    testimonial_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="testimonials",
        section_type="testimonial_carousel",
        order_index=5,
        is_active=True
    )
    db.add(testimonial_section)
    db.flush()

    testimonial_content = SectionContent(
        section_id=testimonial_section.id,
        tagline="TESTIMONIAL CAROUSEL",
        content=[
            {
                "id": 1,
                "quote": "I've received so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
                "author": "Mandy",
                "location": "UK",
                "media": {
                    "type": "video",
                    "src": "https://www.youtube.com/embed/Ut4iguf7n6U",
                    "videoType": "youtube",
                    "thumbnail": "/testimonial.png"
                }
            },
            {
                "id": 2,
                "quote": "I've so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
                "author": "Mandy",
                "location": "UK",
                "media": {
                    "type": "image",
                    "src": "/testimonial.png"
                }
            }
        ]
    )
    db.add(testimonial_content)

    # 6. CONTACT US SECTION
    contact_section = PageSection(
        page_slug="retreats-shakti",
        section_slug="contact",
        section_type="contact_us",
        order_index=6,
        is_active=True
    )
    db.add(contact_section)
    db.flush()

    contact_content = SectionContent(
        section_id=contact_section.id
    )
    db.add(contact_content)

    db.commit()
    print("✅ Retreats/shakti page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding retreats/shakti page: {e}")
    raise

finally:
    db.close()
