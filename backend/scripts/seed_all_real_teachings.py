#!/usr/bin/env python3
"""Seed database with ALL 693 REAL teachings from data.ts"""
import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal, engine
from app.models.teaching import Teaching, ContentType, AccessLevel
from sqlalchemy import text

def add_columns_if_needed():
    """Add cloudflare_ids and podbean_ids columns if they don't exist."""
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE teachings ADD COLUMN IF NOT EXISTS cloudflare_ids JSONB"))
            conn.execute(text("ALTER TABLE teachings ADD COLUMN IF NOT EXISTS podbean_ids JSONB"))
            conn.commit()
            print("✅ Schema updated (columns added if needed)\n")
        except Exception as e:
            print(f"Schema update: {e}\n")

def map_content_type(ct_str):
    """Map content_type string to enum."""
    ct_lower = ct_str.lower()
    if ct_lower == 'qa':
        return ContentType.VIDEO  # Q&A is video
    elif ct_lower == 'video_teaching':
        return ContentType.VIDEO
    elif ct_lower == 'guided_meditation':
        return ContentType.MEDITATION
    elif ct_lower in ['other', 'essay']:
        return ContentType.ESSAY
    return ContentType.VIDEO  # default

def seed_all_teachings():
    """Seed ALL 693 teachings from data.ts"""
    db = SessionLocal()

    # Delete existing teachings
    count = db.query(Teaching).count()
    if count > 0:
        print(f"🗑️  Deleting {count} old teachings...")
        db.query(Teaching).delete()
        db.commit()

    # Load extracted teachings data
    json_path = os.path.join(os.path.dirname(__file__), 'all_teachings_data.json')
    with open(json_path, 'r') as f:
        teachings_data = json.load(f)

    print(f"📚 Seeding {len(teachings_data)} REAL teachings...\n")

    # Track by first letter for progress
    added = 0
    for i, t_data in enumerate(teachings_data):
        try:
            # Map fields
            teaching = Teaching(
                slug=t_data['slug'],
                title=t_data['title'],
                description=t_data['description'] or "No description available",
                content_type=map_content_type(t_data['content_type']),
                access_level=AccessLevel.FREE,  # All public for now
                thumbnail_url=t_data['thumbnail_url'],
                cloudflare_ids=t_data['cloudflare_ids'],
                podbean_ids=t_data['podbean_ids'],
                youtube_ids=t_data.get('youtube_ids', []),
                preview_duration=30,
                duration=2700,  # 45min default
                published_date=datetime.utcnow(),
                category=t_data.get('category', 'Q&A'),
                tags=[],
                view_count=0
            )
            db.add(teaching)
            added += 1

            # Progress indicator every 50
            if (i + 1) % 50 == 0:
                print(f"  Added {i+1}/{len(teachings_data)}...")

        except Exception as e:
            print(f"✗ Error adding {t_data.get('slug', 'unknown')}: {e}")
            continue

    db.commit()
    print(f"\n✅ Successfully added {added}/{len(teachings_data)} teachings!")

    # Verify
    final_count = db.query(Teaching).count()
    print(f"✅ Final database count: {final_count} teachings\n")

    db.close()

if __name__ == "__main__":
    print("=" * 70)
    print("SEEDING DATABASE WITH ALL 693 REAL TEACHINGS")
    print("=" * 70)
    print()

    add_columns_if_needed()
    seed_all_teachings()

    print("=" * 70)
    print("✅ COMPLETE! Database now has ALL real teaching data")
    print("=" * 70)
