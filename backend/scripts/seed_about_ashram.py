#!/usr/bin/env python3
"""
Seed about/ashram page data
Migrates from data.ts: ashramEndTimeData, spiritualTribeData
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding about/ashram page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="about-ashram",
        section_slug="hero",
        section_type="hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        tagline="About",
        heading="Our Ashram",
        subheading="The Challenge of Interbeing",
        background_image="/ssi.jpg"
    )
    db.add(hero_content)

    # 2. ASHRAM END TIME SECTION (TwoPaneComponent with paragraphs)
    end_time_section = PageSection(
        page_slug="about-ashram",
        section_slug="ashram-end-time",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(end_time_section)
    db.flush()

    end_time_content = SectionContent(
        section_id=end_time_section.id,
        heading="An Ashram at the End of Time",
        content=[
            "What is different about an ashram established in the understanding that we are near the end of this age and of the whole cycle of history? We are not traditionalists or believers in a creed. We are not perfectionists, not necessarily ascetics, and mostly rebels and runaways; but the responsibilities of sustaining a farming community and serving in a wisdom school have refined our characters and given us at least a taste of divine ecstasy. We are not here to pass on any dogma, enlist anyone as a monk, or give out certificates. We are playing for higher stakes: Liberation.",
            "We understand that the chief responsibility of our residential sangha is to maintain an energy field filled with wisdom, love, and compassion—expressed as cheerfulness, friendship, cooperation, and forgiveness. And we are engaged in the constant practice of recognizing that all of reality is a single Consciousness.",
            "The ashram was founded in 2009 and has been sustained miraculously, thanks to the dedication, generosity, and faith of the founding members and the hard work and innovative ideas of those who came after them. The magnanimity of donors has been life-saving. We have also flourished thanks to the endless flow of new teachings—always more profound and powerful—transmitted through our yogic research director, Shunyamurti.",
            "We are not ordinary preppers or mere survivalists; but we do foresee the imminent collapse of civilization, and we intend to endure peacefully through the time of tribulations for so long as our service on this plane is required."
        ],
        background_elements={
            "nataraj": {
                "image": "/nataraj.png",
                "desktop": {
                    "width": "670px",
                    "height": "670px",
                    "left": "-200px",
                    "top": "250px",
                    "opacity": 0.1,
                    "zIndex": 0
                },
                "mobile": {
                    "width": "560px",
                    "height": "700px",
                    "left": "-150px",
                    "top": "265px",
                    "opacity": 0.06,
                    "zIndex": 0
                }
            }
        }
    )
    db.add(end_time_content)

    # 3. IMAGE CAROUSEL SECTION
    carousel_section = PageSection(
        page_slug="about-ashram",
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
            {"src": "/ASHRAM_Gallery 1.jpg", "alt": "Satsang with Shunyamurti"},
            {"src": "/ASHRAM_Gallery 2.jpg", "alt": "Music and meditation practice"},
            {"src": "/ASHRAM_Gallery 3.jpg", "alt": "Kitchen and community service"},
            {"src": "/ASHRAM_Gallery 4.jpg", "alt": "Outdoor meditation"},
            {"src": "/ASHRAM_Gallery 5.jpg", "alt": "Group study and contemplation"},
            {"src": "/ASHRAM_Gallery 6.jpg", "alt": "Group study and contemplation"}
        ]
    )
    db.add(carousel_content)

    # 4. QUOTE SECTION
    quote_section = PageSection(
        page_slug="about-ashram",
        section_slug="quote",
        section_type="quote",
        order_index=4,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="Living in a serious transformational community is a great privilege and opportunity . . . and perhaps the ultimate rite of passage."
    )
    db.add(quote_content)

    # 5. SPIRITUAL TRIBE SECTION (TwoPaneComponent with paragraphs)
    tribe_section = PageSection(
        page_slug="about-ashram",
        section_slug="spiritual-tribe",
        section_type="two_pane_paragraphs",
        order_index=5,
        is_active=True
    )
    db.add(tribe_section)
    db.flush()

    tribe_content = SectionContent(
        section_id=tribe_section.id,
        heading="A Spiritual Tribe Like No Other",
        content=[
            "Most of us had never even visited an ashram before arriving here. We grew up in the urban, materialist, consumerist, dumbed-down, puerile, and cynical culture that produced nearly everyone's ego—with a tenacious resistance to responsible adulthood and with few higher role models. We were saddled with a nihilistic attitude, seeking whatever crumbs of pleasure could be found. Fortunately, our karma got us to this refuge where we could start to heal our wounded souls.",
            "In short, we were not prepared for a life devoted to transcendence of the ego, nor even for managing a farm, a retreat center, and a complex website. We are learning on the go. That has added an edge of aliveness and willingness to accept beginner's mind, along with the thrill of solving enigmas and gasping in wonder at the impossible synchronicities that have kept us afloat.",
            "Even more miraculously, we have learned how to get along, how to accommodate the other, how to resolve conflicts, and (most importantly) how to stop projecting—instead, to eliminate attitudes that produce glitches in the field. We have learned how to disidentify from our own self-presentations, and we have learned the hard way—through our experience of karma and dharma and the sting of intense inner work—the vital importance of these teachings."
        ]
    )
    db.add(tribe_content)

    # 6. SHUNYAMURTI VIDEO SECTION (TwoPaneComponent with video)
    video_section = PageSection(
        page_slug="about-ashram",
        section_slug="shunyamurti-video",
        section_type="two_pane_video",
        order_index=6,
        is_active=True
    )
    db.add(video_section)
    db.flush()

    video_content = SectionContent(
        section_id=video_section.id,
        video_url="https://www.youtube.com/embed/1z4ryQt0duM?feature=shared",
        video_thumbnail="/shunyavideo.png",
        video_type="youtube",
        content=[
            "In this short video, recorded during a recent satsang, Shunyamurti explains some of the work of the community, and the vision for a network of flourishing self-sustaining, spiritual communities."
        ]
    )
    db.add(video_content)

    db.commit()
    print("✅ about/ashram page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding about/ashram: {e}")
    import traceback
    traceback.print_exc()
    raise
finally:
    db.close()
