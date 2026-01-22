"""
Test all retreat media URLs to identify broken links.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.retreat import Retreat
import requests
from urllib.parse import urlparse


def test_url(url):
    """Test if a URL is accessible."""
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code, response.status_code < 400
    except Exception as e:
        return None, False


def main():
    db = SessionLocal()

    try:
        print("\n🔍 Testing all retreat media URLs...\n")

        # Get all retreat products
        products = db.query(Product).filter(
            Product.type == ProductType.RETREAT_PORTAL_ACCESS
        ).order_by(Product.title).all()

        total_urls = 0
        working_urls = 0
        broken_urls = 0
        broken_by_retreat = {}

        for product in products:
            retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

            if not retreat or not retreat.past_retreat_portal_media:
                continue

            retreat_broken = []

            for idx, media_item in enumerate(retreat.past_retreat_portal_media, 1):
                # Test video_url if present
                if media_item.get('youtube_url'):
                    total_urls += 1
                    status_code, is_working = test_url(media_item['youtube_url'])
                    if is_working:
                        working_urls += 1
                    else:
                        broken_urls += 1
                        retreat_broken.append({
                            'class': idx,
                            'title': media_item.get('title', 'Unknown'),
                            'url': media_item['youtube_url'],
                            'status': status_code or 'Error'
                        })

                # Test audio_url if present
                if media_item.get('audio_url'):
                    total_urls += 1
                    status_code, is_working = test_url(media_item['audio_url'])
                    if is_working:
                        working_urls += 1
                    else:
                        broken_urls += 1
                        retreat_broken.append({
                            'class': idx,
                            'title': media_item.get('title', 'Unknown'),
                            'url': media_item['audio_url'],
                            'status': status_code or 'Error'
                        })

            if retreat_broken:
                broken_by_retreat[product.title] = retreat_broken

        # Print results
        print(f"=== TEST RESULTS ===\n")
        print(f"Total URLs tested: {total_urls}")
        print(f"✅ Working: {working_urls}")
        print(f"❌ Broken: {broken_urls}")

        if broken_by_retreat:
            print(f"\n=== BROKEN URLS BY RETREAT ===\n")
            for retreat_title, broken_items in broken_by_retreat.items():
                print(f"\n{retreat_title}: {len(broken_items)} broken URLs")
                for item in broken_items:
                    print(f"  Class {item['class']}: {item['title']}")
                    print(f"    URL: {item['url']}")
                    print(f"    Status: {item['status']}")
        else:
            print(f"\n🎉 All URLs are working!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
