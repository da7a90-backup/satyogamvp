"""
Migration script to convert portal_media from array format to dict format.

OLD FORMAT (array of classes):
[
    {"title": "Class 1", "youtube_url": "...", "audio_url": "..."},
    {"title": "Class 2", "youtube_url": "...", "audio_url": "..."}
]

NEW FORMAT (dict with media types):
{
    "youtube": ["url1", "url2"],
    "vimeo": [],
    "cloudflare": [],
    "mp4": [],
    "mp3": ["url1", "url2"]
}

This migration:
1. Converts product.portal_media from array to dict format
2. Preserves retreat.past_retreat_portal_media as array (for admin editing)
3. Keeps retreat.live_schedule as is (for live retreats)
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.product import Product
from app.models.retreat import Retreat
import json


def extract_media_urls_from_array(portal_media_array):
    """
    Extract media URLs from old array format and organize by type.

    Returns dict: {"youtube": [...], "vimeo": [], "cloudflare": [], "mp4": [], "mp3": [...]}
    """
    result = {
        "youtube": [],
        "vimeo": [],
        "cloudflare": [],
        "mp4": [],
        "mp3": []
    }

    if not isinstance(portal_media_array, list):
        return result

    for item in portal_media_array:
        if not isinstance(item, dict):
            continue

        # Extract YouTube URLs
        if "youtube_url" in item and item["youtube_url"]:
            result["youtube"].append(item["youtube_url"])

        # Extract audio URLs (assume they're MP3)
        if "audio_url" in item and item["audio_url"]:
            result["mp3"].append(item["audio_url"])

        # Extract Vimeo URLs
        if "vimeo_url" in item and item["vimeo_url"]:
            result["vimeo"].append(item["vimeo_url"])

        # Extract Cloudflare Stream URLs
        if "cloudflare_url" in item and item["cloudflare_url"]:
            result["cloudflare"].append(item["cloudflare_url"])

        # Extract MP4 URLs
        if "mp4_url" in item and item["mp4_url"]:
            result["mp4"].append(item["mp4_url"])

    return result


def migrate_products(db: Session):
    """Migrate product.portal_media from array to dict format."""
    print("\n🔄 Migrating product portal_media...")

    # Get all products with portal_media
    products = db.query(Product).filter(Product.portal_media.isnot(None)).all()

    migrated_count = 0
    skipped_count = 0
    error_count = 0

    for product in products:
        try:
            # Skip if already in dict format
            if isinstance(product.portal_media, dict):
                if "youtube" in product.portal_media or "vimeo" in product.portal_media:
                    print(f"  ✓ {product.title[:50]}... - Already in dict format")
                    skipped_count += 1
                    continue

            # Skip if it's null/empty
            if not product.portal_media:
                skipped_count += 1
                continue

            # Convert array to dict
            if isinstance(product.portal_media, list):
                new_format = extract_media_urls_from_array(product.portal_media)
                product.portal_media = new_format
                migrated_count += 1
                print(f"  ✓ {product.title[:50]}... - Converted {len([u for urls in new_format.values() for u in urls])} media items")
            else:
                print(f"  ⚠️  {product.title[:50]}... - Unexpected format: {type(product.portal_media)}")
                error_count += 1

        except Exception as e:
            print(f"  ❌ {product.title[:50]}... - Error: {e}")
            error_count += 1

    db.commit()

    print(f"\n✅ Products migration complete:")
    print(f"   - Migrated: {migrated_count}")
    print(f"   - Skipped (already migrated): {skipped_count}")
    print(f"   - Errors: {error_count}")

    return migrated_count, skipped_count, error_count


def check_retreats(db: Session):
    """
    Check retreats to ensure:
    1. past_retreat_portal_media keeps array format (for admin editing)
    2. live_schedule stays as is (for live retreats)
    """
    print("\n🔍 Checking retreat media formats...")

    retreats = db.query(Retreat).all()

    past_portal_count = 0
    live_schedule_count = 0

    for retreat in retreats:
        has_past_portal = retreat.past_retreat_portal_media is not None
        has_live_schedule = retreat.live_schedule is not None

        if has_past_portal:
            past_portal_count += 1
            format_type = "array" if isinstance(retreat.past_retreat_portal_media, list) else "other"
            print(f"  📦 {retreat.title[:50]}... - Has past_retreat_portal_media ({format_type})")

        if has_live_schedule:
            live_schedule_count += 1
            print(f"  📅 {retreat.title[:50]}... - Has live_schedule")

    print(f"\n✅ Retreat check complete:")
    print(f"   - Retreats with past_retreat_portal_media: {past_portal_count}")
    print(f"   - Retreats with live_schedule: {live_schedule_count}")
    print(f"   - These formats are preserved for admin editing")


def main():
    print("="*60)
    print("PORTAL MEDIA FORMAT MIGRATION")
    print("="*60)

    db = Session(bind=engine)

    try:
        # Migrate products
        migrated, skipped, errors = migrate_products(db)

        # Check retreats (no migration needed, just verification)
        check_retreats(db)

        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   Products migrated: {migrated}")
        print(f"   Products skipped: {skipped}")
        print(f"   Errors: {errors}")
        print(f"\n💡 Next steps:")
        print(f"   1. Restart the backend server")
        print(f"   2. Test cart and payment functionality")
        print(f"   3. Verify retreat portal access still works")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
