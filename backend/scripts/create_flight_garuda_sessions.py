"""
Create BookGroupSession records for Flight of the Garuda book group.
Creates 13 sessions total: intro + 8 weeks (with weeks 5-8 having 2 videos each).
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.book_group import BookGroup, BookGroupSession
from datetime import datetime, timedelta
import uuid


def create_flight_garuda_sessions():
    """Create all session records for Flight of the Garuda book group."""
    db = SessionLocal()

    try:
        # Find the book group
        book_group = db.query(BookGroup).filter(
            BookGroup.slug == 'flight-of-the-garuda-book-group'
        ).first()

        if not book_group:
            print("❌ Could not find Flight of the Garuda book group")
            print("   Run add_flight_of_garuda_book_group.py first")
            return

        print(f"✅ Found book group: {book_group.title}")

        # Delete existing sessions if any
        existing_count = db.query(BookGroupSession).filter(
            BookGroupSession.book_group_id == book_group.id
        ).count()

        if existing_count > 0:
            print(f"⚠️  Deleting {existing_count} existing sessions...")
            db.query(BookGroupSession).filter(
                BookGroupSession.book_group_id == book_group.id
            ).delete()
            db.commit()

        # Base date for sessions (starting from June 5, 2024)
        base_date = datetime(2024, 6, 5, 19, 0)  # June 5, 2024, 7 PM

        sessions_data = [
            # Introduction (week 0)
            {
                'week_number': 0,
                'title': 'Introduction',
                'description': 'A New Course Designed to Blast You into Instant Enlightenment',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/24fee815992b1b455d6324ff2f0ced26/iframe',
                'session_date': base_date - timedelta(days=7),  # Week before week 1
                'order_index': 0
            },
            # Week 1
            {
                'week_number': 1,
                'title': 'Week 1 - Prepare for Takeoff: The Maiden Flight of Your Inner Garuda',
                'description': 'Wednesday, June 5 | Songs 0, 1 | Teaching Begins: 19:06',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/5fbc2691ba6decd08079f52647f0e0e5/iframe',
                'session_date': base_date,
                'order_index': 1
            },
            # Week 2
            {
                'week_number': 2,
                'title': 'Week 2 - Session Two of the Flight of Garuda',
                'description': 'Wednesday, June 12 | Songs 3, 4, 5 | Teaching Begins: 19:06',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/2950cb0fdcfaa686cf2f736d7dd36646/iframe',
                'session_date': base_date + timedelta(days=7),
                'order_index': 2
            },
            # Week 3
            {
                'week_number': 3,
                'title': 'Week 3 - Buddhahood is Here and Now',
                'description': 'Wednesday, June 19 | Songs 6, 7 | Teaching Begins: 19:06',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/b1dd611b568eca9b0d1d7ceee38f3925/iframe',
                'session_date': base_date + timedelta(days=14),
                'order_index': 3
            },
            # Week 4
            {
                'week_number': 4,
                'title': 'Week 4 - How High Does Garuda Fly? Ramana vs. Shabkar',
                'description': 'Wednesday, June 26 | Song 8 | Teaching Begins: 19:06',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/0681d684b3a294bac9ce557216e8ec2a/iframe',
                'session_date': base_date + timedelta(days=21),
                'order_index': 4
            },
            # Week 5 - Cloudflare video
            {
                'week_number': 5,
                'title': 'Week 5 - How to Become Real (Main Session)',
                'description': 'Wednesday, July 10 | Songs 9, 10 | Teaching Begins: 13:48',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/af48a96e88956db699a0fc699067a2b0/iframe',
                'session_date': base_date + timedelta(days=35),  # June 5 + 35 days = July 10
                'order_index': 5
            },
            # Week 5 - YouTube video
            {
                'week_number': 5,
                'title': 'Week 5 - Additional Teaching Session',
                'description': 'Wednesday, July 10 | Additional content',
                'video_url': 'https://www.youtube.com/embed/Pked2rr_jS8',
                'session_date': base_date + timedelta(days=35),
                'order_index': 6
            },
            # Week 6 - Cloudflare video
            {
                'week_number': 6,
                'title': 'Week 6 - You Are the Infinite Sky of Consciousness (Main Session)',
                'description': 'Wednesday, July 17 | Songs 11, 12 | Teaching Begins: 26:32',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/f5e69ef1a08212161a24dd00e3b2e6cf/iframe',
                'session_date': base_date + timedelta(days=42),
                'order_index': 7
            },
            # Week 6 - YouTube video
            {
                'week_number': 6,
                'title': 'Week 6 - Additional Teaching Session',
                'description': 'Wednesday, July 17 | Additional content',
                'video_url': 'https://www.youtube.com/embed/0r9bFb2eIGM',
                'session_date': base_date + timedelta(days=42),
                'order_index': 8
            },
            # Week 7 - Cloudflare video
            {
                'week_number': 7,
                'title': 'Week 7 - The Dilation of Consciousness at Rest in Itself (Main Session)',
                'description': 'Wednesday, July 24 | Songs 13, 14, 15 | Teaching Begins: 21:45',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/37d2b2be32c219b756a375aa01187b7a/iframe',
                'session_date': base_date + timedelta(days=49),
                'order_index': 9
            },
            # Week 7 - YouTube video
            {
                'week_number': 7,
                'title': 'Week 7 - Additional Teaching Session',
                'description': 'Wednesday, July 24 | Additional content',
                'video_url': 'https://www.youtube.com/embed/I8jeNBquoBk',
                'session_date': base_date + timedelta(days=49),
                'order_index': 10
            },
            # Week 8 - Cloudflare video
            {
                'week_number': 8,
                'title': 'Week 8 - The Secret Teaching of the Mahasiddhas (Main Session)',
                'description': 'Wednesday, July 31 | Song 16 | Teaching Begins: 18:45',
                'video_url': 'https://customer-vks11mjf4m4m2mip.cloudflarestream.com/1f91a86c1c1cdfb80202e8c85781a07a/iframe',
                'session_date': base_date + timedelta(days=56),
                'order_index': 11
            },
            # Week 8 - YouTube video
            {
                'week_number': 8,
                'title': 'Week 8 - Additional Teaching Session',
                'description': 'Wednesday, July 31 | Additional content',
                'video_url': 'https://www.youtube.com/embed/mzTGV3QCgp4',
                'session_date': base_date + timedelta(days=56),
                'order_index': 12
            }
        ]

        # Create all sessions
        created_sessions = []
        for session_data in sessions_data:
            session = BookGroupSession(
                id=uuid.uuid4(),
                book_group_id=book_group.id,
                week_number=session_data['week_number'],
                title=session_data['title'],
                description=session_data['description'],
                video_url=session_data['video_url'],
                session_date=session_data['session_date'],
                order_index=session_data['order_index'],
                is_published=True,
                duration_minutes=90  # Default duration
            )
            db.add(session)
            created_sessions.append(session)
            print(f"  ✓ Created session: {session_data['title']}")

        # Commit all sessions
        db.commit()

        # Verify
        total_sessions = db.query(BookGroupSession).filter(
            BookGroupSession.book_group_id == book_group.id
        ).count()

        print(f"\n{'='*80}")
        print("✅ SESSIONS CREATED SUCCESSFULLY!")
        print(f"{'='*80}")
        print(f"\nBook Group: {book_group.title}")
        print(f"Total Sessions Created: {total_sessions}")
        print(f"\nBreakdown:")
        print(f"  • Introduction: 1 session")
        print(f"  • Weeks 1-4: 4 sessions (1 per week)")
        print(f"  • Weeks 5-8: 8 sessions (2 per week: Cloudflare + YouTube)")
        print(f"\n📺 The dashboard should now show {total_sessions} sessions!")

    except Exception as e:
        print(f"\n❌ Error creating sessions: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("="*80)
    print("FLIGHT OF THE GARUDA - CREATE BOOK GROUP SESSIONS")
    print("="*80)
    print("\nThis script will:")
    print("  1. Find the Flight of the Garuda book group")
    print("  2. Create 13 session records (intro + weeks 1-8)")
    print("  3. Weeks 5-8 have 2 videos each (Cloudflare + YouTube)")
    print("\n" + "="*80 + "\n")

    create_flight_garuda_sessions()
