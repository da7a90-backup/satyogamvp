#!/usr/bin/env python3
"""
Update donation images - Upload new versions to Cloudflare and update database
"""
import os
import sys
import requests
from pathlib import Path
import mimetypes
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import MediaAsset

# Load environment variables
load_dotenv()

# Cloudflare configuration
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_IMAGES_TOKEN = os.getenv("CLOUDFLARE_IMAGES_TOKEN")
CF_IMAGES_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/images/v1"

def upload_to_cloudflare(file_path: str, image_id: str = None) -> dict:
    """Upload image to Cloudflare Images and return full result"""
    headers = {"Authorization": f"Bearer {CF_IMAGES_TOKEN}"}

    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {}
        if image_id:
            data['id'] = image_id

        response = requests.post(CF_IMAGES_URL, headers=headers, files=files, data=data)

    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")

    return response.json()['result']

# Mapping of Downloads files to database paths
IMAGES = {
    '/Users/guertethiaf/Downloads/DONATE Top Banner.jpg': '/images/donate/hero-bg.jpg',
    '/Users/guertethiaf/Downloads/DONATE TAB 2 - Broadcasting from the Asharm.jpg': '/images/donate/broadcasting.jpg',
    '/Users/guertethiaf/Downloads/DONATE TAB 3 - Off-Grid Preparedness.jpg': '/images/donate/off-grid.jpg',
    '/Users/guertethiaf/Downloads/DONATE TAB 4 - Student Scholarships.jpg': '/images/donate/scholarships.jpg',
    '/Users/guertethiaf/Downloads/DONATE TAB 5 Book Publishing.png': '/images/donate/publishing.jpg',
    '/Users/guertethiaf/Downloads/DONATE TAB 6 - Infrastructure.jpg': '/images/donate/infrastructure.jpg',
}

def main():
    print("\n🚀 Updating Donation Images on Cloudflare")
    print("=" * 70)

    if not CF_ACCOUNT_ID or not CF_IMAGES_TOKEN:
        print("❌ Missing Cloudflare credentials in .env file")
        print(f"   CLOUDFLARE_ACCOUNT_ID: {'✓' if CF_ACCOUNT_ID else '✗'}")
        print(f"   CLOUDFLARE_IMAGES_TOKEN: {'✓' if CF_IMAGES_TOKEN else '✗'}")
        sys.exit(1)

    db = SessionLocal()
    uploaded = 0
    updated = 0

    try:
        for file_path, original_path in IMAGES.items():
            if not Path(file_path).exists():
                print(f"❌ File not found: {file_path}")
                continue

            # Check if already in database
            existing = db.query(MediaAsset).filter(
                MediaAsset.original_path == original_path
            ).first()

            print(f"\n📤 Processing: {original_path}")
            print(f"   Source: {Path(file_path).name}")

            # Upload to Cloudflare
            result = upload_to_cloudflare(file_path)
            cdn_url = result['variants'][0]  # Get public variant URL
            storage_id = result['id']

            print(f"✅ Uploaded to Cloudflare")
            print(f"   CDN URL: {cdn_url}")
            print(f"   Storage ID: {storage_id}")

            # Get file stats
            file_stat = Path(file_path).stat()
            mime_type, _ = mimetypes.guess_type(file_path)

            if existing:
                # Update existing record
                existing.cdn_url = cdn_url
                existing.storage_id = storage_id
                existing.file_type = mime_type
                existing.file_size = file_stat.st_size
                existing.is_active = True
                print(f"💾 Updated database record")
                updated += 1
            else:
                # Create new database record
                media_asset = MediaAsset(
                    original_path=original_path,
                    storage_type='cloudflare_images',
                    storage_id=storage_id,
                    cdn_url=cdn_url,
                    file_type=mime_type,
                    file_size=file_stat.st_size,
                    context='donation-images',
                    is_active=True
                )
                db.add(media_asset)
                print(f"💾 Created database record")
                uploaded += 1

            db.commit()

        print("\n" + "=" * 70)
        print(f"✅ Update Complete!")
        print(f"   New uploads: {uploaded}")
        print(f"   Updated: {updated}")
        print(f"   Total processed: {uploaded + updated}")
        print("=" * 70 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
