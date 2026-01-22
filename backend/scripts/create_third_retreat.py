"""
Script to create a third online retreat for testing registration flow.
Uses same images as original but different title, description, prices, and dates.
"""

import sys
import os
from datetime import datetime, timedelta
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.retreat import Retreat, RetreatType

engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)


def create_third_retreat(db):
    """Create a third online retreat for testing."""
    print("\nFinding existing online retreat for image references...")

    # Get the first online retreat for images
    existing_retreat = db.query(Retreat).filter(
        Retreat.type == RetreatType.ONLINE,
        Retreat.is_published == True
    ).first()

    if not existing_retreat:
        print("❌ No online retreat found!")
        return

    print(f"Found retreat: {existing_retreat.title}")

    # Create new slug
    new_slug = "inner-transformation-spring-2026"

    # Check if retreat already exists
    existing_new = db.query(Retreat).filter(Retreat.slug == new_slug).first()
    if existing_new:
        print(f"Retreat with slug '{new_slug}' already exists. Deleting...")
        db.delete(existing_new)
        db.commit()

    print(f"\nCreating new retreat with slug: {new_slug}")

    # Create new dates (March 2026)
    start_date = datetime(2026, 3, 13)
    end_date = datetime(2026, 3, 15)

    # Create the new retreat
    new_retreat = Retreat(
        id=uuid.uuid4(),
        slug=new_slug,
        title="Inner Transformation: The Path to Radical Healing",
        subtitle="Discover the power of inner transformation through sacred practices and profound teachings",
        description="Join us for an intensive 3-day journey into the depths of consciousness and healing.",
        type=RetreatType.ONLINE,
        start_date=start_date,
        end_date=end_date,

        # Different prices than the other two retreats
        price_lifetime=595.00,
        price_limited=357.00,

        price_options=existing_retreat.price_options,
        member_discount_percentage=existing_retreat.member_discount_percentage,
        scholarship_available=existing_retreat.scholarship_available,
        scholarship_deadline="March 1, 2026",
        application_url=existing_retreat.application_url,
        location="Online via Zoom",
        max_participants=None,
        is_published=True,

        # Same images as original
        thumbnail_url=existing_retreat.thumbnail_url,
        hero_background=existing_retreat.hero_background,
        images=existing_retreat.images,
        video_url=existing_retreat.video_url,
        video_thumbnail=existing_retreat.video_thumbnail,
        video_type=existing_retreat.video_type,

        # Modified selling page content
        booking_tagline="Experience Deep Healing Over 3 Transformative Days",
        intro1_title="Embark on a Journey of Inner Transformation",
        intro1_content=[
            "This intensive online retreat offers a unique opportunity to dive deep into the practice of self-inquiry and radical healing.",
            "Through live satsangs, guided meditations, and transformative teachings, you will discover the path to lasting inner peace.",
            "Shunyamurti will guide you through powerful practices that unlock the doorway to your true Self."
        ],
        intro2_title="What Awaits You",
        intro2_content=[
            "Profound teachings on the nature of consciousness and reality",
            "Intensive meditation practices for deep healing",
            "Live Q&A sessions to address your personal spiritual questions",
            "Sacred practices for breaking free from limiting beliefs"
        ],
        intro3_title="Healing from Within",
        intro3_content=[
            "This retreat is perfect for those seeking genuine transformation and healing at the deepest level.",
            "You will learn to release old patterns and embrace your authentic nature.",
            "The practices you receive will continue to support your journey long after the retreat ends."
        ],
        intro3_media=existing_retreat.intro3_media,

        agenda_title="Retreat Schedule",
        agenda_items=[
            {"time": "Day 1", "activity": "Opening Ceremony & Introduction", "description": "Set intentions and receive orientation"},
            {"time": "Day 2", "activity": "Deep Dive into Healing Practices", "description": "Intensive sessions and personal guidance"},
            {"time": "Day 3", "activity": "Integration & Completion", "description": "Integrate insights and receive final transmissions"}
        ],

        included_title="Your Retreat Includes",
        included_items=[
            {"icon": "video", "title": "Live Video Sessions", "description": "Real-time participation in all teachings"},
            {"icon": "audio", "title": "Unlimited Replays", "description": "Lifetime or 12-day access to recordings"},
            {"icon": "book", "title": "Comprehensive Materials", "description": "Complete spiritual practice guides"},
            {"icon": "community", "title": "Sacred Community", "description": "Join seekers from around the world"}
        ],

        schedule_tagline=existing_retreat.schedule_tagline,
        schedule_title="Daily Sessions",
        schedule_items=[
            {
                "date": "March 13th",
                "sessions": [
                    {"time": "7:00 PM EST", "title": "Opening Satsang with Shunyamurti"}
                ]
            },
            {
                "date": "March 14th",
                "sessions": [
                    {"time": "7:00 AM EST", "title": "Morning Meditation Practice"},
                    {"time": "1:00 PM EST", "title": "Afternoon Teaching & Q&A"}
                ]
            },
            {
                "date": "March 15th",
                "sessions": [
                    {"time": "1:00 PM EST", "title": "Final Satsang & Integration"}
                ]
            }
        ],

        testimonial_tagline=existing_retreat.testimonial_tagline,
        testimonial_heading=existing_retreat.testimonial_heading,
        testimonial_data=existing_retreat.testimonial_data,

        invitation_video_url=existing_retreat.invitation_video_url,
        announcement="Welcome to this profound journey of inner transformation and healing. We are grateful to share this sacred time with you.",
        about_content="This retreat provides a complete immersion into the practices of self-inquiry and spiritual healing, offering tools for lasting transformation.",
        about_image_url=existing_retreat.about_image_url,
        preparation_instructions=[
            "Dedicate a quiet, comfortable space for the retreat",
            "Ensure you have a stable high-speed internet connection",
            "Prepare a journal for recording insights and experiences",
            "Test your Zoom setup before the first session",
            "Set a clear intention for your healing journey",
            "Plan to minimize distractions during retreat hours"
        ],
        faq_data=[
            {
                "question": "What time zone are the sessions in?",
                "answer": "All times are listed in EST (Eastern Standard Time). You will receive a detailed schedule with your local time zone upon registration."
            },
            {
                "question": "Can I watch the recordings if I miss a live session?",
                "answer": "Yes! All sessions are recorded. Lifetime access members can watch anytime forever. 12-day access members can watch for 12 days after the retreat concludes."
            },
            {
                "question": "What's included with each access level?",
                "answer": "Lifetime access ($595) gives you permanent access to all retreat recordings and materials. 12-day access ($357) gives you access during the retreat and for 12 days afterward."
            },
            {
                "question": "Is this retreat suitable for beginners?",
                "answer": "Yes! While the teachings go deep, they are accessible to all levels. Beginners and experienced practitioners alike will find profound value."
            },
            {
                "question": "Will there be opportunities for personal questions?",
                "answer": "Yes! Each day includes Q&A time where you can ask Shunyamurti questions about your practice and journey."
            }
        ],
        live_schedule=[
            {
                "date": "March 13th",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "7:00 pm EST",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example456",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "March 14th",
                "day_label": "Saturday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "7:00 am EST",
                        "title": "Sacred Morning Meditation",
                        "zoom_link": "https://zoom.us/j/example456"
                    },
                    {
                        "time": "1:00 pm EST",
                        "title": "Afternoon Teaching: The Path of Healing",
                        "zoom_link": "https://zoom.us/j/example456",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "March 15th",
                "day_label": "Sunday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "1:00 pm EST",
                        "title": "Completion Satsang & Sacred Transmission",
                        "zoom_link": "https://zoom.us/j/example456",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            }
        ],

        duration_days=3,
        has_audio=True,
        has_video=True,
        forum_enabled=True
    )

    db.add(new_retreat)
    db.commit()
    db.refresh(new_retreat)

    print(f"\n✅ Successfully created new retreat!")
    print(f"   - ID: {new_retreat.id}")
    print(f"   - Title: {new_retreat.title}")
    print(f"   - Slug: {new_retreat.slug}")
    print(f"   - Type: {new_retreat.type.value}")
    print(f"   - Start Date: {new_retreat.start_date}")
    print(f"   - End Date: {new_retreat.end_date}")
    print(f"   - Price (Lifetime): ${new_retreat.price_lifetime}")
    print(f"   - Price (12-day): ${new_retreat.price_limited}")
    print(f"   - Published: {new_retreat.is_published}")
    print(f"\n✅ You can now test registration with this retreat!")
    print(f"   Selling page: http://localhost:3000/retreats/online/{new_retreat.slug}")


def main():
    """Run the script."""
    db = SessionLocal()

    try:
        print("=" * 70)
        print("CREATE THIRD ONLINE RETREAT FOR TESTING")
        print("=" * 70)

        create_third_retreat(db)

        print("\n" + "=" * 70)
        print("✅ RETREAT CREATED!")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
