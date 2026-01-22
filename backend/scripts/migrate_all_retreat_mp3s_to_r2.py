"""
Complete migration of ALL retreat MP3s from satyoga.org to Cloudflare R2.

This script:
1. Downloads all MP3 files from satyoga.org server
2. Uploads them to Cloudflare R2
3. Updates database URLs to point to R2
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from botocore.client import Config
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.retreat import Retreat
import subprocess
import tempfile


def get_retreats_with_satyoga_urls(db: SessionLocal):
    """Find all retreats with satyoga.org audio URLs."""

    products = db.query(Product).filter(
        Product.type == ProductType.RETREAT_PORTAL_ACCESS
    ).all()

    retreats_to_migrate = []

    for product in products:
        retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()

        if not retreat or not retreat.past_retreat_portal_media:
            continue

        satyoga_urls = []
        for item in retreat.past_retreat_portal_media:
            if isinstance(item, dict) and item.get('audio_url'):
                if 'satyoga.org' in item['audio_url']:
                    satyoga_urls.append(item['audio_url'])

        if satyoga_urls:
            retreats_to_migrate.append({
                'product': product,
                'retreat': retreat,
                'urls': satyoga_urls
            })

    return retreats_to_migrate


def upload_file_to_r2(local_path, r2_key):
    """Upload a file to R2."""

    s3_client = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

    try:
        with open(local_path, 'rb') as f:
            s3_client.upload_fileobj(
                f,
                settings.R2_BUCKET_NAME,
                r2_key,
                ExtraArgs={'ContentType': 'audio/mpeg'}
            )
        return True
    except Exception as e:
        print(f"     ❌ Upload failed: {e}")
        return False


def migrate_retreat_mp3s(retreat_info):
    """Migrate all MP3s for a retreat to R2."""

    product = retreat_info['product']
    retreat = retreat_info['retreat']
    urls = retreat_info['urls']

    print(f"\n{'='*80}")
    print(f"MIGRATING: {product.title}")
    print(f"{'='*80}")
    print(f"URLs to migrate: {len(urls)}\n")

    migrated_count = 0
    failed_count = 0

    # Create temp directory for downloads
    with tempfile.TemporaryDirectory() as temp_dir:

        # Process each audio URL
        for url in urls:
            filename = url.split('/')[-1]
            print(f"  Processing: {filename}")

            # Extract server path from URL
            if '/wp-content/uploads/' in url:
                path_part = url.split('/wp-content/uploads/')[1]
                server_path = f"/var/www/satyoga/wp-content/uploads/{path_part}"
            else:
                print(f"    ⚠️  Unexpected URL format, skipping")
                failed_count += 1
                continue

            local_path = os.path.join(temp_dir, filename)
            r2_key = f"retreat-audio/{filename}"

            # Download from server using wildcard to handle special chars
            base_filename = filename.split('.')[0]  # Get name without extension
            result = subprocess.run(
                ['ssh', 'root@104.248.239.206',
                 f'cd /var/www/satyoga/wp-content/uploads && find . -name "*{base_filename}*.mp3" -print0 | tar -czf /tmp/migrate_temp.tar.gz --null -T -'],
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                print(f"    ❌ Failed to find file on server")
                failed_count += 1
                continue

            # Download tar file
            result = subprocess.run(
                ['scp', 'root@104.248.239.206:/tmp/migrate_temp.tar.gz', temp_dir],
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                print(f"    ❌ Failed to download from server")
                failed_count += 1
                continue

            # Extract tar file
            subprocess.run(['tar', '-xzf', f'{temp_dir}/migrate_temp.tar.gz', '-C', temp_dir],
                         capture_output=True)

            # Find the extracted MP3 file
            import glob
            extracted_files = glob.glob(f'{temp_dir}/**/*{base_filename}*.mp3', recursive=True)

            if not extracted_files:
                print(f"    ❌ File not found after extraction")
                failed_count += 1
                continue

            extracted_file = extracted_files[0]

            # Upload to R2
            print(f"    📤 Uploading to R2...")
            if upload_file_to_r2(extracted_file, r2_key):
                print(f"    ✅ Uploaded successfully")
                migrated_count += 1
            else:
                failed_count += 1

    print(f"\n  Migrated: {migrated_count}/{len(urls)}")
    print(f"  Failed: {failed_count}/{len(urls)}")

    return migrated_count, failed_count


def update_retreat_urls(db: SessionLocal, retreat, r2_url_base):
    """Update retreat URLs to point to R2."""

    updated_count = 0

    for item in retreat.past_retreat_portal_media:
        if isinstance(item, dict) and item.get('audio_url'):
            url = item['audio_url']

            if 'satyoga.org' in url:
                filename = url.split('/')[-1]
                r2_url = f"{r2_url_base}/{filename}"
                item['audio_url'] = r2_url
                updated_count += 1

    return updated_count


def main():
    db = SessionLocal()

    try:
        print("\n🚀 COMPLETE RETREAT MP3 MIGRATION TO CLOUDFLARE R2")
        print("="*80)

        # Step 1: Find retreats with satyoga.org URLs
        print("\nSTEP 1: Finding retreats with satyoga.org URLs...")
        retreats_to_migrate = get_retreats_with_satyoga_urls(db)

        print(f"\nFound {len(retreats_to_migrate)} retreats to migrate:")
        for r in retreats_to_migrate:
            print(f"  - {r['product'].title}: {len(r['urls'])} URLs")

        if not retreats_to_migrate:
            print("\n✅ No retreats need migration!")
            return

        # Step 2: Migrate MP3s to R2
        print("\n\nSTEP 2: Migrating MP3s to R2...")
        total_migrated = 0
        total_failed = 0

        for retreat_info in retreats_to_migrate:
            migrated, failed = migrate_retreat_mp3s(retreat_info)
            total_migrated += migrated
            total_failed += failed

        # Step 3: Update database URLs
        print("\n\nSTEP 3: Updating database URLs...")
        r2_url_base = f"{settings.R2_PUBLIC_URL}/retreat-audio"
        total_updated = 0

        for retreat_info in retreats_to_migrate:
            retreat = retreat_info['retreat']
            updated = update_retreat_urls(db, retreat, r2_url_base)
            total_updated += updated
            print(f"  ✅ Updated {updated} URLs for {retreat_info['product'].title}")

        db.commit()

        print(f"\n\n{'='*80}")
        print(f"MIGRATION COMPLETE")
        print(f"{'='*80}")
        print(f"  MP3s migrated to R2: {total_migrated}")
        print(f"  MP3s failed: {total_failed}")
        print(f"  Database URLs updated: {total_updated}")
        print(f"\n✅ All done!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
