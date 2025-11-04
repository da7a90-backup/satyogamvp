#!/usr/bin/env python3
"""
Extract teachings from data.ts, fetch missing video IDs from WordPress, and seed database.
"""
import sys
import os
import json
import re
import requests
from datetime import datetime
from typing import Dict, List, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.teaching import Teaching, ContentType, AccessLevel
from sqlalchemy import text

# Category mapping
CATEGORY_MAP = {
    'qa': 'Q&A',
    'video_teaching': 'Video Teaching',
    'guided_meditation': 'Guided Meditation',
    'essay': 'Essay',
    'other': 'Other'
}

# Content type mapping
CONTENT_TYPE_MAP = {
    'qa': ContentType.VIDEO,
    'video_teaching': ContentType.VIDEO,
    'guided_meditation': ContentType.MEDITATION,
    'essay': ContentType.ESSAY,
    'other': ContentType.ESSAY
}

def extract_video_ids_from_wordpress(url: str) -> Dict[str, List[str]]:
    """Fetch WordPress post and extract video IDs from content."""
    print(f"  Fetching from WordPress: {url}")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"  ⚠️  Failed to fetch: {response.status_code}")
            return {'cloudflare': [], 'youtube': []}

        html = response.text

        # Extract Cloudflare Stream IDs
        cloudflare_pattern = r'iframe\.videodelivery\.net/([a-f0-9]{32})'
        cloudflare_ids = list(set(re.findall(cloudflare_pattern, html)))

        # Extract YouTube IDs
        youtube_pattern = r'(?:youtube\.com/embed/|youtu\.be/)([a-zA-Z0-9_-]{11})'
        youtube_ids = list(set(re.findall(youtube_pattern, html)))

        if cloudflare_ids or youtube_ids:
            print(f"  ✓ Found: {len(cloudflare_ids)} cloudflare, {len(youtube_ids)} youtube")

        return {
            'cloudflare': cloudflare_ids,
            'youtube': youtube_ids
        }
    except Exception as e:
        print(f"  ⚠️  Error fetching: {e}")
        return {'cloudflare': [], 'youtube': []}

def parse_data_ts() -> Dict[str, List[Dict]]:
    """Parse data.ts file and extract teachings by category."""
    data_ts_path = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'lib', 'data.ts')

    print("📖 Reading data.ts...")
    with open(data_ts_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the export const data = {"data":{
    match = re.search(r'export const data = (\{"data":\{.*?\}\});', content, re.DOTALL)
    if not match:
        print("❌ Could not find data export in data.ts")
        return {}

    # Extract the JSON-like structure
    data_str = match.group(1)

    # Remove TypeScript type annotations like "as const"
    data_str = re.sub(r'\s+as const', '', data_str)

    # Parse JSON
    try:
        data_obj = json.loads(data_str)
        teachings_by_category = data_obj['data']

        print(f"✓ Parsed data.ts successfully")
        for category, items in teachings_by_category.items():
            print(f"  - {category}: {len(items)} teachings")

        return teachings_by_category
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        return {}

def seed_database():
    """Main seeding function."""
    print("=" * 70)
    print("SEEDING DATABASE FROM data.ts WITH VIDEO ID FETCHING")
    print("=" * 70)
    print()

    # Parse data.ts
    teachings_by_category = parse_data_ts()
    if not teachings_by_category:
        print("❌ No data to seed")
        return

    db = SessionLocal()

    # Delete existing teachings
    count = db.query(Teaching).count()
    if count > 0:
        print(f"🗑️  Deleting {count} old teachings...")
        db.query(Teaching).delete()
        db.commit()

    print(f"\n📚 Seeding teachings...\n")

    added = 0
    fetched_from_wp = 0

    for category_key, teachings_list in teachings_by_category.items():
        category_name = CATEGORY_MAP.get(category_key, 'Other')
        content_type = CONTENT_TYPE_MAP.get(category_key, ContentType.VIDEO)

        print(f"Processing {category_name} ({len(teachings_list)} teachings)...")

        for i, t_data in enumerate(teachings_list):
            try:
                # Check if teaching has media IDs
                cloudflare_ids = t_data.get('cloudflare_ids', [])
                youtube_ids = t_data.get('youtube_ids', [])
                podbean_ids = t_data.get('podbean_ids', [])

                # If no media IDs and there's a link, fetch from WordPress
                if not cloudflare_ids and not youtube_ids and t_data.get('link'):
                    wp_ids = extract_video_ids_from_wordpress(t_data['link'])
                    cloudflare_ids = wp_ids['cloudflare']
                    youtube_ids = wp_ids['youtube']
                    if cloudflare_ids or youtube_ids:
                        fetched_from_wp += 1

                # Create teaching
                teaching = Teaching(
                    slug=t_data['slug'],
                    title=t_data['title'],
                    description=t_data.get('excerpt_text', 'No description available'),
                    content_type=content_type,
                    access_level=AccessLevel.FREE,
                    thumbnail_url=t_data.get('featured_media', {}).get('url'),
                    cloudflare_ids=cloudflare_ids,
                    podbean_ids=podbean_ids,
                    youtube_ids=youtube_ids,
                    text_content=t_data.get('content_text'),
                    preview_duration=t_data.get('preview_duration', 30),
                    duration=2700,
                    published_date=datetime.utcnow(),
                    category=category_name,
                    tags=[],
                    view_count=0
                )
                db.add(teaching)
                added += 1

                # Progress indicator
                if (i + 1) % 10 == 0:
                    print(f"  {i+1}/{len(teachings_list)}...")
                    db.commit()  # Commit in batches

            except Exception as e:
                print(f"✗ Error adding {t_data.get('slug', 'unknown')}: {e}")
                continue

        print(f"✓ Completed {category_name}\n")

    db.commit()

    print(f"\n✅ Successfully added {added} teachings!")
    print(f"📡 Fetched video IDs from WordPress for {fetched_from_wp} teachings")

    # Verify
    final_count = db.query(Teaching).count()
    print(f"✅ Final database count: {final_count} teachings")

    # Show category breakdown
    print("\n📊 Category breakdown:")
    for category in CATEGORY_MAP.values():
        count = db.query(Teaching).filter(Teaching.category == category).count()
        if count > 0:
            print(f"  - {category}: {count}")

    print("\n📊 Content type breakdown:")
    for ct in [ContentType.VIDEO, ContentType.MEDITATION, ContentType.ESSAY]:
        count = db.query(Teaching).filter(Teaching.content_type == ct).count()
        if count > 0:
            print(f"  - {ct.value}: {count}")

    db.close()
    print("\n" + "=" * 70)
    print("✅ COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    seed_database()
