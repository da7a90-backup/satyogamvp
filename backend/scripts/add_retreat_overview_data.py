"""
Add sample overview data (about_content, about_image_url, overview_sections)
to the 'live-free-of-anxiety' retreat for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat

def add_overview_data():
    db: Session = SessionLocal()

    try:
        # Find the retreat
        retreat = db.query(Retreat).filter(Retreat.slug == "live-free-of-anxiety").first()

        if not retreat:
            print("❌ Retreat 'live-free-of-anxiety' not found")
            return

        print(f"✓ Found retreat: {retreat.title}")

        # Add about_content and about_image_url
        retreat.about_content = """This transformative 3-day online retreat offers practical tools and profound teachings to help you break free from the grip of anxiety and discover lasting inner peace.

Through a combination of meditation practices, philosophical insights, and Q&A sessions, you'll learn to understand the root causes of anxiety and develop the spiritual strength to transcend fear-based patterns.

Join Shunyamurti and our global community for this powerful journey toward liberation from anxiety and the awakening of your true nature."""

        retreat.about_image_url = None  # Admin will add actual images later

        # Add additional overview sections (without images for now - admin will add them)
        retreat.overview_sections = [
            {
                "image_url": None,
                "content": "In this retreat, we explore the deeper dimensions of consciousness that lie beneath surface-level anxiety. You'll discover how to access the inner sanctuary of peace that exists beyond all mental disturbances. Through guided meditations and transformative practices, you'll learn to rest in the eternal stillness of your true Self."
            },
            {
                "image_url": None,
                "content": "Experience the power of community support as we journey together through these teachings. Participants from around the world join in sacred practice, creating a field of collective consciousness that amplifies individual transformation. The retreat includes live sessions, recorded teachings, and opportunities for personal reflection and integration of the practices into daily life."
            }
        ]

        db.commit()

        print("\n" + "="*80)
        print("✅ OVERVIEW DATA ADDED SUCCESSFULLY")
        print("="*80)
        print(f"\nRetreat: {retreat.title}")
        print(f"About content length: {len(retreat.about_content)} characters")
        print(f"About image: {retreat.about_image_url}")
        print(f"Overview sections: {len(retreat.overview_sections)} sections added")
        print("\n✓ You can now view the retreat summary sections in the Overview tab!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_overview_data()
