"""
Fix retreat portal_media: Populate retreat.past_retreat_portal_media
from product.portal_media (dict format) to preserve class structure.

This script reconstructs the class array for retreat portal viewers.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.product import Product
from app.models.retreat import Retreat


def reconstruct_class_array_from_dict(portal_media_dict):
    """
    Reconstruct class array from dict format.

    INPUT (dict):
    {
        "youtube": ["url1", "url2", "url3"],
        "mp3": ["url4", "url5"]
    }

    OUTPUT (array):
    [
        {"title": "Session 1", "youtube_url": "url1"},
        {"title": "Session 2", "youtube_url": "url2"},
        {"title": "Session 3", "youtube_url": "url3"},
        {"title": "Session 4", "audio_url": "url4"},
        {"title": "Session 5", "audio_url": "url5"}
    ]
    """
    if not isinstance(portal_media_dict, dict):
        return []

    classes = []
    session_num = 1

    # Add YouTube videos
    for url in portal_media_dict.get("youtube", []):
        classes.append({
            "title": f"Session {session_num}",
            "youtube_url": url,
            "order": session_num
        })
        session_num += 1

    # Add Vimeo videos
    for url in portal_media_dict.get("vimeo", []):
        classes.append({
            "title": f"Session {session_num}",
            "vimeo_url": url,
            "order": session_num
        })
        session_num += 1

    # Add Cloudflare videos
    for url in portal_media_dict.get("cloudflare", []):
        classes.append({
            "title": f"Session {session_num}",
            "cloudflare_url": url,
            "order": session_num
        })
        session_num += 1

    # Add MP4 videos
    for url in portal_media_dict.get("mp4", []):
        classes.append({
            "title": f"Session {session_num}",
            "mp4_url": url,
            "order": session_num
        })
        session_num += 1

    # Add MP3 audio
    for url in portal_media_dict.get("mp3", []):
        classes.append({
            "title": f"Session {session_num}",
            "audio_url": url,
            "order": session_num
        })
        session_num += 1

    return classes


def fix_retreat_portal_media(db: Session):
    """
    For each product linked to a retreat:
    1. Get product.portal_media (dict format)
    2. Reconstruct class array
    3. Save to retreat.past_retreat_portal_media
    """
    print("\n🔄 Fixing retreat portal media...")

    # Get all products linked to retreats
    products = db.query(Product).filter(
        Product.retreat_id.isnot(None),
        Product.portal_media.isnot(None)
    ).all()

    fixed_count = 0
    skipped_count = 0

    for product in products:
        try:
            # Get linked retreat
            retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()
            if not retreat:
                print(f"  ⚠️  {product.title[:50]}... - No retreat found")
                skipped_count += 1
                continue

            # Skip if retreat already has past_retreat_portal_media
            if retreat.past_retreat_portal_media and isinstance(retreat.past_retreat_portal_media, list):
                if len(retreat.past_retreat_portal_media) > 0:
                    print(f"  ✓ {product.title[:50]}... - Already has {len(retreat.past_retreat_portal_media)} sessions")
                    skipped_count += 1
                    continue

            # Reconstruct class array from product portal_media
            if isinstance(product.portal_media, dict):
                class_array = reconstruct_class_array_from_dict(product.portal_media)

                if class_array:
                    retreat.past_retreat_portal_media = class_array
                    fixed_count += 1
                    print(f"  ✅ {product.title[:50]}... - Created {len(class_array)} sessions")
                else:
                    print(f"  ⚠️  {product.title[:50]}... - No media found in dict")
                    skipped_count += 1
            else:
                print(f"  ⚠️  {product.title[:50]}... - portal_media not a dict")
                skipped_count += 1

        except Exception as e:
            print(f"  ❌ {product.title[:50]}... - Error: {e}")
            skipped_count += 1

    db.commit()

    print(f"\n✅ Fix complete:")
    print(f"   - Fixed: {fixed_count}")
    print(f"   - Skipped: {skipped_count}")

    return fixed_count, skipped_count


def main():
    print("="*60)
    print("FIX RETREAT PORTAL MEDIA")
    print("="*60)

    db = Session(bind=engine)

    try:
        fixed, skipped = fix_retreat_portal_media(db)

        print("\n" + "="*60)
        print("✅ FIX COMPLETE!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   Retreats fixed: {fixed}")
        print(f"   Retreats skipped: {skipped}")
        print(f"\n💡 Next steps:")
        print(f"   1. Restart backend server")
        print(f"   2. Test retreat portal viewer")
        print(f"   3. Admin can edit session titles in past_retreat_portal_media")

    except Exception as e:
        print(f"\n❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
