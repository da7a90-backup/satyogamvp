"""
Add media for the 2 retreats missing portal media:
- Meditation Weekend April 2018
- The Basis of White Magic

This script extracts MP3 downloads from WooCommerce products and adds them
to retreat.past_retreat_portal_media in the correct format.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.retreat import Retreat
import json


def add_meditation_weekend_april_2018_media(db: SessionLocal):
    """Add media for Meditation Weekend April 2018."""

    # Find the retreat by its slug
    product = db.query(Product).filter(Product.slug == 'meditation-weekend-april-2018').first()

    if not product:
        print("❌ Product 'meditation-weekend-april-2018' not found")
        return False

    if not product.retreat_id:
        print("❌ Product has no retreat_id")
        return False

    retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

    if not retreat:
        print("❌ Retreat not found")
        return False

    # Media extracted from WooCommerce product ID 756
    portal_media = [
        {
            "title": "Class 1",
            "description": "Meditation Weekend Evening Class, Guided Meditation, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/1_Meditation-Weekend-Evening-Class-Guided-Meditation-QA.mp3",
            "order": 1
        },
        {
            "title": "Class 2",
            "description": "Meditation Weekend Evening Guided Meditation, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/2_Meditation-Weekend-Evening-Guided-Meditation-QA.mp3",
            "order": 2
        },
        {
            "title": "Class 3",
            "description": "Meditation Weekend Mid-Morning Guided Meditation, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/3_Meditation-Weekend-Mid-Morning-Guided-Meditation-QA.mp3",
            "order": 3
        },
        {
            "title": "Class 4",
            "description": "Meditation Weekend Morning Class",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/4_Meditation-Weekend-Morning-Class.mp3",
            "order": 4
        },
        {
            "title": "Class 5",
            "description": "Meditation Weekend Morning Meditation Exercise, Class",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/5_Meditation-Weekend-Morning-Meditation-Exercise-Class.mp3",
            "order": 5
        }
    ]

    retreat.past_retreat_portal_media = portal_media
    print(f"✅ Added {len(portal_media)} audio classes to Meditation Weekend April 2018")
    return True


def add_basis_of_white_magic_media(db: SessionLocal):
    """Add media for The Basis of White Magic."""

    # Find the retreat by its slug
    product = db.query(Product).filter(Product.slug == 'the-basis-of-white-magic').first()

    if not product:
        print("❌ Product 'the-basis-of-white-magic' not found")
        return False

    if not product.retreat_id:
        print("❌ Product has no retreat_id")
        return False

    retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

    if not retreat:
        print("❌ Retreat not found")
        return False

    # Media extracted from WooCommerce product ID 4510
    portal_media = [
        {
            "title": "Class 1",
            "description": "White Magic_Evening Teaching, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/1_190914_AC_White-Magic_Evening-Teaching-QA.mp3",
            "order": 1
        },
        {
            "title": "Class 2",
            "description": "White Magic_Morning Teaching",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/2_190915_AC_White-Magic_Morning-Teaching.mp3",
            "order": 2
        },
        {
            "title": "Class 3",
            "description": "White Magic_Mid-Morning Teaching",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/3_190915_AC_White-Magic_Mid-Morning-Teaching.mp3",
            "order": 3
        },
        {
            "title": "Class 4",
            "description": "White Magic_Evening Teaching, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/4_190915_AC_White-Magic_Evening-Teaching-QA.mp3",
            "order": 4
        },
        {
            "title": "Class 5",
            "description": "White Magic_Morning Teaching",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/5_190916_AC_White-Magic_Morning-Teaching.mp3",
            "order": 5
        },
        {
            "title": "Class 6",
            "description": "White Magic_Mid-Morning Guided Meditation, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/6_190916_AC_White-Magic_Mid-Morning-Guided-Meditation-QA.mp3",
            "order": 6
        },
        {
            "title": "Class 7",
            "description": "White Magic_Evening Music, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/7_190916_AC_White-Magic_Evening-Music-QA.mp3",
            "order": 7
        },
        {
            "title": "Class 8",
            "description": "White Magic_Morning Teaching",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/8_190917_AC_White-Magic_Morning-Teaching.mp3",
            "order": 8
        },
        {
            "title": "Class 9",
            "description": "White Magic_Mid-Morning Guided Meditation, Teaching, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/9_190917_AC_White-Magic_Mid-Morning-Guided-Meditation-Teaching-QA.mp3",
            "order": 9
        },
        {
            "title": "Class 10",
            "description": "White Magic_Evening Teaching, Q&A",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/10_190917_AC_White-Magic_Evening-Teaching-QA.mp3",
            "order": 10
        },
        {
            "title": "Class 11",
            "description": "White Magic_Morning Teaching",
            "audio_url": "https://satyoga.org/wp-content/uploads/woocommerce_uploads/2020/06/11_190918_AC_White-Magic_Morning-Teaching.mp3",
            "order": 11
        }
    ]

    retreat.past_retreat_portal_media = portal_media
    print(f"✅ Added {len(portal_media)} audio classes to The Basis of White Magic")
    return True


def main():
    db = SessionLocal()

    try:
        print("\n🔄 Adding media for 2 retreats missing portal media...\n")

        success_count = 0

        # Add media for Meditation Weekend April 2018
        if add_meditation_weekend_april_2018_media(db):
            success_count += 1

        # Add media for The Basis of White Magic
        if add_basis_of_white_magic_media(db):
            success_count += 1

        # Commit changes
        db.commit()

        print(f"\n✅ Successfully added media to {success_count}/2 retreats")
        print("\n💡 Next steps:")
        print("   1. Test the retreats in My Online Retreats portal")
        print("   2. Verify all audio URLs are working")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
