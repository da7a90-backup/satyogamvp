#!/usr/bin/env python3
"""
Fix ALL Retreat Products - Final Migration

This script:
1. Ensures all product.portal_media is in correct LIST format
2. Copies all portal_media to retreat.past_retreat_portal_media in LIST format
3. Adds placeholder overview content and images for all retreats
4. Creates RetreatRegistrations for all purchasers
"""

import sys
import os
import json
from typing import List, Dict, Any
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")


def ensure_list_format(media_data: Any) -> List[Dict]:
    """Convert media from any format to LIST format"""
    if not media_data:
        return []

    # If it's already a list, return it
    if isinstance(media_data, list):
        return media_data

    # If it's a dict, convert to list
    if isinstance(media_data, dict):
        # Check if it's the old {youtube: [], audio: []} format
        if 'youtube' in media_data or 'audio' in media_data or 'cloudflare' in media_data:
            formatted_list = []
            session_num = 1

            # Process cloudflare videos
            for url in media_data.get('cloudflare', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'cloudflare_url': url
                })
                session_num += 1

            # Process YouTube videos
            for url in media_data.get('youtube', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'youtube_url': url
                })
                session_num += 1

            # Process audio (Podbean/MP3)
            for url in media_data.get('audio', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'audio_url': url
                })
                session_num += 1

            # Process Podbean
            for url in media_data.get('podbean', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'audio_url': url
                })
                session_num += 1

            # Process MP3
            for url in media_data.get('mp3', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'audio_url': url
                })
                session_num += 1

            # Process MP4
            for url in media_data.get('mp4', []):
                formatted_list.append({
                    'title': f'Class {session_num}',
                    'description': f'Session {session_num}',
                    'video_url': url
                })
                session_num += 1

            return formatted_list
        else:
            # It's a single media item dict, wrap in list
            return [media_data]

    return []


def main():
    print("=" * 100)
    print("FIX ALL RETREAT PRODUCTS - FINAL MIGRATION")
    print("=" * 100)

    engine = create_engine(PG_DATABASE_URL)
    session = Session(engine)

    try:
        # Get all retreat products
        query = text("""
            SELECT
                p.id,
                p.slug,
                p.title,
                p.retreat_id,
                p.portal_media,
                r.title as retreat_name,
                r.past_retreat_portal_media,
                r.about_content,
                r.about_image_url
            FROM products p
            LEFT JOIN retreats r ON p.retreat_id = r.id
            WHERE p.type = 'RETREAT_PORTAL_ACCESS'
            ORDER BY p.title
        """)

        results = session.execute(query).fetchall()

        print(f"\nFound {len(results)} retreat products to process\n")

        fixed_count = 0

        for row in results:
            product_id, slug, title, retreat_id, portal_media, retreat_name, retreat_media, about_content, about_image = row

            print(f"{'─' * 100}")
            print(f"Processing: {title}")
            print(f"{'─' * 100}")

            # Parse existing media
            if isinstance(portal_media, str):
                portal_media = json.loads(portal_media)

            # Ensure portal_media is in LIST format
            formatted_media = ensure_list_format(portal_media)

            if not formatted_media:
                print(f"  ⚠ No media found for this product")
                continue

            print(f"  → {len(formatted_media)} media items found")

            # Update product.portal_media in correct format
            update_product = text("""
                UPDATE products
                SET portal_media = :media
                WHERE id = :product_id
            """)

            session.execute(update_product, {
                'product_id': product_id,
                'media': json.dumps(formatted_media)
            })
            print(f"  ✓ Updated product.portal_media")

            # Update retreat if exists
            if retreat_id:
                # Update retreat.past_retreat_portal_media
                update_retreat_media = text("""
                    UPDATE retreats
                    SET past_retreat_portal_media = :media
                    WHERE id = :retreat_id
                """)

                session.execute(update_retreat_media, {
                    'retreat_id': retreat_id,
                    'media': json.dumps(formatted_media)
                })
                print(f"  ✓ Updated retreat.past_retreat_portal_media")

                # Add overview content if missing
                if not about_content or not about_image:
                    overview_text = f"Welcome to {title}. This transformative retreat includes {len(formatted_media)} powerful sessions of spiritual teachings and practices."
                    placeholder_image = "https://placehold.co/600x400/1a1a1a/white/png?text=Retreat+Overview"

                    update_overview = text("""
                        UPDATE retreats
                        SET
                            about_content = COALESCE(about_content, :content),
                            about_image_url = COALESCE(about_image_url, :image)
                        WHERE id = :retreat_id
                    """)

                    session.execute(update_overview, {
                        'retreat_id': retreat_id,
                        'content': overview_text,
                        'image': placeholder_image
                    })
                    print(f"  ✓ Added overview content and placeholder image")

                fixed_count += 1
            else:
                print(f"  ⚠ No retreat linked to this product")

        session.commit()

        # Create retreat registrations for all purchasers
        print(f"\n{'=' * 100}")
        print("CREATING RETREAT REGISTRATIONS FOR PURCHASERS")
        print(f"{'=' * 100}")

        create_registrations = text("""
            INSERT INTO retreat_registrations (
                user_id,
                retreat_id,
                status,
                access_type,
                registered_at,
                access_expires_at
            )
            SELECT DISTINCT
                o.user_id,
                p.retreat_id,
                'CONFIRMED'::registrationstatus,
                'LIFETIME'::accesstype,
                COALESCE(o.created_at, NOW()),
                NULL::timestamp
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

        result = session.execute(create_registrations)
        session.commit()

        print(f"  ✓ Created {result.rowcount} new retreat registrations")

        print(f"\n{'=' * 100}")
        print("✓ MIGRATION COMPLETE!")
        print(f"{'=' * 100}")
        print(f"\nFixed {fixed_count} retreat products:")
        print(f"  - Ensured all media in correct LIST format")
        print(f"  - Synced product.portal_media → retreat.past_retreat_portal_media")
        print(f"  - Added overview content and placeholder images where missing")
        print(f"  - Created retreat registrations for all purchasers")
        print(f"\nAll retreat products should now display properly in 'My Online Retreats'!")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    main()
