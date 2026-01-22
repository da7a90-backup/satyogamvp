#!/bin/bash

# Extract and upload ebook ZIP files to R2
# This script extracts ZIP files on the VPS and uploads PDFs/EPUBs to R2

set -e

echo "=========================================="
echo "EXTRACTING AND UPLOADING EBOOK ZIP FILES"
echo "=========================================="

# R2 Configuration
R2_BUCKET="videos"
R2_ENDPOINT="https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com"
R2_ACCESS_KEY="232085615dde86bd4fac67a0ecafcee2"
R2_SECRET_KEY="a3df24e4c18fff805c8936b0ab869f19d89d7faebbf837457c12b79a4ed5ea0c"
R2_PUBLIC_URL="https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev"

# WordPress uploads directory
WP_UPLOADS="/var/www/old-removelater/satyoga-new/wp-content/uploads/woocommerce_uploads"

# Temporary extraction directory
TEMP_DIR="/tmp/ebook_extraction"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Python upload script
cat > /tmp/upload_to_r2.py << 'PYTHON_SCRIPT'
import sys
import boto3
from botocore.client import Config
import mimetypes

R2_BUCKET = "videos"
R2_ENDPOINT = "https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com"
R2_ACCESS_KEY = "232085615dde86bd4fac67a0ecafcee2"
R2_SECRET_KEY = "a3df24e4c18fff805c8936b0ab869f19d89d7faebbf837457c12b79a4ed5ea0c"

s3 = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

def upload_file(local_path, r2_key):
    content_type, _ = mimetypes.guess_type(local_path)
    if not content_type:
        if local_path.endswith('.pdf'):
            content_type = 'application/pdf'
        elif local_path.endswith('.epub'):
            content_type = 'application/epub+zip'
        else:
            content_type = 'application/octet-stream'

    with open(local_path, 'rb') as f:
        s3.put_object(Bucket=R2_BUCKET, Key=r2_key, Body=f, ContentType=content_type)

    print(f"  ✓ Uploaded: {r2_key}")
    return f"https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/{r2_key}"

if __name__ == "__main__":
    local_file = sys.argv[1]
    r2_key = sys.argv[2]
    url = upload_file(local_file, r2_key)
    print(f"  URL: {url}")
PYTHON_SCRIPT

echo ""
echo "1. EXTRACTING RADHA MA'S RECIPES ZIP..."
echo "----------------------------------------"
ZIP_FILE="$WP_UPLOADS/2019/08/Radha-Ma's-Recipes-for-a-New-Sat-Renaissance.zip"
if [ -f "$ZIP_FILE" ]; then
    cd "$TEMP_DIR"
    unzip -q "$ZIP_FILE"

    # Find and upload PDF files
    for pdf in $(find . -name "*.pdf" -o -name "*.epub"); do
        filename=$(basename "$pdf")
        echo "  Found: $filename"
        python3 /tmp/upload_to_r2.py "$pdf" "store-ebooks/$filename"
    done

    rm -rf "$TEMP_DIR"/*
else
    echo "  ✗ ZIP file not found"
fi

echo ""
echo "2. EXTRACTING TRANSFORMATIONAL IMPERATIVE ZIP..."
echo "---------------------------------------------------"
ZIP_FILE="$WP_UPLOADS/2019/06/Transformational-Imperative.zip"
if [ -f "$ZIP_FILE" ]; then
    cd "$TEMP_DIR"
    unzip -q "$ZIP_FILE"

    # Find and upload PDF/EPUB files
    for file in $(find . -name "*.pdf" -o -name "*.epub"); do
        filename=$(basename "$file")
        echo "  Found: $filename"
        python3 /tmp/upload_to_r2.py "$file" "store-ebooks/$filename"
    done

    rm -rf "$TEMP_DIR"/*
else
    echo "  ✗ ZIP file not found"
fi

echo ""
echo "3. CHECK FOR OTHER MISSING EBOOK PDFs..."
echo "-------------------------------------------"

# Check if Coming Full Circle PDF exists (might be in a different location)
if [ ! -f "$WP_UPLOADS/2019/06/Coming-Full-Circle.pdf" ]; then
    echo "  Looking for Coming Full Circle PDF..."
    find "$WP_UPLOADS" -name "*Coming*Full*Circle*.pdf" | head -5
fi

# Check for Dao of Final Days
echo "  Looking for Dao of Final Days PDF..."
find "$WP_UPLOADS" -name "*Dao*Final*Days*.pdf" -o -name "*Tao*Final*Days*.pdf" | head -5

# Check for Seven Veils
echo "  Looking for Seven Veils PDF..."
find "$WP_UPLOADS" -name "*Seven*Veils*.pdf" | head -5

# Check for El Imperativo
echo "  Looking for El Imperativo PDF..."
find "$WP_UPLOADS" -name "*Imperativo*.pdf" | head -5

# Check for Gems of Wisdom
echo "  Looking for Gems of Wisdom PDF..."
find "$WP_UPLOADS" -name "*Gems*Wisdom*.pdf" | head -5

echo ""
echo "=========================================="
echo "EXTRACTION COMPLETE"
echo "=========================================="

# Cleanup
rm -rf "$TEMP_DIR"
rm -f /tmp/upload_to_r2.py
