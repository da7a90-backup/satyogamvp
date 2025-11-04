#!/usr/bin/env python3
"""
Script to fetch and update durations for all teachings in the database.
Supports Cloudflare Stream, Podbean, and YouTube media sources.
"""

import os
import sys
import asyncio
import aiohttp
import ssl
import xml.etree.ElementTree as ET
from typing import Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

from app.core.database import SessionLocal
from app.models.teaching import Teaching, ContentType


# Configuration from environment
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')


class DurationFetcher:
    """Fetch video/audio durations from various sources."""

    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        # Create SSL context that doesn't verify certificates (needed for macOS)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        # Create connector with SSL context
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        self.session = aiohttp.ClientSession(connector=connector)
        return self

    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()

    async def get_cloudflare_duration(self, video_id: str) -> Optional[int]:
        """Get duration from Cloudflare Stream API."""
        if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
            print("⚠️  Cloudflare credentials not configured")
            return None

        url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/stream/{video_id}"
        headers = {
            "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
            "Content-Type": "application/json"
        }

        try:
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    duration = data.get('result', {}).get('duration')
                    if duration:
                        return int(duration)
                else:
                    print(f"⚠️  Cloudflare API error for {video_id}: {response.status}")
        except Exception as e:
            print(f"❌ Error fetching Cloudflare duration for {video_id}: {e}")

        return None

    async def get_podbean_duration(self, episode_id: str) -> Optional[int]:
        """Get duration from Podbean embed page or RSS."""
        # Podbean episode IDs are in format: "dxj66-1978ba3-pb"
        # We can try to fetch the embed page and parse duration from the player data

        try:
            # Try the embed URL first
            embed_url = f"https://www.podbean.com/player-v2/?i={episode_id.replace('-pb', '')}&share=1&download=0&rtl=0&fonts=Arial&skin=1&font-color=auto&logo_link=episode_page&order=episodic&limit=10&filter=all&ss=a713390a017602015775e868a2cf26b0&btn-skin=7&size=150"

            async with self.session.get(embed_url, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()

                    # Try to find duration in the HTML
                    # Podbean embeds often have data-duration or similar attributes
                    import re

                    # Look for duration patterns in seconds
                    patterns = [
                        r'"duration["\s:]+(\d+)',
                        r'data-duration="(\d+)"',
                        r'duration:\s*(\d+)',
                    ]

                    for pattern in patterns:
                        match = re.search(pattern, html)
                        if match:
                            duration = int(match.group(1))
                            return duration

            # If embed parsing fails, we'd need the RSS feed URL
            # For now, return None and log
            print(f"⚠️  Could not extract Podbean duration for {episode_id}")

        except Exception as e:
            print(f"❌ Error fetching Podbean duration for {episode_id}: {e}")

        return None

    async def get_youtube_duration(self, video_id: str) -> Optional[int]:
        """Get duration from YouTube by scraping the page (no API key needed)."""

        try:
            # Fetch the YouTube watch page
            url = f"https://www.youtube.com/watch?v={video_id}"

            async with self.session.get(url, timeout=15) as response:
                if response.status == 200:
                    html = await response.text()

                    # Look for the duration in the page metadata
                    # YouTube stores it in multiple places - try them all
                    import re

                    # Pattern 1: Look for "lengthSeconds" in ytInitialPlayerResponse
                    match = re.search(r'"lengthSeconds":"(\d+)"', html)
                    if match:
                        return int(match.group(1))

                    # Pattern 2: Look for approxDurationMs
                    match = re.search(r'"approxDurationMs":"(\d+)"', html)
                    if match:
                        return int(match.group(1)) // 1000

                    # Pattern 3: Look in microdata
                    match = re.search(r'"duration":"PT(\d+H)?(\d+M)?(\d+S)"', html)
                    if match:
                        hours = int(match.group(1).replace('H', '')) if match.group(1) else 0
                        minutes = int(match.group(2).replace('M', '')) if match.group(2) else 0
                        seconds = int(match.group(3).replace('S', '')) if match.group(3) else 0
                        return hours * 3600 + minutes * 60 + seconds

                    print(f"⚠️  Could not extract YouTube duration from page for {video_id}")
                else:
                    print(f"⚠️  YouTube page error for {video_id}: {response.status}")
        except Exception as e:
            print(f"❌ Error fetching YouTube duration for {video_id}: {e}")

        return None

    def _parse_iso_duration(self, duration: str) -> int:
        """Parse ISO 8601 duration to seconds (e.g., PT1H30M15S -> 5415)."""
        import re

        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration)

        if not match:
            return 0

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)

        return hours * 3600 + minutes * 60 + seconds


async def update_teaching_duration(teaching: Teaching, fetcher: DurationFetcher, db: Session) -> bool:
    """Update duration for a single teaching."""

    # Skip if already has duration
    if teaching.duration:
        print(f"✓ {teaching.slug} already has duration: {teaching.duration}s")
        return True

    duration = None
    source = None

    # Try Cloudflare first (for video/videoandaudio)
    if teaching.cloudflare_ids and len(teaching.cloudflare_ids) > 0:
        video_id = teaching.cloudflare_ids[0]
        source = "Cloudflare"
        print(f"🎬 Fetching Cloudflare duration for {teaching.slug} ({video_id})...")
        duration = await fetcher.get_cloudflare_duration(video_id)

    # Try YouTube if no Cloudflare
    if not duration and teaching.youtube_ids and len(teaching.youtube_ids) > 0:
        video_id = teaching.youtube_ids[0]
        source = "YouTube"
        print(f"▶️  Fetching YouTube duration for {teaching.slug} ({video_id})...")
        duration = await fetcher.get_youtube_duration(video_id)

    # Try Podbean if audio or no video duration found
    if not duration and teaching.podbean_ids and len(teaching.podbean_ids) > 0:
        episode_id = teaching.podbean_ids[0]
        source = "Podbean"
        print(f"🎙️  Fetching Podbean duration for {teaching.slug} ({episode_id})...")
        duration = await fetcher.get_podbean_duration(episode_id)

    # Update database if duration found
    if duration:
        teaching.duration = duration
        db.commit()
        print(f"✅ Updated {teaching.slug}: {duration}s ({duration // 60}m {duration % 60}s) from {source}")
        return True
    else:
        print(f"❌ No duration found for {teaching.slug}")
        return False


async def main():
    """Main function to update all teaching durations."""

    print("=" * 80)
    print("🎯 Teaching Duration Updater")
    print("=" * 80)

    # Check configuration
    print("\n📋 Configuration:")
    print(f"   Cloudflare Account ID: {'✓' if CLOUDFLARE_ACCOUNT_ID else '✗'}")
    print(f"   Cloudflare API Token:  {'✓' if CLOUDFLARE_API_TOKEN else '✗'}")
    print(f"   YouTube scraping:      ✓ (no API key needed)")

    if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
        print("\n⚠️  WARNING: Cloudflare credentials not configured!")
        print("   Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to your .env file")
        print("   Most teachings use Cloudflare Stream, so this will limit results.\n")

    # Get database session
    db = SessionLocal()

    try:
        # Fetch all audio/video teachings
        teachings = db.query(Teaching).filter(
            Teaching.content_type.in_(['video', 'audio', 'videoandaudio'])
        ).all()

        print(f"\n📚 Found {len(teachings)} teachings to process\n")

        # Process each teaching
        async with DurationFetcher() as fetcher:
            updated = 0
            skipped = 0
            failed = 0

            for i, teaching in enumerate(teachings, 1):
                print(f"\n[{i}/{len(teachings)}] Processing: {teaching.slug}")

                result = await update_teaching_duration(teaching, fetcher, db)

                if teaching.duration:
                    if result:
                        updated += 1
                    else:
                        skipped += 1
                else:
                    failed += 1

                # Small delay to be nice to APIs
                await asyncio.sleep(0.5)

        # Summary
        print("\n" + "=" * 80)
        print("📊 Summary:")
        print(f"   Total teachings:  {len(teachings)}")
        print(f"   ✅ Updated:       {updated}")
        print(f"   ⏭️  Skipped:        {skipped} (already had duration)")
        print(f"   ❌ Failed:        {failed}")
        print("=" * 80)

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
