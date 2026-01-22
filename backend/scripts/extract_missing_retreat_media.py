#!/usr/bin/env python3
"""
Extract Missing Retreat Media from WordPress

This script extracts portal media for products that have portal_media field but it's empty.
It connects to the WordPress database via SSH and extracts:
- YouTube URLs
- Cloudflare Stream URLs
- MP3 URLs
- MP4 URLs
- Vimeo URLs
- Podbean URLs

Then updates the product.portal_media field in PostgreSQL.
"""

import sys
import os
import re
import json
import subprocess
from typing import List, Dict, Optional
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# PostgreSQL Connection
PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")

# Products with empty portal_media - RETRY FAILED ONES
PRODUCTS_TO_EXTRACT = [
    {
        "slug": "live-free-of-anxiety-an-invitation-to-sustained-serenity",
        "title": "Live Free of Anxiety! An Invitation to Sustained Serenity"
    },
    {
        "slug": "mastering-one-concept-will-bring-complete-fulfillment-small-em-and-freedom-from-all-suffering-em-small",
        "title": "Mastering One Concept Will Bring Complete Fulfillment"
    },
    {
        "slug": "reason-revelation-and-redemption-copy",
        "title": "Reason, Revelation, and Redemption (Copy)"
    },
    {
        "slug": "revelation-of-the-real-small-em-the-final-secrets-of-the-simulation-and-the-self-em-small",
        "title": "Revelation of the Real"
    },
    {
        "slug": "the-great-escape-small-em-a-new-path-out-of-the-prison-of-the-ego-em-small",
        "title": "The Great Escape"
    },
    {
        "slug": "the-practice-of-self-mastery",
        "title": "The Practice of Self-Mastery"
    },
    {
        "slug": "the-recipe-for-rapture-small-em-why-the-world-must-now-be-sacrificed-em-small",
        "title": "The Recipe for Rapture"
    }
]


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
        pattern = r'(https?://[^\s\"\'<>]+podbean[^\s\"\'<>]+)'
        urls = re.findall(pattern, content)
        # Clean up URLs
        cleaned_urls = []
        for url in urls:
            # Remove trailing punctuation
            url = re.sub(r'[,;.\)]+$', '', url)
            cleaned_urls.append(url)
        return list(set(cleaned_urls))

    @staticmethod
    def extract_mp3_urls(content: str) -> List[str]:
        """Extract direct MP3 URLs"""
        pattern = r'(https?://[^\s\"\'<>]+\.mp3(?:\?[^\s\"\'<>]*)?)'
        urls = re.findall(pattern, content)
        cleaned_urls = []
        for url in urls:
            url = re.sub(r'[,;.\)]+$', '', url)
            cleaned_urls.append(url)
        return list(set(cleaned_urls))

    @staticmethod
    def extract_mp4_urls(content: str) -> List[str]:
        """Extract direct MP4 URLs"""
        pattern = r'(https?://[^\s\"\'<>]+\.mp4(?:\?[^\s\"\'<>]*)?)'
        urls = re.findall(pattern, content)
        cleaned_urls = []
        for url in urls:
            url = re.sub(r'[,;.\)]+$', '', url)
            cleaned_urls.append(url)
        return list(set(cleaned_urls))


def ssh_query(query: str, retries=10, delay=10) -> str:
    """Execute MySQL query via SSH with aggressive retry logic"""
    import time

    for attempt in range(retries):
        cmd = [
            "ssh", "-o", "ConnectTimeout=60",
            "-o", "ServerAliveInterval=15",
            "-o", "ServerAliveCountMax=6",
            "root@104.248.239.206",
            f"mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"{query}\""
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, timeout=90)
            if result.returncode != 0:
                stderr_text = result.stderr.decode('utf-8', errors='replace') if result.stderr else ''
                if attempt < retries - 1:
                    print(f"    → Connection issue, waiting {delay}s and retrying ({attempt + 1}/{retries})...")
                    time.sleep(delay)
                    continue
                print(f"    ✗ SSH query error after {retries} attempts: {stderr_text}")
                return ""

            # Decode with error handling
            stdout_text = result.stdout.decode('utf-8', errors='replace') if result.stdout else ''
            return stdout_text
        except subprocess.TimeoutExpired:
            if attempt < retries - 1:
                print(f"    → Query timeout, waiting {delay}s and retrying ({attempt + 1}/{retries})...")
                time.sleep(delay)
                continue
            print(f"    ✗ SSH query timeout after {retries} attempts")
            return ""
        except Exception as e:
            if attempt < retries - 1:
                print(f"    → Error: {e}, waiting {delay}s and retrying ({attempt + 1}/{retries})...")
                time.sleep(delay)
                continue
            print(f"    ✗ SSH query failed after {retries} attempts: {e}")
            return ""

    return ""


def extract_media_for_product(title: str) -> Optional[Dict]:
    """Extract all media for a product from WordPress"""
    import time

    print(f"\n{'='*100}")
    print(f"Extracting: {title}")
    print(f"{'='*100}")

    media = {
        'youtube': [],
        'cloudflare': [],
        'mp3': [],
        'mp4': [],
        'podbean': [],
        'vimeo': []
    }

    # Create multiple search patterns with different variations
    # Extract key words from title
    title_words = title.replace(',', '').replace(':', '').split()
    main_words = [w for w in title_words if len(w) > 3 and w.lower() not in ['the', 'and', 'for', 'with']]

    search_patterns = [
        f"%{title}%Portal%",
        f"%{title}%Audio%",
        f"%{title}%Video%",
        f"%{title}%A&V%",
        f"%{title}%Classes%",
        f"%{title}%Package%",
        f"%{title}%",
    ]

    # Add patterns with main words only
    if len(main_words) >= 2:
        search_patterns.append(f"%{main_words[0]}%{main_words[1]}%")
        search_patterns.append(f"%{main_words[0]}%Portal%")

    all_page_ids = set()

    for idx, pattern in enumerate(search_patterns):
        print(f"  → Searching pattern {idx+1}/{len(search_patterns)}: {pattern}")

        query = f"""
            SELECT p.ID, p.post_title
            FROM wrt6_posts p
            WHERE p.post_type = 'page'
            AND p.post_status = 'publish'
            AND p.post_title LIKE '{pattern}'
            LIMIT 20
        """

        result = ssh_query(query, retries=10, delay=10)

        # Add delay between queries to avoid overwhelming the connection
        time.sleep(5)

        if result.strip():
            lines = [line for line in result.strip().split('\n') if line.strip()]
            for line in lines:
                parts = line.split('\t')
                if len(parts) >= 2:
                    page_id = parts[0]
                    page_title = parts[1]
                    if page_id not in all_page_ids:
                        all_page_ids.add(page_id)
                        print(f"    ✓ Found: {page_title} (ID: {page_id})")

    if not all_page_ids:
        print(f"  ⚠ No portal pages found for: {title}")
        return None

    print(f"  → Total pages found: {len(all_page_ids)}")

    # Extract content from all found pages
    for idx, page_id in enumerate(all_page_ids):
        print(f"  → Extracting content from page {idx+1}/{len(all_page_ids)} (ID: {page_id})...")

        content_query = f"""
            SELECT post_content
            FROM wrt6_posts
            WHERE ID = {page_id}
        """

        content = ssh_query(content_query, retries=10, delay=10)

        # Add delay between content queries
        time.sleep(5)

        if not content.strip():
            print(f"    ⚠ No content returned for page {page_id}")
            continue

        # Extract all media types
        youtube_urls = MediaExtractor.extract_youtube_urls(content)
        cloudflare_urls = MediaExtractor.extract_cloudflare_urls(content)
        vimeo_urls = MediaExtractor.extract_vimeo_urls(content)
        podbean_urls = MediaExtractor.extract_podbean_urls(content)
        mp3_urls = MediaExtractor.extract_mp3_urls(content)
        mp4_urls = MediaExtractor.extract_mp4_urls(content)

        media['youtube'].extend(youtube_urls)
        media['cloudflare'].extend(cloudflare_urls)
        media['vimeo'].extend(vimeo_urls)
        media['podbean'].extend(podbean_urls)
        media['mp3'].extend(mp3_urls)
        media['mp4'].extend(mp4_urls)

        print(f"    Page {page_id}: YT={len(youtube_urls)} CF={len(cloudflare_urls)} MP3={len(mp3_urls)} MP4={len(mp4_urls)} VIM={len(vimeo_urls)} POD={len(podbean_urls)}")

    # Remove duplicates
    for key in media:
        media[key] = list(set(media[key]))

    # Print summary
    total = sum(len(urls) for urls in media.values())
    print(f"\n  📊 Summary:")
    print(f"    YouTube:    {len(media['youtube'])} URLs")
    print(f"    Cloudflare: {len(media['cloudflare'])} URLs")
    print(f"    MP3:        {len(media['mp3'])} URLs")
    print(f"    MP4:        {len(media['mp4'])} URLs")
    print(f"    Vimeo:      {len(media['vimeo'])} URLs")
    print(f"    Podbean:    {len(media['podbean'])} URLs")
    print(f"    TOTAL:      {total} media items")

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
        print(f"  ✓ Updated product: {slug}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to update {slug}: {e}")
        db.rollback()
        return False


def main():
    """Main execution"""
    print("\n" + "="*100)
    print(" EXTRACT MISSING RETREAT MEDIA FROM WORDPRESS")
    print("="*100)
    print(f"\nProducts to process: {len(PRODUCTS_TO_EXTRACT)}\n")

    engine = create_engine(PG_DATABASE_URL)
    db = Session(engine)

    results = {
        'success': [],
        'empty': [],
        'failed': []
    }

    for idx, product in enumerate(PRODUCTS_TO_EXTRACT, 1):
        print(f"\n[{idx}/{len(PRODUCTS_TO_EXTRACT)}] Processing: {product['title']}")

        # Extract media
        media = extract_media_for_product(product['title'])

        if media is None:
            print(f"  ⚠ No media found")
            results['empty'].append(product['slug'])
            # Add delay before next product
            if idx < len(PRODUCTS_TO_EXTRACT):
                print(f"  → Waiting 5 seconds before next product...")
                import time
                time.sleep(5)
            continue

        # Update database
        success = update_product_media(db, product['slug'], media)

        if success:
            results['success'].append(product['slug'])
        else:
            results['failed'].append(product['slug'])

        # Add delay before next product
        if idx < len(PRODUCTS_TO_EXTRACT):
            print(f"  → Waiting 5 seconds before next product...")
            import time
            time.sleep(5)

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
