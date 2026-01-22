"""List all store files in R2 bucket."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings

account_id = settings.CLOUDFLARE_ACCOUNT_ID
r2_access_key = settings.CLOUDFLARE_R2_ACCESS_KEY_ID
r2_secret_key = settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY
bucket = settings.CLOUDFLARE_R2_BUCKET

endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

s3_client = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=r2_access_key,
    aws_secret_access_key=r2_secret_key,
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

print(f"Listing all store files in R2 bucket: {bucket}\n")
print("=" * 80)

try:
    # List audio files
    print("\n📀 AUDIO FILES (store-audio/):")
    print("-" * 80)
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='store-audio/', MaxKeys=100)
    if 'Contents' in response:
        audio_files = [obj for obj in response['Contents'] if not obj['Key'].endswith('/')]
        print(f"Found {len(audio_files)} audio files")
        for obj in audio_files[:5]:  # Show first 5
            print(f"  - {obj['Key']} ({obj['Size'] / 1024 / 1024:.1f} MB)")
        if len(audio_files) > 5:
            print(f"  ... and {len(audio_files) - 5} more")
    else:
        print("  No audio files found")

    # List ebook PDF files
    print("\n📚 EBOOK FILES (store-ebooks/):")
    print("-" * 80)
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='store-ebooks/', MaxKeys=100)
    if 'Contents' in response:
        ebook_files = [obj for obj in response['Contents'] if not obj['Key'].endswith('/')]
        print(f"Found {len(ebook_files)} ebook files")
        for obj in ebook_files:
            print(f"  - {obj['Key']} ({obj['Size'] / 1024 / 1024:.1f} MB)")
    else:
        print("  No ebook files found")

    # List ZIP files
    print("\n📦 ZIP FILES (store-files/):")
    print("-" * 80)
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='store-files/', MaxKeys=100)
    if 'Contents' in response:
        zip_files = [obj for obj in response['Contents'] if not obj['Key'].endswith('/')]
        print(f"Found {len(zip_files)} ZIP files")
        for obj in zip_files:
            print(f"  - {obj['Key']} ({obj['Size'] / 1024 / 1024:.1f} MB)")
    else:
        print("  No ZIP files found")

    print("\n" + "=" * 80)

except ClientError as e:
    print(f"Error: {e}")
