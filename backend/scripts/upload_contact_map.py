#!/usr/bin/env python3
"""
Upload contact page map image to Cloudflare Images
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_IMAGES_TOKEN = os.getenv('CLOUDFLARE_IMAGES_TOKEN')

def upload_image(image_path: str, image_id: str = "contact-page-map"):
    """Upload image to Cloudflare Images"""

    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return None

    if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_IMAGES_TOKEN:
        print("❌ Error: Cloudflare credentials not found in .env")
        print(f"   CLOUDFLARE_ACCOUNT_ID: {'✓' if CLOUDFLARE_ACCOUNT_ID else '✗'}")
        print(f"   CLOUDFLARE_IMAGES_TOKEN: {'✓' if CLOUDFLARE_IMAGES_TOKEN else '✗'}")
        return None

    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1"

    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_IMAGES_TOKEN}"
    }

    with open(image_path, 'rb') as f:
        files = {
            'file': f
        }
        data = {
            'id': image_id
        }

        print(f"🚀 Uploading {os.path.basename(image_path)} to Cloudflare Images...")

        response = requests.post(url, headers=headers, files=files, data=data)

    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            image_url = result['result']['variants'][0]
            print(f"✅ Upload successful!")
            print(f"📷 Image URL: {image_url}")
            print(f"🆔 Image ID: {image_id}")
            return image_url
        else:
            print(f"❌ Upload failed: {result.get('errors')}")
            return None
    else:
        print(f"❌ Upload failed with status code: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def update_database(image_url: str):
    """Update the database with the image URL"""
    import psycopg2
    from urllib.parse import urlparse

    # Get database connection from environment
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("❌ Error: DATABASE_URL not found in .env")
        return False

    # Parse the database URL
    if database_url.startswith('postgresql://'):
        url = urlparse(database_url)
        conn = psycopg2.connect(
            host=url.hostname,
            port=url.port or 5432,
            user=url.username,
            password=url.password,
            database=url.path[1:]
        )
    else:
        print("⚠️  Using hardcoded database credentials")
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            user='satyoga',
            password='satyoga_dev_password',
            database='satyoga_db'
        )

    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE contact_info SET map_image = %s WHERE id = 1",
            (image_url,)
        )
        conn.commit()
        print("✅ Database updated successfully!")
        return True
    except Exception as e:
        print(f"❌ Database update failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_contact_map.py <image_path>")
        print("\nExample:")
        print("  python upload_contact_map.py ~/Downloads/map.png")
        sys.exit(1)

    image_path = sys.argv[1]

    # Upload to Cloudflare
    image_url = upload_image(image_path)

    if image_url:
        # Update database
        update_database(image_url)
        print("\n" + "="*60)
        print("🎉 All done! The map image is now live on the contact page.")
        print("="*60)
    else:
        print("\n❌ Failed to upload image")
        sys.exit(1)
