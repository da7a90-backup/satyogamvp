#!/usr/bin/env python3
"""
Fix Retreat Media Migration - Direct approach with extracted WordPress data

This script migrates media from WordPress to our retreat products using pre-extracted URLs.
"""

import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:satyoga_dev_password@localhost:5432/satyoga_dev")

# Pre-extracted media data from WordPress
RETREAT_MEDIA = {
    'revelation-of-the-real-the-final-secrets-of-the-simulation-and-the-self': {
        'cloudflare': [
            '5928668bb26f12e40275cb826f0d161f',
            '79f3fd30364e50eb9f3763215aa8e4c7',
            '1d16e0a89c6bcec5fd3960c343bae4fd',
            'c3c45025d6d13a52defacefc467aa0c8',
        ]
    },
    'alls-well-that-ends-well-the-re-marriage-of-shakti-and-shiva': {
        'youtube': [
            'dBahl1V1a7I', 'QLHBl_Ant6I', 'tHpqxKmuFY0', 'b4pz6lefEZY',
            'z8ETs6n3tfo', 'MW2c9lcPAEI', 'qMfCdnusNGY', 'FRufUo7wJP8',
            'sMII5xrQHTI', 'NLJ8-yKLtMI', 'h6necUkah1w', 'lKf0hnNY2lQ',
            'KEtneIolv0A', 'U8NqbzI89Pw', '5yxU4Kphurc', 'URAhmK65xVM',
            '9isgNp-iLfc', 'Ophl4HiValo', 'eQNo96rfZQ4', 'XDi78jXc0Os',
        ]
    },
    'why-our-situation-is-hopeless-yet-hilarious': {
        'youtube': [
            'lU_niNWQh2s', '3fZKbm5kAww', 'crKL93nGe6I', 'TOBc4rfaGuA',
            'XHOmBV4js_E', 'W6Md9dT8riE', 'glZebEdd1tM', 'pquQLNq8wYg',
            'HDPPrWYdi-4', 'FXE4l-PD0B0', 'XHYyUeLv7Ao', 'H02fDiT8Bh4',
            'gNXCxa4Y8Bc', 'cYYM1FbCuvc', 'K6MDJOPJGdY', 'kU9oZgt5f3s',
            'A7GeblPFGng', 'QLHBl_Ant6I', 'ii0X0QqhPPQ', 'QC2e6ketBEw',
            'j0mp00WwZ1E', 'kPMD2AdKFAQ', 'Vu9IxNDDZO4', 'oljRvtjm7Qw',
            '67mkzH_eRMI', 'dBahl1V1a7I', 'tHpqxKmuFY0', 'b4pz6lefEZY',
            'z8ETs6n3tfo', 'MW2c9lcPAEI',
        ],
        # This retreat already has MP3s in product.portal_media, copy them to retreat
        'copy_from_product': True
    }
}


def format_media_list(slug: str, media_dict: dict) -> list:
    """Format media dictionary into proper list format for database"""
    media_list = []
    class_num = 1

    # Handle Cloudflare videos
    if 'cloudflare' in media_dict:
        for video_id in media_dict['cloudflare']:
            media_list.append({
                'title': f'Class {class_num}',
                'description': f'Session {class_num}',
                'cloudflare_url': f'https://iframe.videodelivery.net/{video_id}'
            })
            class_num += 1

    # Handle YouTube videos
    if 'youtube' in media_dict:
        for video_id in media_dict['youtube']:
            media_list.append({
                'title': f'Class {class_num}',
                'description': f'Session {class_num}',
                'youtube_url': f'https://www.youtube.com/watch?v={video_id}'
            })
            class_num += 1

    return media_list


def main():
    print("=" * 80)
    print("RETREAT MEDIA MIGRATION - FIX SCRIPT")
    print("=" * 80)

    engine = create_engine(PG_DATABASE_URL)
    session = Session(engine)

    try:
        for product_slug, media_data in RETREAT_MEDIA.items():
            print(f"\n{'─' * 80}")
            print(f"Processing: {product_slug}")
            print(f"{'─' * 80}")

            # Get product and retreat
            query = text("""
                SELECT p.id, p.name, p.retreat_id, p.portal_media, r.past_retreat_portal_media
                FROM products p
                LEFT JOIN retreats r ON p.retreat_id = r.id
                WHERE p.slug = :slug
            """)

            result = session.execute(query, {'slug': product_slug}).fetchone()

            if not result:
                print(f"  ⚠ Product not found: {product_slug}")
                continue

            product_id, product_name, retreat_id, existing_product_media, existing_retreat_media = result
            print(f"  ✓ Found product: {product_name} (ID: {product_id})")

            if not retreat_id:
                print(f"  ⚠ No retreat linked to this product")
                continue

            print(f"  ✓ Retreat ID: {retreat_id}")

            # Format media list
            if media_data.get('copy_from_product') and existing_product_media:
                # For Hopeless - copy existing MP3s from product
                print(f"  → Copying existing product media to retreat")
                media_list = json.loads(existing_product_media) if isinstance(existing_product_media, str) else existing_product_media
            else:
                # For others - create new media list
                media_list = format_media_list(product_slug, media_data)

            if not media_list:
                print(f"  ⚠ No media to migrate")
                continue

            print(f"  → Migrating {len(media_list)} media items")

            # Update product.portal_media
            update_product = text("""
                UPDATE products
                SET portal_media = :media
                WHERE id = :product_id
            """)

            session.execute(update_product, {
                'product_id': product_id,
                'media': json.dumps(media_list)
            })
            print(f"  ✓ Updated product.portal_media")

            # Update retreat.past_retreat_portal_media
            update_retreat = text("""
                UPDATE retreats
                SET past_retreat_portal_media = :media
                WHERE id = :retreat_id
            """)

            session.execute(update_retreat, {
                'retreat_id': retreat_id,
                'media': json.dumps(media_list)
            })
            print(f"  ✓ Updated retreat.past_retreat_portal_media")

        # Create RetreatRegistrations for purchasers
        print(f"\n{'─' * 80}")
        print("Creating Retreat Registrations")
        print(f"{'─' * 80}")

        create_registrations = text("""
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

        result = session.execute(create_registrations)
        session.commit()

        print(f"  ✓ Created {result.rowcount} new retreat registrations")

        print("\n" + "=" * 80)
        print("✓ MIGRATION COMPLETE!")
        print("=" * 80)
        print("\nAll retreat media has been migrated successfully.")
        print("Users who purchased these products now have access in 'My Online Retreats'.")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    main()
