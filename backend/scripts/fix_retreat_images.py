"""
Fix retreat images to use CDN URLs from online_retreats table.
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.static_content import OnlineRetreat
from app.models.retreat import Retreat

SessionLocal = sessionmaker(bind=engine)

def fix_images():
    """Update retreat images with CDN URLs from online_retreats."""
    db = SessionLocal()

    try:
        print("Fixing retreat images...")

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

        print(f"Updating images for: {retreat.title}")
        print(f"Online retreat images: {online_retreat.images}")

        # Update images from online_retreat
        retreat.images = online_retreat.images
        retreat.hero_background = online_retreat.hero_background
        retreat.intro3_media = online_retreat.intro3_media
        retreat.video_url = online_retreat.video_url
        retreat.video_thumbnail = online_retreat.video_thumbnail
        retreat.video_type = online_retreat.video_type

        db.commit()
        print("✅ Successfully updated retreat images with CDN URLs!")
        print(f"New images: {retreat.images}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_images()
