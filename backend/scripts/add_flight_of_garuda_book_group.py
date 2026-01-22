"""
Create a completed book group for The Flight of the Garuda product that exists in the store.
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.models.book_group import BookGroup, BookGroupStatus
from app.models.product import Product
from datetime import datetime, timedelta
import uuid


def create_flight_of_garuda_book_group():
    """Create completed book group for Flight of the Garuda."""
    db = SessionLocal()

    try:
        # Find the Flight of the Garuda product
        product = db.query(Product).filter(
            Product.title.ilike('%garuda%')
        ).first()

        if not product:
            print("❌ Could not find Flight of the Garuda product")
            return

        print(f"✅ Found product: {product.title} (ID: {product.id})")

        # Check if book group already exists
        existing = db.query(BookGroup).filter(
            BookGroup.slug == 'flight-of-the-garuda-book-group'
        ).first()

        if existing:
            print("⚠️  Book group already exists, updating...")
            book_group = existing
        else:
            book_group = BookGroup(
                id=uuid.uuid4(),
                slug='flight-of-the-garuda-book-group',
            )

        # Update book group data
        book_group.title = "The Flight of the Garuda Book Study Group"
        book_group.short_description = "Exploring Dzogchen teachings through this profound Tibetan Buddhist text"
        book_group.description = """Join us for an in-depth exploration of "The Flight of the Garuda," a remarkable Dzogchen text that presents the essence of Tibetan Buddhist teachings on the nature of mind and reality.

Over 10 weeks, we explored:
- The nature of primordial awareness
- Direct introduction to the nature of mind
- The view of the Great Perfection (Dzogchen)
- Integration of practice and daily life

This book group included weekly sessions with teachings, guided meditation, and Q&A."""
        book_group.status = BookGroupStatus.COMPLETED
        book_group.is_featured = False
        book_group.is_published = True
        book_group.requires_purchase = True  # This one requires purchase
        book_group.start_date = datetime.now() - timedelta(days=90)  # Started 90 days ago
        book_group.meeting_day_of_week = "Tuesday"
        book_group.meeting_time = "19:00"
        book_group.duration_minutes = 90
        book_group.has_transcription = True
        book_group.has_audio = True
        book_group.has_downloads = True
        book_group.has_video = False
        book_group.store_product_id = product.id

        # Set session count
        book_group.session_count = 10

        if not existing:
            db.add(book_group)

        db.commit()
        db.refresh(book_group)

        print(f"\n✅ Successfully created/updated completed book group:")
        print(f"   Title: {book_group.title}")
        print(f"   Slug: {book_group.slug}")
        print(f"   Status: {book_group.status}")
        print(f"   Sessions: {book_group.session_count}")
        print(f"   Linked Product: {product.title} (${product.price})")
        print(f"   Product Type: {product.type}")
        print()
        print("📦 This book group is now available in the store!")

    except Exception as e:
        print(f"❌ Error creating book group: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Creating Flight of the Garuda book group...")
    print()
    create_flight_of_garuda_book_group()
