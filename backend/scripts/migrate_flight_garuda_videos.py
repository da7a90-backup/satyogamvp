"""
Migrate Flight of the Garuda book group videos to product and book_group tables.
Both Cloudflare Stream and YouTube videos are included as separate content.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.book_group import BookGroup
import json

def migrate_flight_garuda_videos():
    """Add all Flight of the Garuda videos to product and book group."""
    db = SessionLocal()

    try:
        # Find the product
        product = db.query(Product).filter(
            Product.title.ilike('%garuda%')
        ).first()

        if not product:
            print("❌ Could not find Flight of the Garuda product")
            return

        print(f"✅ Found product: {product.title}")
        print(f"   Current type: {product.type}")

        # Initialize portal_media structure
        portal_media = {
            'youtube': [],
            'vimeo': [],
            'cloudflare': [],
            'mp4': [],
            'mp3': [],
            'pdf': []
        }

        # Add all Cloudflare Stream videos
        cloudflare_videos = [
            {
                'id': '24fee815992b1b455d6324ff2f0ced26',
                'title': 'Introduction',
                'description': 'A New Course Designed to Blast You into Instant Enlightenment',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Intro.jpeg',
                'order': 0
            },
            {
                'id': '5fbc2691ba6decd08079f52647f0e0e5',
                'title': 'Week 1 - Prepare for Takeoff: The Maiden Flight of Your Inner Garuda',
                'description': 'Wednesday, June 5 | Songs 0, 1 | Teaching Begins: 19:06',
                'date': '2024-06-05',
                'songs': '0, 1',
                'teaching_starts': '19:06',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-1.png',
                'order': 1
            },
            {
                'id': '2950cb0fdcfaa686cf2f736d7dd36646',
                'title': 'Week 2 - Session Two of the Flight of Garuda',
                'description': 'Wednesday, June 12 | Songs 3, 4, 5 | Teaching Begins: 19:06',
                'date': '2024-06-12',
                'songs': '3, 4, 5',
                'teaching_starts': '19:06',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-2.png',
                'order': 2
            },
            {
                'id': 'b1dd611b568eca9b0d1d7ceee38f3925',
                'title': 'Week 3 - Buddhahood is Here and Now',
                'description': 'Wednesday, June 19 | Songs 6, 7 | Teaching Begins: 19:06',
                'date': '2024-06-19',
                'songs': '6, 7',
                'teaching_starts': '19:06',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-3.png',
                'order': 3
            },
            {
                'id': '0681d684b3a294bac9ce557216e8ec2a',
                'title': 'Week 4 - How High Does Garuda Fly? Ramana vs. Shabkar',
                'description': 'Wednesday, June 26 | Song 8 | Teaching Begins: 19:06',
                'date': '2024-06-26',
                'songs': '8',
                'teaching_starts': '19:06',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-4.png',
                'order': 4
            },
            {
                'id': 'af48a96e88956db699a0fc699067a2b0',
                'title': 'Week 5 - How to Become Real',
                'description': 'Wednesday, July 10 | Songs 9, 10 | Teaching Begins: 13:48',
                'date': '2024-07-10',
                'songs': '9, 10',
                'teaching_starts': '13:48',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/Book-Group_Flight-Garuda_Week-5-Thumb-Final.png',
                'order': 5
            },
            {
                'id': 'f5e69ef1a08212161a24dd00e3b2e6cf',
                'title': 'Week 6 - You Are the Infinite Sky of Consciousness',
                'description': 'Wednesday, July 17 | Songs 11, 12 | Teaching Begins: 26:32',
                'date': '2024-07-17',
                'songs': '11, 12',
                'teaching_starts': '26:32',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-6-Final.png',
                'order': 6
            },
            {
                'id': '37d2b2be32c219b756a375aa01187b7a',
                'title': 'Week 7 - The Dilation of Consciousness at Rest in Itself',
                'description': 'Wednesday, July 24 | Songs 13, 14, 15 | Teaching Begins: 21:45',
                'date': '2024-07-24',
                'songs': '13, 14, 15',
                'teaching_starts': '21:45',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/07/BG-Flight-Garuda-Week-7-Final.png',
                'order': 7
            },
            {
                'id': '1f91a86c1c1cdfb80202e8c85781a07a',
                'title': 'Week 8 - The Secret Teaching of the Mahasiddhas',
                'description': 'Wednesday, July 31 | Song 16 | Teaching Begins: 18:45',
                'date': '2024-07-31',
                'songs': '16',
                'teaching_starts': '18:45',
                'poster': 'https://www.members.satyoga.org/wp-content/uploads/sites/5/2024/08/BG-Flight-Garuda-Week-8-Final.png',
                'order': 8
            }
        ]

        # Add YouTube videos (additional content for weeks 5-8)
        youtube_videos = [
            {
                'id': 'Pked2rr_jS8',
                'url': 'https://www.youtube.com/watch?v=Pked2rr_jS8',
                'title': 'Week 5 - YouTube Session',
                'description': 'Wednesday, July 10 | Additional content',
                'week': 5,
                'order': 50  # Different order to distinguish from main video
            },
            {
                'id': '0r9bFb2eIGM',
                'url': 'https://www.youtube.com/watch?v=0r9bFb2eIGM',
                'title': 'Week 6 - YouTube Session',
                'description': 'Wednesday, July 17 | Additional content',
                'week': 6,
                'order': 60
            },
            {
                'id': 'I8jeNBquoBk',
                'url': 'https://www.youtube.com/watch?v=I8jeNBquoBk',
                'title': 'Week 7 - YouTube Session',
                'description': 'Wednesday, July 24 | Additional content',
                'week': 7,
                'order': 70
            },
            {
                'id': 'mzTGV3QCgp4',
                'url': 'https://www.youtube.com/watch?v=mzTGV3QCgp4',
                'title': 'Week 8 - YouTube Session',
                'description': 'Wednesday, July 31 | Additional content',
                'week': 8,
                'order': 80
            }
        ]

        # Add to portal_media
        portal_media['cloudflare'] = cloudflare_videos
        portal_media['youtube'] = youtube_videos

        # Update product
        product.portal_media = portal_media
        product.type = ProductType.BOOK_GROUP_PORTAL_ACCESS

        print(f"\n✅ Updated product portal_media:")
        print(f"   - {len(cloudflare_videos)} Cloudflare Stream videos")
        print(f"   - {len(youtube_videos)} YouTube videos")
        print(f"   - Changed type to: {product.type}")

        # Find and update book group
        book_group = db.query(BookGroup).filter(
            BookGroup.slug == 'flight-of-the-garuda-book-group'
        ).first()

        if book_group:
            print(f"\n✅ Found book group: {book_group.title}")
            # You can add similar portal_media to book_group if needed
            # For now, the product has all the video data
        else:
            print("\n⚠️  Book group not found (might need to be created)")

        # Commit changes
        db.commit()
        db.refresh(product)

        print("\n" + "=" * 80)
        print("✅ MIGRATION COMPLETE!")
        print("=" * 80)
        print(f"\nProduct '{product.title}' now has:")
        print(f"  • 9 Cloudflare Stream videos (intro + 8 weeks)")
        print(f"  • 4 YouTube videos (weeks 5-8 additional content)")
        print(f"  • Type: {product.type}")
        print(f"  • Total video sessions: 13")

    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 80)
    print("FLIGHT OF THE GARUDA VIDEO MIGRATION")
    print("=" * 80)
    print("\nThis script will:")
    print("  1. Add 9 Cloudflare Stream videos to the product")
    print("  2. Add 4 YouTube videos (weeks 5-8 additional content)")
    print("  3. Change product type to BOOK_GROUP_PORTAL_ACCESS")
    print("\n" + "=" * 80)

    migrate_flight_garuda_videos()
