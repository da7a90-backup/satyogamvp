"""
Check Cloudflare R2 for Healing with Truth MP3 files and compare with server filenames.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from botocore.client import Config
from app.core.config import settings


def list_r2_mp3_files():
    """List all MP3 files in R2 bucket."""

    # Configure S3 client for R2
    s3_client = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

    print(f"\n🔍 Checking R2 bucket: {settings.R2_BUCKET_NAME}")
    print(f"   Endpoint: {settings.R2_ENDPOINT_URL}\n")

    # List all objects
    mp3_files = []
    paginator = s3_client.get_paginator('list_objects_v2')

    for page in paginator.paginate(Bucket=settings.R2_BUCKET_NAME):
        if 'Contents' in page:
            for obj in page['Contents']:
                key = obj['Key']
                if key.lower().endswith('.mp3'):
                    mp3_files.append({
                        'key': key,
                        'filename': os.path.basename(key),
                        'size': obj['Size']
                    })

    return mp3_files


def main():
    try:
        # Get list from R2
        r2_files = list_r2_mp3_files()

        print(f"=== R2 MP3 FILES ===")
        print(f"Total MP3 files: {len(r2_files)}\n")

        # Check for Healing with Truth files
        healing_files_on_r2 = [f for f in r2_files if 'healing' in f['filename'].lower() or 'healing-with-truth' in f['key'].lower()]

        print(f"Files with 'healing' in name: {len(healing_files_on_r2)}")

        if healing_files_on_r2:
            print("\nHealing with Truth files on R2:")
            for f in healing_files_on_r2[:10]:
                print(f"  {f['filename']} ({f['size'] / 1024 / 1024:.1f} MB)")

        # Expected filenames from server
        expected_files = [
            '1-The-Ultimate-Force-for-Healing-Truth-Healing-with-Truth.mp3',
            '11-The-Zircon-Sutra-Healing-with-Truth.mp3',
            '12-Why-Miss-Out-on-the-Magic-Healing-with-Truth.mp3',
            '13-GM_Yagya-Healing-with-Truth.mp3',
            '13-Yagya_The-Sacred-Fire-that-Annihilates-All-Suffering-Healing-with-Truth.mp3',
            '14-The-Ultimate-Secret-The-Ajata-Doctrine-Healing-with-Truth.mp3',
            '2-Ground-Zero-Explosion-Into-Enlightenment-Healing-with-Truth.mp3',
            '3-Stage-One-Meditation-Stabilize-in-Stillness-Healing-With-Truth.mp3',
            '4-Stage-One-Meditation-Entry-into-Shunyata-Healing-With-Truth.mp3',
            '5-The-fundament-of-being-Healing-with-Truth.mp3',
            '8-Restoring-Our-Planetary-Energy-Field-Healing-with-Truth.mp3',
            '9-You-Can\'t-Be-Half-Liberated-Healing-with-Truth.mp3'
        ]

        print(f"\n=== CHECKING FOR EXPECTED FILES ===")
        print(f"Expected files from server: {len(expected_files)}\n")

        r2_filenames = {f['filename'].lower() for f in r2_files}

        found_count = 0
        missing_count = 0

        for expected in expected_files:
            if expected.lower() in r2_filenames:
                found_count += 1
                # Get the matching file
                matching = [f for f in r2_files if f['filename'].lower() == expected.lower()][0]
                print(f"✅ FOUND: {expected}")
                print(f"   Key: {matching['key']}")
            else:
                missing_count += 1
                print(f"❌ MISSING: {expected}")

        print(f"\n=== SUMMARY ===")
        print(f"Found on R2: {found_count}/{len(expected_files)}")
        print(f"Missing from R2: {missing_count}/{len(expected_files)}")

        if found_count == len(expected_files):
            print("\n🎉 All Healing with Truth MP3 files are on R2!")
            print("\nNext step: Update database URLs to point to R2")
        else:
            print("\n⚠️  Some files are missing from R2")
            print("   Need to upload them from the server")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
