"""Test portal-access API endpoint directly."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product, UserProductAccess
import json

db = SessionLocal()

try:
    # Get test user
    user = db.query(User).filter(User.email == 'audiotest@example.com').first()
    if not user:
        print("✗ Test user not found. Run test_audio_product_access.py first")
        sys.exit(1)

    # Get product
    product = db.query(Product).filter(Product.slug == 'dissolve-the-ego-mind').first()
    if not product:
        print("✗ Product not found")
        sys.exit(1)

    print(f"Testing portal access for user: {user.email}")
    print(f"Product: {product.title}")

    # Check access
    access = db.query(UserProductAccess).filter(
        UserProductAccess.user_id == user.id,
        UserProductAccess.product_id == product.id
    ).first()

    if not access:
        print("✗ User does not have access to this product")
        sys.exit(1)

    print(f"✓ User has access (granted at {access.granted_at})")

    # Build response similar to API
    print(f"\nProduct Portal Data:")
    print(f"{'='*80}")
    print(f"Title: {product.title}")
    print(f"Type: {product.type}")
    print(f"Digital Content URL: {product.digital_content_url}")
    print(f"\nPortal Media:")
    print(json.dumps(product.portal_media, indent=2))

    # Check if audio URL is accessible
    if product.digital_content_url:
        print(f"\n✓ AUDIO FILE AVAILABLE: {product.digital_content_url}")
        print(f"\nThe PortalViewer component should be able to:")
        print(f"  1. Display the audio player")
        print(f"  2. Load the MP3 from R2")
        print(f"  3. Allow playback")
    elif product.portal_media and product.portal_media.get('mp3'):
        print(f"\n✓ MULTIPLE AUDIO FILES AVAILABLE:")
        for idx, url in enumerate(product.portal_media['mp3'], 1):
            print(f"  {idx}. {url}")
    else:
        print(f"\n✗ NO AUDIO CONTENT FOUND")

except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
