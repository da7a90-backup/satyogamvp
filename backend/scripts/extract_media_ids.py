#!/usr/bin/env python3
"""
WordPress Media ID Extraction Script

Fetches teachings from WordPress API and extracts embedded media IDs
(Cloudflare video, YouTube video, Podbean audio) from HTML content.

Handles multiple videos per teaching.
"""

import os
import sys
import json
import re
import time
import requests
from typing import List, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import Json

# Database connection
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'satyoga_db')
DB_USER = os.getenv('DB_USER', 'satyoga')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'satyoga_dev_password')

# WordPress API
WP_API_BASE = "https://www.members.satyoga.org/wp-json/wp/v2/posts"


class MediaExtractor:
    """Extracts media IDs from WordPress HTML content."""

    # Regex patterns for media extraction
    CLOUDFLARE_PATTERN = r'iframe\.videodelivery\.net/([a-f0-9]{32})'
    PODBEAN_PATTERN = r'i=([a-zA-Z0-9]+-[a-zA-Z0-9]+-pb)'
    YOUTUBE_PATTERNS = [
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
    ]

    def __init__(self, timeout: int = 60, retry_attempts: int = 3):
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SatyoGa-MediaExtractor/1.0'
        })

    def extract_cloudflare_ids(self, html: str) -> List[str]:
        """Extract all Cloudflare video IDs from HTML."""
        return list(dict.fromkeys(re.findall(self.CLOUDFLARE_PATTERN, html)))

    def extract_podbean_ids(self, html: str) -> List[str]:
        """Extract all Podbean audio IDs from HTML."""
        return list(dict.fromkeys(re.findall(self.PODBEAN_PATTERN, html)))

    def extract_youtube_ids(self, html: str) -> List[str]:
        """Extract all YouTube video IDs from HTML."""
        youtube_ids = []
        for pattern in self.YOUTUBE_PATTERNS:
            youtube_ids.extend(re.findall(pattern, html))
        # Remove duplicates while preserving order
        return list(dict.fromkeys(youtube_ids))

    def fetch_wordpress_content(self, post_id: int) -> Optional[str]:
        """
        Fetch WordPress post HTML content via API.

        Args:
            post_id: WordPress post ID

        Returns:
            HTML content or None if failed
        """
        url = f"{WP_API_BASE}/{post_id}"

        for attempt in range(self.retry_attempts):
            try:
                response = self.session.get(url, timeout=self.timeout)

                if response.status_code == 200:
                    data = response.json()
                    return data.get('content', {}).get('rendered', '')

                elif response.status_code == 404:
                    print(f"  ⚠️  Post {post_id} not found (404)")
                    return None

                else:
                    print(f"  ⚠️  HTTP {response.status_code} for post {post_id}")
                    if attempt < self.retry_attempts - 1:
                        wait_time = 2 ** attempt  # Exponential backoff
                        print(f"     Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                    continue

            except requests.Timeout:
                print(f"  ⏱️  Timeout fetching post {post_id}")
                if attempt < self.retry_attempts - 1:
                    wait_time = 2 ** attempt
                    print(f"     Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                continue

            except Exception as e:
                print(f"  ❌ Error fetching post {post_id}: {e}")
                return None

        return None

    def extract_media_from_html(self, html: str) -> Dict[str, List[str]]:
        """
        Extract all media IDs from HTML content.

        Returns:
            Dict with keys: cloudflare_ids, podbean_ids, youtube_ids
        """
        return {
            'cloudflare_ids': self.extract_cloudflare_ids(html),
            'podbean_ids': self.extract_podbean_ids(html),
            'youtube_ids': self.extract_youtube_ids(html)
        }


class DatabaseManager:
    """Manages database connections and updates."""

    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect(self):
        """Connect to PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
            self.cursor = self.conn.cursor()
            print(f"✅ Connected to database: {DB_NAME}")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)

    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def fetch_teachings_needing_extraction(self, limit: Optional[int] = None) -> List[Dict]:
        """
        Fetch teachings from JSON file that need media ID extraction.

        Returns:
            List of teaching dicts with id, slug, title, wordpress_id
        """
        # Load JSON data
        json_path = os.path.join(os.path.dirname(__file__), 'all_teachings_data.json')
        with open(json_path, 'r') as f:
            teachings_data = json.load(f)

        # Find teachings needing extraction
        results = []
        for teaching in teachings_data:
            wordpress_id = teaching.get('id')
            cloudflare_ids = teaching.get('cloudflare_ids', [])
            youtube_ids = teaching.get('youtube_ids', [])
            podbean_ids = teaching.get('podbean_ids', [])

            # Need extraction if no video IDs
            if (not cloudflare_ids or cloudflare_ids == []) and (not youtube_ids or youtube_ids == []):
                results.append({
                    'slug': teaching['slug'],
                    'title': teaching['title'],
                    'wordpress_id': wordpress_id,
                    'cloudflare_ids': cloudflare_ids or [],
                    'podbean_ids': podbean_ids or [],
                    'youtube_ids': youtube_ids or []
                })

            if limit and len(results) >= limit:
                break

        return results

    def find_teaching_by_slug(self, slug: str) -> Optional[str]:
        """Find teaching ID by slug."""
        query = "SELECT id FROM teachings WHERE slug = %s"
        self.cursor.execute(query, (slug,))
        result = self.cursor.fetchone()
        return result[0] if result else None

    def update_teaching_media_ids(
        self,
        teaching_id: str,
        cloudflare_ids: List[str],
        podbean_ids: List[str],
        youtube_ids: List[str]
    ) -> bool:
        """
        Update teaching with extracted media IDs.

        Args:
            teaching_id: Teaching UUID
            cloudflare_ids: List of Cloudflare video IDs
            podbean_ids: List of Podbean audio IDs
            youtube_ids: List of YouTube video IDs

        Returns:
            True if successful
        """
        try:
            query = """
            UPDATE teachings
            SET
                cloudflare_ids = %s,
                podbean_ids = %s,
                youtube_ids = %s,
                updated_at = NOW()
            WHERE id = %s
            """

            self.cursor.execute(
                query,
                (
                    Json(cloudflare_ids),
                    Json(podbean_ids),
                    Json(youtube_ids),
                    teaching_id
                )
            )

            self.conn.commit()
            return True

        except Exception as e:
            print(f"  ❌ Database update failed: {e}")
            self.conn.rollback()
            return False


def main():
    """Main extraction workflow."""
    import argparse

    parser = argparse.ArgumentParser(description='Extract media IDs from WordPress')
    parser.add_argument('--limit', type=int, help='Limit number of teachings to process')
    parser.add_argument('--test', action='store_true', help='Test mode (5 teachings)')
    parser.add_argument('--dry-run', action='store_true', help='Don\'t update database')
    args = parser.parse_args()

    # Determine limit
    if args.test:
        limit = 5
    elif args.limit:
        limit = args.limit
    else:
        limit = None

    print("=" * 80)
    print("WordPress Media ID Extraction")
    print("=" * 80)
    print()

    # Initialize
    db = DatabaseManager()
    db.connect()

    extractor = MediaExtractor(timeout=60, retry_attempts=3)

    # Fetch teachings
    print(f"📋 Fetching teachings needing extraction{f' (limit: {limit})' if limit else ''}...")
    teachings = db.fetch_teachings_needing_extraction(limit=limit)
    print(f"   Found: {len(teachings)} teachings")
    print()

    if not teachings:
        print("✅ No teachings need extraction!")
        db.close()
        return

    # Statistics
    stats = {
        'processed': 0,
        'updated': 0,
        'failed': 0,
        'no_media': 0,
        'found_cloudflare': 0,
        'found_podbean': 0,
        'found_youtube': 0,
        'multiple_videos': 0
    }

    # Process each teaching
    for i, teaching in enumerate(teachings, 1):
        print(f"[{i}/{len(teachings)}] {teaching['slug'][:60]}")
        print(f"   WP ID: {teaching['wordpress_id']}")

        # Fetch WordPress content
        html = extractor.fetch_wordpress_content(teaching['wordpress_id'])

        if not html:
            print(f"   ⚠️  No content fetched")
            stats['failed'] += 1
            print()
            continue

        # Extract media IDs
        extracted = extractor.extract_media_from_html(html)

        # Merge with existing IDs (don't overwrite if already has data)
        cloudflare_ids = extracted['cloudflare_ids'] if extracted['cloudflare_ids'] else teaching['cloudflare_ids']
        podbean_ids = extracted['podbean_ids'] if extracted['podbean_ids'] else teaching['podbean_ids']
        youtube_ids = extracted['youtube_ids']

        # Display results
        if cloudflare_ids:
            print(f"   🎥 Cloudflare: {len(cloudflare_ids)} video(s) - {cloudflare_ids}")
            stats['found_cloudflare'] += 1

        if youtube_ids:
            print(f"   📺 YouTube: {len(youtube_ids)} video(s) - {youtube_ids}")
            stats['found_youtube'] += 1

        if podbean_ids:
            print(f"   🔊 Podbean: {len(podbean_ids)} audio(s) - {podbean_ids}")
            stats['found_podbean'] += 1

        if not cloudflare_ids and not youtube_ids and not podbean_ids:
            print(f"   ⚠️  No media found")
            stats['no_media'] += 1

        if (len(cloudflare_ids) + len(youtube_ids)) > 1:
            stats['multiple_videos'] += 1
            print(f"   ⭐ Multiple videos detected!")

        # Update database
        if not args.dry_run:
            # Find teaching ID by slug
            teaching_id = db.find_teaching_by_slug(teaching['slug'])

            if not teaching_id:
                print(f"   ⚠️  Teaching not found in database by slug: {teaching['slug']}")
                stats['failed'] += 1
            else:
                success = db.update_teaching_media_ids(
                    teaching_id,
                    cloudflare_ids,
                    podbean_ids,
                    youtube_ids
                )

                if success:
                    print(f"   ✅ Updated in database")
                    stats['updated'] += 1
                else:
                    stats['failed'] += 1
        else:
            print(f"   🔄 Dry run - skipping database update")
            stats['updated'] += 1

        stats['processed'] += 1
        print()

        # Rate limiting
        time.sleep(0.5)

    # Summary
    print("=" * 80)
    print("EXTRACTION COMPLETE")
    print("=" * 80)
    print(f"Processed:        {stats['processed']}")
    print(f"Updated:          {stats['updated']}")
    print(f"Failed:           {stats['failed']}")
    print(f"No media:         {stats['no_media']}")
    print()
    print(f"Found Cloudflare: {stats['found_cloudflare']} teachings")
    print(f"Found YouTube:    {stats['found_youtube']} teachings")
    print(f"Found Podbean:    {stats['found_podbean']} teachings")
    print(f"Multiple videos:  {stats['multiple_videos']} teachings")
    print()

    if args.dry_run:
        print("⚠️  DRY RUN - No database changes made")

    db.close()


if __name__ == "__main__":
    main()
