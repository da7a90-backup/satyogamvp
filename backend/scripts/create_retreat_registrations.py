"""
Create retreat registrations for users who purchased the product.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.product import Product, UserProductAccess
from app.models.retreat import Retreat, RetreatRegistration, RegistrationStatus, AccessType
from datetime import datetime

def main():
    db: Session = SessionLocal()

    try:
        # Get the product
        product = db.query(Product).filter(
            Product.slug == 'why-our-situation-is-hopeless-yet-hilarious'
        ).first()

        if not product or not product.retreat_id:
            print("❌ Product not found or not linked to retreat")
            return

        print(f"✓ Found product: {product.title}")
        print(f"  Retreat ID: {product.retreat_id}")

        # Get all users who have access to this product
        accesses = db.query(UserProductAccess).filter(
            UserProductAccess.product_id == product.id
        ).all()

        print(f"\n✓ Found {len(accesses)} users with product access")

        # Create retreat registrations for each user
        created_count = 0
        skipped_count = 0

        for access in accesses:
            # Check if registration already exists
            existing_reg = db.query(RetreatRegistration).filter(
                RetreatRegistration.user_id == access.user_id,
                RetreatRegistration.retreat_id == product.retreat_id
            ).first()

            if existing_reg:
                print(f"  - Skipped user {access.user_id} (already registered)")
                skipped_count += 1
                continue

            # Create new registration
            registration = RetreatRegistration(
                user_id=access.user_id,
                retreat_id=product.retreat_id,
                access_type=AccessType.LIFETIME,  # Purchased products get lifetime access
                status=RegistrationStatus.CONFIRMED,
                registered_at=access.granted_at,
                access_expires_at=None  # Lifetime access
            )

            db.add(registration)
            created_count += 1
            print(f"  ✓ Created registration for user {access.user_id}")

        db.commit()

        print(f"\n✅ SUCCESS!")
        print(f"  - Created: {created_count} new registrations")
        print(f"  - Skipped: {skipped_count} existing registrations")
        print(f"\nUsers can now access the retreat portal at:")
        print(f"  /dashboard/user/retreats/hopeless-yet-hilarious")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
