#!/usr/bin/env python3
"""Reseed database with REAL teachings from data.ts"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal, engine, Base
from app.models.teaching import Teaching, ContentType, AccessLevel

# Import to ensure all models are registered
from app.models import user, teaching, course, retreat, event, forms, payment, product, blog, analytics, email, membership

def drop_and_recreate_teachings():
    """Drop teachings table and recreate with new schema."""
    print("🗑️  Dropping teachings table...")
    Base.metadata.drop_all(bind=engine, tables=[Teaching.__table__])
    print("✅ Creating teachings table with new schema...")
    Base.metadata.create_all(bind=engine, tables=[Teaching.__table__])

def seed_real_teachings():
    """Seed with REAL teaching data from data.ts"""
    db = SessionLocal()

    #  REAL teaching data extracted from src/lib/data.ts
    teachings_data = [
        {
            "slug": "your-real-potential",
            "title": "You Don't Know Your Real Potential…",
            "description": "The human ego in its current models is a fragmented and internally conflicted operating system. This condition creates affective and cognitive deadlocks, repetitive self-sabotage, delusional projections, and stunted capacity to function as a responsible adult.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Q&A",
            "preview_duration": 30,
            "cloudflare_ids": ["0ae62b2e592c22e8a19bdb1ea8ac5781"],
            "podbean_ids": ["uus43-1968131-pb"],
            "thumbnail_url": "https://www.members.satyoga.org/wp-content/uploads/sites/5/2025/10/2Fri-Oct-3-Members-Teaching-231230_Attuning_Maha_Sukha_Evening-Teaching-QA.png",
            "tags": ["Ego Structure", "Nonduality"],
            "published_date": datetime(2025, 10, 3, 12, 49, 48),
            "duration": 2700  # 45 minutes estimated
        },
        {
            "slug": "gita-change-life",
            "title": "How the Bhagavad Gita Can Change Your Life",
            "description": "Shunyamurti reveals why the Bhagavad Gita is a time-released teaching—a terma designed for this very moment at the end of Kali Yuga. We are all Arjuna now, standing on the battlefield of the soul.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Q&A",
            "preview_duration": 30,
            "cloudflare_ids": ["c32d7fb8e92866cf7581783242f55510"],
            "podbean_ids": ["uzbki-195d9c4-pb"],
            "thumbnail_url": "https://www.members.satyoga.org/wp-content/uploads/sites/5/2025/09/2-Fri-Sep-26-Members-Teaching250827_Evening-GM-Teaching-QA.png",
            "tags": ["Mythology", "Nonduality", "Reading the Sages"],
            "published_date": datetime(2025, 9, 26, 12, 42, 51),
            "duration": 2700
        },
        {
            "slug": "10-defenses-anxiety",
            "title": "The 10 Defenses Against Anxiety (and Why They Fail)",
            "description": "In this teaching, Shunyamurti reveals the 10 major defenses the ego uses to escape anxiety. These strategies may seem to offer relief, but ultimately they deepen suffering and block the path to liberation.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Q&A",
            "preview_duration": 30,
            "cloudflare_ids": [],
            "podbean_ids": [],
            "thumbnail_url": "https://www.members.satyoga.org/wp-content/uploads/sites/5/2025/09/2-Fri-Sep-19_Members-Teaching-250905_Free-Anxiety_Evening-GM-Teaching-QA.png",
            "tags": ["Nonduality", "Philosophy", "Psychoanalysis"],
            "published_date": datetime(2025, 9, 19, 13, 20, 28),
            "duration": 2700
        },
    ]

    print(f"\n📚 Seeding {len(teachings_data)} REAL teachings from data.ts...\n")

    for t_data in teachings_data:
        teaching = Teaching(**t_data)
        db.add(teaching)
        print(f"✅ Added: {t_data['title']}")
        print(f"   - Cloudflare IDs: {t_data['cloudflare_ids']}")
        print(f"   - Podbean IDs: {t_data['podbean_ids']}")
        print(f"   - Thumbnail: {t_data['thumbnail_url'][:60]}...")
        print()

    db.commit()
    print("✅ Real teachings seeded successfully!\n")
    db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("RESEEDING DATABASE WITH REAL TEACHINGS")
    print("=" * 60)

    drop_and_recreate_teachings()
    seed_real_teachings()

    print("=" * 60)
    print("✅ DONE! Database now has REAL teaching data")
    print("=" * 60)
