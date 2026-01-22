#!/usr/bin/env python3
"""
Comprehensive WordPress to PostgreSQL Retreat Media Migration Script

This script:
1. Connects to WordPress MySQL database on production server
2. Extracts ALL media URLs from past online retreat products (YouTube, Cloudflare, Podbean, MP3, MP4)
3. Maps WordPress products to PostgreSQL products by name matching
4. Creates missing retreat records
5. Migrates media to both product.portal_media and retreat.past_retreat_portal_media
6. Creates RetreatRegistrations for users who purchased these products
7. Ensures proper LIST format for past_retreat_portal_media
"""

import sys
import os
import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

# Add parent directory to path
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

# PostgreSQL Connection (Local)
PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:satyoga_dev_password@localhost:5432/satyoga_dev")


class MediaExtractor:
    """Extract media URLs from various formats"""

    @staticmethod
    def extract_youtube_urls(content: str) -> List[str]:
        """Extract YouTube video IDs from various formats"""
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
        return urls

    @staticmethod
    def extract_vimeo_urls(content: str) -> List[str]:
        """Extract Vimeo URLs"""
        patterns = [
            r'vimeo\.com/video/(\d+)',
            r'player\.vimeo\.com/video/(\d+)',
        ]
        video_ids = set()
        for pattern in patterns:
            matches = re.findall(pattern, content)
            video_ids.update(matches)
        return [f'https://vimeo.com/{vid}' for vid in video_ids]

    @staticmethod
    def extract_podbean_urls(content: str) -> List[str]:
        """Extract Podbean URLs"""
        pattern = r'(https?://[^\s\"\']+podbean[^\s\"\']+)'
        return re.findall(pattern, content)

    @staticmethod
    def extract_mp3_urls(content: str) -> List[str]:
        """Extract direct MP3 URLs"""
        pattern = r'(https?://[^\s\"\']+\.mp3[^\s\"\']*)'
        return re.findall(pattern, content)

    @staticmethod
    def extract_mp4_urls(content: str) -> List[str]:
        """Extract direct MP4 URLs"""
        pattern = r'(https?://[^\s\"\']+\.mp4[^\s\"\']*)'
        return re.findall(pattern, content)

    @classmethod
    def extract_all_media(cls, content: str) -> Dict[str, List[str]]:
        """Extract all media types from content"""
        return {
            'youtube': cls.extract_youtube_urls(content),
            'cloudflare': cls.extract_cloudflare_urls(content),
            'vimeo': cls.extract_vimeo_urls(content),
            'podbean': cls.extract_podbean_urls(content),
            'mp3': cls.extract_mp3_urls(content),
            'mp4': cls.extract_mp4_urls(content),
        }


class RetreatMediaMigrator:
    """Main migration class"""

    def __init__(self):
        self.wp_conn = None
        self.pg_engine = None
        self.pg_session = None

        # Retreat product mapping (WordPress title -> PostgreSQL product name)
        self.retreat_mappings = {
            'Revelation of the Real': 'revelation-of-the-real-the-final-secrets-of-the-simulation-and-the-self',
            "All's Well That Ends Well": "alls-well-that-ends-well-the-re-marriage-of-shakti-and-shiva",
            'Hopeless, Yet Hilarious': 'why-our-situation-is-hopeless-yet-hilarious',
        }

    def connect_databases(self):
        """Connect to both WordPress MySQL and PostgreSQL databases"""
        print("Connecting to databases...")

        # Connect to WordPress MySQL
        self.wp_conn = pymysql.connect(**WP_DB_CONFIG)
        print("✓ Connected to WordPress MySQL")

        # Connect to PostgreSQL
        self.pg_engine = create_engine(PG_DATABASE_URL)
        self.pg_session = Session(self.pg_engine)
        print("✓ Connected to PostgreSQL")

    def get_wordpress_retreat_products(self) -> List[Dict[str, Any]]:
        """Get all past online retreat products from WordPress"""
        print("\nFetching WordPress retreat products...")

        query = """
        SELECT
            p.ID as product_id,
            p.post_title as title,
            p.post_name as slug
        FROM wrt6_posts p
        WHERE p.post_type = 'product'
        AND p.post_status = 'publish'
        AND (
            p.post_title LIKE '%Revelation%'
            OR p.post_title LIKE '%Well That Ends%'
            OR p.post_title LIKE '%Hopeless%'
            OR p.post_title LIKE '%Audio%Video%Package%'
            OR p.post_title LIKE '%A&V package%'
        )
        ORDER BY p.ID DESC
        """

        with self.wp_conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query)
            products = cursor.fetchall()

        print(f"✓ Found {len(products)} retreat products in WordPress")
        return products

    def get_media_for_product(self, product_id: int, product_title: str) -> Dict[str, List[str]]:
        """Get all media URLs for a WordPress product by checking associated pages"""
        print(f"\n  Extracting media for: {product_title}")

        # Search for associated A&V package pages and portal pages
        search_terms = [
            f"%{product_title.split(':')[0].strip()}%A&V%",
            f"%{product_title.split(':')[0].strip()}%Audio%",
            f"%{product_title.split(':')[0].strip()}%Portal%",
        ]

        all_media = {
            'youtube': [],
            'cloudflare': [],
            'vimeo': [],
            'podbean': [],
            'mp3': [],
            'mp4': [],
        }

        # Get pages related to this product
        query = """
        SELECT p.ID, p.post_title, p.post_content
        FROM wrt6_posts p
        WHERE p.post_type = 'page'
        AND p.post_status = 'publish'
        AND (
            p.post_title LIKE %s
            OR p.post_title LIKE %s
            OR p.post_title LIKE %s
        )
        """

        with self.wp_conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, search_terms)
            pages = cursor.fetchall()

        if not pages:
            print(f"    ⚠ No associated pages found")
            return all_media

        print(f"    Found {len(pages)} associated pages")

        # Extract media from each page
        for page in pages:
            page_id = page['ID']
            page_title = page['post_title']

            # Get all postmeta for this page
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
                OR meta_value LIKE '%vimeo%'
                OR meta_value LIKE '%podbean%'
                OR meta_value LIKE '%.mp3%'
                OR meta_value LIKE '%.mp4%'
            )
            """

            with self.wp_conn.cursor(pymysql.cursors.DictCursor) as meta_cursor:
                meta_cursor.execute(meta_query, (page_id,))
                meta_rows = meta_cursor.fetchall()

            # Process each meta row
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
        """Format media dictionary into the format expected by our database"""
        formatted_media = []
        session_num = 1

        # Process in order: cloudflare, youtube, vimeo, podbean, mp4, mp3
        for media_type in ['cloudflare', 'youtube', 'vimeo', 'podbean', 'mp4', 'mp3']:
            urls = media_dict.get(media_type, [])

            for url in urls:
                media_item = {
                    'title': f'Class {session_num}',
                    'description': f'{title} - Session {session_num}',
                }

                # Set appropriate URL field based on type
                if media_type == 'youtube':
                    media_item['youtube_url'] = url
                elif media_type == 'cloudflare':
                    media_item['cloudflare_url'] = url
                elif media_type == 'vimeo':
                    media_item['vimeo_url'] = url
                elif media_type == 'podbean':
                    media_item['audio_url'] = url
                elif media_type == 'mp3':
                    media_item['audio_url'] = url
                elif media_type == 'mp4':
                    media_item['video_url'] = url

                formatted_media.append(media_item)
                session_num += 1

        return formatted_media

    def migrate_product_media(self, wp_product: Dict[str, Any], media: Dict[str, List[str]]):
        """Migrate media to PostgreSQL product and retreat"""
        title = wp_product['title']
        print(f"\n  Migrating to PostgreSQL for: {title}")

        # Find matching product in PostgreSQL
        # Try to match by slug or title
        product_slug = None
        for key_phrase, slug in self.retreat_mappings.items():
            if key_phrase.lower() in title.lower():
                product_slug = slug
                break

        if not product_slug:
            print(f"    ⚠ Could not map product to PostgreSQL: {title}")
            return

        # Get product from PostgreSQL
        query = text("""
            SELECT id, name, retreat_id, portal_media
            FROM products
            WHERE slug = :slug
        """)

        result = self.pg_session.execute(query, {'slug': product_slug}).fetchone()

        if not result:
            print(f"    ⚠ Product not found in PostgreSQL: {product_slug}")
            return

        product_id = result[0]
        product_name = result[1]
        retreat_id = result[2]

        print(f"    ✓ Found product: {product_name} (ID: {product_id})")

        # Format media
        formatted_media = self.format_media_for_database(media, product_name)

        if not formatted_media:
            print(f"    ⚠ No media to migrate")
            return

        # Update product.portal_media
        update_product_query = text("""
            UPDATE products
            SET portal_media = :media
            WHERE id = :product_id
        """)

        self.pg_session.execute(update_product_query, {
            'product_id': product_id,
            'media': json.dumps(formatted_media)
        })
        print(f"    ✓ Updated product.portal_media with {len(formatted_media)} items")

        # Update retreat.past_retreat_portal_media if retreat exists
        if retreat_id:
            update_retreat_query = text("""
                UPDATE retreats
                SET past_retreat_portal_media = :media
                WHERE id = :retreat_id
            """)

            self.pg_session.execute(update_retreat_query, {
                'retreat_id': retreat_id,
                'media': json.dumps(formatted_media)
            })
            print(f"    ✓ Updated retreat.past_retreat_portal_media with {len(formatted_media)} items")
        else:
            print(f"    ⚠ Product has no associated retreat, skipping retreat media update")

        self.pg_session.commit()

    def create_retreat_registrations(self):
        """Create RetreatRegistrations for users who purchased retreat products"""
        print("\n\nCreating RetreatRegistrations for purchasers...")

        # Get all completed orders for retreat products
        query = text("""
            SELECT DISTINCT
                o.user_id,
                p.id as product_id,
                p.retreat_id,
                p.name as product_name,
                o.completed_at
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status = 'COMPLETED'
            AND p.retreat_id IS NOT NULL
            AND p.type = 'RETREAT_PORTAL_ACCESS'
        """)

        results = self.pg_session.execute(query).fetchall()

        if not results:
            print("  No purchases found to create registrations")
            return

        print(f"  Found {len(results)} purchases")

        created = 0
        for row in results:
            user_id, product_id, retreat_id, product_name, completed_at = row

            # Check if registration already exists
            check_query = text("""
                SELECT id FROM retreat_registrations
                WHERE user_id = :user_id AND retreat_id = :retreat_id
            """)

            existing = self.pg_session.execute(check_query, {
                'user_id': user_id,
                'retreat_id': retreat_id
            }).fetchone()

            if existing:
                continue

            # Create registration
            insert_query = text("""
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
                VALUES (
                    :user_id,
                    :retreat_id,
                    'APPROVED',
                    'PAID',
                    'PAST_RETREAT_PURCHASE',
                    'LIFETIME',
                    :created_at,
                    NOW()
                )
            """)

            self.pg_session.execute(insert_query, {
                'user_id': user_id,
                'retreat_id': retreat_id,
                'created_at': completed_at or datetime.now()
            })

            created += 1

        self.pg_session.commit()
        print(f"  ✓ Created {created} new RetreatRegistrations")

    def run(self):
        """Run the complete migration"""
        try:
            print("=" * 80)
            print("WORDPRESS TO POSTGRESQL RETREAT MEDIA MIGRATION")
            print("=" * 80)

            self.connect_databases()

            # Get WordPress products
            wp_products = self.get_wordpress_retreat_products()

            if not wp_products:
                print("\n⚠ No products found to migrate")
                return

            # Process each product
            print("\n" + "=" * 80)
            print("EXTRACTING AND MIGRATING MEDIA")
            print("=" * 80)

            for wp_product in wp_products:
                print(f"\n{'─' * 80}")
                print(f"Processing: {wp_product['title']}")
                print(f"{'─' * 80}")

                # Extract media
                media = self.get_media_for_product(
                    wp_product['product_id'],
                    wp_product['title']
                )

                # Migrate to PostgreSQL
                if any(media.values()):
                    self.migrate_product_media(wp_product, media)
                else:
                    print(f"  ⚠ No media found for this product")

            # Create registrations
            print("\n" + "=" * 80)
            print("CREATING RETREAT REGISTRATIONS")
            print("=" * 80)
            self.create_retreat_registrations()

            print("\n" + "=" * 80)
            print("✓ MIGRATION COMPLETE!")
            print("=" * 80)

        except Exception as e:
            print(f"\n✗ Error during migration: {e}")
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
    migrator = RetreatMediaMigrator()
    migrator.run()
