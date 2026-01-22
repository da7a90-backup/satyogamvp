#!/usr/bin/env python3
"""
Seed retreats/sevadhari page data
Migrates from Sevadhari.tsx component
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding retreats/sevadhari page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="retreats-sevadhari",
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
        heading="Become a Sevadhari",
        subheading="Live, study, and serve at the Sat Yoga Ashram for 3-6 months or longer",
        background_image="/sevadhari.jpg"
    )
    db.add(hero_content)

    # 2. INTRO SECTION (TwoPaneComponent)
    intro_section = PageSection(
        page_slug="retreats-sevadhari",
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
        page_slug="retreats-sevadhari",
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
            {"src": "/SD GALLERY 1.jpg", "alt": "Teaching session"},
            {"src": "/SD GALLERY 2.jpg", "alt": "Shunyamurti with student"},
            {"src": "/SD GALLERY 3.jpg", "alt": "Community gathering"},
            {"src": "/SD GALLERY 4.jpg", "alt": "Ashram activities"},
            {"src": "/SD GALLERY 5.jpg", "alt": "Group learning"},
            {"src": "/SD GALLERY 6.jpg", "alt": "Meditation practice"}
        ]
    )
    db.add(carousel_content)

    # 4. QUOTE SECTION
    quote_section = PageSection(
        page_slug="retreats-sevadhari",
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

    # 5. APPLICATION PROCESS SECTION (Timeline)
    application_process_section = PageSection(
        page_slug="retreats-sevadhari",
        section_slug="application_process",
        section_type="two_pane_timeline",
        order_index=5,
        is_active=True
    )
    db.add(application_process_section)
    db.flush()

    application_process_content = SectionContent(
        section_id=application_process_section.id,
        tagline="AFTER ADMISSION",
        heading="What's the Process of Application and Admission?",
        title_line_height="120%",
        content=[
            {
                "number": 1,
                "tagline": "Start Your Journey to Join the Community",
                "title": "Submit Your Application",
                "description": "Fill out the application form, providing details about your background, intentions, and interest in joining the Sat Yoga community."
            },
            {
                "number": 2,
                "tagline": "We Assess Your Fit",
                "title": "Application Review",
                "description": "Our admissions committee will review your application to assess your readiness for this lifestyle, your goals, and whether there is a strong resonance with our teachings and community dynamic. We consider your aspirations and how well you align with our values."
            },
            {
                "number": 3,
                "tagline": "Get to Know Us and Ask Your Questions",
                "title": "Phone Interview",
                "description": "If your application resonates, we'll schedule a phone interview to discuss the program and life at the ashram in depth. We'll clarify expectations, including our rainy climate, diet, Dharma, early morning meditation schedule, and remote location. This is your chance to ask questions and ensure you fully understand the lifestyle you're committing to."
            },
            {
                "number": 4,
                "tagline": "Admissions Committee Makes a Decision",
                "title": "Final decision",
                "description": "After the interview, the admissions committee will review everything and make a decision as soon as possible."
            },
            {
                "number": 5,
                "tagline": "We Help You Prepare for Your Arrival",
                "title": "Arrival arrangements",
                "description": "If accepted, we'll work with you to finalize your arrival date and ensure a smooth transition into ashram life."
            },
            {
                "number": 6,
                "tagline": "Begin Your Journey with Us",
                "title": "Trial period",
                "description": "Your first month at the Ashram will be part of the Shakti Saturation Immersion, which serves as a trial period for both you and the community. During this time, you'll dive into ashram life, connect with the community, and begin your seva (selfless service) duties. It's a chance for us to get to know each other better and ensure there is a mutual resonance. If, after the first month, it is a good fit, you will transition into a full time sevadhari."
            },
            {
                "number": 7,
                "tagline": "Reflection and Feedback",
                "title": "Monthly Assessment and Reflection",
                "description": "At the end of the Shakti Saturation Immersion, and at the end of every month of your stay thereafter, we'll sit down together to reflect on your experience. We'll discuss how things are going, listen to your feedback, and make any adjustments needed. This helps us ensure you're thriving and aligned with the community and to see if this program and the ashram are the right fit for you for the remaining months of the program."
            }
        ]
    )
    db.add(application_process_content)

    # 6. CONTACT US SECTION
    contact_section = PageSection(
        page_slug="retreats-sevadhari",
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
    print("✅ Retreats/sevadhari page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding retreats/sevadhari page: {e}")
    raise

finally:
    db.close()
