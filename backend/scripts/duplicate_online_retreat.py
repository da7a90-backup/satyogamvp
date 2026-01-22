"""
Script to duplicate an existing online retreat with modified details for testing.

This script:
1. Finds the existing online retreat
2. Creates a duplicate with same images but different title, description, prices
3. Ensures the user is not registered to the new retreat
"""

import sys
import os
from datetime import datetime, timedelta
import uuid

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.retreat import Retreat, RetreatType, RetreatPortal

# Create database engine
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)


def duplicate_online_retreat(db):
    """Duplicate an existing online retreat with modified details."""
    print("\nFinding existing online retreat...")

    # Get the first online retreat
    existing_retreat = db.query(Retreat).filter(
        Retreat.type == RetreatType.ONLINE,
        Retreat.is_published == True
    ).first()

    if not existing_retreat:
        print("❌ No online retreat found!")
        return

    print(f"Found retreat: {existing_retreat.title}")
    print(f"Slug: {existing_retreat.slug}")

    # Create new slug
    new_slug = "awakening-consciousness-2026"

    # Check if new retreat already exists
    existing_new = db.query(Retreat).filter(Retreat.slug == new_slug).first()
    if existing_new:
        print(f"❌ Retreat with slug '{new_slug}' already exists!")
        print("   Deleting existing retreat to create a fresh one...")
        db.delete(existing_new)
        db.commit()

    print(f"\nCreating duplicate retreat with slug: {new_slug}")

    # Create new dates (January 2026)
    start_date = datetime(2026, 1, 23)
    end_date = datetime(2026, 1, 25)

    # Create the duplicate retreat with modified details
    new_retreat = Retreat(
        id=uuid.uuid4(),  # New UUID
        slug=new_slug,
        title="Awakening Consciousness: A New Beginning",
        subtitle="Journey into the depths of consciousness through transformative practices and sacred teachings",
        description="Experience a profound transformation as we explore the nature of consciousness and awaken to your true self.",
        type=RetreatType.ONLINE,
        start_date=start_date,
        end_date=end_date,

        # Modified prices
        price_lifetime=495.00,  # Different from original
        price_limited=297.00,   # Different from original

        # Keep same price_options structure if exists, or create new
        price_options=existing_retreat.price_options,
        member_discount_percentage=existing_retreat.member_discount_percentage,
        scholarship_available=existing_retreat.scholarship_available,
        scholarship_deadline="January 15, 2026",
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
        booking_tagline="Transform Your Consciousness in 3 Powerful Days",
        intro1_title="A Sacred Journey of Awakening",
        intro1_content=[
            "Join us for an extraordinary online retreat that will guide you through the profound journey of consciousness awakening.",
            "Over three transformative days, you will receive direct teachings from Shunyamurti that illuminate the path to Self-realization.",
            "This retreat offers a unique opportunity to deepen your spiritual practice and connect with a global community of seekers."
        ],
        intro2_title="What You Will Experience",
        intro2_content=[
            "Live Satsangs with Shunyamurti exploring the deepest truths of existence",
            "Guided meditations to activate higher states of consciousness",
            "Sacred practices for spiritual awakening and integration",
            "Q&A sessions for personal guidance on your spiritual journey"
        ],
        intro3_title="Transform Your Life",
        intro3_content=[
            "This retreat is designed for those ready to break through the illusions of the ego and discover their true nature.",
            "You will learn powerful techniques for maintaining awakened awareness in daily life.",
            "The teachings you receive will serve as a foundation for continued spiritual growth and evolution."
        ],
        intro3_media=existing_retreat.intro3_media,

        agenda_title="Retreat Agenda",
        agenda_items=[
            {"time": "Day 1", "activity": "Opening Satsang & Meditation", "description": "Begin your journey with live teachings"},
            {"time": "Day 2", "activity": "Deep Dive Sessions", "description": "Intensive practices and Q&A"},
            {"time": "Day 3", "activity": "Integration & Closing", "description": "Integrate your insights and receive final teachings"}
        ],

        included_title="What's Included",
        included_items=[
            {"icon": "video", "title": "Live Streaming Sessions", "description": "Participate in real-time teachings"},
            {"icon": "audio", "title": "Lifetime Access", "description": "Replay recordings anytime"},
            {"icon": "book", "title": "Retreat Materials", "description": "Comprehensive spiritual resources"},
            {"icon": "community", "title": "Global Community", "description": "Connect with fellow seekers"}
        ],

        # Schedule
        schedule_tagline=existing_retreat.schedule_tagline,
        schedule_title="Retreat Schedule",
        schedule_items=[
            {
                "date": "January 23rd",
                "sessions": [
                    {"time": "6:00 PM EST", "title": "Opening Livestream Satsang with Shunyamurti"}
                ]
            },
            {
                "date": "January 24th",
                "sessions": [
                    {"time": "6:00 AM EST", "title": "Morning Meditation"},
                    {"time": "12:00 PM EST", "title": "Livestream Satsang & Q&A"}
                ]
            },
            {
                "date": "January 25th",
                "sessions": [
                    {"time": "12:00 PM EST", "title": "Closing Livestream Satsang"}
                ]
            }
        ],

        # Testimonials (keep same)
        testimonial_tagline=existing_retreat.testimonial_tagline,
        testimonial_heading=existing_retreat.testimonial_heading,
        testimonial_data=existing_retreat.testimonial_data,

        # Portal/Selling Page Data
        invitation_video_url=existing_retreat.invitation_video_url,
        announcement="Welcome to this sacred journey of consciousness awakening! We are honored to have you join us.",
        about_content="This retreat offers a deep dive into the nature of consciousness, providing you with tools and teachings for lasting transformation.",
        about_image_url=existing_retreat.about_image_url,
        preparation_instructions=[
            "Create a sacred space for meditation and contemplation",
            "Ensure you have a reliable internet connection",
            "Prepare a journal for insights and reflections",
            "Test your Zoom setup prior to the retreat",
            "Set intention for your journey of awakening"
        ],
        faq_data=[
            {
                "question": "When are the live sessions?",
                "answer": "The retreat includes 5 live sessions over 3 days. All times are in EST. You will receive the detailed schedule upon registration."
            },
            {
                "question": "What if I miss a live session?",
                "answer": "All sessions are recorded and available for replay. Lifetime access members can watch anytime; 12-day access members have 12 days after the retreat ends."
            },
            {
                "question": "What's the difference between lifetime and 12-day access?",
                "answer": "Lifetime access ($495) gives you permanent access to all recordings. 12-day access ($297) gives you access during the retreat and for 12 days after it ends."
            },
            {
                "question": "Do I need prior meditation experience?",
                "answer": "No prior experience is necessary. The teachings are accessible to beginners while offering depth for experienced practitioners."
            }
        ],
        live_schedule=[
            {
                "date": "January 23rd",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "6:00 pm EST",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example123",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "January 24th",
                "day_label": "Saturday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "6:00 am EST",
                        "title": "Morning Meditation",
                        "zoom_link": "https://zoom.us/j/example123"
                    },
                    {
                        "time": "12:00 pm EST",
                        "title": "Deep Dive Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example123",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "January 25th",
                "day_label": "Sunday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "12:00 pm EST",
                        "title": "Closing Livestream Satsang & Integration",
                        "zoom_link": "https://zoom.us/j/example123",
                        "thumbnail_url": existing_retreat.video_thumbnail
                    }
                ]
            }
        ],

        # Card display
        duration_days=3,
        has_audio=True,
        has_video=True,

        # Forum
        forum_enabled=True
    )

    db.add(new_retreat)
    db.commit()
    db.refresh(new_retreat)

    print(f"\n✅ Successfully created duplicate retreat!")
    print(f"   - ID: {new_retreat.id}")
    print(f"   - Title: {new_retreat.title}")
    print(f"   - Slug: {new_retreat.slug}")
    print(f"   - Type: {new_retreat.type.value}")
    print(f"   - Start Date: {new_retreat.start_date}")
    print(f"   - End Date: {new_retreat.end_date}")
    print(f"   - Price (Lifetime): ${new_retreat.price_lifetime}")
    print(f"   - Price (12-day): ${new_retreat.price_limited}")
    print(f"   - Published: {new_retreat.is_published}")
    print(f"\n✅ You can now test registration with this new retreat!")
    print(f"   URL: http://localhost:3000/retreats/online/{new_retreat.slug}")


def main():
    """Run the duplication script."""
    db = SessionLocal()

    try:
        print("=" * 70)
        print("DUPLICATE ONLINE RETREAT SCRIPT")
        print("=" * 70)

        duplicate_online_retreat(db)

        print("\n" + "=" * 70)
        print("✅ DUPLICATION COMPLETE!")
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
