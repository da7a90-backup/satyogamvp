"""
Script to migrate MP3 files from VPS to Cloudflare R2 and update product portal_media URLs.
"""

import sys
import os
import subprocess
import tempfile

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product
from app.services.cloudflare_service import cloudflare_service
from pathlib import Path


VPS_HOST = "root@104.248.239.206"
VPS_MP3_PATH = "/var/www/satyoga/wp-content/uploads/2020/06/"


def download_mp3_from_vps(filename: str, local_dir: str) -> Path:
    """Download MP3 file from VPS via SCP."""
    local_path = Path(local_dir) / filename
    remote_path = f"{VPS_HOST}:{VPS_MP3_PATH}{filename}"

    print(f"  Downloading {filename}...")
    result = subprocess.run(
        ["scp", remote_path, str(local_path)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception(f"Failed to download {filename}: {result.stderr}")

    return local_path


def upload_to_r2(file_path: Path) -> str:
    """Upload MP3 file to Cloudflare R2 and return public URL."""
    with open(file_path, "rb") as f:
        file_content = f.read()

    print(f"  Uploading {file_path.name} to R2...")
    result = cloudflare_service.upload_audio_to_r2(
        file_content=file_content,
        filename=file_path.name
    )

    return result["r2_url"]


def extract_filename_from_url(url: str) -> str:
    """Extract filename from satyoga.org URL."""
    # URL format: https://satyoga.org/wp-content/uploads/2020/06/filename.mp3
    return url.split('/')[-1]


def main():
    db = SessionLocal()

    try:
        print("=" * 80)
        print("MIGRATING MP3 FILES TO CLOUDFLARE R2")
        print("=" * 80)

        # Get the healing-with-truth-retreat product
        product = db.query(Product).filter(Product.slug == "healing-with-truth-retreat").first()

        if not product:
            print("Product 'healing-with-truth-retreat' not found!")
            return

        if not product.portal_media or not isinstance(product.portal_media, dict):
            print("Product has no portal_media!")
            return

        mp3_files = product.portal_media.get('mp3', [])
        if not mp3_files:
            print("Product has no MP3 files!")
            return

        # Get unique filenames (remove duplicates)
        unique_filenames = list(set([
            extract_filename_from_url(url)
            for url in mp3_files
            if isinstance(url, str) and 'satyoga.org' in url
        ]))

        print(f"\nFound {len(unique_filenames)} unique MP3 files to migrate")
        print()

        # Create temporary directory for downloads
        with tempfile.TemporaryDirectory() as temp_dir:
            url_mapping = {}  # Old URL -> New R2 URL

            for idx, filename in enumerate(unique_filenames, 1):
                try:
                    print(f"[{idx}/{len(unique_filenames)}] Processing: {filename}")

                    # Download from VPS
                    local_file = download_mp3_from_vps(filename, temp_dir)

                    # Upload to R2
                    r2_url = upload_to_r2(local_file)

                    # Map old URL to new R2 URL
                    old_url = f"https://satyoga.org/wp-content/uploads/2020/06/{filename}"
                    url_mapping[old_url] = r2_url

                    print(f"  ✓ Migrated: {filename}")
                    print(f"    New URL: {r2_url}")
                    print()

                except Exception as e:
                    print(f"  ✗ Error migrating {filename}: {str(e)}")
                    print()
                    continue

            # Update product portal_media with new URLs
            if url_mapping:
                print("=" * 80)
                print("UPDATING PRODUCT PORTAL_MEDIA")
                print("=" * 80)

                updated_mp3_files = []
                for url in mp3_files:
                    if isinstance(url, str):
                        # Replace old URL with new R2 URL if it exists
                        new_url = url_mapping.get(url, url)
                        updated_mp3_files.append(new_url)
                    else:
                        updated_mp3_files.append(url)

                # Update the portal_media
                product.portal_media['mp3'] = updated_mp3_files

                # Also update retreat's past_retreat_portal_media if linked
                if product.retreat_id:
                    from app.models.retreat import Retreat
                    retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()
                    if retreat and retreat.past_retreat_portal_media:
                        retreat.past_retreat_portal_media['mp3'] = updated_mp3_files
                        print(f"  ✓ Updated retreat portal_media")

                db.commit()

                print(f"\n✅ Successfully migrated {len(url_mapping)} MP3 files!")
                print(f"   Product portal_media updated with {len(updated_mp3_files)} MP3 URLs")
                print()

                # Show sample mappings
                print("Sample URL Mappings:")
                for old_url, new_url in list(url_mapping.items())[:3]:
                    print(f"  OLD: {old_url}")
                    print(f"  NEW: {new_url}")
                    print()
            else:
                print("\n⚠️  No files were successfully migrated")

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
