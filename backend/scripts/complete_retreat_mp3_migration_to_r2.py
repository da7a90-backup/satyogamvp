"""
Complete migration of all retreat MP3s from satyoga.org to Cloudflare R2.
1. Download missing MP3 files from WordPress server
2. Upload them to Cloudflare R2
3. Update all database URLs to point to R2
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.retreat import Retreat
import boto3
from botocore.client import Config
import subprocess
from dotenv import load_dotenv
import re

load_dotenv()

# R2 configuration
r2_client = boto3.client(
    's3',
    endpoint_url=f"https://{os.getenv('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

bucket_name = 'videos'
r2_base_url = f"https://{os.getenv('CLOUDFLARE_R2_PUBLIC_BUCKET_URL')}/retreat-audio"

def get_files_on_r2():
    """Get list of MP3 files already on R2"""
    try:
        response = r2_client.list_objects_v2(Bucket=bucket_name, Prefix='retreat-audio/')
        if 'Contents' in response:
            return {obj['Key'].replace('retreat-audio/', '') for obj in response['Contents'] if obj['Key'].endswith('.mp3')}
        return set()
    except Exception as e:
        print(f"Error listing R2 files: {e}")
        return set()

def download_file_from_server(remote_path, local_path):
    """Download file from WordPress server via SCP"""
    try:
        cmd = f"scp root@104.248.239.206:{remote_path} {local_path}"
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Failed to download: {e}")
        return False

def upload_to_r2(local_path, filename):
    """Upload file to Cloudflare R2"""
    try:
        r2_key = f"retreat-audio/{filename}"
        r2_client.upload_file(
            local_path,
            bucket_name,
            r2_key,
            ExtraArgs={'ContentType': 'audio/mpeg'}
        )
        return True
    except Exception as e:
        print(f"  ❌ Upload failed: {e}")
        return False

def extract_filename_from_url(url):
    """Extract filename from satyoga.org URL"""
    return url.split('/')[-1]

def main():
    db = SessionLocal()

    print(f"{'='*80}")
    print(f"🚀 COMPLETE RETREAT MP3 MIGRATION TO CLOUDFLARE R2")
    print(f"{'='*80}\n")

    # Get files already on R2
    r2_files = get_files_on_r2()
    print(f"Files already on R2: {len(r2_files)}\n")

    # Get all retreats with satyoga.org URLs
    retreats = db.query(Retreat).all()

    retreats_to_update = []
    files_to_upload = []

    for retreat in retreats:
        if not retreat.past_retreat_portal_media:
            continue

        media = retreat.past_retreat_portal_media
        if not isinstance(media, list):
            continue

        has_satyoga_urls = False
        for item in media:
            if not isinstance(item, dict):
                continue

            audio_url = item.get('audio_url') or item.get('audio')
            if audio_url and 'satyoga.org' in audio_url:
                has_satyoga_urls = True
                filename = extract_filename_from_url(audio_url)
                if filename not in r2_files:
                    # Extract server path from URL
                    # URL format: http://satyoga.org/wp-content/uploads/2020/06/filename.mp3
                    match = re.search(r'wp-content/uploads/.*', audio_url)
                    if match:
                        server_path = f"/var/www/satyoga/{match.group(0)}"
                        files_to_upload.append((filename, server_path))

        if has_satyoga_urls:
            retreats_to_update.append(retreat)

    # Remove duplicates
    files_to_upload = list(set(files_to_upload))

    print(f"Retreats to update: {len(retreats_to_update)}")
    print(f"Files to upload: {len(files_to_upload)}\n")

    # Upload missing files
    if files_to_upload:
        print(f"{'='*80}")
        print(f"STEP 1: Uploading {len(files_to_upload)} missing files to R2")
        print(f"{'='*80}\n")

        for filename, server_path in files_to_upload:
            print(f"📦 {filename}")
            local_path = f"/tmp/{filename}"

            # Download from server
            print(f"   Downloading from server...")
            if download_file_from_server(server_path, local_path):
                # Upload to R2
                print(f"   Uploading to R2...")
                if upload_to_r2(local_path, filename):
                    print(f"   ✅ Successfully uploaded")
                    # Clean up
                    os.remove(local_path)
                else:
                    print(f"   ❌ Upload failed")
            else:
                print(f"   ❌ Download failed")
            print()

    # Update database URLs
    print(f"{'='*80}")
    print(f"STEP 2: Updating database URLs")
    print(f"{'='*80}\n")

    total_updated = 0
    for retreat in retreats_to_update:
        print(f"📝 {retreat.title}")

        media = retreat.past_retreat_portal_media
        updated_media = []
        url_count = 0

        for item in media:
            if not isinstance(item, dict):
                updated_media.append(item)
                continue

            updated_item = item.copy()
            audio_url = item.get('audio_url') or item.get('audio')

            if audio_url and 'satyoga.org' in audio_url:
                filename = extract_filename_from_url(audio_url)
                new_url = f"{r2_base_url}/{filename}"

                # Update the appropriate field
                if 'audio_url' in item:
                    updated_item['audio_url'] = new_url
                elif 'audio' in item:
                    updated_item['audio'] = new_url

                url_count += 1

            updated_media.append(updated_item)

        retreat.past_retreat_portal_media = updated_media
        print(f"   Updated {url_count} URLs")
        total_updated += url_count
        print()

    db.commit()

    print(f"{'='*80}")
    print(f"✅ MIGRATION COMPLETE")
    print(f"{'='*80}")
    print(f"Files uploaded to R2: {len(files_to_upload)}")
    print(f"Database URLs updated: {total_updated}")
    print(f"Retreats updated: {len(retreats_to_update)}")

    db.close()

if __name__ == "__main__":
    main()
