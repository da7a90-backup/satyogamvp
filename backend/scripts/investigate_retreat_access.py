"""
Investigation script to diagnose retreat access issues for user sidbarrack@gmail.com

This script audits the database to find:
- User's product purchases and access records
- Missing RetreatRegistrations
- Portal media configuration issues
"""

import sys
import os
import json
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product, UserProductAccess, Order, OrderItem
from app.models.retreat import Retreat, RetreatRegistration, AccessType
from app.models.payment import Payment, PaymentStatus


def investigate_user_access(user_email: str):
    """Comprehensive audit of user's retreat access."""
    db = SessionLocal()
    try:
        print(f"\n{'='*80}")
        print(f"RETREAT ACCESS INVESTIGATION REPORT")
        print(f"{'='*80}")
        print(f"User Email: {user_email}")
        print(f"Investigation Time: {datetime.utcnow().isoformat()}")
        print(f"{'='*80}\n")

        # Find user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"❌ ERROR: User with email '{user_email}' not found")
            return

        print(f"✓ User Found: {user.name} (ID: {user.id})")
        print(f"  Membership: {user.membership_tier.value if user.membership_tier else 'FREE'}\n")

        # Get all orders
        orders = db.query(Order).filter(Order.user_id == user.id).all()
        print(f"{'='*80}")
        print(f"ORDERS ({len(orders)} total)")
        print(f"{'='*80}")
        for order in orders:
            print(f"\nOrder #{order.order_number}")
            print(f"  ID: {order.id}")
            print(f"  Status: {order.status.value}")
            print(f"  Total: ${order.total_amount}")
            print(f"  Created: {order.created_at}")
            print(f"  Items: {len(order.items)}")
            for item in order.items:
                product = item.product
                print(f"    - {product.title} (${item.price_at_purchase})")
                print(f"      Product ID: {product.id}")
                print(f"      Slug: {product.slug}")
                print(f"      Type: {product.type.value}")

        # Get all payments
        payments = db.query(Payment).filter(Payment.user_id == user.id).all()
        print(f"\n{'='*80}")
        print(f"PAYMENTS ({len(payments)} total)")
        print(f"{'='*80}")
        for payment in payments:
            print(f"\nPayment ID: {payment.id}")
            print(f"  Type: {payment.payment_type.value}")
            print(f"  Status: {payment.status.value}")
            print(f"  Amount: ${payment.amount}")
            print(f"  Reference ID: {payment.reference_id}")
            print(f"  Tilopay Transaction: {payment.tilopay_transaction_id}")
            print(f"  Created: {payment.created_at}")
            if payment.payment_metadata:
                print(f"  Metadata: {json.dumps(payment.payment_metadata, indent=4)}")

        # Get all UserProductAccess records
        product_accesses = db.query(UserProductAccess).filter(
            UserProductAccess.user_id == user.id
        ).all()

        print(f"\n{'='*80}")
        print(f"PRODUCT ACCESS RECORDS ({len(product_accesses)} total)")
        print(f"{'='*80}")

        for access in product_accesses:
            product = access.product
            print(f"\n--- Product: {product.title} ---")
            print(f"  Product ID: {product.id}")
            print(f"  Slug: {product.slug}")
            print(f"  Type: {product.type.value}")
            print(f"  Granted: {access.granted_at}")
            print(f"  Expires: {access.expires_at if access.expires_at else 'Never'}")
            print(f"  Order ID: {access.order_id}")

            # Check if product has retreat_id
            if product.retreat_id:
                print(f"  ✓ Linked to Retreat ID: {product.retreat_id}")

                # Get retreat details
                retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()
                if retreat:
                    print(f"  Retreat Details:")
                    print(f"    - Title: {retreat.title}")
                    print(f"    - Slug: {retreat.slug}")
                    print(f"    - Type: {retreat.type.value}")
                    print(f"    - End Date: {retreat.end_date}")
                    print(f"    - Is Past: {retreat.end_date < datetime.utcnow() if retreat.end_date else False}")
                    print(f"    - Published to Store: {retreat.is_published_to_store}")
                    print(f"    - Store Product ID: {retreat.store_product_id}")

                    # Check portal media
                    has_past_media = bool(retreat.past_retreat_portal_media)
                    print(f"    - Has past_retreat_portal_media: {has_past_media}")
                    if has_past_media:
                        # Handle both dict and list formats
                        if isinstance(retreat.past_retreat_portal_media, list):
                            media_count = len(retreat.past_retreat_portal_media)
                            print(f"      → {media_count} media items (list)")
                            for i, item in enumerate(retreat.past_retreat_portal_media[:3], 1):
                                print(f"        {i}. {item.get('title', 'Untitled')}")
                                if 'video_url' in item and item['video_url']:
                                    print(f"           Video: {item['video_url'][:50]}...")
                                if 'audio_url' in item and item['audio_url']:
                                    print(f"           Audio: {item['audio_url'][:50]}...")
                        elif isinstance(retreat.past_retreat_portal_media, dict):
                            keys = list(retreat.past_retreat_portal_media.keys())
                            print(f"      → {len(keys)} keys (dict): {keys}")
                        else:
                            print(f"      → Unknown type: {type(retreat.past_retreat_portal_media)}")

                    # Check for RetreatRegistration
                    registration = db.query(RetreatRegistration).filter(
                        RetreatRegistration.user_id == user.id,
                        RetreatRegistration.retreat_id == retreat.id
                    ).first()

                    if registration:
                        print(f"  ✓ RetreatRegistration EXISTS")
                        print(f"    - Registration ID: {registration.id}")
                        print(f"    - Status: {registration.status.value}")
                        print(f"    - Access Type: {registration.access_type.value if registration.access_type else 'None'}")
                        print(f"    - Registered: {registration.registered_at}")
                        print(f"    - Expires: {registration.access_expires_at if registration.access_expires_at else 'Never'}")
                    else:
                        print(f"  ❌ RetreatRegistration MISSING - This is the problem!")
                        print(f"     → User has UserProductAccess but no RetreatRegistration")
                        print(f"     → Retreat will not show in 'My Online Retreats'")
                else:
                    print(f"  ❌ Retreat not found in database!")
            else:
                print(f"  ⚠ No retreat_id - Not linked to a retreat")

            # Check product portal media
            has_product_media = bool(product.portal_media)
            print(f"  Product portal_media: {has_product_media}")
            if has_product_media:
                if isinstance(product.portal_media, list):
                    print(f"    → {len(product.portal_media)} media items")
                elif isinstance(product.portal_media, dict):
                    keys = list(product.portal_media.keys())
                    print(f"    → Keys: {keys}")

        # Get all RetreatRegistrations
        registrations = db.query(RetreatRegistration).filter(
            RetreatRegistration.user_id == user.id
        ).all()

        print(f"\n{'='*80}")
        print(f"RETREAT REGISTRATIONS ({len(registrations)} total)")
        print(f"{'='*80}")
        for reg in registrations:
            retreat = reg.retreat
            print(f"\nRetreat: {retreat.title}")
            print(f"  Retreat ID: {retreat.id}")
            print(f"  Registration ID: {reg.id}")
            print(f"  Status: {reg.status.value}")
            print(f"  Access Type: {reg.access_type.value if reg.access_type else 'None'}")
            print(f"  Registered: {reg.registered_at}")
            print(f"  Expires: {reg.access_expires_at if reg.access_expires_at else 'Never'}")
            print(f"  Payment ID: {reg.payment_id}")

        # Summary
        print(f"\n{'='*80}")
        print(f"SUMMARY & RECOMMENDATIONS")
        print(f"{'='*80}")

        missing_registrations = []
        for access in product_accesses:
            if access.product.retreat_id:
                retreat = db.query(Retreat).filter(Retreat.id == access.product.retreat_id).first()
                if retreat:
                    reg_exists = db.query(RetreatRegistration).filter(
                        RetreatRegistration.user_id == user.id,
                        RetreatRegistration.retreat_id == retreat.id
                    ).first()
                    if not reg_exists:
                        missing_registrations.append({
                            'product': access.product,
                            'retreat': retreat,
                            'access': access
                        })

        if missing_registrations:
            print(f"\n❌ FOUND {len(missing_registrations)} MISSING RETREAT REGISTRATIONS:")
            for item in missing_registrations:
                print(f"\n  Product: {item['product'].title}")
                print(f"  Product ID: {item['product'].id}")
                print(f"  Retreat: {item['retreat'].title}")
                print(f"  Retreat ID: {item['retreat'].id}")
                print(f"  → Needs RetreatRegistration with LIFETIME access")
        else:
            print(f"\n✓ All products with retreat_id have corresponding RetreatRegistrations")

        # Check for retreats with no media
        retreats_no_media = []
        for reg in registrations:
            retreat = reg.retreat
            if retreat.end_date and retreat.end_date < datetime.utcnow():
                # Past retreat
                if not retreat.past_retreat_portal_media or len(retreat.past_retreat_portal_media) == 0:
                    # Check if linked product has media
                    if retreat.store_product_id:
                        product = db.query(Product).filter(Product.id == retreat.store_product_id).first()
                        if product and (not product.portal_media or len(product.portal_media) == 0):
                            retreats_no_media.append(retreat)
                    else:
                        retreats_no_media.append(retreat)

        if retreats_no_media:
            print(f"\n⚠ FOUND {len(retreats_no_media)} PAST RETREATS WITH NO MEDIA:")
            for retreat in retreats_no_media:
                print(f"\n  Retreat: {retreat.title}")
                print(f"  Retreat ID: {retreat.id}")
                print(f"  Slug: {retreat.slug}")
                print(f"  → past_retreat_portal_media is empty or missing")
                print(f"  → Portal will show 'Schedule Coming Soon'")
                print(f"  → Need to migrate media from source")

        print(f"\n{'='*80}")
        print(f"END OF REPORT")
        print(f"{'='*80}\n")

    except Exception as e:
        print(f"\n❌ ERROR during investigation: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Investigate retreat access issues')
    parser.add_argument('--email', type=str, default='sidbarrack@gmail.com',
                       help='User email to investigate')

    args = parser.parse_args()

    investigate_user_access(args.email)
