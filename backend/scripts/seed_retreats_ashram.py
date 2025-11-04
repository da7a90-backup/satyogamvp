#!/usr/bin/env python3
"""
Seed retreats/ashram page data
Migrates from StayingAtAshram.tsx component
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding retreats/ashram page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="retreats-ashram",
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
        heading="Staying at the Ashram",
        subheading="Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica",
        background_image="/ashramstaybanner.jpg"
    )
    db.add(hero_content)

    # 2. WHY PARTICIPATE SECTION (TwoPaneComponent)
    participate_section = PageSection(
        page_slug="retreats-ashram",
        section_slug="why-participate",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(participate_section)
    db.flush()

    participate_content = SectionContent(
        section_id=participate_section.id,
        heading="Why Participate in Ashram Life?",
        title_line_height="120%",
        content=[
            "An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature. To fully heal from the wounds of egoic consciousness and become receptive to transmission of the Supreme Light of Being requires surrender to a higher will and to the support of a spiritual community.",
            "Very few are called to become permanent members of an ashram community, but all seekers of Truth can benefit from participating in ashram life for a time—taking a break from the world, immersing yourself in community dharma and spiritual practice, and learning to live ecologically on a small plot of land.",
            "Yet, most importantly, what will happen is that you will be invited into a new relationship with the God-Self that requires you to take radical responsibility for the transformation of consciousness needed for Liberation. As Jesus famously said, you cannot put new wine into old wineskins. You need a new mind—and a new identity."
        ]
    )
    db.add(participate_content)

    # 3. QUOTE SECTION
    quote_section = PageSection(
        page_slug="retreats-ashram",
        section_slug="quote",
        section_type="quote",
        order_index=3,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature."
    )
    db.add(quote_content)

    # 4. TESTIMONIAL CAROUSEL SECTION
    testimonial_section = PageSection(
        page_slug="retreats-ashram",
        section_slug="testimonials",
        section_type="testimonial_carousel",
        order_index=4,
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

    # 5. CONTACT US SECTION
    contact_section = PageSection(
        page_slug="retreats-ashram",
        section_slug="contact",
        section_type="contact_us",
        order_index=5,
        is_active=True
    )
    db.add(contact_section)
    db.flush()

    contact_content = SectionContent(
        section_id=contact_section.id
    )
    db.add(contact_content)

    db.commit()
    print("✅ Retreats/ashram page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding retreats/ashram page: {e}")
    raise

finally:
    db.close()
