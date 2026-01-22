#!/usr/bin/env python3
"""
Complete Retreat Media Extraction and Verification
1. SSH to WordPress and extract ALL retreat portal media
2. Parse and extract all media URLs (YouTube, Cloudflare, MP3, MP4, Podbean, Vimeo)
3. Test EVERY URL to verify it doesn't return 404
4. Update database with verified working media
"""

import sys
import os
import re
import json
import subprocess
from typing import List, Dict, Tuple
import requests
from time import sleep

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")

# All 17 retreat products
RETREATS = [
    "A Gathering of Visionaries",
    "Advanced Training for Spiritual Revolutionaries",
    "All's Well That Ends Well",
    "Corona Retreat: Awakening in a Dying World",
    "Empowered Meditation for Healing and Joy",
    "Healing with Truth Retreat",
    "How to Cultivate the Love of God",
    "Living by the Brilliance of the Tao",
    "Meditation Weekend April 2018",
    "Overcoming Death Retreat",
    "Ramana's Revelation of Liberating Truth",
    "Realize the Supreme Self Now",
    "Spiritual Preparation for Social Collapse",
    "The Alchemy of Endless Ecstasy",
    "The Basis of White Magic",
    "The Ecstasy of Cosmic Consciousness",
    "The Secret of Samadhi"
]


def ssh_query(query: str) -> str:
    """Execute MySQL query via SSH"""
    cmd = [
        "ssh", "root@104.248.239.206",
        f"mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"{query}\""
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result.stdout
    except Exception as e:
        print(f"    ✗ SSH query failed: {e}")
        return ""


def extract_youtube_ids(content: str) -> List[str]:
    """Extract YouTube video IDs"""
    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
        r'youtu\.be/([a-zA-Z0-9_-]+)',
        r'youtube\.com/embed/([a-zA-Z0-9_-]+)',
        r'"([a-zA-Z0-9_-]{11})"'  # 11-char YouTube IDs in quotes
    ]
    ids = []
    for pattern in patterns:
        ids.extend(re.findall(pattern, content))
    return list(set(ids))


def extract_cloudflare_ids(content: str) -> List[str]:
    """Extract Cloudflare Video Delivery IDs"""
    patterns = [
        r'iframe\.videodelivery\.net/([a-f0-9]+)',
        r'cloudflarestream\.com/([a-f0-9]+)',
        r'videodelivery\.net/([a-f0-9]+)',
        r'watch\.cloudflarestream\.com/([a-f0-9]+)'
    ]
    ids = []
    for pattern in patterns:
        ids.extend(re.findall(pattern, content))
    return list(set(ids))


def extract_urls(content: str, pattern: str) -> List[str]:
    """Extract URLs matching pattern"""
    urls = re.findall(pattern, content)
    return list(set(urls))


def test_url(url: str) -> bool:
    """Test if URL is accessible (doesn't 404)"""
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code < 400
    except:
        try:
            response = requests.get(url, timeout=10, allow_redirects=True)
            return response.status_code < 400
        except:
            return False


def extract_all_media_for_retreat(retreat_name: str) -> Dict:
    """Extract ALL media for a retreat from WordPress"""
    print(f"\n{'─' * 100}")
    print(f"Extracting: {retreat_name}")
    print(f"{'─' * 100}")

    media = {
        'youtube': [],
        'cloudflare': [],
        'mp3': [],
        'mp4': [],
        'podbean': [],
        'vimeo': []
    }

    # Find portal pages
    portal_query = f"""
        SELECT p.ID, p.post_title
        FROM wrt6_posts p
        WHERE p.post_type = 'page'
        AND p.post_status = 'publish'
        AND (
            p.post_title LIKE '%{retreat_name}%Portal%'
            OR p.post_title LIKE '%{retreat_name}%Audio%'
            OR p.post_title LIKE '%{retreat_name}%Video%'
            OR p.post_title LIKE '%{retreat_name}%A&V%'
            OR p.post_title LIKE '%{retreat_name}%Classes%'
            OR (p.post_title LIKE '%{retreat_name}%' AND p.post_name LIKE '%portal%')
            OR (p.post_title LIKE '%{retreat_name}%' AND p.post_name LIKE '%audio%')
            OR (p.post_title LIKE '%{retreat_name}%' AND p.post_name LIKE '%video%')
        )
    """

    pages_result = ssh_query(portal_query)
    if not pages_result.strip():
        print(f"  ⚠ No portal pages found in WordPress")
        return media

    pages = [line.split('\t') for line in pages_result.strip().split('\n')]
    print(f"  → Found {len(pages)} portal page(s)")

    for page_id, page_title in pages:
        print(f"    → Extracting from: {page_title}")

        # Get ALL postmeta with media
        media_query = f"""
            SELECT pm.meta_value
            FROM wrt6_postmeta pm
            WHERE pm.post_id = {page_id}
            AND (
                pm.meta_key LIKE '_oembed_%'
                OR pm.meta_key = '_elementor_data'
                OR pm.meta_key = 'portal_media'
                OR pm.meta_value LIKE '%youtube%'
                OR pm.meta_value LIKE '%cloudflare%'
                OR pm.meta_value LIKE '%videodelivery%'
                OR pm.meta_value LIKE '%podbean%'
                OR pm.meta_value LIKE '%.mp3%'
                OR pm.meta_value LIKE '%.mp4%'
                OR pm.meta_value LIKE '%vimeo%'
            )
        """

        media_result = ssh_query(media_query)
        if not media_result.strip():
            continue

        all_content = media_result

        # Extract YouTube
        yt_ids = extract_youtube_ids(all_content)
        media['youtube'].extend([f'https://www.youtube.com/watch?v={vid}' for vid in yt_ids])

        # Extract Cloudflare
        cf_ids = extract_cloudflare_ids(all_content)
        media['cloudflare'].extend([f'https://iframe.videodelivery.net/{vid}' for vid in cf_ids])

        # Extract direct MP3/MP4
        mp3_urls = extract_urls(all_content, r'https?://[^\s<>"\']+\.mp3')
        media['mp3'].extend(mp3_urls)

        mp4_urls = extract_urls(all_content, r'https?://[^\s<>"\']+\.mp4')
        media['mp4'].extend(mp4_urls)

        # Extract Podbean
        podbean_urls = extract_urls(all_content, r'https?://[^\s<>"\']*podbean[^\s<>"\']*')
        media['podbean'].extend(podbean_urls)

        # Extract Vimeo
        vimeo_urls = extract_urls(all_content, r'https?://[^\s<>"\']*vimeo[^\s<>"\']*')
        media['vimeo'].extend(vimeo_urls)

    # Deduplicate
    for key in media:
        media[key] = list(set(media[key]))

    total = sum(len(v) for v in media.values())
    print(f"  ✓ Extracted {total} media items")

    return media


def test_all_urls(media: Dict) -> Tuple[Dict, Dict]:
    """Test all URLs and return working/broken ones"""
    working = {k: [] for k in media.keys()}
    broken = {k: [] for k in media.keys()}

    print(f"  → Testing URLs...")

    for media_type, urls in media.items():
        for url in urls:
            if test_url(url):
                working[media_type].append(url)
            else:
                broken[media_type].append(url)
                print(f"      ✗ 404: {url}")
            sleep(0.1)  # Rate limit

    working_count = sum(len(v) for v in working.values())
    broken_count = sum(len(v) for v in broken.values())

    print(f"  ✓ Verified: {working_count} working, {broken_count} broken")

    return working, broken


def format_media_for_db(media: Dict) -> List[Dict]:
    """Convert media dict to LIST format for database"""
    formatted = []
    session_num = 1

    # Cloudflare videos
    for url in media.get('cloudflare', []):
        formatted.append({
            'title': f'Class {session_num}',
            'description': f'Session {session_num}',
            'cloudflare_url': url
        })
        session_num += 1

    # YouTube videos
    for url in media.get('youtube', []):
        formatted.append({
            'title': f'Class {session_num}',
            'description': f'Session {session_num}',
            'youtube_url': url
        })
        session_num += 1

    # Audio (MP3, Podbean)
    for url in media.get('mp3', []) + media.get('podbean', []):
        formatted.append({
            'title': f'Class {session_num}',
            'description': f'Session {session_num}',
            'audio_url': url
        })
        session_num += 1

    # MP4 videos
    for url in media.get('mp4', []):
        formatted.append({
            'title': f'Class {session_num}',
            'description': f'Session {session_num}',
            'video_url': url
        })
        session_num += 1

    # Vimeo videos
    for url in media.get('vimeo', []):
        formatted.append({
            'title': f'Class {session_num}',
            'description': f'Session {session_num}',
            'vimeo_url': url
        })
        session_num += 1

    return formatted


def main():
    print("=" * 100)
    print("COMPLETE RETREAT MEDIA EXTRACTION AND VERIFICATION")
    print("=" * 100)

    engine = create_engine(PG_DATABASE_URL)
    session = Session(engine)

    results = {}

    try:
        for retreat_name in RETREATS:
            # Extract media from WordPress
            media = extract_all_media_for_retreat(retreat_name)

            if not any(media.values()):
                print(f"  ⚠ No media found")
                results[retreat_name] = {'status': 'no_media'}
                continue

            # Test all URLs
            working, broken = test_all_urls(media)

            # Format for database
            formatted_media = format_media_for_db(working)

            if not formatted_media:
                print(f"  ⚠ No working media URLs")
                results[retreat_name] = {'status': 'all_broken', 'broken': broken}
                continue

            # Update database
            # Find product by retreat name
            product_query = text("""
                SELECT p.id, p.retreat_id
                FROM products p
                WHERE p.title LIKE :title
                AND p.type = 'RETREAT_PORTAL_ACCESS'
                LIMIT 1
            """)

            product = session.execute(product_query, {'title': f'%{retreat_name}%'}).fetchone()

            if not product:
                print(f"  ⚠ Product not found in database")
                results[retreat_name] = {'status': 'product_not_found'}
                continue

            product_id, retreat_id = product

            # Update product
            update_product = text("""
                UPDATE products
                SET portal_media = :media
                WHERE id = :id
            """)
            session.execute(update_product, {
                'id': product_id,
                'media': json.dumps(formatted_media)
            })

            # Update retreat
            if retreat_id:
                update_retreat = text("""
                    UPDATE retreats
                    SET past_retreat_portal_media = :media
                    WHERE id = :id
                """)
                session.execute(update_retreat, {
                    'id': retreat_id,
                    'media': json.dumps(formatted_media)
                })

            session.commit()

            print(f"  ✓ Updated database with {len(formatted_media)} verified media items")

            results[retreat_name] = {
                'status': 'success',
                'media_count': len(formatted_media),
                'broken_count': sum(len(v) for v in broken.values())
            }

        print(f"\n{'=' * 100}")
        print("✓ COMPLETE!")
        print("=" * 100)

        # Summary
        success = sum(1 for r in results.values() if r.get('status') == 'success')
        no_media = sum(1 for r in results.values() if r.get('status') == 'no_media')

        print(f"\nResults:")
        print(f"  ✓ {success} retreats updated with verified media")
        print(f"  ⚠ {no_media} retreats have no media in WordPress")

        # Save detailed report
        with open('/tmp/retreat_media_report.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nDetailed report saved to: /tmp/retreat_media_report.json")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    main()
