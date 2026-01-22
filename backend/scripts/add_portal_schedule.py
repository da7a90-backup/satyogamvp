"""
Quick script to add portal content with class schedule to a retreat
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat, RetreatPortal
import uuid

def add_portal_schedule():
    """Add portal content with schedule to the first retreat"""
    db: Session = SessionLocal()

    try:
        print("🔄 Adding portal schedule to retreat...")

        # Get the first retreat
        retreat = db.query(Retreat).filter(
            Retreat.slug == "hopeless-yet-hilarious"
        ).first()

        if not retreat:
            print("❌ Retreat not found!")
            return

        print(f"✅ Found retreat: {retreat.title}")

        # Check if portal already exists
        existing_portal = db.query(RetreatPortal).filter(
            RetreatPortal.retreat_id == retreat.id
        ).first()

        if existing_portal:
            print("⚠️  Portal already exists, updating...")
            portal = existing_portal
        else:
            portal = RetreatPortal(
                id=uuid.uuid4(),
                retreat_id=retreat.id,
                order_index=0
            )
            db.add(portal)

        portal.title = "Retreat Schedule"
        portal.description = "Full retreat schedule with all sessions"
        portal.content = {
            "days": [
                {
                    "day_number": 1,
                    "title": "Day 1",
                    "sessions": [
                        {
                            "time": "5:30 pm",
                            "session_title": "Opening Satsang with Shunyamurti",
                            "type": "teaching",
                            "teaching_id": "opening-satsang",
                            "thumbnail_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/53dd8bf2-0d2a-4550-c518-29bd6a81dd00/public",
                            "duration": 90,
                            "has_video": True,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Join us for the opening teaching as we embark on this transformative journey together.",
                            "date": "Dec 27th, 2024",
                            "youtube_live_id": "dQw4w9WgXcQ"
                        }
                    ]
                },
                {
                    "day_number": 2,
                    "title": "Day 2",
                    "sessions": [
                        {
                            "time": "5:00 am",
                            "session_title": "Morning Meditation",
                            "type": "meditation",
                            "zoom_link": "https://zoom.us/j/example123",
                            "duration": 45,
                            "has_video": False,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Start your day with guided meditation.",
                            "date": "Dec 28th, 2024"
                        },
                        {
                            "time": "11:15 am",
                            "session_title": "Teaching: The Path of Self-Inquiry",
                            "type": "teaching",
                            "teaching_id": "self-inquiry",
                            "thumbnail_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/53dd8bf2-0d2a-4550-c518-29bd6a81dd00/public",
                            "duration": 120,
                            "has_video": True,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Deep dive into the practice of self-inquiry and consciousness.",
                            "date": "Dec 28th, 2024",
                            "youtube_live_id": "dQw4w9WgXcQ"
                        },
                        {
                            "time": "5:30 pm",
                            "session_title": "Evening Satsang",
                            "type": "teaching",
                            "teaching_id": "evening-satsang",
                            "thumbnail_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/53dd8bf2-0d2a-4550-c518-29bd6a81dd00/public",
                            "duration": 90,
                            "has_video": True,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Evening teaching and Q&A session.",
                            "date": "Dec 28th, 2024",
                            "youtube_live_id": "dQw4w9WgXcQ"
                        }
                    ]
                },
                {
                    "day_number": 3,
                    "title": "Day 3",
                    "sessions": [
                        {
                            "time": "5:00 am",
                            "session_title": "Morning Meditation",
                            "type": "meditation",
                            "zoom_link": "https://zoom.us/j/example123",
                            "duration": 45,
                            "has_video": False,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Morning meditation practice.",
                            "date": "Dec 29th, 2024"
                        },
                        {
                            "time": "11:15 am",
                            "session_title": "Closing Ceremony",
                            "type": "teaching",
                            "teaching_id": "closing-ceremony",
                            "thumbnail_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/53dd8bf2-0d2a-4550-c518-29bd6a81dd00/public",
                            "duration": 120,
                            "has_video": True,
                            "has_audio": True,
                            "is_text": False,
                            "description": "Closing teachings and integration.",
                            "date": "Dec 29th, 2024",
                            "youtube_live_id": "dQw4w9WgXcQ"
                        }
                    ]
                }
            ]
        }

        db.commit()
        print("✅ Successfully added portal schedule!")
        print(f"   - Portal ID: {portal.id}")
        print(f"   - Days: {len(portal.content['days'])}")
        print(f"   - Total sessions: {sum(len(day['sessions']) for day in portal.content['days'])}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_portal_schedule()
