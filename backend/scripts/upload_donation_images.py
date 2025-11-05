#!/usr/bin/env python3
"""
Upload donation images to Cloudflare and add to database
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

def upload_to_cloudflare(file_path: str) -> str:
    """Upload image to Cloudflare Images and return CDN URL"""
    headers = {"Authorization": f"Bearer {CF_IMAGES_TOKEN}"}

    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(CF_IMAGES_URL, headers=headers, files=files)

    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")

    result = response.json()['result']
    return result['variants'][0]  # Return public variant URL

# Mapping of local files to original paths
IMAGES = {
    '/tmp/donation_images/broadcasting.jpg': '/images/donate/broadcasting.jpg',
    '/tmp/donation_images/off-grid.jpg': '/images/donate/off-grid.jpg',
    '/tmp/donation_images/scholarships.jpg': '/images/donate/scholarships.jpg',
    '/tmp/donation_images/publishing.png': '/images/donate/publishing.jpg',  # Convert to jpg path
    '/tmp/donation_images/infrastructure.jpg': '/images/donate/infrastructure.jpg',
}

def main():
    print("\n🚀 Uploading Donation Images to Cloudflare")
    print("=" * 70)

    db = SessionLocal()
    uploaded = 0

    try:
        for file_path, original_path in IMAGES.items():
            if not Path(file_path).exists():
                print(f"❌ File not found: {file_path}")
                continue

            # Check if already uploaded
            existing = db.query(MediaAsset).filter(
                MediaAsset.original_path == original_path
            ).first()

            if existing:
                print(f"⏭️  Already uploaded: {original_path}")
                continue

            print(f"\n📤 Uploading: {original_path}")
            print(f"   Source: {file_path}")

            # Upload to Cloudflare
            cdn_url = upload_to_cloudflare(file_path)
            print(f"✅ CDN URL: {cdn_url}")

            # Get file stats
            file_stat = Path(file_path).stat()
            mime_type, _ = mimetypes.guess_type(file_path)

            # Create database record
            media_asset = MediaAsset(
                original_path=original_path,
                storage_type='cloudflare_images',
                storage_id=cdn_url.split('/')[-2],  # Extract ID from URL
                cdn_url=cdn_url,
                file_type=mime_type,
                file_size=file_stat.st_size,
                context='donation-images',
                is_active=True
            )
            db.add(media_asset)
            db.commit()

            uploaded += 1
            print(f"💾 Saved to database")

        print("\n" + "=" * 70)
        print(f"✅ Upload Complete!")
        print(f"   Uploaded: {uploaded} images")
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
