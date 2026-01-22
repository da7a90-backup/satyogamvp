"""Test audio product purchase and access flow."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product, Order, OrderItem, OrderStatus, UserProductAccess
from datetime import datetime
import uuid

db = SessionLocal()

try:
    # Find or create test user
    test_email = "audiotest@example.com"
    user = db.query(User).filter(User.email == test_email).first()

    if not user:
        print("Creating test user...")
        user = User(
            id=uuid.uuid4(),
            email=test_email,
            name="Audio Test User",
            password_hash="test",
            is_active=True,
            membership_tier="free"
        )
        db.add(user)
        db.commit()
        print(f"✓ Created user: {user.email} ({user.id})")
    else:
        print(f"✓ Found existing user: {user.email} ({user.id})")

    # Find the Dissolve the Ego-mind product
    product = db.query(Product).filter(Product.slug == 'dissolve-the-ego-mind').first()

    if not product:
        print("✗ Product not found")
        sys.exit(1)

    print(f"✓ Found product: {product.title} ({product.id})")
    print(f"  Price: ${product.price}")
    print(f"  Digital Content URL: {product.digital_content_url}")

    # Check if user already has access
    existing_access = db.query(UserProductAccess).filter(
        UserProductAccess.user_id == user.id,
        UserProductAccess.product_id == product.id
    ).first()

    if existing_access:
        print(f"✓ User already has access (granted at {existing_access.granted_at})")
    else:
        # Create order and grant access
        print("\nCreating order and granting access...")

        order = Order(
            id=uuid.uuid4(),
            user_id=user.id,
            order_number=f"TEST-{int(datetime.now().timestamp())}",
            total_amount=product.price,
            status=OrderStatus.COMPLETED,
            created_at=datetime.now()
        )
        db.add(order)

        order_item = OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            product_id=product.id,
            quantity=1,
            price_at_purchase=product.price
        )
        db.add(order_item)

        access = UserProductAccess(
            id=uuid.uuid4(),
            user_id=user.id,
            product_id=product.id,
            order_id=order.id,
            granted_at=datetime.now()
        )
        db.add(access)

        db.commit()
        print(f"✓ Created order: {order.order_number}")
        print(f"✓ Granted product access")

    # Verify access
    user_products = db.query(UserProductAccess).filter(
        UserProductAccess.user_id == user.id
    ).all()

    print(f"\n✓ User has access to {len(user_products)} product(s)")

    print(f"\n{'='*80}")
    print("TEST SUMMARY")
    print(f"{'='*80}")
    print(f"User ID: {user.id}")
    print(f"Product ID: {product.id}")
    print(f"Product Slug: {product.slug}")
    print(f"Has Access: ✓")
    print(f"\nTo test API access, use:")
    print(f"  1. Login as {user.email} to get JWT token")
    print(f"  2. GET /api/products/{product.slug}/portal-access")
    print(f"  3. GET /api/products/purchases (should list this product)")

except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
