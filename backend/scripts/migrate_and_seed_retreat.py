"""
Migration script to add selling page fields to retreats table and seed from online_retreats.

This script:
1. Adds all missing selling page columns to the retreats table
2. Copies retreat data from online_retreats into retreats table
"""

import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.static_content import OnlineRetreat
from app.models.retreat import Retreat, RetreatType

# Create database engine
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)

def add_missing_columns(db):
    """Add missing selling page columns to retreats table."""
    print("Adding missing columns to retreats table...")

    columns_to_add = [
        ("subtitle", "TEXT"),
        ("booking_tagline", "TEXT"),
        ("intro1_title", "TEXT"),
        ("intro1_content", "JSONB"),
        ("intro2_title", "TEXT"),
        ("intro2_content", "JSONB"),
        ("intro3_title", "TEXT"),
        ("intro3_content", "JSONB"),
        ("intro3_media", "VARCHAR(500)"),
        ("agenda_title", "TEXT"),
        ("agenda_items", "JSONB"),
        ("included_title", "TEXT"),
        ("included_items", "JSONB"),
        ("schedule_tagline", "VARCHAR(200)"),
        ("schedule_title", "VARCHAR(500)"),
        ("schedule_items", "JSONB"),
        ("hero_background", "VARCHAR(500)"),
        ("images", "JSONB"),
        ("video_url", "VARCHAR(500)"),
        ("video_thumbnail", "VARCHAR(500)"),
        ("video_type", "VARCHAR(50)"),
        ("testimonial_tagline", "VARCHAR(200)"),
        ("testimonial_heading", "VARCHAR(500)"),
        ("testimonial_data", "JSONB"),
        ("price_options", "JSONB"),
        ("member_discount_percentage", "INTEGER"),
        ("scholarship_available", "BOOLEAN DEFAULT FALSE"),
        ("scholarship_deadline", "VARCHAR(200)"),
        ("application_url", "VARCHAR(500)"),
    ]

    for column_name, column_type in columns_to_add:
        try:
            # Check if column exists
            result = db.execute(text(f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='retreats' AND column_name='{column_name}'
            """))

            if not result.fetchone():
                # Column doesn't exist, add it
                print(f"  Adding column: {column_name}")
                db.execute(text(f"""
                    ALTER TABLE retreats
                    ADD COLUMN {column_name} {column_type}
                """))
                db.commit()
            else:
                print(f"  Column {column_name} already exists, skipping")
        except Exception as e:
            print(f"  Error adding column {column_name}: {e}")
            db.rollback()

    print("✅ Column migration complete")


def seed_retreat_from_online_retreat(db):
    """Seed retreat from online_retreats table."""
    print("\nSeeding retreat from online_retreats table...")

    # Get the online retreat
    online_retreat = db.query(OnlineRetreat).filter(
        OnlineRetreat.slug == "hopeless-yet-hilarious"
    ).first()

    if not online_retreat:
        print("❌ Online retreat not found!")
        return

    # Check if retreat already exists
    existing = db.query(Retreat).filter(Retreat.slug == online_retreat.slug).first()
    if existing:
        print(f"✅ Retreat '{online_retreat.title}' already exists in retreats table")
        return

    print(f"Creating retreat: {online_retreat.title}")

    # Parse dates from fixed_date string
    # Example: "December 27-29, 2025"
    start_date = datetime(2025, 12, 27)  # Fallback
    end_date = datetime(2025, 12, 29)    # Fallback

    # Create the retreat
    retreat = Retreat(
        slug=online_retreat.slug,
        title=online_retreat.title,
        subtitle=online_retreat.subtitle,
        description=online_retreat.subtitle,  # Use subtitle as description
        type=RetreatType.ONLINE,
        start_date=start_date,
        end_date=end_date,
        price_lifetime=float(online_retreat.base_price) if online_retreat.base_price else 395.00,
        price_limited=float(online_retreat.base_price) * 0.6 if online_retreat.base_price else 237.00,  # 40% discount
        price_options=online_retreat.price_options,
        member_discount_percentage=online_retreat.member_discount_percentage,
        scholarship_available=online_retreat.scholarship_available or False,
        scholarship_deadline=online_retreat.scholarship_deadline,
        application_url=online_retreat.application_url,
        location=online_retreat.location or "Online",
        max_participants=None,
        is_published=True,
        thumbnail_url=online_retreat.hero_background,

        # Selling page content
        booking_tagline=online_retreat.booking_tagline,
        intro1_title=online_retreat.intro1_title,
        intro1_content=online_retreat.intro1_content,
        intro2_title=online_retreat.intro2_title,
        intro2_content=online_retreat.intro2_content,
        intro3_title=online_retreat.intro3_title,
        intro3_content=online_retreat.intro3_content,
        intro3_media=online_retreat.intro3_media,
        agenda_title=online_retreat.agenda_title,
        agenda_items=online_retreat.agenda_items,
        included_title=online_retreat.included_title,
        included_items=online_retreat.included_items,

        # Schedule
        schedule_tagline=online_retreat.schedule_tagline,
        schedule_title=online_retreat.schedule_title,
        schedule_items=online_retreat.schedule_items,

        # Media
        hero_background=online_retreat.hero_background,
        images=online_retreat.images,
        video_url=online_retreat.video_url,
        video_thumbnail=online_retreat.video_thumbnail,
        video_type=online_retreat.video_type,

        # Testimonials
        testimonial_tagline=online_retreat.testimonial_tagline,
        testimonial_heading=online_retreat.testimonial_heading,
        testimonial_data=online_retreat.testimonial_data,

        # Portal data (to be filled by admin later)
        invitation_video_url=online_retreat.video_url,  # Use same video for now
        announcement="Welcome to this transformative online retreat!",
        about_content=online_retreat.intro1_content[0] if online_retreat.intro1_content else None,
        preparation_instructions=[
            "Set up a quiet, comfortable meditation space",
            "Ensure stable internet connection",
            "Have a journal ready for reflections",
            "Test your Zoom connection before the retreat begins"
        ],
        faq_data=[
            {
                "question": "What time are the Livestream Satsangs with Shunyamurti?",
                "answer": "The schedule will be shared before the retreat begins."
            },
            {
                "question": "How do I view the satsangs?",
                "answer": "You will receive Zoom links via email once registered."
            }
        ],
        live_schedule=[
            {
                "date": "December 27th",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "5:30 pm",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": online_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "December 28th",
                "day_label": "Saturday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "5:00 am",
                        "title": "Meditation via Zoom",
                        "zoom_link": "https://zoom.us/j/example"
                    },
                    {
                        "time": "11:15 am",
                        "title": "Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": online_retreat.video_thumbnail
                    }
                ]
            },
            {
                "date": "December 29th",
                "day_label": "Sunday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "11:15 am",
                        "title": "Closing Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": online_retreat.video_thumbnail
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

    db.add(retreat)
    db.commit()
    db.refresh(retreat)

    print(f"✅ Successfully seeded retreat: {retreat.title} (ID: {retreat.id})")
    print(f"   - Slug: {retreat.slug}")
    print(f"   - Type: {retreat.type.value}")
    print(f"   - Price (Lifetime): ${retreat.price_lifetime}")
    print(f"   - Price (12-day): ${retreat.price_limited}")
    print(f"   - Published: {retreat.is_published}")


def main():
    """Run the migration and seed."""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("RETREAT TABLE MIGRATION & SEED SCRIPT")
        print("=" * 60)

        # Step 1: Add missing columns
        add_missing_columns(db)

        # Step 2: Seed retreat
        seed_retreat_from_online_retreat(db)

        print("\n" + "=" * 60)
        print("✅ MIGRATION & SEED COMPLETE!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
