#!/usr/bin/env python3
"""
Test ALL existing retreat media URLs in the database to verify none return 404
"""

import sys
import os
import json
import re
import requests
from typing import Dict, List, Tuple
from time import sleep

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")


def extract_url_from_media_item(item: Dict) -> str:
    """Extract URL from a media item"""
    if 'youtube_url' in item:
        return item['youtube_url']
    elif 'cloudflare_url' in item:
        return item['cloudflare_url']
    elif 'audio_url' in item:
        return item['audio_url']
    elif 'video_url' in item:
        return item['video_url']
    elif 'vimeo_url' in item:
        return item['vimeo_url']
    elif 'podbean_url' in item:
        return item['podbean_url']
    return None


def test_url(url: str) -> Tuple[bool, int]:
    """Test if URL is accessible"""
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code < 400, response.status_code
    except:
        try:
            response = requests.get(url, timeout=10, allow_redirects=True, stream=True)
            return response.status_code < 400, response.status_code
        except Exception as e:
            return False, 0


def parse_media(media_data) -> List[Dict]:
    """Parse media data into list format"""
    if not media_data:
        return []

    # Parse JSON if it's a string
    if isinstance(media_data, str):
        try:
            media_data = json.loads(media_data)
        except:
            return []

    # If it's already a list, return it
    if isinstance(media_data, list):
        return media_data

    # If it's a dict with youtube/cloudflare/etc keys, convert
    if isinstance(media_data, dict):
        if 'youtube' in media_data or 'cloudflare' in media_data:
            # Old DICT format, skip for now
            return []
        # Single item dict, wrap in list
        return [media_data]

    return []


def main():
    print("=" * 100)
    print("TESTING ALL RETREAT MEDIA URLs FOR 404 ERRORS")
    print("=" * 100)

    engine = create_engine(PG_DATABASE_URL)
    session = Session(engine)

    report = {}

    try:
        # Get ALL retreat products with their media
        query = text("""
            SELECT
                p.id,
                p.slug,
                p.title,
                p.portal_media,
                r.title as retreat_name,
                r.past_retreat_portal_media
            FROM products p
            LEFT JOIN retreats r ON p.retreat_id = r.id
            WHERE p.type = 'RETREAT_PORTAL_ACCESS'
            ORDER BY p.title
        """)

        results = session.execute(query).fetchall()

        print(f"\n Found {len(results)} retreat products\n")

        for row in results:
            product_id, slug, title, product_media, retreat_name, retreat_media = row

            print(f"{'─' * 100}")
            print(f"Testing: {title}")
            print(f"{'─' * 100}")

            # Parse product media
            product_media_list = parse_media(product_media)
            retreat_media_list = parse_media(retreat_media)

            # Use retreat media if product media is empty
            media_list = retreat_media_list if retreat_media_list else product_media_list

            if not media_list:
                print(f"  ⚠ No media found")
                report[title] = {
                    'status': 'no_media',
                    'media_count': 0,
                    'working': 0,
                    'broken': 0
                }
                continue

            print(f"  → Found {len(media_list)} media items")

            working_urls = []
            broken_urls = []

            for i, item in enumerate(media_list, 1):
                url = extract_url_from_media_item(item)

                if not url:
                    continue

                print(f"    [{i}/{len(media_list)}] Testing: {url[:80]}...", end=' ')

                is_working, status_code = test_url(url)

                if is_working:
                    print(f"✓ {status_code}")
                    working_urls.append(url)
                else:
                    print(f"✗ {status_code if status_code else 'FAILED'}")
                    broken_urls.append({'url': url, 'status': status_code})

                sleep(0.1)  # Rate limit

            print(f"  ✓ Results: {len(working_urls)} working, {len(broken_urls)} broken")

            report[title] = {
                'status': 'tested',
                'media_count': len(media_list),
                'working': len(working_urls),
                'broken': len(broken_urls),
                'broken_urls': broken_urls
            }

        print(f"\n{'=' * 100}")
        print("✓ TESTING COMPLETE")
        print("=" * 100)

        # Summary
        total_retreats = len(report)
        with_media = sum(1 for r in report.values() if r.get('media_count', 0) > 0)
        no_media = sum(1 for r in report.values() if r.get('status') == 'no_media')
        total_working = sum(r.get('working', 0) for r in report.values())
        total_broken = sum(r.get('broken', 0) for r in report.values())

        print(f"\nSummary:")
        print(f"  Total retreat products: {total_retreats}")
        print(f"  With media: {with_media}")
        print(f"  No media: {no_media}")
        print(f"  Total working URLs: {total_working}")
        print(f"  Total broken URLs (404): {total_broken}")

        if total_broken > 0:
            print(f"\n⚠ BROKEN URLS FOUND:")
            for title, data in report.items():
                if data.get('broken', 0) > 0:
                    print(f"\n  {title}:")
                    for broken in data.get('broken_urls', []):
                        print(f"    ✗ [{broken['status']}] {broken['url']}")

        # Save report
        with open('/tmp/retreat_media_test_report.json', 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\nDetailed report saved to: /tmp/retreat_media_test_report.json")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()


if __name__ == '__main__':
    main()
