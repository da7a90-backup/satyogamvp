#!/usr/bin/env python3
"""
Seed retreats/darshan page data
Migrates from Darshan.tsx component
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding retreats/darshan page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="retreats-darshan",
        section_slug="hero",
        section_type="hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        tagline="Ashram Retreats",
        heading="Private Darshan Retreat",
        subheading="A 7-day personal encounter with Shunyamurti",
        background_image="/darshan.jpg"
    )
    db.add(hero_content)

    # 2. INTRO SECTION (TwoPaneComponent)
    intro_section = PageSection(
        page_slug="retreats-darshan",
        section_slug="intro",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(intro_section)
    db.flush()

    intro_content = SectionContent(
        section_id=intro_section.id,
        heading="A Personal Encounter with Shunyamurti",
        title_line_height="120%",
        content=[
            "This retreat is a precious opportunity to receive initiation from Shunyamurti directly—an encounter that can shift your vibrational frequency immediately to the Presence of divine light and love. This in turn can bring full realization of your God-Self.",
            " Designed to open your heart and mind to be filled with the Light of the Supreme Real,",
            "these compact events also feature wisdom classes, meditation training, and optional meetings with an individual counselor."
        ]
    )
    db.add(intro_content)

    # 3. IMAGE CAROUSEL SECTION
    carousel_section = PageSection(
        page_slug="retreats-darshan",
        section_slug="carousel",
        section_type="image_carousel",
        order_index=3,
        is_active=True
    )
    db.add(carousel_section)
    db.flush()

    carousel_content = SectionContent(
        section_id=carousel_section.id,
        secondary_images=[
            {"src": "/darshangallery1.jpg", "alt": "Teaching session"},
            {"src": "/darshangallery2.jpg", "alt": "Shunyamurti with student"},
            {"src": "/darshangallery3.jpg", "alt": "Community gathering"},
            {"src": "/darshangallery4.jpg", "alt": "Ashram activities"},
            {"src": "/darshangallery5.jpg", "alt": "Group learning"},
            {"src": "/darshangallery6.jpg", "alt": "Meditation practice"}
        ]
    )
    db.add(carousel_content)

    # 4. QUOTE SECTION
    quote_section = PageSection(
        page_slug="retreats-darshan",
        section_slug="quote",
        section_type="quote",
        order_index=4,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."
    )
    db.add(quote_content)

    # 5. TESTIMONIALS SECTION
    testimonial_section = PageSection(
        page_slug="retreats-darshan",
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
        page_slug="retreats-darshan",
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
    print("✅ Retreats/darshan page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding retreats/darshan page: {e}")
    raise

finally:
    db.close()
