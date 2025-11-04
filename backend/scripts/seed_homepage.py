#!/usr/bin/env python3
"""
Seed homepage data from hpdata.ts to PostgreSQL

This script extracts homepage sections and populates:
- page_sections
- section_content
- section_tabs
- section_decorations
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent, SectionTab, SectionDecoration


def seed_homepage(db: Session):
    """Seed homepage sections"""

    print("=" * 70)
    print("SEEDING HOMEPAGE DATA")
    print("=" * 70)

    # Check if already seeded
    existing = db.query(PageSection).filter(PageSection.page_slug == "homepage").count()
    if existing > 0:
        print(f"⚠️  Homepage already has {existing} sections. Skipping...")
        return

    sections_data = [
        # 1. HERO SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "hero",
                "section_type": "video_hero",
                "order_index": 1
            },
            "content": {
                "video_url": "/HOMEPAGELOOP.mp4",
                "logo_url": "/satyogawhitelogo.svg",
                "logo_alt": "Sat Yoga",
                "subtitle": "Awaken to the Real"
            }
        },

        # 2. INTRO SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "intro",
                "section_type": "intro",
                "order_index": 2
            },
            "content": {
                "background_image": "/aboutbanner.jpg",
                "heading": "A Revolution in Consciousness"
            }
        },

        # 3. WHO WE ARE SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "who-we-are",
                "section_type": "content_with_image",
                "order_index": 3
            },
            "content": {
                "eyebrow": "Who We Are",
                "heading": "The Original Consciousness Technology",
                "content": [
                    "Sat Yoga is a pioneering institute that offers the most ancient, powerful, and complete spiritual science for the transformation of consciousness. We provide the ultimate user-friendly map of Reality, along with empowering operations for full command of the mind, so that one can rapidly awaken latent psycho-spiritual powers and achieve the supreme goal of enlightenment.",
                    "In our self-sustaining ashram community in the rural mountains of southern Costa Rica, those seeking refuge from this collapsing world can discover the keys to joyous living in Total Presence."
                ],
                "button_text": "Learn More",
                "button_link": "/about/satyoga",
                "image_url": "/1. HOME_Who We Are.jpg",
                "image_alt": "Sat Yoga Community",
                "background_decoration": "/halfflower.svg"
            }
        },

        # 4. SHUNYAMURTI SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "shunyamurti",
                "section_type": "content_with_image",
                "order_index": 4
            },
            "content": {
                "eyebrow": "Our Spiritual Guide",
                "quote": "\"You are That which you are seeking.\"",
                "content": [
                    "Shunyamurti is a realized spiritual teacher whose mission is to awaken humanity to the imminent collapse of the current world system and to guide prepared souls to the enlightened consciousness necessary for sustainable living in the New Earth that is emerging.",
                    "Drawing from deep wells of ancient wisdom and integrating insights from quantum physics, neuroscience, psychology, and mysticism, Shunyamurti offers a revolutionary teaching that empowers sincere seekers to transcend the limitations of ego and discover their true nature as infinite consciousness."
                ],
                "button_text": "About Shunyamurti",
                "button_link": "/about/shunyamurti",
                "image_url": "/2. HOME_Shunya.jpg",
                "image_alt": "Shunyamurti",
                "background_decoration": "/innerlab.svg"
            }
        },

        # 5. LEARN ONLINE SECTION (with tabs)
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "learn-online",
                "section_type": "tabs",
                "order_index": 5
            },
            "content": {
                "eyebrow": "Learn Online",
                "heading": "Transform Your Consciousness From Anywhere",
                "description": [
                    "Access profound teachings, transformative practices, and live events from the comfort of your home.",
                    "Join a global community of seekers dedicated to spiritual awakening."
                ]
            },
            "tabs": [
                {
                    "tab_id": "teachings",
                    "label": "Teachings",
                    "tagline": "Wisdom Library",
                    "title": "2000+ Hours of Spiritual Teachings",
                    "description": "Access our vast library of talks, meditations, and Q&A sessions covering consciousness, enlightenment, and the Supreme Reality.",
                    "button_text": "Explore Teachings",
                    "button_link": "/teachings",
                    "image_url": "/3. HOME_Learn Online_Teachings.jpg",
                    "order_index": 1
                },
                {
                    "tab_id": "courses",
                    "label": "Courses",
                    "tagline": "Deep Dive Training",
                    "title": "Structured Programs for Transformation",
                    "description": "Immerse yourself in comprehensive courses designed to guide you through systematic spiritual development and awakening.",
                    "button_text": "View Courses",
                    "button_link": "/courses",
                    "image_url": "/4. HOME_Learn Online_Courses.jpg",
                    "order_index": 2
                },
                {
                    "tab_id": "retreats",
                    "label": "Online Retreats",
                    "tagline": "Virtual Immersion",
                    "title": "Transform Through Intensive Practice",
                    "description": "Participate in live online retreats offering deep immersion in meditation, self-inquiry, and direct transmission from Shunyamurti.",
                    "button_text": "Join a Retreat",
                    "button_link": "/retreats/online",
                    "image_url": "/5. HOME_Learn Online_Retreats.jpg",
                    "order_index": 3
                },
                {
                    "tab_id": "events",
                    "label": "Live Events",
                    "tagline": "Connect in Real-Time",
                    "title": "Live Sessions with the Sangha",
                    "description": "Join live Q&A sessions, meditation circles, and special events with Shunyamurti and the global Sat Yoga community.",
                    "button_text": "See Calendar",
                    "button_link": "/events",
                    "image_url": "/6. HOME_Learn Online_Events.jpg",
                    "order_index": 4
                },
                {
                    "tab_id": "membership",
                    "label": "Membership",
                    "tagline": "Join the Sangha",
                    "title": "Full Access to All Resources",
                    "description": "Become a member and gain unlimited access to our entire library of teachings, courses, and exclusive content.",
                    "button_text": "Explore Plans",
                    "button_link": "/membership",
                    "image_url": "/7. HOME_Learn Online_Membership.jpg",
                    "order_index": 5
                }
            ],
            "decorations": {
                "innerLab": "/innerlab.svg",
                "halfFlower": "/halfflower.svg",
                "imageTraced": "/imagetraced.svg"
            }
        },

        # 6. ASHRAM SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "ashram",
                "section_type": "content_with_gallery",
                "order_index": 6
            },
            "content": {
                "eyebrow": "Visit the Ashram",
                "heading": "Retreat to Paradise",
                "content": [
                    "Our ashram is nestled in 600 acres of pristine Costa Rican rainforest, offering a sanctuary for deep spiritual practice and sustainable community living.",
                    "Experience profound transformation through silent retreats, sacred ceremonies, and direct transmission in a setting designed to support your journey to enlightenment.",
                    "Join us for an onsite retreat and discover what it means to live in alignment with the Supreme Reality."
                ],
                "button_text": "Explore Retreats",
                "button_link": "/retreats/ashram",
                "image_url": "/8. HOME_Ashram.jpg",
                "image_alt": "Sat Yoga Ashram",
                "secondary_images": [
                    "/ASHRAM_Gallery 1.jpg",
                    "/ASHRAM_Gallery 2.jpg",
                    "/ASHRAM_Gallery 3.jpg",
                    "/ASHRAM_Gallery 4.jpg",
                    "/ASHRAM_Gallery 5.jpg",
                    "/ASHRAM_Gallery 6.jpg"
                ]
            }
        },

        # 7. PLATFORM SECTION
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "platform",
                "section_type": "feature",
                "order_index": 7
            },
            "content": {
                "eyebrow": "Our Platform",
                "heading": "Your Gateway to Enlightenment",
                "content": "Access thousands of hours of teachings, join live events, track your spiritual practice, and connect with a global community—all from one integrated platform designed to support your awakening.",
                "button_text": "Get Started",
                "button_link": "/register",
                "image_url": "/FrameDevices.png",
                "image_alt": "Sat Yoga Platform",
                "background_decoration": "/halfflower.svg"
            }
        },

        # 8. MEMBERSHIP CTA
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "membership-cta",
                "section_type": "cta",
                "order_index": 8
            },
            "content": {
                "eyebrow": "Join the Sangha",
                "heading": "Begin Your Journey to Enlightenment",
                "description": "Gain unlimited access to our complete library of teachings, courses, and live events. Transform your consciousness and awaken to your true nature.",
                "button_text": "Explore Membership",
                "button_link": "/membership",
                "background_image": "/membershipbanner.jpg"
            }
        },

        # 9. DONATION CTA
        {
            "section": {
                "page_slug": "homepage",
                "section_slug": "donation",
                "section_type": "cta",
                "order_index": 9
            },
            "content": {
                "eyebrow": "Support Our Mission",
                "heading": "Help Us Awaken Humanity",
                "description": "Your contribution supports our mission to preserve and share these precious teachings, maintain our ashram sanctuary, and create a refuge for spiritual seekers worldwide.",
                "button_text": "Make a Donation",
                "button_link": "/donate",
                "background_decoration": "/innerlab.svg"
            }
        }
    ]

    created_count = 0

    for section_data in sections_data:
        try:
            # Create page section
            section = PageSection(**section_data["section"])
            db.add(section)
            db.flush()  # Get the ID

            # Create section content
            if "content" in section_data:
                content_data = section_data["content"].copy()

                # Convert list content to JSON
                if "content" in content_data and isinstance(content_data["content"], list):
                    content_data["content"] = content_data["content"]
                if "description" in content_data and isinstance(content_data["description"], list):
                    content_data["description"] = content_data["description"]
                if "secondary_images" in content_data and isinstance(content_data["secondary_images"], list):
                    content_data["secondary_images"] = content_data["secondary_images"]

                content = SectionContent(section_id=section.id, **content_data)
                db.add(content)

            # Create tabs
            if "tabs" in section_data:
                for tab_data in section_data["tabs"]:
                    tab = SectionTab(section_id=section.id, **tab_data)
                    db.add(tab)

            # Create decorations
            if "decorations" in section_data:
                for key, url in section_data["decorations"].items():
                    decoration = SectionDecoration(
                        section_id=section.id,
                        decoration_key=key,
                        decoration_url=url
                    )
                    db.add(decoration)

            created_count += 1
            print(f"✓ Created section: {section_data['section']['section_slug']}")

        except Exception as e:
            print(f"❌ Error creating section {section_data['section']['section_slug']}: {str(e)}")
            db.rollback()
            raise

    db.commit()

    print(f"\n✅ Successfully seeded {created_count} homepage sections!")
    print("=" * 70)


def main():
    """Main execution"""
    db = SessionLocal()

    try:
        seed_homepage(db)
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
