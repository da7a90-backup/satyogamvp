"""
Script to create a duplicate online retreat with modified data for testing.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat
import uuid
from datetime import datetime, timedelta

def create_duplicate_retreat():
    db = SessionLocal()
    try:
        # Source retreat ID
        source_id = "f59c8b9b-c169-47a5-ba62-8d845e7e1234"

        # Get the source retreat
        source = db.query(Retreat).filter(Retreat.id == source_id).first()
        if not source:
            print(f"❌ Source retreat {source_id} not found")
            return

        print(f"✓ Found source retreat: {source.title}")

        # Create new retreat with modified data
        new_retreat = Retreat(
            id=uuid.uuid4(),
            slug="awakening-self-love-spring-2026",
            title="Awakening Self-Love: The Journey to Wholeness",
            subtitle="Transform your relationship with yourself through sacred practices and divine wisdom",
            description="Experience a 3-day immersive journey into the depths of self-love and spiritual wholeness.",
            type=source.type,
            start_date=datetime(2026, 4, 17, 0, 0, 0),
            end_date=datetime(2026, 4, 19, 0, 0, 0),
            price_lifetime=645.00,
            price_limited=387.00,
            price_onsite=source.price_onsite,
            price_options=source.price_options,
            member_discount_percentage=source.member_discount_percentage,
            scholarship_available=True,
            scholarship_deadline="April 1, 2026",
            application_url=source.application_url,
            location=source.location,
            max_participants=source.max_participants,
            is_published=True,
            thumbnail_url=source.thumbnail_url,

            # Selling Page Content - Modified
            booking_tagline="Embrace Self-Love Through 3 Days of Sacred Transformation",
            intro1_title="Begin Your Journey to Wholeness",
            intro1_content=[
                "This powerful online retreat invites you to explore the deepest dimensions of self-love and acceptance.",
                "Through intimate satsangs, heart-opening meditations, and transformative wisdom, you will awaken to your inherent wholeness.",
                "Shunyamurti will illuminate the path to unconditional self-love and divine connection."
            ],
            intro2_title="Your Transformation Path",
            intro2_content=[
                "Sacred teachings on self-love and spiritual awakening",
                "Heart-centered meditation practices for deep healing",
                "Interactive Q&A sessions for personalized guidance",
                "Ancient wisdom practices for embracing your true nature"
            ],
            intro3_title="The Power of Self-Love",
            intro3_content=[
                "This retreat offers a sacred container for those ready to embrace radical self-acceptance.",
                "You will discover how to release self-judgment and step into unconditional love.",
                "The transformative practices will continue to deepen your self-love journey."
            ],
            intro3_media=source.intro3_media,

            agenda_title="Retreat Journey",
            agenda_items=[
                {
                    "time": "Day 1",
                    "activity": "Opening Circle & Heart Awakening",
                    "description": "Connect with your intention and open your heart"
                },
                {
                    "time": "Day 2",
                    "activity": "Deep Immersion in Self-Love Practices",
                    "description": "Intensive guidance and sacred transmissions"
                },
                {
                    "time": "Day 3",
                    "activity": "Embodiment & Sacred Closure",
                    "description": "Anchor your transformation and receive blessings"
                }
            ],

            included_title="What You'll Receive",
            included_items=source.included_items,

            schedule_tagline=source.schedule_tagline,
            schedule_title="Session Schedule",
            schedule_items=[
                {
                    "date": "April 17th",
                    "sessions": [
                        {
                            "time": "7:00 PM EST",
                            "title": "Opening Heart Ceremony with Shunyamurti"
                        }
                    ]
                },
                {
                    "date": "April 18th",
                    "sessions": [
                        {
                            "time": "7:00 AM EST",
                            "title": "Heart-Opening Meditation"
                        },
                        {
                            "time": "1:00 PM EST",
                            "title": "Self-Love Teaching & Sacred Dialogue"
                        }
                    ]
                },
                {
                    "date": "April 19th",
                    "sessions": [
                        {
                            "time": "1:00 PM EST",
                            "title": "Closing Satsang & Divine Transmission"
                        }
                    ]
                }
            ],

            # Media - Same as source
            hero_background=source.hero_background,
            images=source.images,
            video_url=source.video_url,
            video_thumbnail=source.video_thumbnail,
            video_type=source.video_type,

            # Testimonials - Same as source
            testimonial_tagline=source.testimonial_tagline,
            testimonial_heading=source.testimonial_heading,
            testimonial_data=source.testimonial_data,

            # Portal/Selling Page Data - Modified
            invitation_video_url=source.invitation_video_url,
            announcement="Welcome to this sacred journey of self-love and spiritual awakening. We honor your courage to embrace wholeness.",
            about_content="This retreat offers a complete immersion into practices of self-acceptance and divine love, providing transformative tools for lasting spiritual growth.",
            about_image_url=source.about_image_url,
            preparation_instructions=[
                "Create a sacred, peaceful space for your retreat experience",
                "Ensure a reliable high-speed internet connection",
                "Have a journal ready for insights and reflections",
                "Test your Zoom connection before the opening session",
                "Set a heartfelt intention for your self-love journey",
                "Arrange to be fully present during all retreat sessions"
            ],
            faq_data=[
                {
                    "question": "What time zone are sessions scheduled in?",
                    "answer": "All sessions are in EST (Eastern Standard Time). Upon registration, you'll receive a schedule converted to your local time zone."
                },
                {
                    "question": "Are recordings available if I can't attend live?",
                    "answer": "Absolutely! All sessions are recorded. Lifetime access includes forever access to recordings. 12-day access provides access during the retreat plus 12 days after."
                },
                {
                    "question": "What's the difference between access levels?",
                    "answer": "Lifetime access ($645) grants permanent access to all retreat recordings and materials. 12-day access ($387) provides access during the retreat and for 12 days following."
                },
                {
                    "question": "Do I need prior meditation experience?",
                    "answer": "No prior experience needed! The teachings are accessible to everyone, from complete beginners to advanced practitioners."
                },
                {
                    "question": "Can I ask personal questions?",
                    "answer": "Yes! Each session includes dedicated Q&A time where you can ask Shunyamurti about your personal journey and practice."
                }
            ],
            live_schedule=[
                {
                    "date": "April 17th",
                    "day_label": "Thursday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "7:00 pm EST",
                            "title": "Opening Livestream Satsang with Shunyamurti",
                            "zoom_link": "https://zoom.us/j/example789",
                            "thumbnail_url": None
                        }
                    ]
                },
                {
                    "date": "April 18th",
                    "day_label": "Friday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "7:00 am EST",
                            "title": "Sacred Morning Heart Practice",
                            "zoom_link": "https://zoom.us/j/example789"
                        },
                        {
                            "time": "1:00 pm EST",
                            "title": "Afternoon Teaching: The Path of Self-Love",
                            "zoom_link": "https://zoom.us/j/example789",
                            "thumbnail_url": None
                        }
                    ]
                },
                {
                    "date": "April 19th",
                    "day_label": "Saturday",
                    "is_live": True,
                    "sessions": [
                        {
                            "time": "1:00 pm EST",
                            "title": "Completion Ceremony & Sacred Blessing",
                            "zoom_link": "https://zoom.us/j/example789",
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

        print(f"\n✅ Successfully created new retreat:")
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
    create_duplicate_retreat()
