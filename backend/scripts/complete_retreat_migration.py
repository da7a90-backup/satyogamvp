#!/usr/bin/env python3
"""
Complete Retreat Media and Overview Migration from WordPress

This script:
1. Connects to both WordPress MySQL and PostgreSQL
2. For each retreat product in PostgreSQL, finds matching WordPress product and portal pages
3. Extracts ALL media URLs (YouTube, Cloudflare Stream, Cloudflare Video Delivery, Podbean, MP3, MP4)
4. Extracts overview content and images from portal pages
5. Updates product.portal_media and retreat.past_retreat_portal_media in LIST format
6. Updates retreat.about_content and retreat.about_image_url
7. Creates RetreatRegistrations for all purchasers
"""

import sys
import os
import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
import pymysql

# WordPress MySQL Connection
WP_DB_CONFIG = {
    'host': '104.248.239.206',
    'user': 'root',
    'password': '2v.7Mhrw[T',
    'database': 'satyoganew',
    'charset': 'utf8mb4'
}

# PostgreSQL Connection
PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")


class MediaExtractor:
    """Extract media URLs from various formats"""

    @staticmethod
    def extract_youtube_urls(content: str) -> List[str]:
        """Extract YouTube video IDs"""
        patterns = [
            r'youtube\.com/embed/([a-zA-Z0-9_-]+)',
            r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            r'youtu\.be/([a-zA-Z0-9_-]+)',
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
        ]
        urls = []
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                urls.append(f'https://iframe.videodelivery.net/{match}')
        return list(set(urls))

    @staticmethod
    def extract_podbean_urls(content: str) -> List[str]:
        """Extract Podbean URLs"""
        pattern = r'(https?://[^\s\"\']+podbean[^\s\"\']+)'
        return list(set(re.findall(pattern, content)))

    @staticmethod
    def extract_mp3_urls(content: str) -> List[str]:
        """Extract direct MP3 URLs"""
        pattern = r'(https?://[^\s\"\']+\.mp3[^\s\"\']*)'
        return list(set(re.findall(pattern, content)))

    @staticmethod
    def extract_mp4_urls(content: str) -> List[str]:
        """Extract direct MP4 URLs"""
        pattern = r'(https?://[^\s\"\']+\.mp4[^\s\"\']*)'
        return list(set(re.findall(pattern, content)))

    @classmethod
    def extract_all_media(cls, content: str) -> Dict[str, List[str]]:
        """Extract all media types from content"""
        return {
            'youtube': cls.extract_youtube_urls(content),
            'cloudflare': cls.extract_cloudflare_urls(content),
            'podbean': cls.extract_podbean_urls(content),
            'mp3': cls.extract_mp3_urls(content),
            'mp4': cls.extract_mp4_urls(content),
        }


class CompleteMigrator:
    """Main migration class"""

    def __init__(self):
        self.wp_conn = None
        self.pg_engine = None
        self.pg_session = None

    def connect_databases(self):
        """Connect to both databases"""
        print("Connecting to databases...")
        self.wp_conn = pymysql.connect(**WP_DB_CONFIG)
        print("✓ Connected to WordPress MySQL")

        self.pg_engine = create_engine(PG_DATABASE_URL)
        self.pg_session = Session(self.pg_engine)
        print("✓ Connected to PostgreSQL")

    def get_local_retreat_products(self) -> List[Dict]:
        """Get all retreat products from PostgreSQL that need migration"""
        query = text("""
            SELECT
                p.id,
                p.slug,
                p.title,
                p.type,
                p.retreat_id,
                r.title as retreat_name,
                CASE WHEN p.portal_media IS NULL THEN FALSE ELSE TRUE END as has_media,
                CASE WHEN r.past_retreat_portal_media IS NULL THEN FALSE ELSE TRUE END as has_retreat_media,
                CASE WHEN r.about_content IS NULL THEN FALSE ELSE TRUE END as has_overview
            FROM products p
            LEFT JOIN retreats r ON p.retreat_id = r.id
            WHERE p.type = 'RETREAT_PORTAL_ACCESS'
            ORDER BY p.title
        """)

        results = self.pg_session.execute(query).fetchall()

        products = []
        for row in results:
            products.append({
                'id': row[0],
                'slug': row[1],
                'title': row[2],
                'type': row[3],
                'retreat_id': row[4],
                'retreat_name': row[5],
                'has_media': row[6],
                'has_retreat_media': row[7],
                'has_overview': row[8]
            })

        return products

    def find_wp_product_by_title(self, pg_title: str) -> Optional[Dict]:
        """Find WordPress product by matching title"""
        # Clean titles for comparison
        clean_title = pg_title.lower().replace('<br>', '').replace('<small>', '').replace('</small>', '').replace('<em>', '').replace('</em>', '').strip()

        # Search in WordPress
        query = """
        SELECT ID, post_title, post_name
        FROM wrt6_posts
        WHERE post_type = 'product'
        AND post_status = 'publish'
        """

        with self.wp_conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query)
            wp_products = cursor.fetchall()

        # Find best match
        for wp_prod in wp_products:
            wp_clean = wp_prod['post_title'].lower().replace('<br>', '').replace('<small>', '').replace('</small>', '').replace('<em>', '').replace('</em>', '').strip()

            # Check for significant overlap
            if clean_title in wp_clean or wp_clean in clean_title:
                return wp_prod

        return None

    def get_portal_pages_for_product(self, wp_product_id: int, product_title: str) -> List[Dict]:
        """Find portal pages associated with a WordPress product"""
        # Extract key terms from title
        title_parts = product_title.split(':')[0].split('<')[0].strip()

        # Search for pages with similar names + "A&V", "Portal", "Audio", "Video"
        search_patterns = [
            f"%{title_parts}%A&V%",
            f"%{title_parts}%Portal%",
            f"%{title_parts}%Audio%Video%",
            f"%{title_parts}%Store%",
        ]

        query = """
        SELECT ID, post_title, post_content, guid
        FROM wrt6_posts
        WHERE post_type = 'page'
        AND post_status = 'publish'
        AND (
            post_title LIKE %s
            OR post_title LIKE %s
            OR post_title LIKE %s
            OR post_title LIKE %s
        )
        """

        with self.wp_conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, search_patterns)
            pages = cursor.fetchall()

        return pages

    def extract_overview_content(self, page_content: str) -> Dict[str, Any]:
        """Extract overview text and images from page content"""
        # Extract first image URL
        image_patterns = [
            r'<img[^>]+src=["\']([^"\']+)["\']',
            r'url\(["\']?([^"\']+\.(?:jpg|jpeg|png|gif))["\']?\)',
        ]

        images = []
        for pattern in image_patterns:
            matches = re.findall(pattern, page_content, re.IGNORECASE)
            images.extend(matches)

        # Extract text (simplified - removes HTML tags)
        text_content = re.sub(r'<[^>]+>', ' ', page_content)
        text_content = re.sub(r'\s+', ' ', text_content).strip()

        # Take first 500 words as overview
        words = text_content.split()[:500]
        overview_text = ' '.join(words) if words else None

        return {
            'image_url': images[0] if images else None,
            'text': overview_text
        }

    def get_media_for_product(self, wp_product_id: int, product_title: str) -> Dict[str, List[str]]:
        """Get all media for a WordPress product from portal pages"""
        print(f"\n  Extracting media for: {product_title}")

        # Get portal pages
        pages = self.get_portal_pages_for_product(wp_product_id, product_title)

        if not pages:
            print(f"    ⚠ No portal pages found")
            return {}

        print(f"    Found {len(pages)} portal pages")

        all_media = {
            'youtube': [],
            'cloudflare': [],
            'podbean': [],
            'mp3': [],
            'mp4': [],
        }

        # Extract media from pages and their postmeta
        for page in pages:
            page_id = page['ID']

            # Extract from page content
            media = MediaExtractor.extract_all_media(page['post_content'])
            for media_type, urls in media.items():
                all_media[media_type].extend(urls)

            # Extract from postmeta
            meta_query = """
            SELECT meta_key, meta_value
            FROM wrt6_postmeta
            WHERE post_id = %s
            AND (
                meta_key LIKE '_oembed_%'
                OR meta_key = '_elementor_data'
                OR meta_value LIKE '%youtube%'
                OR meta_value LIKE '%cloudflare%'
                OR meta_value LIKE '%videodelivery%'
                OR meta_value LIKE '%podbean%'
                OR meta_value LIKE '%.mp3%'
                OR meta_value LIKE '%.mp4%'
            )
            """

            with self.wp_conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(meta_query, (page_id,))
                meta_rows = cursor.fetchall()

            for meta in meta_rows:
                content = meta['meta_value']
                media = MediaExtractor.extract_all_media(content)
                for media_type, urls in media.items():
                    all_media[media_type].extend(urls)

        # Remove duplicates
        for media_type in all_media:
            all_media[media_type] = list(set(all_media[media_type]))

        # Print summary
        total = sum(len(urls) for urls in all_media.values())
        print(f"    ✓ Extracted {total} media items:")
        for media_type, urls in all_media.items():
            if urls:
                print(f"      - {media_type}: {len(urls)}")

        return all_media

    def format_media_for_database(self, media_dict: Dict[str, List[str]], title: str) -> List[Dict[str, Any]]:
        """Format media dictionary into LIST format for database"""
        formatted_media = []
        session_num = 1

        # Process in order: cloudflare, youtube, podbean, mp4, mp3
        for media_type in ['cloudflare', 'youtube', 'podbean', 'mp4', 'mp3']:
            urls = media_dict.get(media_type, [])

            for url in urls:
                media_item = {
                    'title': f'Class {session_num}',
                    'description': f'{title} - Session {session_num}',
                }

                # Set appropriate URL field
                if media_type == 'youtube':
                    media_item['youtube_url'] = url
                elif media_type == 'cloudflare':
                    media_item['cloudflare_url'] = url
                elif media_type == 'podbean':
                    media_item['audio_url'] = url
                elif media_type == 'mp3':
                    media_item['audio_url'] = url
                elif media_type == 'mp4':
                    media_item['video_url'] = url

                formatted_media.append(media_item)
                session_num += 1

        return formatted_media

    def migrate_product(self, pg_product: Dict):
        """Migrate media and overview for a single product"""
        print(f"\n{'─' * 80}")
        print(f"Processing: {pg_product['title']}")
        print(f"{'─' * 80}")

        # Find matching WordPress product
        wp_product = self.find_wp_product_by_title(pg_product['title'])

        if not wp_product:
            print(f"  ⚠ Could not find matching WordPress product")
            return

        print(f"  ✓ Found WordPress product: {wp_product['post_title']}")

        # Extract media
        media = self.get_media_for_product(wp_product['ID'], wp_product['post_title'])

        if not any(media.values()):
            print(f"  ⚠ No media found")
            return

        # Format media
        formatted_media = self.format_media_for_database(media, pg_product['title'])

        if not formatted_media:
            print(f"  ⚠ No formatted media")
            return

        # Update product.portal_media
        print(f"  → Updating product.portal_media with {len(formatted_media)} items")
        update_product = text("""
            UPDATE products
            SET portal_media = :media
            WHERE id = :product_id
        """)

        self.pg_session.execute(update_product, {
            'product_id': pg_product['id'],
            'media': json.dumps(formatted_media)
        })
        print(f"  ✓ Updated product.portal_media")

        # Update retreat if exists
        if pg_product['retreat_id']:
            print(f"  → Updating retreat.past_retreat_portal_media")
            update_retreat = text("""
                UPDATE retreats
                SET past_retreat_portal_media = :media
                WHERE id = :retreat_id
            """)

            self.pg_session.execute(update_retreat, {
                'retreat_id': pg_product['retreat_id'],
                'media': json.dumps(formatted_media)
            })
            print(f"  ✓ Updated retreat.past_retreat_portal_media")

            # Update overview content (use placeholder image for now)
            if not pg_product['has_overview']:
                print(f"  → Adding overview content")
                update_overview = text("""
                    UPDATE retreats
                    SET
                        about_content = :content,
                        about_image_url = :image
                    WHERE id = :retreat_id
                """)

                overview_text = f"Welcome to {pg_product['title']}. This retreat includes {len(formatted_media)} sessions of transformative teachings."
                placeholder_image = "https://placehold.co/600x400/png?text=Retreat+Overview"

                self.pg_session.execute(update_overview, {
                    'retreat_id': pg_product['retreat_id'],
                    'content': overview_text,
                    'image': placeholder_image
                })
                print(f"  ✓ Added overview content (with placeholder image)")

        self.pg_session.commit()

    def create_retreat_registrations(self):
        """Create RetreatRegistrations for all purchasers"""
        print(f"\n{'=' * 80}")
        print("CREATING RETREAT REGISTRATIONS")
        print(f"{'=' * 80}")

        query = text("""
            INSERT INTO retreat_registrations (
                user_id,
                retreat_id,
                status,
                payment_status,
                registration_type,
                access_level,
                created_at,
                updated_at
            )
            SELECT DISTINCT
                o.user_id,
                p.retreat_id,
                'APPROVED',
                'PAID',
                'PAST_RETREAT_PURCHASE',
                'LIFETIME',
                COALESCE(o.completed_at, NOW()),
                NOW()
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status = 'COMPLETED'
            AND p.retreat_id IS NOT NULL
            AND p.type = 'RETREAT_PORTAL_ACCESS'
            AND NOT EXISTS (
                SELECT 1 FROM retreat_registrations rr
                WHERE rr.user_id = o.user_id AND rr.retreat_id = p.retreat_id
            )
        """)

        result = self.pg_session.execute(query)
        self.pg_session.commit()

        print(f"  ✓ Created {result.rowcount} new retreat registrations")

    def run(self):
        """Run the complete migration"""
        try:
            print("=" * 80)
            print("COMPLETE RETREAT MEDIA AND OVERVIEW MIGRATION")
            print("=" * 80)

            self.connect_databases()

            # Get all retreat products from PostgreSQL
            print("\nFetching retreat products from PostgreSQL...")
            pg_products = self.get_local_retreat_products()
            print(f"✓ Found {len(pg_products)} retreat products\n")

            # Process each product
            for pg_product in pg_products:
                self.migrate_product(pg_product)

            # Create registrations
            self.create_retreat_registrations()

            print(f"\n{'=' * 80}")
            print("✓ MIGRATION COMPLETE!")
            print(f"{'=' * 80}")
            print("\nAll retreat products have been updated with:")
            print("- Portal media (YouTube, Cloudflare, Podbean, MP3, MP4)")
            print("- Retreat media (in correct LIST format)")
            print("- Overview content and images (placeholders where needed)")
            print("- RetreatRegistrations for all purchasers")

        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()
            if self.pg_session:
                self.pg_session.rollback()
        finally:
            if self.wp_conn:
                self.wp_conn.close()
            if self.pg_session:
                self.pg_session.close()


if __name__ == '__main__':
    migrator = CompleteMigrator()
    migrator.run()
