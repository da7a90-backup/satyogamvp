"""
Link the 'Hopeless Yet Hilarious' product to its retreat and update portal content.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.product import Product
from app.models.retreat import Retreat, RetreatPortal
import json

def main():
    db: Session = SessionLocal()

    try:
        # Get the product
        product = db.query(Product).filter(
            Product.slug == 'why-our-situation-is-hopeless-yet-hilarious'
        ).first()

        if not product:
            print("❌ Product not found")
            return

        print(f"✓ Found product: {product.title}")
        print(f"  Product ID: {product.id}")

        # Get the retreat
        retreat = db.query(Retreat).filter(
            Retreat.slug == 'hopeless-yet-hilarious'
        ).first()

        if not retreat:
            print("❌ Retreat not found")
            return

        print(f"✓ Found retreat: {retreat.title}")
        print(f"  Retreat ID: {retreat.id}")
        print(f"  Dates: {retreat.start_date} to {retreat.end_date}")

        # Link product to retreat
        product.retreat_id = retreat.id
        print(f"✓ Linked product to retreat")

        # Get the retreat portal
        portal = db.query(RetreatPortal).filter(
            RetreatPortal.retreat_id == retreat.id
        ).first()

        if not portal:
            print("❌ Retreat portal not found")
            return

        print(f"✓ Found retreat portal: {portal.title}")

        # Update portal content with actual MP3 files from product
        # Based on filenames:
        # Day 1 (Dec 27): 250704_* files (2 files)
        # Day 2 (Dec 28): 250705_* files (4 files)

        portal_content = {
            "days": [
                {
                    "title": "Day 1",
                    "day_number": 1,
                    "date": "December 27th, 2025",
                    "day_label": "Friday",
                    "sessions": [
                        {
                            "session_title": "Evening Guided Meditation",
                            "date": "Dec 27th, 2025",
                            "time": "5:30 pm EST",
                            "type": "meditation",
                            "duration": 60,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Evening guided meditation to begin the retreat.",
                            "audio_url": product.portal_media['mp3'][1]  # 250704_Hopeless_Hilarious_Evening_GM
                        },
                        {
                            "session_title": "Evening Teaching & Q&A",
                            "date": "Dec 27th, 2025",
                            "time": "7:00 pm EST",
                            "type": "teaching",
                            "duration": 90,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Opening teaching exploring why our situation is hopeless, yet hilarious.",
                            "audio_url": product.portal_media['mp3'][0]  # 250704_Hopeless_Hilarious_Evening_GM_Teaching_Q_A
                        }
                    ]
                },
                {
                    "title": "Day 2",
                    "day_number": 2,
                    "date": "December 28th, 2025",
                    "day_label": "Saturday",
                    "sessions": [
                        {
                            "session_title": "Midday Guided Meditation",
                            "date": "Dec 28th, 2025",
                            "time": "11:00 am EST",
                            "type": "meditation",
                            "duration": 60,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Guided meditation practice.",
                            "audio_url": product.portal_media['mp3'][3]  # 250705_Hopeless_Hilarious_Midday_GM
                        },
                        {
                            "session_title": "Midday Teaching & Q&A",
                            "date": "Dec 28th, 2025",
                            "time": "12:30 pm EST",
                            "type": "teaching",
                            "duration": 120,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Deep teachings on embracing the paradox of existence.",
                            "audio_url": product.portal_media['mp3'][2]  # 250705_Hopeless_Hilarious_Midday_GM_Teaching_Q_A
                        },
                        {
                            "session_title": "Evening Guided Meditation",
                            "date": "Dec 28th, 2025",
                            "time": "5:30 pm EST",
                            "type": "meditation",
                            "duration": 60,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Evening meditation practice.",
                            "audio_url": product.portal_media['mp3'][5]  # 250705_Hopeless_Hilarious_Evening_GM
                        },
                        {
                            "session_title": "Evening Teaching & Q&A",
                            "date": "Dec 28th, 2025",
                            "time": "7:00 pm EST",
                            "type": "teaching",
                            "duration": 90,
                            "has_audio": True,
                            "has_video": False,
                            "is_text": False,
                            "description": "Evening teaching and community Q&A session.",
                            "audio_url": product.portal_media['mp3'][4]  # 250705_Hopeless_Hilarious_Evening_GM_Teaching_Q_A
                        }
                    ]
                }
            ]
        }

        portal.content = portal_content
        print(f"✓ Updated portal content with {len(product.portal_media['mp3'])} audio files")
        print(f"  - Day 1: {len(portal_content['days'][0]['sessions'])} sessions")
        print(f"  - Day 2: {len(portal_content['days'][1]['sessions'])} sessions")

        db.commit()
        print("\n✅ SUCCESS! Product linked to retreat with structured portal content")
        print(f"\nUsers can now access the portal at:")
        print(f"  /dashboard/user/purchases/{product.slug}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
