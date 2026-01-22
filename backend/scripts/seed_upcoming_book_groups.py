"""
Seed script to create upcoming book groups for testing admin features.
These book groups will be created with status=UPCOMING and no sessions yet.
Admin users can then test the workflow of:
1. Adding sessions
2. Adding Zoom links
3. Starting book group (status=LIVE)
4. Completing book group (status=COMPLETED)
5. Uploading recordings
6. Creating store products
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.models.book_group import BookGroup, BookGroupStatus
from datetime import datetime, timedelta
import uuid


def create_upcoming_book_groups():
    """Create sample upcoming book groups for testing."""
    db = SessionLocal()

    try:
        # Sample Book Group 1: Ashtavakra Gita
        book_group_1 = BookGroup(
            id=uuid.uuid4(),
            slug="ashtavakra-gita-study-group",
            title="Exploring the Ashtavakra Gita",
            short_description="A profound dialogue on non-dual wisdom and self-realization",
            description="""Join us for an in-depth exploration of the Ashtavakra Gita, one of the most direct and profound texts on Advaita Vedanta. This ancient dialogue between King Janaka and the sage Ashtavakra reveals the nature of the Self with startling clarity and uncompromising truth.

Over 8 weeks, we'll examine:
- The nature of consciousness and the illusion of separation
- Freedom from identification with the body-mind
- The pathless path to Self-realization
- Living as the witness of all experience

Each session includes guided discussion, Q&A, and contemplative practices to deepen your understanding.""",
            status=BookGroupStatus.UPCOMING,
            is_featured=True,
            is_published=True,
            requires_purchase=False,  # Gyani+ members get automatic access
            start_date=datetime.now() + timedelta(days=14),  # Starts in 2 weeks
            meeting_day_of_week="Wednesday",
            meeting_time="19:00",
            duration_minutes=90,
            has_transcription=False,
            has_audio=False,
            has_downloads=False,
            store_product_id=None  # Will be created later when book group completes
        )

        # Sample Book Group 2: Lankavatara Sutra
        book_group_2 = BookGroup(
            id=uuid.uuid4(),
            slug="lankavatara-sutra-study-group",
            title="The Lankavatara Sutra: Mind and Reality",
            short_description="Exploring consciousness-only doctrine and the path to enlightenment",
            description="""Dive deep into one of Mahayana Buddhism's most important texts. The Lankavatara Sutra presents a radical vision of reality as pure mind, offering profound insights into the nature of consciousness, karma, and liberation.

This 10-week study group will cover:
- The doctrine of Consciousness-Only (Vijñānavāda)
- The Eight Consciousnesses and the Ālaya-vijñāna
- Tathāgatagarbha (Buddha-nature) teachings
- The relationship between meditation and wisdom
- Transcending dualistic thinking

Perfect for those interested in Buddhist philosophy, meditation, and the nature of mind.""",
            status=BookGroupStatus.UPCOMING,
            is_featured=False,
            is_published=True,
            requires_purchase=False,
            start_date=datetime.now() + timedelta(days=21),  # Starts in 3 weeks
            meeting_day_of_week="Sunday",
            meeting_time="18:00",
            duration_minutes=90,
            has_transcription=False,
            has_audio=False,
            has_downloads=False,
            store_product_id=None
        )

        # Sample Book Group 3: Tibetan Book of the Dead
        book_group_3 = BookGroup(
            id=uuid.uuid4(),
            slug="tibetan-book-of-the-dead-study",
            title="The Tibetan Book of the Dead: Bardo Teachings",
            short_description="Understanding the intermediate states and the nature of death",
            description="""Explore the Bardo Thodol, the Tibetan Book of the Dead, a profound guide to the journey of consciousness through death, the intermediate state, and rebirth. This text offers not only practical guidance for the dying process but also deep insights into the nature of mind that can transform how we live.

In this 6-week series we'll explore:
- The three bardos: dying, dharmata, and becoming
- Recognizing the clear light of the mind
- Liberation through understanding the nature of appearances
- Practical applications for daily life and meditation
- Confronting fear and embracing impermanence

All wisdom traditions welcome. No prior Buddhist study required.""",
            status=BookGroupStatus.UPCOMING,
            is_featured=False,
            is_published=True,
            requires_purchase=False,
            start_date=datetime.now() + timedelta(days=28),  # Starts in 4 weeks
            meeting_day_of_week="Saturday",
            meeting_time="10:00",
            duration_minutes=120,
            has_transcription=False,
            has_audio=False,
            has_downloads=False,
            store_product_id=None
        )

        # Add all book groups to session
        db.add(book_group_1)
        db.add(book_group_2)
        db.add(book_group_3)

        # Commit to database
        db.commit()

        print("✅ Successfully created 3 upcoming book groups:")
        print(f"   1. {book_group_1.title} (Featured)")
        print(f"      - Slug: {book_group_1.slug}")
        print(f"      - Starts: {book_group_1.start_date.strftime('%Y-%m-%d')}")
        print(f"      - Day: {book_group_1.meeting_day_of_week} at {book_group_1.meeting_time}")
        print()
        print(f"   2. {book_group_2.title}")
        print(f"      - Slug: {book_group_2.slug}")
        print(f"      - Starts: {book_group_2.start_date.strftime('%Y-%m-%d')}")
        print(f"      - Day: {book_group_2.meeting_day_of_week} at {book_group_2.meeting_time}")
        print()
        print(f"   3. {book_group_3.title}")
        print(f"      - Slug: {book_group_3.slug}")
        print(f"      - Starts: {book_group_3.start_date.strftime('%Y-%m-%d')}")
        print(f"      - Day: {book_group_3.meeting_day_of_week} at {book_group_3.meeting_time}")
        print()
        print("📋 Next steps for testing admin workflow:")
        print("   1. Go to /dashboard/admin/book-groups")
        print("   2. Select a book group")
        print("   3. Add sessions (weeks 1, 2, 3...)")
        print("   4. Add Zoom links to sessions")
        print("   5. Change status to LIVE when ready to start")
        print("   6. After completion, upload recordings")
        print("   7. Create store product and link to book group")

    except Exception as e:
        print(f"❌ Error creating book groups: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding upcoming book groups for admin testing...")
    print()
    create_upcoming_book_groups()
