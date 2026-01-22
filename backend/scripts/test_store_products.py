"""Test script to verify store products (audio and ebooks) are accessible and working."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product, ProductType
from app.models.product import UserProductAccess
from app.models.product import Order, OrderItem, OrderStatus

db = SessionLocal()

try:
    print("=" * 80)
    print("TESTING STORE PRODUCTS - AUDIO & EBOOKS")
    print("=" * 80)

    # Find or create test user
    test_email = "audiotest@example.com"
    test_user = db.query(User).filter(User.email == test_email).first()

    if not test_user:
        print(f"\n❌ Test user {test_email} not found")
        print("Creating test user...")
        from app.core.security import get_password_hash
        test_user = User(
            email=test_email,
            name="Audio Test User",
            password=get_password_hash("testpass123"),
            membership_tier="pragyani_plus",
            is_active=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"✓ Created test user: {test_user.email}")
    else:
        print(f"\n✓ Found test user: {test_user.email}")
        print(f"  ID: {test_user.id}")
        print(f"  Membership: {test_user.membership_tier}")

    # Get sample audio and ebook products
    audio_product = db.query(Product).filter(
        Product.type == ProductType.AUDIO,
        Product.digital_content_url.isnot(None)
    ).first()

    ebook_product = db.query(Product).filter(
        Product.type == ProductType.EBOOK,
        Product.digital_content_url.isnot(None)
    ).first()

    guided_meditation = db.query(Product).filter(
        Product.type == ProductType.GUIDED_MEDITATION,
        Product.digital_content_url.isnot(None)
    ).first()

    print("\n" + "=" * 80)
    print("SAMPLE PRODUCTS FOUND:")
    print("=" * 80)

    if audio_product:
        print(f"\n📀 AUDIO: {audio_product.title}")
        print(f"  Slug: {audio_product.slug}")
        print(f"  URL: {audio_product.digital_content_url[:80]}...")
    else:
        print("\n❌ No audio product found")

    if guided_meditation:
        print(f"\n🧘 GUIDED MEDITATION: {guided_meditation.title}")
        print(f"  Slug: {guided_meditation.slug}")
        print(f"  URL: {guided_meditation.digital_content_url[:80]}...")
    else:
        print("\n❌ No guided meditation found")

    if ebook_product:
        print(f"\n📚 EBOOK: {ebook_product.title}")
        print(f"  Slug: {ebook_product.slug}")
        print(f"  URL: {ebook_product.digital_content_url[:80]}...")
    else:
        print("\n❌ No ebook product found")

    # Check if test user has access to products
    print("\n" + "=" * 80)
    print("CHECKING TEST USER ACCESS:")
    print("=" * 80)

    products_to_test = []
    if audio_product:
        products_to_test.append(audio_product)
    if guided_meditation:
        products_to_test.append(guided_meditation)
    if ebook_product:
        products_to_test.append(ebook_product)

    for product in products_to_test:
        access = db.query(UserProductAccess).filter(
            UserProductAccess.user_id == test_user.id,
            UserProductAccess.product_id == product.id
        ).first()

        if not access:
            print(f"\n⚠ Creating access for: {product.title}")
            # Create order and grant access
            import time
            order_number = f"TEST-{int(time.time())}-{product.slug[:10]}"
            order = Order(
                user_id=test_user.id,
                order_number=order_number,
                total_amount=0,
                status=OrderStatus.COMPLETED
            )
            db.add(order)
            db.flush()

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=1,
                price_at_purchase=0
            )
            db.add(order_item)

            access = UserProductAccess(
                user_id=test_user.id,
                product_id=product.id,
                order_id=order.id
            )
            db.add(access)
            db.commit()
            print(f"  ✓ Access granted")
        else:
            print(f"\n✓ Already has access: {product.title}")

    # Display API test instructions
    print("\n" + "=" * 80)
    print("TEST INSTRUCTIONS:")
    print("=" * 80)
    print("\n1. Login as test user:")
    print(f"   Email: {test_email}")
    print(f"   Password: testpass123")

    print("\n2. Navigate to purchases page:")
    print(f"   http://localhost:3000/dashboard/user/purchases")

    print("\n3. You should see these products:")
    for product in products_to_test:
        print(f"   - {product.title} ({product.type.value})")
        print(f"     Click to view at: /dashboard/user/purchases/{product.slug}")

    print("\n4. Test each product:")
    print("   - Audio products should display audio player")
    print("   - Ebook products should display PDF viewer")
    print("   - Verify media plays/displays correctly")

    print("\n" + "=" * 80)
    print("API ENDPOINTS TO TEST:")
    print("=" * 80)

    if products_to_test:
        print(f"\nGet user purchases:")
        print(f"  GET http://localhost:8000/api/products/purchases")
        print(f"  Authorization: Bearer <token>")

        for product in products_to_test:
            print(f"\nGet portal access for {product.title}:")
            print(f"  GET http://localhost:8000/api/products/{product.slug}/portal-access")
            print(f"  Authorization: Bearer <token>")
            print(f"  Expected: digital_content_url = {product.digital_content_url[:50]}...")

    print("\n" + "=" * 80)

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
