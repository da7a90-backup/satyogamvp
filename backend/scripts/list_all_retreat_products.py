#!/usr/bin/env python3
"""
List ALL retreat products in local database to compare with WordPress
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

PG_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db")

def main():
    print("=" * 100)
    print("ALL RETREAT PRODUCTS IN LOCAL DATABASE")
    print("=" * 100)

    engine = create_engine(PG_DATABASE_URL)
    session = Session(engine)

    try:
        # Get all products that might be retreat-related
        query = text("""
            SELECT
                p.id,
                p.slug,
                p.title,
                p.type,
                p.retreat_id,
                CASE
                    WHEN p.portal_media IS NOT NULL THEN
                        CASE
                            WHEN p.portal_media::text LIKE '%youtube%' THEN 'YES (YouTube)'
                            WHEN p.portal_media::text LIKE '%cloudflare%' THEN 'YES (Cloudflare)'
                            WHEN p.portal_media::text LIKE '%mp3%' THEN 'YES (MP3)'
                            ELSE 'YES'
                        END
                    ELSE 'NO'
                END as has_media,
                CASE WHEN r.about_image_url IS NOT NULL THEN 'YES' ELSE 'NO' END as has_image,
                CASE WHEN r.about_content IS NOT NULL THEN 'YES' ELSE 'NO' END as has_text,
                r.title as retreat_name,
                CASE WHEN r.past_retreat_portal_media IS NOT NULL THEN 'YES' ELSE 'NO' END as retreat_has_media
            FROM products p
            LEFT JOIN retreats r ON p.retreat_id = r.id
            WHERE
                p.slug LIKE '%retreat%'
                OR p.slug LIKE '%revelation%'
                OR p.slug LIKE '%well%'
                OR p.slug LIKE '%hopeless%'
                OR p.slug LIKE '%darshan%'
                OR p.slug LIKE '%ashram%'
                OR p.slug LIKE '%shakti%'
                OR p.slug LIKE '%sevadhari%'
                OR p.type = 'RETREAT_PORTAL_ACCESS'
            ORDER BY p.title
        """)

        results = session.execute(query).fetchall()

        if not results:
            print("\n⚠ No retreat products found!")
            return

        print(f"\nFound {len(results)} retreat-related products:\n")
        print("-" * 100)

        for row in results:
            product_id, slug, name, ptype, retreat_id, has_media, has_image, has_text, retreat_name, retreat_has_media = row
            print(f"\nProduct: {name}")
            print(f"  Slug: {slug}")
            print(f"  Type: {ptype}")
            print(f"  Retreat ID: {retreat_id or 'NONE'}")
            print(f"  Retreat Name: {retreat_name or 'N/A'}")
            print(f"  Product Media: {has_media}")
            print(f"  Retreat Media: {retreat_has_media if retreat_id else 'N/A'}")
            print(f"  Overview Image: {has_image}")
            print(f"  Overview Text: {has_text}")
            print("-" * 100)

        # Summary
        print(f"\n{'=' * 100}")
        print("SUMMARY")
        print("=" * 100)

        missing_media = sum(1 for row in results if row[5] == 'NO' and row[3] == 'RETREAT_PORTAL_ACCESS')
        missing_retreat_link = sum(1 for row in results if row[4] is None and row[3] == 'RETREAT_PORTAL_ACCESS')
        missing_retreat_media = sum(1 for row in results if row[4] is not None and row[9] == 'NO')
        missing_overview_image = sum(1 for row in results if row[6] == 'NO')
        missing_overview_text = sum(1 for row in results if row[7] == 'NO')

        print(f"Total retreat products: {len(results)}")
        print(f"Missing product media: {missing_media}")
        print(f"Missing retreat link: {missing_retreat_link}")
        print(f"Missing retreat media: {missing_retreat_media}")
        print(f"Missing overview image: {missing_overview_image}")
        print(f"Missing overview text: {missing_overview_text}")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()


if __name__ == '__main__':
    main()
