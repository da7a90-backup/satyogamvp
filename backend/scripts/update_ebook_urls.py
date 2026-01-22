"""Update ebook product URLs with R2 links."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.product import Product, ProductType

db = SessionLocal()

try:
    print("=" * 80)
    print("UPDATING EBOOK PRODUCT URLS")
    print("=" * 80)

    # Ebook products with their R2 URLs
    ebook_urls = {
        'radha-ma-s-recipes-for-a-new-sat-renaissance': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/Radha-Mas-Recipes-for-a-New-Sat-Renaissance.pdf',
        'the-transformational-imperative': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/The-Transformational-Imperative.pdf',
        'el-imperativo-de-la-transformaci-n': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/El-Imperativo-de-la-Transformacion.pdf',
        'coming-full-circle-the-secret-of-the-singularity-ebook': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/Coming-Full-Circle-The-Secret-of-the-Singularity.pdf',
        'gems-of-wisdom-collection-vol-1-2-ebooks': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/Gems-of-Wisdom-Collection.pdf',
        'the-dao-of-the-final-days-ebook': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/The-Dao-of-the-Final-Days.pdf',
        'the-seven-veils-of-maya-ebook': 'https://pub-063e79e48bb84a73924ad4964d346c95.r2.dev/store-ebooks/The-Seven-Veils-of-Maya.pdf',
    }

    updated_count = 0

    for slug, url in ebook_urls.items():
        product = db.query(Product).filter(Product.slug == slug).first()

        if product:
            print(f"\n[{slug}]")
            print(f"  Title: {product.title}")

            if product.digital_content_url != url:
                product.digital_content_url = url
                print(f"  ✓ Updated digital_content_url")
                print(f"    URL: {url}")
                updated_count += 1
            else:
                print(f"  - Already has correct URL")

            db.commit()
            db.refresh(product)
        else:
            print(f"\n✗ Product not found: {slug}")

    print("\n" + "=" * 80)
    print(f"UPDATE COMPLETE: {updated_count} products updated")
    print("=" * 80)

    # Verify
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)

    ebooks = db.query(Product).filter(Product.type == ProductType.EBOOK).all()

    for ebook in ebooks:
        print(f"\n{ebook.title}")
        print(f"  Slug: {ebook.slug}")
        if ebook.digital_content_url:
            print(f"  ✓ Has URL: {ebook.digital_content_url[:80]}...")
        else:
            print(f"  ✗ NO URL SET")

except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
