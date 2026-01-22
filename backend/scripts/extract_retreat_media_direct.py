#!/usr/bin/env python3
"""
Extract Retreat Media from WordPress using Direct Page IDs

This script extracts portal media from specific WordPress pages that contain
the A&V packages for retreats.
"""

import sys
import os
import re
import json
import subprocess
from typing import List, Dict

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# PostgreSQL Connection
PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")

# Direct mapping of product slugs to WordPress page IDs
RETREAT_PAGES = {
    "live-free-of-anxiety-an-invitation-to-sustained-serenity": 302618,
    "mastering-one-concept-will-bring-complete-fulfillment-small-em-and-freedom-from-all-suffering-em-small": 284650,
    "reason-revelation-and-redemption-copy": 297344,
    "revelation-of-the-real-small-em-the-final-secrets-of-the-simulation-and-the-self-em-small": 297571,
    "the-great-escape-small-em-a-new-path-out-of-the-prison-of-the-ego-em-small": 297326,
    "the-practice-of-self-mastery": 297272,
    "the-recipe-for-rapture-small-em-why-the-world-must-now-be-sacrificed-em-small": 297263,
}


class MediaExtractor:
    """Extract media URLs from various formats"""

    @staticmethod
    def extract_youtube_urls(content: str) -> List[str]:
        """Extract YouTube URLs from various formats"""
        patterns = [
            r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            r'youtu\.be/([a-zA-Z0-9_-]+)',
            r'youtube\.com/embed/([a-zA-Z0-9_-]+)',
        ]
        video_ids = set()
        for pattern in patterns:
            matches = re.findall(pattern, content)
            video_ids.update(matches)
        return [f'https://www.youtube.com/watch?v={vid}' for vid in video_ids]

    @staticmethod
    def extract_cloudflare_urls(content: str) -> List[str]:
        """Extract Cloudflare Stream and Video Delivery URLs"""
        patterns = [
            r'iframe\.videodelivery\.net/([a-f0-9]+)',
            r'cloudflarestream\.com/([a-f0-9]+)',
            r'videodelivery\.net/([a-f0-9]+)',
            r'watch\.cloudflarestream\.com/([a-f0-9]+)'
        ]
        ids = set()
        for pattern in patterns:
            matches = re.findall(pattern, content)
            ids.update(matches)
        return [f'https://iframe.videodelivery.net/{vid_id}' for vid_id in ids]

    @staticmethod
    def extract_vimeo_urls(content: str) -> List[str]:
        """Extract Vimeo URLs"""
        patterns = [
            r'vimeo\.com/video/(\d+)',
            r'player\.vimeo\.com/video/(\d+)',
            r'vimeo\.com/(\d+)'
        ]
        video_ids = set()
        for pattern in patterns:
            matches = re.findall(pattern, content)
            video_ids.update(matches)
        return [f'https://vimeo.com/{vid}' for vid in video_ids]

    @staticmethod
    def extract_podbean_urls(content: str) -> List[str]:
        """Extract Podbean URLs"""
        pattern = r'(https?://[^\s\"\'<>]+podbean[^\s\"\'<>]+\.mp3)'
        urls = re.findall(pattern, content)
        return list(set(urls))

    @staticmethod
    def extract_mp3_urls(content: str) -> List[str]:
        """Extract direct MP3 URLs (excluding podbean)"""
        pattern = r'(https?://[^\s\"\'<>]+\.mp3(?:\?[^\s\"\'<>]*)?)'
        urls = re.findall(pattern, content)
        # Filter out podbean URLs
        cleaned_urls = [url for url in urls if 'podbean' not in url.lower()]
        return list(set(cleaned_urls))

    @staticmethod
    def extract_mp4_urls(content: str) -> List[str]:
        """Extract direct MP4 URLs"""
        pattern = r'(https?://[^\s\"\'<>]+\.mp4(?:\?[^\s\"\'<>]*)?)'
        urls = re.findall(pattern, content)
        return list(set(urls))


def ssh_query(query: str) -> str:
    """Execute MySQL query via SSH"""
    cmd = [
        "ssh", "-o", "ConnectTimeout=30",
        "root@104.248.239.206",
        f"mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"{query}\""
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, timeout=60)
        if result.returncode != 0:
            return ""
        return result.stdout.decode('utf-8', errors='replace') if result.stdout else ''
    except Exception as e:
        print(f"    ✗ SSH query failed: {e}")
        return ""


def extract_media_from_page(page_id: int) -> Dict:
    """Extract all media from a specific WordPress page"""
    print(f"  → Extracting from page ID: {page_id}")

    query = f"SELECT post_content FROM wrt6_posts WHERE ID = {page_id}"
    content = ssh_query(query)

    if not content.strip():
        print(f"    ✗ No content found")
        return None

    # Extract all media types
    media = {
        'youtube': MediaExtractor.extract_youtube_urls(content),
        'cloudflare': MediaExtractor.extract_cloudflare_urls(content),
        'vimeo': MediaExtractor.extract_vimeo_urls(content),
        'podbean': MediaExtractor.extract_podbean_urls(content),
        'mp3': MediaExtractor.extract_mp3_urls(content),
        'mp4': MediaExtractor.extract_mp4_urls(content),
    }

    # Print summary
    total = sum(len(urls) for urls in media.values())
    print(f"    ✓ Found {total} media items")
    print(f"      YouTube: {len(media['youtube'])}, Cloudflare: {len(media['cloudflare'])}")
    print(f"      MP3: {len(media['mp3'])}, MP4: {len(media['mp4'])}")
    print(f"      Vimeo: {len(media['vimeo'])}, Podbean: {len(media['podbean'])}")

    if total == 0:
        return None

    return media


def update_product_media(db: Session, slug: str, media: Dict):
    """Update product.portal_media in database"""
    try:
        query = text("""
            UPDATE products
            SET portal_media = :media
            WHERE slug = :slug
        """)
        db.execute(query, {"media": json.dumps(media), "slug": slug})
        db.commit()
        print(f"    ✓ Updated product: {slug}")
        return True
    except Exception as e:
        print(f"    ✗ Failed to update {slug}: {e}")
        db.rollback()
        return False


def main():
    """Main execution"""
    print("\n" + "="*100)
    print(" EXTRACT RETREAT MEDIA FROM WORDPRESS (Direct Page IDs)")
    print("="*100)
    print(f"\nProducts to process: {len(RETREAT_PAGES)}\n")

    engine = create_engine(PG_DATABASE_URL)
    db = Session(engine)

    results = {
        'success': [],
        'empty': [],
        'failed': []
    }

    for idx, (slug, page_id) in enumerate(RETREAT_PAGES.items(), 1):
        print(f"\n[{idx}/{len(RETREAT_PAGES)}] Processing: {slug}")
        print(f"  WordPress Page ID: {page_id}")

        # Extract media
        media = extract_media_from_page(page_id)

        if media is None:
            print(f"  ⚠ No media found")
            results['empty'].append(slug)
            continue

        # Update database
        success = update_product_media(db, slug, media)

        if success:
            results['success'].append(slug)
        else:
            results['failed'].append(slug)

    # Print final summary
    print("\n" + "="*100)
    print(" FINAL SUMMARY")
    print("="*100)
    print(f"\n✓ Successfully updated: {len(results['success'])}")
    for slug in results['success']:
        print(f"  - {slug}")

    if results['empty']:
        print(f"\n⚠ No media found: {len(results['empty'])}")
        for slug in results['empty']:
            print(f"  - {slug}")

    if results['failed']:
        print(f"\n✗ Failed to update: {len(results['failed'])}")
        for slug in results['failed']:
            print(f"  - {slug}")

    db.close()
    print("\n✓ Done!\n")


if __name__ == "__main__":
    main()
