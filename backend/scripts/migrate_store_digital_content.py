"""
Migrate digital content (audio, ebooks) from WordPress to Cloudflare R2.

This script:
1. Queries all products with downloads metadata
2. For each file in downloads array:
   - Checks if file exists on server at /var/www/old-removelater/satyoga-new/wp-content/uploads/woocommerce_uploads/
   - Handles ZIP files: extracts and uploads individual files
   - Uploads to Cloudflare R2
3. Updates database:
   - Single MP3: Set digital_content_url
   - Multiple MP3s: Add to portal_media.mp3[]
   - PDFs/EPUBs: Add to portal_media.pdf[] (or set digital_content_url for single files)
   - ZIPs: Extract and process contents
"""

import sys
import os
from pathlib import Path
import tempfile
import zipfile
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.services.cloudflare_service import CloudflareService


def get_local_file_path(url: str) -> str:
    """Convert WordPress URL to local server file path."""
    # URL format: https://satyoga.org/wp-content/uploads/woocommerce_uploads/2019/06/file.mp3
    # Local path: /var/www/old-removelater/satyoga-new/wp-content/uploads/woocommerce_uploads/2019/06/file.mp3

    if 'wp-content/uploads/' in url:
        relative_path = url.split('wp-content/uploads/')[1]
        local_path = f'/var/www/old-removelater/satyoga-new/wp-content/uploads/{relative_path}'
        return local_path

    return None


def get_content_type(filename: str) -> str:
    """Determine content type from filename extension."""
    ext = os.path.splitext(filename)[1].lower()

    content_types = {
        '.mp3': 'audio/mpeg',
        '.pdf': 'application/pdf',
        '.epub': 'application/epub+zip',
        '.mobi': 'application/x-mobipocket-ebook',
        '.zip': 'application/zip',
        '.m4a': 'audio/mp4',
        '.wav': 'audio/wav',
    }

    return content_types.get(ext, 'application/octet-stream')


def upload_file_to_r2(file_path: str, original_filename: str, product_slug: str) -> dict:
    """Upload a single file to R2 and return metadata."""

    # Read file content
    with open(file_path, 'rb') as f:
        file_content = f.read()

    # Determine R2 path based on file type
    ext = os.path.splitext(original_filename)[1].lower()

    if ext == '.mp3' or ext in ['.m4a', '.wav']:
        r2_folder = 'store-audio'
    elif ext in ['.pdf', '.epub', '.mobi']:
        r2_folder = 'store-ebooks'
    else:
        r2_folder = 'store-files'

    # Create unique R2 key: store-audio/product-slug/filename.mp3
    r2_key = f"{r2_folder}/{product_slug}/{original_filename}"

    print(f"      Uploading {original_filename} ({len(file_content) / 1024 / 1024:.2f} MB) to R2...")

    try:
        # Use CloudflareService to upload
        cloudflare_service = CloudflareService()

        # We need to use boto3 directly since CloudflareService methods are for specific types
        import boto3
        from botocore.exceptions import ClientError
        from app.core.config import settings

        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        r2_access_key = settings.CLOUDFLARE_R2_ACCESS_KEY_ID
        r2_secret_key = settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY
        bucket = settings.CLOUDFLARE_R2_BUCKET
        r2_public_url = settings.CLOUDFLARE_R2_PUBLIC_URL

        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=r2_access_key,
            aws_secret_access_key=r2_secret_key,
            region_name='auto'
        )

        # Upload to R2
        content_type = get_content_type(original_filename)
        s3_client.put_object(
            Bucket=bucket,
            Key=r2_key,
            Body=file_content,
            ContentType=content_type
        )

        # Construct public URL
        if r2_public_url:
            public_url = f"{r2_public_url}/{r2_key}"
        else:
            public_url = f"https://pub-{account_id}.r2.dev/{r2_key}"

        print(f"      ✓ Uploaded successfully: {public_url}")

        return {
            'url': public_url,
            'filename': original_filename,
            'size': len(file_content),
            'content_type': content_type,
            'r2_key': r2_key
        }

    except Exception as e:
        print(f"      ✗ Upload failed: {str(e)}")
        return None


def extract_and_process_zip(zip_path: str, product_slug: str, temp_dir: str) -> list:
    """Extract ZIP file and return list of extracted files."""
    extracted_files = []

    print(f"      Extracting ZIP file...")

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # List contents
            file_list = zip_ref.namelist()
            print(f"      ZIP contains {len(file_list)} files")

            # Extract all files
            extract_path = os.path.join(temp_dir, 'extracted')
            os.makedirs(extract_path, exist_ok=True)
            zip_ref.extractall(extract_path)

            # Process extracted files
            for filename in file_list:
                # Skip directories and hidden files
                if filename.endswith('/') or filename.startswith('.') or '/' in filename:
                    continue

                file_path = os.path.join(extract_path, filename)
                if os.path.isfile(file_path):
                    # Upload to R2
                    result = upload_file_to_r2(file_path, filename, product_slug)
                    if result:
                        extracted_files.append(result)

        print(f"      ✓ Extracted and uploaded {len(extracted_files)} files")
        return extracted_files

    except Exception as e:
        print(f"      ✗ ZIP extraction failed: {str(e)}")
        return []


def process_product(product: Product, db: SessionLocal):
    """Process a single product's downloads."""

    print(f"\n[{product.type.value}] {product.title}")
    print(f"  Slug: {product.slug}")

    downloads = product.downloads if isinstance(product.downloads, list) else []
    if not downloads:
        print("  ⚠ No downloads found, skipping")
        return

    print(f"  Processing {len(downloads)} file(s)...")

    uploaded_files = {
        'mp3': [],
        'pdf': [],
        'epub': [],
        'other': []
    }

    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:

        for idx, download in enumerate(downloads, 1):
            name = download.get('name', 'unnamed')
            url = download.get('url', '')

            print(f"    [{idx}/{len(downloads)}] {name}")

            if not url:
                print(f"      ⚠ No URL, skipping")
                continue

            # Get local file path
            local_path = get_local_file_path(url)
            if not local_path:
                print(f"      ⚠ Could not determine local path")
                continue

            # Check if file exists
            if not os.path.exists(local_path):
                print(f"      ✗ File not found: {local_path}")
                continue

            # Get file extension
            ext = os.path.splitext(local_path)[1].lower()

            # Handle ZIP files (extract and upload contents)
            if ext == '.zip':
                extracted = extract_and_process_zip(local_path, product.slug, temp_dir)
                for file_info in extracted:
                    file_ext = os.path.splitext(file_info['filename'])[1].lower()
                    if file_ext == '.mp3':
                        uploaded_files['mp3'].append(file_info)
                    elif file_ext == '.pdf':
                        uploaded_files['pdf'].append(file_info)
                    elif file_ext in ['.epub', '.mobi']:
                        uploaded_files['epub'].append(file_info)
                    else:
                        uploaded_files['other'].append(file_info)

            # Handle regular files
            else:
                original_filename = os.path.basename(local_path)
                result = upload_file_to_r2(local_path, original_filename, product.slug)

                if result:
                    if ext == '.mp3':
                        uploaded_files['mp3'].append(result)
                    elif ext == '.pdf':
                        uploaded_files['pdf'].append(result)
                    elif ext in ['.epub', '.mobi']:
                        uploaded_files['epub'].append(result)
                    else:
                        uploaded_files['other'].append(result)

    # Update product in database
    print(f"\n  Updating database...")
    update_product_in_db(product, uploaded_files, db)
    print(f"  ✓ Product updated successfully\n")


def update_product_in_db(product: Product, uploaded_files: dict, db: SessionLocal):
    """Update product with R2 URLs."""

    total_files = sum(len(files) for files in uploaded_files.values())

    if total_files == 0:
        print("    ⚠ No files uploaded, skipping database update")
        return

    # Initialize portal_media if needed
    if not product.portal_media:
        product.portal_media = {
            'youtube': [],
            'vimeo': [],
            'cloudflare': [],
            'mp4': [],
            'mp3': [],
            'pdf': []
        }
    elif isinstance(product.portal_media, dict):
        # Ensure all keys exist
        if 'mp3' not in product.portal_media:
            product.portal_media['mp3'] = []
        if 'pdf' not in product.portal_media:
            product.portal_media['pdf'] = []

    # Update based on file types and counts
    mp3_count = len(uploaded_files['mp3'])
    pdf_count = len(uploaded_files['pdf'])
    epub_count = len(uploaded_files['epub'])

    print(f"    Files uploaded: {mp3_count} MP3, {pdf_count} PDF, {epub_count} EPUB")

    # Handle MP3 files
    if mp3_count == 1:
        # Single MP3: Set digital_content_url
        product.digital_content_url = uploaded_files['mp3'][0]['url']
        print(f"    Set digital_content_url to single MP3")
    elif mp3_count > 1:
        # Multiple MP3s: Add to portal_media.mp3
        product.portal_media['mp3'] = [f['url'] for f in uploaded_files['mp3']]
        print(f"    Added {mp3_count} MP3s to portal_media")

    # Handle PDFs and EPUBs (treat together as ebook content)
    ebook_files = uploaded_files['pdf'] + uploaded_files['epub']
    if len(ebook_files) == 1:
        # Single ebook file: Set digital_content_url if not already set by MP3
        if not product.digital_content_url:
            product.digital_content_url = ebook_files[0]['url']
            print(f"    Set digital_content_url to single ebook file")
    elif len(ebook_files) > 1:
        # Multiple ebook files: Add to portal_media.pdf
        product.portal_media['pdf'] = [f['url'] for f in ebook_files]
        print(f"    Added {len(ebook_files)} ebook files to portal_media")

    # Commit changes
    db.commit()
    db.refresh(product)


def main():
    """Main migration function."""

    print("=" * 80)
    print("STORE DIGITAL CONTENT MIGRATION TO R2")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Get all products with downloads that need migration
        products = db.query(Product).filter(
            Product.downloads.isnot(None)
        ).all()

        # Filter to only audio and ebook products
        target_products = [
            p for p in products
            if p.type in [ProductType.AUDIO, ProductType.EBOOK, ProductType.GUIDED_MEDITATION]
        ]

        print(f"\nFound {len(target_products)} products to migrate:")
        print(f"  - Audio/Guided Meditation: {len([p for p in target_products if p.type in [ProductType.AUDIO, ProductType.GUIDED_MEDITATION]])}")
        print(f"  - Ebooks: {len([p for p in target_products if p.type == ProductType.EBOOK])}")

        # Process each product
        for idx, product in enumerate(target_products, 1):
            print(f"\n{'=' * 80}")
            print(f"Processing {idx}/{len(target_products)}")
            process_product(product, db)

        print("\n" + "=" * 80)
        print("MIGRATION COMPLETE!")
        print("=" * 80)

        # Summary
        print("\nSummary:")
        for product in target_products:
            mp3_count = len(product.portal_media.get('mp3', [])) if product.portal_media else 0
            pdf_count = len(product.portal_media.get('pdf', [])) if product.portal_media else 0
            has_digital_url = bool(product.digital_content_url)

            status = "✓" if (mp3_count > 0 or pdf_count > 0 or has_digital_url) else "✗"
            print(f"  {status} {product.title[:60]}")
            if has_digital_url:
                print(f"      digital_content_url: ✓")
            if mp3_count:
                print(f"      portal_media.mp3: {mp3_count} files")
            if pdf_count:
                print(f"      portal_media.pdf: {pdf_count} files")

    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
