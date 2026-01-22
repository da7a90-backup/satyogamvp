"""
Add overview sections to all retreats missing them.
Uses retreat description to create a basic overview.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.retreat import Retreat


def add_retreat_overview(db: SessionLocal):
    """Add overview sections to retreats missing them."""

    # Get all retreat products
    products = db.query(Product).filter(
        Product.type == ProductType.RETREAT_PORTAL_ACCESS
    ).order_by(Product.title).all()

    total = 0
    updated = 0
    skipped = 0

    for product in products:
        retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

        if not retreat:
            continue

        total += 1

        # Skip if already has overview
        if retreat.overview_sections:
            skipped += 1
            print(f"✓ SKIP: {product.title[:60]} - Already has overview")
            continue

        # Create a basic overview from description
        overview_content = retreat.description if retreat.description else (
            f"Welcome to {retreat.title}. "
            "This online retreat offers profound teachings and guided meditations "
            "to support your spiritual journey."
        )

        # Create overview sections
        overview_sections = [
            {
                "image_url": retreat.thumbnail_url or retreat.hero_background or "",
                "content": overview_content
            }
        ]

        retreat.overview_sections = overview_sections
        updated += 1
        print(f"✅ ADDED: {product.title[:60]}")

    db.commit()

    print(f"\n=== SUMMARY ===")
    print(f"Total retreats: {total}")
    print(f"Overviews added: {updated}")
    print(f"Skipped (already had overview): {skipped}")


def main():
    db = SessionLocal()

    try:
        print("\n🔄 Adding overview sections to retreats...\n")
        add_retreat_overview(db)
        print("\n✅ All done!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
