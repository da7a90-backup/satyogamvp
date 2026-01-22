#!/bin/bash

# Upload store digital files (MP3, PDF, ZIP) from WordPress to Cloudflare R2
# Run this script ON THE SERVER

echo "========================================="
echo "STORE DIGITAL CONTENT UPLOAD TO R2"
echo "========================================="

# Source directory
WP_DIR="/var/www/old-removelater/satyoga-new/wp-content/uploads/woocommerce_uploads"

# R2 Configuration
R2_BUCKET="videos"
R2_ENDPOINT="https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com"
R2_ACCESS_KEY="232085615dde86bd4fac67a0ecafcee2"
R2_SECRET_KEY="a3df24e4c18fff805c8936b0ab869f19d89d7faebbf837457c12b79a4ed5ea0c"
R2_PUBLIC_URL="https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos"

# Create Python upload script
cat > /tmp/upload_to_r2.py << 'PYTHON_SCRIPT'
import boto3
from botocore.client import Config
import os
import sys
import mimetypes

# R2 Configuration
R2_ENDPOINT = os.environ['R2_ENDPOINT']
R2_ACCESS_KEY = os.environ['R2_ACCESS_KEY']
R2_SECRET_KEY = os.environ['R2_SECRET_KEY']
R2_BUCKET = os.environ['R2_BUCKET']
R2_PUBLIC_URL = os.environ['R2_PUBLIC_URL']

# Initialize S3 client for R2
s3 = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

def get_content_type(filename):
    """Get MIME type for file."""
    content_type, _ = mimetypes.guess_type(filename)
    if not content_type:
        ext = os.path.splitext(filename)[1].lower()
        types = {
            '.mp3': 'audio/mpeg',
            '.pdf': 'application/pdf',
            '.epub': 'application/epub+zip',
            '.zip': 'application/zip',
        }
        content_type = types.get(ext, 'application/octet-stream')
    return content_type

def upload_file(local_path, r2_key):
    """Upload file to R2."""
    try:
        content_type = get_content_type(local_path)

        with open(local_path, 'rb') as f:
            s3.put_object(
                Bucket=R2_BUCKET,
                Key=r2_key,
                Body=f,
                ContentType=content_type
            )

        # Return public URL
        r2_url = f"{R2_PUBLIC_URL}/{r2_key}"
        return r2_url
    except Exception as e:
        print(f"ERROR uploading {local_path}: {e}", file=sys.stderr)
        return None

# Main: Upload files passed as arguments
if __name__ == '__main__':
    for file_path in sys.argv[1:]:
        if os.path.exists(file_path):
            # Determine R2 key based on file type
            filename = os.path.basename(file_path)
            ext = os.path.splitext(filename)[1].lower()

            if ext == '.mp3':
                r2_key = f"store-audio/{filename}"
            elif ext in ['.pdf', '.epub']:
                r2_key = f"store-ebooks/{filename}"
            else:
                r2_key = f"store-files/{filename}"

            print(f"Uploading: {filename}")
            r2_url = upload_file(file_path, r2_key)

            if r2_url:
                print(f"SUCCESS: {r2_url}")
            else:
                print(f"FAILED: {filename}")
PYTHON_SCRIPT

# Export environment variables for Python script
export R2_ENDPOINT="$R2_ENDPOINT"
export R2_ACCESS_KEY="$R2_ACCESS_KEY"
export R2_SECRET_KEY="$R2_SECRET_KEY"
export R2_BUCKET="$R2_BUCKET"
export R2_PUBLIC_URL="$R2_PUBLIC_URL"

echo ""
echo "Finding files to upload..."

# Find all MP3, PDF, and ZIP files
MP3_FILES=$(find "$WP_DIR" -name "*.mp3" -type f 2>/dev/null | wc -l)
PDF_FILES=$(find "$WP_DIR" -name "*.pdf" -type f 2>/dev/null | wc -l)
ZIP_FILES=$(find "$WP_DIR" -name "*.zip" -type f 2>/dev/null | wc -l)

echo "Found:"
echo "  - MP3 files: $MP3_FILES"
echo "  - PDF files: $PDF_FILES"
echo "  - ZIP files: $ZIP_FILES"
echo ""

# Upload all MP3 files
echo "========================================="
echo "UPLOADING MP3 FILES"
echo "========================================="
find "$WP_DIR" -name "*.mp3" -type f 2>/dev/null | while read -r file; do
    python3 /tmp/upload_to_r2.py "$file"
done

# Upload all PDF files
echo ""
echo "========================================="
echo "UPLOADING PDF FILES"
echo "========================================="
find "$WP_DIR" -name "*.pdf" -type f 2>/dev/null | while read -r file; do
    python3 /tmp/upload_to_r2.py "$file"
done

# Upload all ZIP files
echo ""
echo "========================================="
echo "UPLOADING ZIP FILES"
echo "========================================="
find "$WP_DIR" -name "*.zip" -type f 2>/dev/null | while read -r file; do
    python3 /tmp/upload_to_r2.py "$file"
done

echo ""
echo "========================================="
echo "UPLOAD COMPLETE!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run the database update script to map these R2 URLs to products"

# Cleanup
rm /tmp/upload_to_r2.py
