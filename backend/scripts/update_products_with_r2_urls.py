"""
Update product database with R2 URLs for digital content.

This script maps the uploaded R2 files to products based on the downloads array.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType


# R2 URL base
R2_PUBLIC_URL = "https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos"


def get_r2_url(filename):
    """Generate R2 URL based on filename extension."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == '.mp3':
        return f"{R2_PUBLIC_URL}/store-audio/{filename}"
    elif ext in ['.pdf', '.epub']:
        return f"{R2_PUBLIC_URL}/store-ebooks/{filename}"
    else:
        return f"{R2_PUBLIC_URL}/store-files/{filename}"


def update_product(product, db):
    """Update a single product with R2 URLs."""

    if not product.downloads:
        return False

    downloads = product.downloads if isinstance(product.downloads, list) else []
    if not downloads:
        return False

    print(f"\nUpdating: {product.title}")
    print(f"  Type: {product.type}")
    print(f"  Downloads: {len(downloads)} file(s)")

    # Extract filenames and build R2 URLs
    mp3_urls = []
    pdf_urls = []
    other_urls = []

    for download in downloads:
        url = download.get('url', '')
        if not url:
            continue

        # Extract filename
        filename = url.split('/')[-1]
        ext = os.path.splitext(filename)[1].lower()

        # Build R2 URL
        r2_url = get_r2_url(filename)

        if ext == '.mp3':
            mp3_urls.append(r2_url)
        elif ext in ['.pdf', '.epub']:
            pdf_urls.append(r2_url)
        elif ext == '.zip':
            # ZIP files - keep as-is for now
            other_urls.append(r2_url)

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

    # Update based on file counts
    updated = False

    # Handle MP3 files
    if len(mp3_urls) == 1:
        # Single MP3: Set digital_content_url
        product.digital_content_url = mp3_urls[0]
        print(f"  ✓ Set digital_content_url: {os.path.basename(mp3_urls[0])}")
        updated = True
    elif len(mp3_urls) > 1:
        # Multiple MP3s: Add to portal_media
        product.portal_media['mp3'] = mp3_urls
        print(f"  ✓ Added {len(mp3_urls)} MP3s to portal_media")
        updated = True

    # Handle PDF/ebook files
    if len(pdf_urls) == 1 and not product.digital_content_url:
        # Single PDF and no MP3: Set digital_content_url
        product.digital_content_url = pdf_urls[0]
        print(f"  ✓ Set digital_content_url: {os.path.basename(pdf_urls[0])}")
        updated = True
    elif len(pdf_urls) > 1:
        # Multiple PDFs: Add to portal_media
        product.portal_media['pdf'] = pdf_urls
        print(f"  ✓ Added {len(pdf_urls)} PDFs to portal_media")
        updated = True
    elif len(pdf_urls) == 1 and product.digital_content_url:
        # Single PDF but MP3 already set: Add to portal_media
        product.portal_media['pdf'] = pdf_urls
        print(f"  ✓ Added 1 PDF to portal_media (MP3 already in digital_content_url)")
        updated = True

    # Handle ZIP files (ebooks that need extraction)
    if other_urls:
        print(f"  ⚠ {len(other_urls)} ZIP file(s) - these need manual extraction")

    return updated


def main():
    print("=" * 80)
    print("UPDATE PRODUCTS WITH R2 URLs")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Get all products with downloads
        products = db.query(Product).filter(
            Product.downloads.isnot(None)
        ).all()

        # Filter to audio and ebook products
        target_products = [
            p for p in products
            if p.type in [ProductType.AUDIO, ProductType.EBOOK, ProductType.GUIDED_MEDITATION]
        ]

        print(f"\nFound {len(target_products)} products to update")

        updated_count = 0
        skipped_count = 0

        for product in target_products:
            if update_product(product, db):
                db.commit()
                db.refresh(product)
                updated_count += 1
            else:
                skipped_count += 1

        print("\n" + "=" * 80)
        print("UPDATE COMPLETE!")
        print("=" * 80)
        print(f"\nUpdated: {updated_count} products")
        print(f"Skipped: {skipped_count} products")

        # Summary
        print("\n" + "=" * 80)
        print("VERIFICATION")
        print("=" * 80)

        for product in target_products:
            has_digital = bool(product.digital_content_url)
            mp3_count = len(product.portal_media.get('mp3', [])) if product.portal_media else 0
            pdf_count = len(product.portal_media.get('pdf', [])) if product.portal_media else 0

            if has_digital or mp3_count > 0 or pdf_count > 0:
                print(f"\n✓ {product.title}")
                if has_digital:
                    print(f"   - digital_content_url: {os.path.basename(product.digital_content_url)}")
                if mp3_count:
                    print(f"   - portal_media.mp3: {mp3_count} files")
                if pdf_count:
                    print(f"   - portal_media.pdf: {pdf_count} files")
            else:
                print(f"\n✗ {product.title} - NO CONTENT LINKED")

    except Exception as e:
        print(f"\n✗ Update failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
