"""Fix product R2 URLs to use correct public R2 domain."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType

# Correct public R2 URL
CORRECT_R2_PUBLIC_URL = "https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev"

# Wrong URL patterns to replace
WRONG_URL_PATTERNS = [
    "https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos",
    "https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com",
]

def fix_url(url):
    """Convert wrong R2 URL to correct public URL."""
    if not url:
        return None

    for pattern in WRONG_URL_PATTERNS:
        if pattern in url:
            # Extract the path after the domain/bucket
            # Old: https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos/store-audio/file.mp3
            # New: https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-audio/file.mp3
            path = url.replace(pattern + "/", "")
            return f"{CORRECT_R2_PUBLIC_URL}/{path}"

    return url

def fix_product_urls(product):
    """Fix all URLs in a product."""
    updated = False

    # Fix digital_content_url
    if product.digital_content_url:
        old_url = product.digital_content_url
        new_url = fix_url(old_url)
        if new_url != old_url:
            product.digital_content_url = new_url
            print(f"  ✓ Updated digital_content_url")
            print(f"    Old: {old_url}")
            print(f"    New: {new_url}")
            updated = True

    # Fix portal_media URLs
    if product.portal_media and isinstance(product.portal_media, dict):
        # Fix MP3 URLs
        if 'mp3' in product.portal_media and product.portal_media['mp3']:
            old_mp3s = product.portal_media['mp3']
            new_mp3s = [fix_url(url) for url in old_mp3s]
            if old_mp3s != new_mp3s:
                product.portal_media['mp3'] = new_mp3s
                print(f"  ✓ Updated {len(new_mp3s)} MP3 URLs in portal_media")
                updated = True

        # Fix PDF URLs
        if 'pdf' in product.portal_media and product.portal_media['pdf']:
            old_pdfs = product.portal_media['pdf']
            new_pdfs = [fix_url(url) for url in old_pdfs]
            if old_pdfs != new_pdfs:
                product.portal_media['pdf'] = new_pdfs
                print(f"  ✓ Updated {len(new_pdfs)} PDF URLs in portal_media")
                updated = True

    return updated

db = SessionLocal()

try:
    print("=" * 80)
    print("FIXING PRODUCT R2 URLS")
    print("=" * 80)
    print(f"\nCorrect R2 URL: {CORRECT_R2_PUBLIC_URL}")

    # Get all products with digital content
    products = db.query(Product).filter(
        Product.type.in_([ProductType.AUDIO, ProductType.EBOOK, ProductType.GUIDED_MEDITATION])
    ).all()

    print(f"\nFound {len(products)} audio/ebook products to check\n")

    updated_count = 0

    for product in products:
        print(f"\n[{product.type.value}] {product.title}")

        if fix_product_urls(product):
            db.commit()
            db.refresh(product)
            updated_count += 1
        else:
            print("  - No updates needed")

    print("\n" + "=" * 80)
    print("UPDATE COMPLETE!")
    print("=" * 80)
    print(f"\nUpdated: {updated_count} products")
    print(f"No changes: {len(products) - updated_count} products")

    # Verification
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)

    for product in products:
        print(f"\n✓ {product.title}")
        if product.digital_content_url:
            print(f"  digital_content_url: {product.digital_content_url}")
        if product.portal_media:
            mp3_count = len(product.portal_media.get('mp3', []))
            pdf_count = len(product.portal_media.get('pdf', []))
            if mp3_count:
                print(f"  portal_media.mp3: {mp3_count} files")
                print(f"    Example: {product.portal_media['mp3'][0]}")
            if pdf_count:
                print(f"  portal_media.pdf: {pdf_count} files")

except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
