#!/usr/bin/env python3
"""
Upload homepage video to Cloudflare R2 and update database
"""
import os
import sys
import boto3
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.static_content import MediaAsset

# Load environment variables
load_dotenv()

# R2 configuration
R2_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET_NAME", "videos")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")

print("🎥 Uploading homepage video to Cloudflare R2...")
print(f"   R2 Bucket: {R2_BUCKET}")
print(f"   R2 Endpoint: {R2_ENDPOINT_URL}")
print(f"   R2 Public URL: {R2_PUBLIC_URL}")

# Video file path
video_file = "public/HOMEPAGELOOP.mp4"
if not os.path.exists(video_file):
    print(f"❌ Video file not found: {video_file}")
    sys.exit(1)

# Get file size
file_size = os.path.getsize(video_file)
file_size_mb = file_size / (1024 * 1024)
print(f"   File size: {file_size_mb:.2f} MB")

# Create S3 client for R2
s3_client = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY
)

# Upload to R2
key = "HOMEPAGELOOP.mp4"
print(f"   Uploading to R2 bucket '{R2_BUCKET}' as '{key}'...")

try:
    with open(video_file, 'rb') as f:
        s3_client.upload_fileobj(
            f,
            R2_BUCKET,
            key,
            ExtraArgs={'ContentType': 'video/mp4'}
        )
    print("   ✅ Upload complete!")
except Exception as e:
    print(f"   ❌ Upload failed: {e}")
    sys.exit(1)

# Construct public CDN URL
# R2 public URLs are: https://<subdomain>.r2.dev/<key> OR custom domain
# For now, we'll use the account ID subdomain format
cdn_url = f"https://pub-{CF_ACCOUNT_ID[:16]}.r2.dev/{key}"
print(f"   CDN URL: {cdn_url}")

# Alternative: If you have a custom domain set up
# cdn_url = f"https://assets.satyoga.com/{key}"

# Update database
print("   Updating database...")
db = SessionLocal()
try:
    asset = db.query(MediaAsset).filter(MediaAsset.original_path == "/HOMEPAGELOOP.mp4").first()

    if asset:
        asset.cdn_url = cdn_url
        asset.storage_type = "r2"
        asset.storage_id = key
        asset.file_size = file_size
        db.commit()
        print(f"   ✅ Database updated! CDN URL: {cdn_url}")
    else:
        print("   ⚠️  No existing media_asset entry found, creating new one...")
        new_asset = MediaAsset(
            original_path="/HOMEPAGELOOP.mp4",
            storage_type="r2",
            storage_id=key,
            cdn_url=cdn_url,
            file_type="video/mp4",
            file_size=file_size,
            context="homepage-hero-video",
            is_active=True
        )
        db.add(new_asset)
        db.commit()
        print(f"   ✅ New database entry created! CDN URL: {cdn_url}")

finally:
    db.close()

print("\n🎉 Done! The homepage video should now load from Cloudflare R2.")
print(f"   Test it at: http://localhost:3000/")
