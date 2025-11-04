#!/usr/bin/env python3
"""
Upload images to Cloudflare Images and videos/other files to R2
Record all URLs in database

Usage:
    cd backend
    python scripts/upload_to_cloudflare.py
"""

import os
import sys
import requests
from pathlib import Path
import mimetypes
from dotenv import load_dotenv

# Add parent directory to path for imports
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

# R2 configuration (optional - for videos/SVG/PDFs)
R2_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET_NAME", "videos")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL", f"https://{CF_ACCOUNT_ID}.r2.cloudflarestorage.com")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "https://assets.satyoga.com")


def upload_to_cloudflare_images(file_path: str, original_path: str) -> dict:
    """Upload image to Cloudflare Images"""

    if not CF_IMAGES_TOKEN or not CF_ACCOUNT_ID:
        raise Exception("Cloudflare Images credentials not configured in .env")

    headers = {"Authorization": f"Bearer {CF_IMAGES_TOKEN}"}

    print(f"  Uploading to Cloudflare Images...")
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(CF_IMAGES_URL, headers=headers, files=files)

    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")

    result = response.json()['result']

    return {
        'storage_type': 'cloudflare_images',
        'storage_id': result['id'],
        'cdn_url': result['variants'][0],  # Use public variant
        'variants': result.get('variants', [])
    }


def upload_to_r2(file_path: str, original_path: str) -> dict:
    """Upload file to Cloudflare R2 (S3-compatible)"""

    # Check if R2 is configured
    if not R2_ACCESS_KEY or not R2_SECRET_KEY:
        print(f"  ⚠️  R2 not configured - keeping original path")
        # Return original path as fallback
        return {
            'storage_type': 'r2',
            'storage_id': original_path.lstrip('/'),
            'cdn_url': original_path,  # Will be served from /public for now
            'variants': None
        }

    try:
        import boto3

        # Use relative path as S3 key
        key = original_path.lstrip('/')

        # S3 client for R2
        s3_client = boto3.client(
            's3',
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=R2_ACCESS_KEY,
            aws_secret_access_key=R2_SECRET_KEY
        )

        # Upload to R2
        mime_type, _ = mimetypes.guess_type(file_path)
        print(f"  Uploading to R2...")
        with open(file_path, 'rb') as f:
            s3_client.upload_fileobj(
                f,
                R2_BUCKET,
                key,
                ExtraArgs={'ContentType': mime_type} if mime_type else {}
            )

        # Construct CDN URL
        cdn_url = f"{R2_PUBLIC_URL}/{key}"

        return {
            'storage_type': 'r2',
            'storage_id': key,
            'cdn_url': cdn_url,
            'variants': None
        }

    except ImportError:
        print(f"  ⚠️  boto3 not installed - run: pip install boto3")
        return {
            'storage_type': 'r2',
            'storage_id': original_path.lstrip('/'),
            'cdn_url': original_path,
            'variants': None
        }
    except Exception as e:
        print(f"  ⚠️  R2 upload failed: {str(e)} - using original path")
        return {
            'storage_type': 'r2',
            'storage_id': original_path.lstrip('/'),
            'cdn_url': original_path,
            'variants': None
        }


def get_context_from_path(path: str) -> str:
    """Determine context from file path"""
    path_lower = path.lower()

    if "homepageloop" in path_lower or "homepage" in path_lower:
        return "homepage-hero-video"
    elif "donate" in path_lower or "donation" in path_lower:
        return "donation-images"
    elif "faq" in path_lower:
        return "faq-gallery"
    elif "ssi" in path_lower or "shakti" in path_lower:
        return "shakti-retreat"
    elif "darshan" in path_lower:
        return "darshan-retreat"
    elif "sevadhari" in path_lower or "sd " in path_lower:
        return "sevadhari-retreat"
    elif "courses" in path_lower or "course" in path_lower:
        return "courses-page"
    elif "about" in path_lower:
        return "about-pages"
    elif "contact" in path_lower:
        return "contact-page"
    elif "retreat" in path_lower:
        return "retreats"
    elif "membership" in path_lower:
        return "membership-page"
    elif "store" in path_lower or "product" in path_lower:
        return "store"
    else:
        return "general"


def migrate_public_directory(public_dir: str, db: Session, dry_run: bool = False):
    """Migrate all files from /public to Cloudflare"""

    public_path = Path(public_dir)

    if not public_path.exists():
        print(f"❌ Directory not found: {public_dir}")
        return

    # File extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    r2_extensions = {'.mp4', '.webm', '.svg', '.pdf', '.gif'}

    uploaded_images = 0
    uploaded_r2 = 0
    skipped = 0
    errors = 0

    print("=" * 70)
    print("CLOUDFLARE MEDIA MIGRATION")
    print("=" * 70)
    print(f"Source: {public_dir}")
    print(f"Mode: {'DRY RUN (no uploads)' if dry_run else 'LIVE'}")
    print("=" * 70)
    print()

    # Collect all files first
    all_files = []
    for file_path in public_path.rglob('*'):
        if not file_path.is_file():
            continue

        ext = file_path.suffix.lower()
        if ext not in image_extensions and ext not in r2_extensions:
            continue

        all_files.append(file_path)

    total_files = len(all_files)
    print(f"Found {total_files} media files to process\n")

    for idx, file_path in enumerate(all_files, 1):
        ext = file_path.suffix.lower()

        # Get original path
        relative_path = file_path.relative_to(public_path)
        original_path = f"/{relative_path.as_posix()}"

        print(f"[{idx}/{total_files}] {original_path}")

        # Check if already uploaded
        existing = db.query(MediaAsset).filter(
            MediaAsset.original_path == original_path
        ).first()

        if existing:
            print(f"  ⏭️  Already uploaded: {existing.cdn_url}")
            skipped += 1
            print()
            continue

        if dry_run:
            print(f"  🔍 Would upload to: {'Cloudflare Images' if ext in image_extensions else 'R2'}")
            if ext in image_extensions:
                uploaded_images += 1
            else:
                uploaded_r2 += 1
            print()
            continue

        try:
            # Determine upload destination
            if ext in image_extensions:
                print(f"  📸 Uploading to Cloudflare Images...")
                upload_result = upload_to_cloudflare_images(str(file_path), original_path)
                uploaded_images += 1
                print(f"  ✅ CDN URL: {upload_result['cdn_url']}")
            else:
                print(f"  📦 Processing for R2...")
                upload_result = upload_to_r2(str(file_path), original_path)
                uploaded_r2 += 1
                print(f"  ✅ URL: {upload_result['cdn_url']}")

            # Get file stats
            file_stat = file_path.stat()
            context = get_context_from_path(original_path)

            # Create database record
            media_asset = MediaAsset(
                original_path=original_path,
                storage_type=upload_result['storage_type'],
                storage_id=upload_result['storage_id'],
                cdn_url=upload_result['cdn_url'],
                variants=upload_result.get('variants'),
                file_type=mimetypes.guess_type(str(file_path))[0],
                file_size=file_stat.st_size,
                context=context,
                is_active=True
            )
            db.add(media_asset)

            # Commit every 5 uploads
            if (uploaded_images + uploaded_r2) % 5 == 0:
                db.commit()
                print(f"  💾 Committed batch to database")

        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            errors += 1

        print()

    if not dry_run:
        db.commit()

    print()
    print("=" * 70)
    print("MIGRATION COMPLETE")
    print("=" * 70)
    print(f"✓ Cloudflare Images: {uploaded_images}")
    print(f"✓ R2 Files: {uploaded_r2}")
    print(f"⏭ Skipped (already uploaded): {skipped}")
    print(f"❌ Errors: {errors}")
    print(f"📊 Total Processed: {uploaded_images + uploaded_r2 + skipped}")
    print("=" * 70)


def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description='Upload media files to Cloudflare')
    parser.add_argument('--dry-run', action='store_true', help='Preview without uploading')
    parser.add_argument('--public-dir', default='../public', help='Path to public directory')
    args = parser.parse_args()

    # Resolve public directory path
    script_dir = Path(__file__).parent
    public_dir = (script_dir / args.public_dir).resolve()

    print(f"\n🚀 Starting Cloudflare Media Upload Script")
    print(f"Public Directory: {public_dir}")
    print(f"Cloudflare Account: {CF_ACCOUNT_ID}")
    print(f"Images API: {'✓ Configured' if CF_IMAGES_TOKEN else '❌ Not configured'}")
    print(f"R2 Storage: {'✓ Configured' if R2_ACCESS_KEY else '⚠️  Not configured (will use fallback)'}")
    print()

    if args.dry_run:
        print("🔍 DRY RUN MODE - No actual uploads will be performed\n")

    db = SessionLocal()

    try:
        migrate_public_directory(str(public_dir), db, dry_run=args.dry_run)
    except KeyboardInterrupt:
        print("\n\n⚠️  Upload interrupted by user")
        db.rollback()
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("\n✅ Script completed successfully!\n")


if __name__ == "__main__":
    main()
