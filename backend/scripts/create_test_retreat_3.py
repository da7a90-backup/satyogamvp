"""
Script to create a third online retreat for testing registration flow.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat, RetreatType
import uuid
from datetime import datetime

def create_test_retreat():
    db = SessionLocal()
    try:
        new_retreat = Retreat(
            id=uuid.uuid4(),
            slug="divine-awakening-summer-2026",
            title="Divine Awakening: The Sacred Path to Liberation",
            subtitle="Experience profound spiritual awakening through ancient wisdom and modern consciousness practices",
            description="Join us for an immersive 3-day journey into divine consciousness and spiritual liberation.",
            type=RetreatType.ONLINE,
            start_date=datetime(2026, 6, 19, 0, 0, 0),
            end_date=datetime(2026, 6, 21, 0, 0, 0),
            price_lifetime=595.00,
            price_limited=357.00,
            price_onsite=None,
            price_options=None,
            member_discount_percentage=None,
            scholarship_available=True,
            scholarship_deadline="June 1, 2026",
            application_url=None,
            location="Online via Zoom",
            max_participants=None,
            is_published=True,
            thumbnail_url="/orbanner.png",

            # Selling Page Content
            booking_tagline="Discover Divine Consciousness Through 3 Days of Sacred Practice",
            intro1_title="The Path to Divine Awakening",
            intro1_content=[
                "This transformative online retreat offers a sacred journey into the depths of divine consciousness.",
                "Through powerful satsangs, ancient practices, and profound teachings, you will awaken to your divine nature.",
                "Shunyamurti will guide you through the sacred practices that open the gateway to liberation."
            ],
            intro2_title="Your Divine Journey",
            intro2_content=[
                "Ancient wisdom teachings for modern consciousness",
                "Powerful meditation practices for divine connection",
                "Live Q&A sessions for personalized spiritual guidance",
                "Sacred practices for transcending the ego"
            ],
            intro3_title="The Gateway to Liberation",
            intro3_content=[
                "This retreat creates a sacred space for those ready to experience divine awakening.",
                "You will learn to dissolve the veils of illusion and recognize your true divine essence.",
                "The sacred practices will continue to support your spiritual journey beyond the retreat."
            ],
            intro3_media="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/701eac01-4cce-44a9-56f3-69597a21b000/public",

            agenda_title="Sacred Journey Schedule",
            agenda_items=[
                {
                    "time": "Day 1",
                    "activity": "Opening Sacred Space & Divine Transmission",
                    "description": "Connect with divine consciousness and receive opening blessings"
                },
                {
                    "time": "Day 2",
                    "activity": "Deep Immersion in Sacred Practices",
                    "description": "Intensive teachings and divine transmissions"
                },
                {
                    "time": "Day 3",
                    "activity": "Integration & Sacred Completion",
                    "description": "Anchor your awakening and receive final blessings"
                }
            ],

            included_title="Your Sacred Retreat Package",
            included_items=[
                {
                    "icon": "video",
                    "title": "Live Video Sessions",
                    "description": "Real-time participation in all teachings"
                },
                {
                    "icon": "audio",
                    "title": "Unlimited Replays",
                    "description": "Lifetime or 12-day access to recordings"
                },
                {
                    "icon": "book",
                    "title": "Comprehensive Materials",
                    "description": "Complete spiritual practice guides"
                },
                {
                    "icon": "community",
                    "title": "Sacred Community",
                    "description": "Join seekers from around the world"
                }
            ],

            schedule_tagline=None,
            schedule_title="Daily Sacred Sessions",
            schedule_items=[
                {
                    "date": "June 19th",
                    "sessions": [
                        {
                            "time": "7:00 PM EST",
                            "title": "Opening Sacred Ceremony with Shunyamurti"
                        }
                    ]
                },
                {
                    "date": "June 20th",
                    "sessions": [
                        {
                            "time": "7:00 AM EST",
                            "title": "Divine Morning Practice"
                        },
                        {
                            "time": "1:00 PM EST",
                            "title": "Sacred Teaching & Divine Q&A"
                        }
                    ]
                },
                {
                    "date": "June 21st",
                    "sessions": [
                        {
                            "time": "1:00 PM EST",
                            "title": "Completion Satsang & Liberation Transmission"
                        }
                    ]
                }
            ],

            # Media - Same as source
            hero_background="/orbanner.png",
            images=[
                {"alt": "Retreat session", "src": "/PURCHASE GALLERY 2.jpg"},
                {"alt": "Meditation practice", "src": "/PURCHASE GALLERY 3.jpg"},
                {"alt": "Community gathering", "src": "/PURCHASE GALLERY 4.jpg"},
                {"alt": "Wisdom teaching", "src": "/PURCHASE GALLERY 5.jpg"}
            ],
            video_url=None,
            video_thumbnail=None,
            video_type=None,

            # Testimonials
            testimonial_tagline="TESTIMONIALS",
            testimonial_heading="Reflections from Recent Retreatants",
            testimonial_data={
                "tagline": "TESTIMONIALS",
                "heading": "Reflections from Recent Retreatants",
                "items": [
                    {
                        "name": "Anissa",
                        "quote": "These teachings this weekend have been amazing. My husband and I watch and discuss for hours. Thank you, Sat Yoga team, for bringing this to our living room. Thank you also to Shunyamurti for sharing his sacred wisdom with us.",
                        "avatar": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                        "location": "USA"
                    },
                    {
                        "name": "Brad",
                        "quote": "The retreat left my being much lighter. I feel I dissolved many layers of the ego and more are lifting with each breath.",
                        "avatar": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                        "location": "Canada"
                    },
                    {
                        "name": "Elisabeth",
                        "quote": "Thank you for this most amazing, wonderful retreat! The teachings were fantastic, so much wisdom and useful tools, I will listen again and again.",
                        "avatar": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                        "location": "Sweden"
                    },
                    {
                        "name": "Mara",
                        "quote": "I have so enjoyed immersing myself in the blissful ocean of these teachings and meditations. Please convey my deepest gratitude to Shunyamurti for his exquisite transmissions.",
                        "avatar": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                        "location": "UK"
                    }
                ]
            },

            # Portal/Selling Page Data
            invitation_video_url=None,
            announcement="Welcome to this sacred journey of divine awakening and spiritual liberation. We honor your commitment to truth.",
            about_content="This retreat offers a complete immersion into practices of divine consciousness and spiritual liberation, providing sacred tools for lasting transformation.",
            about_image_url=None,
            preparation_instructions=[
                "Create a sacred space for your retreat practice",
                "Ensure reliable high-speed internet connection",
                "Have a journal for recording divine insights",
                "Test your Zoom setup before the opening ceremony",
                "Set a sacred intention for your awakening journey",
                "Commit to being fully present during all sessions"
            ],
            faq_data=[
                {
                    "question": "What time zone are the sessions?",
                    "answer": "All sessions are in EST (Eastern Standard Time). You'll receive a personalized schedule with your local time zone after registration."
                },
                {
                    "question": "Can I access recordings later?",
                    "answer": "Yes! All sessions are recorded. Lifetime access includes permanent access to all recordings. 12-day access provides access during the retreat plus 12 days after."
                },
                {
                    "question": "What's the difference between access options?",
                    "answer": "Lifetime access ($595) grants permanent access to all retreat content and materials. 12-day access ($357) provides access during the retreat and for 12 days following its conclusion."
                },
                {
                    "question": "Is prior experience required?",
                    "answer": "No! The teachings are accessible to all levels. Both beginners and experienced practitioners will find profound value and transformation."
                },
                {
                    "question": "Can I ask questions during the retreat?",
                    "answer": "Absolutely! Each session includes Q&A time where you can ask Shunyamurti questions about your spiritual journey and practice."
                }
            ],
            live_schedule=[
                {
                    "date": "June 19th",
                    "day_label": "Friday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "7:00 pm EST",
                            "title": "Opening Livestream Satsang with Shunyamurti",
                            "zoom_link": "https://zoom.us/j/example999",
                            "thumbnail_url": None
                        }
                    ]
                },
                {
                    "date": "June 20th",
                    "day_label": "Saturday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "7:00 am EST",
                            "title": "Sacred Morning Divine Practice",
                            "zoom_link": "https://zoom.us/j/example999"
                        },
                        {
                            "time": "1:00 pm EST",
                            "title": "Afternoon Teaching: Path to Liberation",
                            "zoom_link": "https://zoom.us/j/example999",
                            "thumbnail_url": None
                        }
                    ]
                },
                {
                    "date": "June 21st",
                    "day_label": "Sunday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "1:00 pm EST",
                            "title": "Completion Ceremony & Liberation Blessing",
                            "zoom_link": "https://zoom.us/j/example999",
                            "thumbnail_url": None
                        }
                    ]
                }
            ],

            # Card Display Fields
            duration_days=3,
            has_audio=True,
            has_video=True,
            forum_enabled=True,

            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to database
        db.add(new_retreat)
        db.commit()
        db.refresh(new_retreat)

        print(f"\n✅ Successfully created new test retreat:")
        print(f"   ID: {new_retreat.id}")
        print(f"   Title: {new_retreat.title}")
        print(f"   Slug: {new_retreat.slug}")
        print(f"   Lifetime Price: ${new_retreat.price_lifetime}")
        print(f"   Limited Price: ${new_retreat.price_limited}")
        print(f"   Dates: {new_retreat.start_date.strftime('%B %d, %Y')} - {new_retreat.end_date.strftime('%B %d, %Y')}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating retreat: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_retreat()
