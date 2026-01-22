"""
Create retreat for Live Free of Anxiety product and link it.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.product import Product
from app.models.retreat import Retreat, RetreatPortal, RetreatRegistration, RegistrationStatus, AccessType
from datetime import datetime, timedelta
import uuid

def main():
    db: Session = SessionLocal()

    try:
        # Get the product
        product = db.query(Product).filter(
            Product.slug == 'live-free-of-anxiety-an-invitation-to-sustained-serenity'
        ).first()

        if not product:
            print("❌ Product not found")
            return

        print(f"✓ Found product: {product.title}")

        # Create retreat (past date)
        from app.models.retreat import RetreatType
        retreat = Retreat(
            id=uuid.uuid4(),
            slug='live-free-of-anxiety',
            title='Live Free of Anxiety! An Invitation to Sustained Serenity',
            description='A transformative online retreat to help you live free of anxiety',
            type=RetreatType.ONLINE,
            start_date=datetime(2025, 11, 15),  # Past date
            end_date=datetime(2025, 11, 17),
            max_participants=None,
            is_published=True,
            thumbnail_url=product.featured_image,
            price_lifetime=product.price
        )
        db.add(retreat)
        db.flush()
        print(f"✓ Created retreat: {retreat.slug}")

        # Create retreat portal
        portal = RetreatPortal(
            id=uuid.uuid4(),
            retreat_id=retreat.id,
            title=retreat.title,
            description='Access all retreat sessions and materials',
            content={"days": []}  # Empty for now, will add content when available
        )
        db.add(portal)
        print(f"✓ Created retreat portal")

        # Link product to retreat
        product.retreat_id = retreat.id
        print(f"✓ Linked product to retreat")

        # Get user and create registration
        user_email = 'sidbarrack@gmail.com'
        from app.models.user import User
        user = db.query(User).filter(User.email == user_email).first()

        if user:
            # Check if registration already exists
            existing_reg = db.query(RetreatRegistration).filter(
                RetreatRegistration.user_id == user.id,
                RetreatRegistration.retreat_id == retreat.id
            ).first()

            if not existing_reg:
                registration = RetreatRegistration(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    retreat_id=retreat.id,
                    access_type=AccessType.LIFETIME,
                    status=RegistrationStatus.CONFIRMED,
                    registered_at=datetime.utcnow(),
                    access_expires_at=None
                )
                db.add(registration)
                print(f"✓ Created retreat registration for {user_email}")
            else:
                print(f"  User already registered")

        db.commit()
        print("\n✅ SUCCESS!")
        print(f"\nUser can access at:")
        print(f"  /dashboard/user/retreats/{retreat.slug}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
