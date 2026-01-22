"""
Fix Healing with Truth Retreat:
1. Upload missing MP3 file to R2
2. Update all database URLs to point to R2
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from botocore.client import Config
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.product import Product
from app.models.retreat import Retreat
import subprocess


def upload_missing_file_to_r2():
    """Upload the missing MP3 file from server to R2."""

    filename = "9-You-Can't-Be-Half-Liberated-Healing-with-Truth.mp3"
    server_path = f"/var/www/satyoga/wp-content/uploads/2020/06/{filename}"
    local_temp_path = f"/tmp/{filename}"
    r2_key = f"retreat-audio/{filename}"

    print(f"\n📥 Downloading file from server...")
    print(f"   Server: {server_path}")
    print(f"   Local temp: {local_temp_path}")

    # Download from server
    result = subprocess.run(
        ['scp', f'root@104.248.239.206:{server_path}', local_temp_path],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"❌ Failed to download file: {result.stderr}")
        return False

    print(f"✅ Downloaded successfully")

    # Upload to R2
    print(f"\n📤 Uploading to R2...")
    print(f"   R2 key: {r2_key}")

    s3_client = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

    try:
        with open(local_temp_path, 'rb') as f:
            s3_client.upload_fileobj(
                f,
                settings.R2_BUCKET_NAME,
                r2_key,
                ExtraArgs={'ContentType': 'audio/mpeg'}
            )
        print(f"✅ Uploaded to R2")

        # Clean up temp file
        os.remove(local_temp_path)
        print(f"✅ Cleaned up temp file")

        return True

    except Exception as e:
        print(f"❌ Failed to upload: {e}")
        return False


def update_database_urls(db: SessionLocal):
    """Update all Healing with Truth URLs to point to R2."""

    product = db.query(Product).filter(Product.slug == 'healing-with-truth-retreat').first()

    if not product or not product.retreat_id:
        print("❌ Product not found")
        return False

    retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

    if not retreat or not retreat.past_retreat_portal_media:
        print("❌ Retreat not found")
        return False

    # Map of filenames to their R2 URLs
    r2_url_base = f"{settings.R2_PUBLIC_URL}/retreat-audio"

    updated_count = 0

    for item in retreat.past_retreat_portal_media:
        if isinstance(item, dict) and item.get('audio_url'):
            url = item['audio_url']

            # Only update if it's a satyoga.org URL
            if 'satyoga.org' in url:
                # Extract filename from URL
                filename = url.split('/')[-1]

                # Build R2 URL
                r2_url = f"{r2_url_base}/{filename}"

                # Update the URL
                item['audio_url'] = r2_url
                updated_count += 1

    print(f"\n✅ Updated {updated_count} URLs to R2")
    return True


def main():
    print("\n🔧 Fixing Healing with Truth Retreat URLs...\n")

    # Step 1: Upload missing file
    print("STEP 1: Upload missing file to R2")
    if not upload_missing_file_to_r2():
        print("\n⚠️  Failed to upload file, but will continue with URL updates")

    # Step 2: Update database URLs
    print("\nSTEP 2: Update database URLs")
    db = SessionLocal()

    try:
        if update_database_urls(db):
            db.commit()
            print("\n✅ Database updated successfully")
        else:
            print("\n❌ Failed to update database")
            db.rollback()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise

    finally:
        db.close()

    print("\n🎉 All done!")
    print("\nNext steps:")
    print("  1. Test the retreat in My Online Retreats portal")
    print("  2. Verify all audio files play correctly")


if __name__ == "__main__":
    main()
