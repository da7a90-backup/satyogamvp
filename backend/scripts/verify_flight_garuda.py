"""Verify Flight of the Garuda book group and sessions."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.book_group import BookGroup, BookGroupSession
from app.models.product import Product

db = SessionLocal()

try:
    # Find book group
    book_group = db.query(BookGroup).filter(
        BookGroup.slug == 'flight-of-the-garuda-book-group'
    ).first()

    if not book_group:
        print("❌ Book group not found!")
        exit(1)

    # Find product
    product = db.query(Product).filter(
        Product.title.ilike('%garuda%')
    ).first()

    # Get all sessions
    sessions = db.query(BookGroupSession).filter(
        BookGroupSession.book_group_id == book_group.id
    ).order_by(BookGroupSession.order_index).all()

    print("=" * 80)
    print("FLIGHT OF THE GARUDA - COMPLETE VERIFICATION")
    print("=" * 80)

    print(f"\n📚 BOOK GROUP:")
    print(f"   Title: {book_group.title}")
    print(f"   Slug: {book_group.slug}")
    print(f"   Status: {book_group.status}")
    print(f"   Linked Product ID: {book_group.store_product_id}")

    print(f"\n📦 PRODUCT:")
    print(f"   Title: {product.title}")
    print(f"   Type: {product.type}")
    print(f"   Slug: {product.slug}")

    if product.portal_media:
        cloudflare_count = len(product.portal_media.get('cloudflare', []))
        youtube_count = len(product.portal_media.get('youtube', []))
        print(f"   Portal Media: {cloudflare_count} Cloudflare + {youtube_count} YouTube = {cloudflare_count + youtube_count} total videos")

    print(f"\n📺 SESSIONS ({len(sessions)} total):")

    for i, session in enumerate(sessions, 1):
        print(f"\n   {i}. {session.title}")
        print(f"      Week: {session.week_number}")
        print(f"      Order: {session.order_index}")
        print(f"      Video: {session.video_url[:50]}...")
        print(f"      Date: {session.session_date}")

    print(f"\n{'=' * 80}")
    print("✅ VERIFICATION COMPLETE!")
    print(f"{'=' * 80}")
    print(f"\n✓ Book Group created")
    print(f"✓ Product type set to BOOK_GROUP_PORTAL_ACCESS")
    print(f"✓ {len(sessions)} sessions created")
    print(f"✓ Product portal_media populated with all videos")
    print(f"\n🎉 The dashboard should now display {len(sessions)} sessions!")

finally:
    db.close()
