"""
Quick script to fix the live_schedule dates in the retreat from September to December.
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.retreat import Retreat

SessionLocal = sessionmaker(bind=engine)

def fix_schedule_dates():
    """Update retreat live_schedule dates from September to December."""
    db = SessionLocal()

    try:
        print("Fixing retreat schedule dates...")

        # Get the retreat
        retreat = db.query(Retreat).filter(Retreat.slug == "hopeless-yet-hilarious").first()

        if not retreat:
            print("❌ Retreat not found!")
            return

        print(f"Updating schedule for: {retreat.title}")

        # Update the live_schedule to December 27-29
        retreat.live_schedule = [
            {
                "date": "December 27th",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "5:30 pm",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": None
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
                        "thumbnail_url": None
                    },
                    {
                        "time": "5:30 pm",
                        "title": "Livestream Satsang with Shunyamurti",
                        "zoom_link": "https://zoom.us/j/example",
                        "thumbnail_url": None
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
                        "thumbnail_url": None
                    }
                ]
            }
        ]

        db.commit()
        print("✅ Successfully updated retreat schedule dates to December 27-29, 2025!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_schedule_dates()
