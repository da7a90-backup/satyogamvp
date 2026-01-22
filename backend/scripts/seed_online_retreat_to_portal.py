"""
Seed script to migrate online retreat from OnlineRetreat (marketing) to Retreat (portal)
This creates a retreat in the portal system that users can register for and access.
"""
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import OnlineRetreat
from app.models.retreat import Retreat, RetreatType, RetreatPortal
import uuid


def seed_online_retreat_to_portal():
    """Migrate online retreat from marketing table to portal table"""
    db: Session = SessionLocal()

    try:
        print("🔄 Migrating online retreat from marketing to portal system...")

        # Get the online retreat from marketing table
        online_retreat = db.query(OnlineRetreat).filter(
            OnlineRetreat.slug == "hopeless-yet-hilarious"
        ).first()

        if not online_retreat:
            print("❌ Online retreat not found in marketing table!")
            return

        print(f"✅ Found marketing retreat: {online_retreat.title}")

        # Check if already exists in portal table
        existing = db.query(Retreat).filter(Retreat.slug == online_retreat.slug).first()
        if existing:
            print(f"⚠️  Retreat already exists in portal table. Updating...")
            retreat = existing
        else:
            retreat = Retreat(id=uuid.uuid4())
            db.add(retreat)

        # Basic info
        retreat.slug = online_retreat.slug
        retreat.title = online_retreat.title
        retreat.description = online_retreat.subtitle
        retreat.type = RetreatType.ONLINE
        retreat.is_published = True

        # Parse dates from fixed_date string
        # Example: "7-Day Retreat • December 27, 2024 - January 2, 2025"
        fixed_date = online_retreat.fixed_date or ""
        if "December 27, 2024" in fixed_date:
            retreat.start_date = datetime(2024, 12, 27)
            retreat.end_date = datetime(2025, 1, 2)
            retreat.duration_days = 7
        else:
            # Default to 3 days from now
            retreat.start_date = datetime.utcnow() + timedelta(days=7)
            retreat.end_date = retreat.start_date + timedelta(days=3)
            retreat.duration_days = 3

        # Pricing
        retreat.price_lifetime = float(online_retreat.base_price) if online_retreat.base_price else 197.00
        retreat.price_limited = float(online_retreat.base_price) * 0.5 if online_retreat.base_price else 97.00  # 50% for 12-day access

        # Location
        retreat.location = online_retreat.location or "Online"

        # Thumbnail
        retreat.thumbnail_url = online_retreat.hero_background

        # Selling page data (from OnlineRetreat model)
        retreat.invitation_video_url = online_retreat.video_url
        retreat.announcement = online_retreat.booking_tagline
        retreat.about_content = "\n\n".join(online_retreat.intro1_content or [])
        retreat.about_image_url = online_retreat.images[0] if online_retreat.images else None

        # Preparation instructions
        retreat.preparation_instructions = [
            {
                "title": "Create Your Sacred Space",
                "description": "Find a quiet, comfortable area free from distractions where you can sit undisturbed for meditation and teachings."
            },
            {
                "title": "Test Your Technology",
                "description": "Ensure your device, internet connection, and audio/video are working properly before the retreat begins."
            },
            {
                "title": "Gather Materials",
                "description": "Have a journal, pen, and any meditation cushions or blankets ready for the retreat experience."
            },
            {
                "title": "Set Your Intention",
                "description": "Take time before the retreat to reflect on what you hope to gain from this transformative experience."
            }
        ]

        # FAQ data
        retreat.faq_data = [
            {
                "question": "What time are the Livestream Satsangs with Shunyamurti?",
                "answer": "Sessions typically begin at 5:30 PM EST. Specific timing will be provided in your registration confirmation."
            },
            {
                "question": "Do I have to follow the live retreat schedule or can I create a schedule that best suits my home situation?",
                "answer": "While we encourage joining live sessions for the full energetic transmission, recordings will be available for your access period, allowing you to engage at times that work for you."
            },
            {
                "question": "How do I use Zoom?",
                "answer": "We'll provide detailed Zoom instructions via email before the retreat. You can join from any device with internet access."
            },
            {
                "question": "How do I view the satsangs?",
                "answer": "You'll receive Zoom links via email for live sessions. After the retreat, access recordings through your user dashboard portal."
            },
            {
                "question": "Where can I leave a question for Shunyamurti?",
                "answer": "You can submit questions through the retreat forum or during live Q&A sessions."
            },
            {
                "question": "What happens if the ashram loses electricity or the internet connection drops?",
                "answer": "While rare, technical issues may occur. We'll resume as quickly as possible and extend sessions if needed to ensure you receive the full content."
            }
        ]

        # Live schedule (from schedule_items)
        retreat.live_schedule = [
            {
                "date": "December 27th",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "5:30 pm",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",  # TODO: Add real link
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
                        "time": "6:30 am",
                        "title": "Asana and Pranayama Practice via Zoom",
                        "zoom_link": "https://zoom.us/j/example"
                    },
                    {
                        "time": "11:15 am",
                        "title": "Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": online_retreat.video_thumbnail
                    },
                    {
                        "time": "5:30 pm",
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
                        "time": "5:00 am",
                        "title": "Meditation via Zoom",
                        "zoom_link": "https://zoom.us/j/example"
                    },
                    {
                        "time": "11:15 am",
                        "title": "Closing Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": online_retreat.video_thumbnail
                    }
                ]
            }
        ]

        # Card display fields
        retreat.has_audio = True
        retreat.has_video = True

        # Forum enabled
        retreat.forum_enabled = True

        db.commit()
        print(f"✅ Successfully migrated retreat: {retreat.title}")
        print(f"   - ID: {retreat.id}")
        print(f"   - Slug: {retreat.slug}")
        print(f"   - Type: {retreat.type.value}")
        print(f"   - Published: {retreat.is_published}")
        print(f"   - Price (Lifetime): ${retreat.price_lifetime}")
        print(f"   - Price (12-day): ${retreat.price_limited}")

        # Create sample portal content
        print("\n🔄 Creating sample portal content...")

        # Check if portal already exists
        existing_portal = db.query(RetreatPortal).filter(
            RetreatPortal.retreat_id == retreat.id
        ).first()

        if existing_portal:
            print("⚠️  Portal content already exists. Skipping...")
        else:
            portal = RetreatPortal(
                id=uuid.uuid4(),
                retreat_id=retreat.id,
                title="Day 1 Content",
                description="Portal content for Day 1 of the retreat",
                order_index=0,
                content={
                    "days": [
                        {
                            "day_number": 1,
                            "title": "Day 1",
                            "sessions": [
                                {
                                    "time": "5:30 pm",
                                    "session_title": "Opening Satsang",
                                    "type": "livestream",
                                    "zoom_link": "https://zoom.us/j/example",
                                    "thumbnail_url": online_retreat.video_thumbnail,
                                    "duration": 90,
                                    "has_video": True,
                                    "has_audio": True,
                                    "is_text": False,
                                    "description": "Opening session with Shunyamurti",
                                    "date": "Dec 27th, 2024"
                                }
                            ]
                        }
                    ]
                }
            )
            db.add(portal)
            db.commit()
            print("✅ Portal content created")

        print("\n✅ Migration complete!")
        print("\nNext steps:")
        print("1. The retreat is now available at /dashboard/user/retreats")
        print("2. Users can purchase lifetime or 12-day access")
        print("3. After purchase, they'll access the portal content")
        print("4. Admin can update portal content as needed")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_online_retreat_to_portal()
