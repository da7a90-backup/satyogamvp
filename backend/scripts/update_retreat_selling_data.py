"""
Quick script to update existing retreat with selling page data from online_retreats.
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.static_content import OnlineRetreat
from app.models.retreat import Retreat

SessionLocal = sessionmaker(bind=engine)

def update_retreat_selling_data():
    """Update retreat with selling page data from online_retreats."""
    db = SessionLocal()

    try:
        print("Updating retreat selling page data...")

        # Get the online retreat
        online_retreat = db.query(OnlineRetreat).filter(
            OnlineRetreat.slug == "hopeless-yet-hilarious"
        ).first()

        if not online_retreat:
            print("❌ Online retreat not found!")
            return

        # Get the retreat
        retreat = db.query(Retreat).filter(Retreat.slug == online_retreat.slug).first()

        if not retreat:
            print("❌ Retreat not found!")
            return

        print(f"Updating retreat: {retreat.title}")

        # Update all selling page fields
        retreat.subtitle = online_retreat.subtitle
        retreat.booking_tagline = online_retreat.booking_tagline
        retreat.intro1_title = online_retreat.intro1_title
        retreat.intro1_content = online_retreat.intro1_content
        retreat.intro2_title = online_retreat.intro2_title
        retreat.intro2_content = online_retreat.intro2_content
        retreat.intro3_title = online_retreat.intro3_title
        retreat.intro3_content = online_retreat.intro3_content
        retreat.intro3_media = online_retreat.intro3_media
        retreat.agenda_title = online_retreat.agenda_title
        retreat.agenda_items = online_retreat.agenda_items
        retreat.included_title = online_retreat.included_title
        retreat.included_items = online_retreat.included_items
        retreat.schedule_tagline = online_retreat.schedule_tagline
        retreat.schedule_title = online_retreat.schedule_title
        retreat.schedule_items = online_retreat.schedule_items
        retreat.hero_background = online_retreat.hero_background
        retreat.images = online_retreat.images
        retreat.video_url = online_retreat.video_url
        retreat.video_thumbnail = online_retreat.video_thumbnail
        retreat.video_type = online_retreat.video_type
        retreat.testimonial_tagline = online_retreat.testimonial_tagline
        retreat.testimonial_heading = online_retreat.testimonial_heading
        retreat.testimonial_data = online_retreat.testimonial_data
        retreat.price_options = online_retreat.price_options
        retreat.member_discount_percentage = online_retreat.member_discount_percentage
        retreat.scholarship_available = online_retreat.scholarship_available
        retreat.scholarship_deadline = online_retreat.scholarship_deadline
        retreat.application_url = online_retreat.application_url

        db.commit()
        print("✅ Successfully updated retreat selling page data!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_retreat_selling_data()
