"""
Script to create online retreats for all retreat package products in the Dharma Bandhara store.
This enables immediate portal access after purchasing a retreat package.
"""

import sys
import os
import re
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.retreat import Retreat, RetreatType
import uuid


def clean_title(title: str) -> str:
    """Remove HTML tags and extra whitespace from product titles."""
    # Remove <br> tags
    cleaned = re.sub(r'<br\s*/?>', '', title, flags=re.IGNORECASE)
    # Remove any other HTML tags
    cleaned = re.sub(r'<[^>]+>', '', cleaned)
    # Clean up whitespace
    cleaned = ' '.join(cleaned.split())
    return cleaned.strip()


def generate_slug(title: str, existing_slugs: set) -> str:
    """Generate a unique slug from the title."""
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug).strip('-')

    # Ensure uniqueness
    original_slug = slug
    counter = 1
    while slug in existing_slugs:
        slug = f"{original_slug}-{counter}"
        counter += 1

    return slug


def has_media_type(portal_media: dict, media_key: str) -> bool:
    """Check if portal_media has content for a specific media type."""
    if not portal_media or not isinstance(portal_media, dict):
        return False

    media_list = portal_media.get(media_key, [])
    return isinstance(media_list, list) and len(media_list) > 0


def create_retreat_from_product(db: SessionLocal, product: Product, existing_slugs: set) -> Retreat:
    """Create an online retreat record from a product."""

    # Clean the title
    cleaned_title = clean_title(product.title)

    # Generate unique slug
    retreat_slug = generate_slug(cleaned_title, existing_slugs)
    existing_slugs.add(retreat_slug)

    # Determine if it has audio/video
    has_audio = False
    has_video = False

    if product.portal_media:
        has_audio = (
            has_media_type(product.portal_media, 'mp3') or
            has_media_type(product.portal_media, 'audio')
        )
        has_video = (
            has_media_type(product.portal_media, 'youtube') or
            has_media_type(product.portal_media, 'cloudflare') or
            has_media_type(product.portal_media, 'vimeo') or
            has_media_type(product.portal_media, 'mp4')
        )

    # Set end date to past (marking it as a past retreat)
    # Use a date from 2020 to match when most of these retreats happened
    past_end_date = datetime(2020, 12, 31)
    past_start_date = datetime(2020, 12, 25)  # 6 days before end

    # Create the retreat
    retreat = Retreat(
        id=uuid.uuid4(),
        slug=retreat_slug,
        title=cleaned_title,
        description=product.description or product.short_description,
        type=RetreatType.ONLINE,
        start_date=past_start_date,
        end_date=past_end_date,
        price_lifetime=float(product.price) if product.price else None,
        thumbnail_url=product.featured_image or product.thumbnail_url,
        has_audio=has_audio,
        has_video=has_video,
        past_retreat_portal_media=product.portal_media,
        is_published_to_store=True,
        store_product_id=product.id,
        is_published=True,
        duration_days=6,  # Default duration
        forum_enabled=False
    )

    return retreat


def main():
    db = SessionLocal()

    try:
        print("=" * 80)
        print("CREATING ONLINE RETREATS FOR RETREAT PACKAGE PRODUCTS")
        print("=" * 80)

        # Get all retreat package products
        products = db.query(Product).filter(
            Product.type.in_([
                ProductType.RETREAT_PORTAL_ACCESS,
                ProductType.AUDIO_VIDEO,
                ProductType.AUDIO_VIDEO_TEXT
            ])
        ).all()

        print(f"\nFound {len(products)} retreat package products\n")

        # Get existing retreat slugs to avoid duplicates
        existing_retreats = db.query(Retreat).all()
        existing_slugs = {r.slug for r in existing_retreats}

        # Track statistics
        created_count = 0
        skipped_count = 0
        updated_count = 0

        for product in products:
            # Check if product already has a retreat linked
            if product.retreat_id:
                print(f"⏭️  SKIPPED: {product.slug} (already linked to retreat)")
                skipped_count += 1
                continue

            # Create retreat
            try:
                retreat = create_retreat_from_product(db, product, existing_slugs)
                db.add(retreat)
                db.flush()  # Get the retreat ID

                # Update product with reverse link
                product.retreat_id = retreat.id

                print(f"✅ CREATED: {retreat.slug}")
                print(f"   Product: {product.slug}")
                print(f"   Price: ${product.price}")
                print(f"   Has Audio: {retreat.has_audio}")
                print(f"   Has Video: {retreat.has_video}")
                print()

                created_count += 1

            except Exception as e:
                print(f"❌ ERROR creating retreat for {product.slug}: {str(e)}")
                continue

        # Commit all changes
        db.commit()

        print("=" * 80)
        print("SUMMARY:")
        print(f"  Total products processed: {len(products)}")
        print(f"  Retreats created: {created_count}")
        print(f"  Products skipped: {skipped_count}")
        print("=" * 80)

        if created_count > 0:
            print(f"\n✅ Successfully created {created_count} online retreats!")
            print("   All products are now linked to their retreat portals.")
            print("   Users who purchase these products will get instant portal access.\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
