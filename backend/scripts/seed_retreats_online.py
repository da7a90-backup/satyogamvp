#!/usr/bin/env python3
"""
Seed retreats/online page data
Migrates from Online.tsx component
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding retreats/online page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="retreats-online",
        section_slug="hero",
        section_type="hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        tagline="Online Retreats",
        heading="Online Retreats Led by Shunyamurti",
        subheading="Livestreamed for a fully immersive experience wherever you are. Also offered onsite through the Shakti Saturation and Sevadhari programs.",
        background_image="/onlineretreatherobanner.jpg"
    )
    db.add(hero_content)

    # 2. INTRO SECTION (TwoPaneComponent)
    intro_section = PageSection(
        page_slug="retreats-online",
        section_slug="intro",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(intro_section)
    db.flush()

    intro_content = SectionContent(
        section_id=intro_section.id,
        heading="Transmissions of Truth for a World in Crisis",
        title_line_height="120%",
        content=[
            "Since the founding of the Sat Yoga Ashram, these retreats have been momentous and grounding tribal gatherings as well as the centerpiece of our wisdom school curriculum. For each retreat, Shunyamurti chooses a title and theme that speak to a current topic of study into which we dive more deeply.",
            "Originally, these retreats were offered only at the ashram; but, since the lockdowns of 2020, we have been offering them as livestream events. Now, both our local ashram community and onsite guests can join together with our global sangha to have our hearts nourished, to receive direct guidance from Shunyamurti on the path to Self-Realization, and to raise the vibrational frequency of the morphogenic field.",
            "These retreats are a rare opportunity to ask Shunyamurti the most precious questions from your heart, to communicate and share with the Sat Yoga community and with online retreat participants worldwide, and to deepen your meditation practice while being immersed in the energy field transmitted from the ashram."
        ]
    )
    db.add(intro_content)

    # 3. TESTIMONIAL SECTION
    testimonial_section = PageSection(
        page_slug="retreats-online",
        section_slug="testimonials",
        section_type="testimonial_secondary",
        order_index=3,
        is_active=True
    )
    db.add(testimonial_section)
    db.flush()

    testimonial_content = SectionContent(
        section_id=testimonial_section.id,
        heading="Testimonials",
        subheading="A few words from people who attended previous online retreats",
        content=[
            {
                "quote": "It was truly a joy and adventure for me to be part of the retreat. I learned a lot of mind and heart expanding concepts.",
                "name": "Idelle",
                "location": "USA",
                "avatar": "/illustrations.png"
            },
            {
                "quote": "We extend infinite gratitude for the gift of the scholarship—deep bows and much love to Shunyamurti and the whole community.",
                "name": "Angela",
                "location": "Canada",
                "avatar": "/illustrations.png"
            },
            {
                "quote": "It was an illuminating and transformative retreat—filled with wisdom that touched me deeply. I feel truly blessed to be part of our collective dream and a member of the Sat Yoga family.",
                "name": "Anthony",
                "location": "USA",
                "avatar": "/illustrations.png"
            },
            {
                "quote": "Being connected with you helps me focus on what's important. Shunya opens these vast realms of understanding—it's rare and unforgettable. I loved the meditations, the teachings—this retreat nourished me in ways I didn't expect.",
                "name": "Hector",
                "location": "Costa Rica",
                "avatar": "/illustrations.png"
            },
            {
                "quote": "Wow, awesome retreat packed with information. I find myself with a renewed commitment to quieting the mind and doing the work for liberation.",
                "name": "Judy",
                "location": "USA",
                "avatar": "/illustrations.png"
            }
        ]
    )
    db.add(testimonial_content)

    # 4. CONTACT US SECTION (or store section)
    contact_section = PageSection(
        page_slug="retreats-online",
        section_slug="contact",
        section_type="contact_us",
        order_index=4,
        is_active=True
    )
    db.add(contact_section)
    db.flush()

    contact_content = SectionContent(
        section_id=contact_section.id
    )
    db.add(contact_content)

    db.commit()
    print("✅ Retreats/online page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding retreats/online page: {e}")
    raise

finally:
    db.close()
