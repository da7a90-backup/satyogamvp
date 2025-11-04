#!/usr/bin/env python3
"""
Seed homepage with CORRECT data from hpdata.ts
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent, SectionTab

db = SessionLocal()

try:
    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="homepage",
        section_slug="hero",
        section_type="video_hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        video_url="/HOMEPAGELOOP.mp4",
        logo_url="/satyogastylized.png",
        logo_alt="Sat Yoga",
        subtitle="The Summit of Self-Realization"
    )
    db.add(hero_content)

    # 2. INTRO SECTION
    intro_section = PageSection(
        page_slug="homepage",
        section_slug="intro",
        section_type="intro",
        order_index=2,
        is_active=True
    )
    db.add(intro_section)
    db.flush()

    intro_content = SectionContent(
        section_id=intro_section.id,
        background_image="/nataraj.png",
        heading="Discover timeless teachings, transformative retreats, and a community devoted to Truth"
    )
    db.add(intro_content)

    # 3. WHO WE ARE SECTION
    who_section = PageSection(
        page_slug="homepage",
        section_slug="who-we-are",
        section_type="content_with_image",
        order_index=3,
        is_active=True
    )
    db.add(who_section)
    db.flush()

    who_content = SectionContent(
        section_id=who_section.id,
        eyebrow="WHO WE ARE",
        heading="A Pathless Path to Self-Realization and Liberation",
        content=[
            "The way and the goal of Sat Yoga is to live in oneness with the eternally present Absolute Real.",
            "To help seekers understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering practices for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the pristine rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence."
        ],
        button_text="Discover Sat Yoga",
        button_link="/about/satyoga",
        image_url="/1. HOME_Who We Are.jpg",
        image_alt="Sat Yoga Community",
        background_decoration="/Inner Labyrinth.png"
    )
    db.add(who_content)

    # 4. SHUNYAMURTI SECTION
    shunya_section = PageSection(
        page_slug="homepage",
        section_slug="shunyamurti",
        section_type="content_with_image",
        order_index=4,
        is_active=True
    )
    db.add(shunya_section)
    db.flush()

    shunya_content = SectionContent(
        section_id=shunya_section.id,
        eyebrow="SHUNYAMURTI",
        quote="Love is what makes the impossible, inevitable.",
        content=[
            "Shunyamurti is an uncanny, profound and life-transforming teacher whose wisdom is transmitted from the source of the infinite Self.",
            "He has a unique ability to distill the essence of Eastern and Western wisdom, history, psychoanalysis, philosophy, and science to deliver the context needed to understand the human condition and interpret the meaning of the state of the world.",
            "Shunyamurti helps seekers awaken from illusion, anxiety, and suffering of every kind. Through deep meditation, self-inquiry, and the recognition of the unreal nature of the ego seekers experience the fullness of freedom, joy, and divine love."
        ],
        button_text="Learn more",
        button_link="/about/shunyamurti",
        image_url="/shunyamurti-meditation.jpg",
        image_alt="Shunyamurti in meditation",
        background_decoration="/innerlab.png"
    )
    db.add(shunya_content)

    # 5. LEARN ONLINE SECTION
    learn_section = PageSection(
        page_slug="homepage",
        section_slug="learn-online",
        section_type="tabs",
        order_index=5,
        is_active=True
    )
    db.add(learn_section)
    db.flush()

    learn_content = SectionContent(
        section_id=learn_section.id,
        eyebrow="LEARN ONLINE",
        heading="Begin on Your Journey with Sat Yoga Online",
        description="[\"We offer a variety of options online to support your spiritual growth and transformation. Wherever you are you can learn at your own pace.\",\"Join livestreamed retreats; membership with access to a vast library of teachings and new content published weekly; live satsangs, classes, and meditations; and a rich collection of resources in the store.\"]"
    )
    db.add(learn_content)

    # Learn online tabs
    tabs_data = [
        ("free-teachings", "Free teachings", "FREE TEACHINGS", "Start Your Journey with Free Wisdom",
         "Our specially curated collection of free teachings, guided meditations, questions and answers with Shunyamurti, and essays offers an introduction and glimpse into the healing and transformative wisdom of meditation and Self-inquiry.",
         "Browse teachings", "/teachings", "/tabimage.png", 1),
        ("membership", "Membership Section", "MEMBERSHIP", "Access Our Complete Library",
         "Join our membership to access a vast library of teachings, new content published weekly, live satsangs, classes, and meditations. Transform your spiritual practice with unlimited access to Shunyamurti's wisdom.",
         "Explore membership", "/membership", "/tabimage2.png", 2),
        ("retreats", "Online Retreats", "ONLINE RETREATS", "Transform Through Intensive Practice",
         "Experience the power of deep spiritual immersion from anywhere in the world. Our online retreats offer structured programs, live interactions, and transformative practices guided by Shunyamurti.",
         "View retreats", "/retreats/online", "/tabimage3.png", 3),
        ("courses", "Courses", "COURSES", "Structured Learning Paths",
         "Dive deep into specific aspects of spiritual development through our comprehensive courses. Each course is designed to build understanding and practice systematically.",
         "Browse courses", "/courses", "/tabimage4.png", 4),
        ("store", "Store", "STORE", "Sacred Resources & Materials",
         "Discover books, audio recordings, meditation tools, and other sacred resources to support your spiritual journey and deepen your practice.",
         "Shop now", "/store", "/tabimage5.png", 5)
    ]

    for tab_id, label, tagline, title, description, button_text, button_link, image_url, order_index in tabs_data:
        tab = SectionTab(
            section_id=learn_section.id,
            tab_id=tab_id,
            label=label,
            tagline=tagline,
            title=title,
            description=description,
            button_text=button_text,
            button_link=button_link,
            image_url=image_url,
            order_index=order_index
        )
        db.add(tab)

    # 6. ASHRAM SECTION
    ashram_section = PageSection(
        page_slug="homepage",
        section_slug="ashram",
        section_type="content_with_gallery",
        order_index=6,
        is_active=True
    )
    db.add(ashram_section)
    db.flush()

    ashram_content = SectionContent(
        section_id=ashram_section.id,
        eyebrow="THE ASHRAM",
        heading="Rest in the Current of Your Infinite Nature",
        content=[
            "Experience the transformative power of Sat Yoga at our Ashram in the serene mountains of southern Costa Rica.",
            "With the luminous presence of Shunyamurti and the support of the sangha, our Ashram retreats offer an unparalleled opportunity to experience deep meditation, wisdom teachings, and community living, which will accelerate your journey toward Self-realization.",
            "Whether you seek a short-term retreat, a longer stay, or a life as an ashram resident, our programs are designed to catalyze your spiritual growth and dissolve the barriers that keep you from experiencing the fullness of Being."
        ],
        button_text="Learn more",
        button_link="/about/ashram",
        image_url="/ashram1.png",
        secondary_images=["/ashram2.png", "/ashram3.png", "/ashram4.png"]
    )
    db.add(ashram_content)

    # 7. PLATFORM SECTION
    platform_section = PageSection(
        page_slug="homepage",
        section_slug="platform",
        section_type="feature",
        order_index=7,
        is_active=True
    )
    db.add(platform_section)
    db.flush()

    platform_content = SectionContent(
        section_id=platform_section.id,
        eyebrow="SAT YOGA ONLINE - SEAMLESS ACROSS ALL DEVICES",
        heading="Stay Connected to Wisdom Anytime, Anywhere",
        content=["No matter where you are or what device you use, Sat Yoga's online platform seamlessly adapts. Our dashboard allows you to engage effortlessly with online retreats, courses, wisdom teachings, guided meditations, live classes, and enriching community discussions—ensuring your virtual connection to the source of wisdom can continue without interruption."],
        button_text="Start the journey",
        button_link="/signup",
        image_url="/platform.png",
        image_alt="Sat Yoga platform",
        background_decoration="/imagetraced.png"
    )
    db.add(platform_content)

    # 8. MEMBERSHIP CTA
    membership_section = PageSection(
        page_slug="homepage",
        section_slug="membership",
        section_type="cta",
        order_index=8,
        is_active=True
    )
    db.add(membership_section)
    db.flush()

    membership_content = SectionContent(
        section_id=membership_section.id,
        eyebrow="MEMBERSHIP",
        heading="A Revolutionary Approach to Living!",
        description="Join our global community and transform your life with Shunyamurti's teachings. Overcome anxiety, confusion, and limitations. Access weekly teachings, guided meditations, live encounters, and exclusive content, as you deepen your connection to wisdom and growth.",
        button_text="Browse Teachings",
        button_link="/teachings",
        background_image="/members.png"
    )
    db.add(membership_content)

    # 9. DONATION CTA
    donation_section = PageSection(
        page_slug="homepage",
        section_slug="donation",
        section_type="cta",
        order_index=9,
        is_active=True
    )
    db.add(donation_section)
    db.flush()

    donation_content = SectionContent(
        section_id=donation_section.id,
        eyebrow="DONATE",
        heading="Support our sacred mission",
        description="If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.",
        button_text="Donate",
        button_link="/donate",
        background_decoration="/innerlab.png"
    )
    db.add(donation_content)

    db.commit()
    print("✅ Homepage seeded with CORRECT data from hpdata.ts")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    raise
finally:
    db.close()
