"""Check recent retreat payments and their metadata."""

import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.payment import Payment, PaymentType
from app.models.retreat import RetreatRegistration

engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)

def check_payments():
    db = SessionLocal()

    try:
        # Get recent retreat payments
        payments = db.query(Payment).filter(
            Payment.payment_type == PaymentType.RETREAT
        ).order_by(desc(Payment.created_at)).limit(5).all()

        print("=" * 70)
        print(f"RECENT RETREAT PAYMENTS (Last {len(payments)})")
        print("=" * 70)

        for payment in payments:
            print(f"\nPayment ID: {payment.id}")
            print(f"  User ID: {payment.user_id}")
            print(f"  Amount: ${payment.amount}")
            print(f"  Status: {payment.status.value}")
            print(f"  Type: {payment.payment_type.value}")
            print(f"  Reference ID (Retreat): {payment.reference_id}")
            print(f"  Created: {payment.created_at}")
            print(f"  Tilopay Order ID: {payment.tilopay_order_id}")
            print(f"  Tilopay Transaction ID: {payment.tilopay_transaction_id}")
            print(f"  Metadata: {payment.payment_metadata}")
            print(f"  Metadata Type: {type(payment.payment_metadata)}")

            # Check if there's a corresponding registration
            if payment.user_id and payment.reference_id:
                registration = db.query(RetreatRegistration).filter(
                    RetreatRegistration.user_id == payment.user_id,
                    RetreatRegistration.retreat_id == payment.reference_id
                ).first()

                if registration:
                    print(f"  ✅ Registration exists:")
                    print(f"     - ID: {registration.id}")
                    print(f"     - Status: {registration.status.value}")
                    print(f"     - Access Type: {registration.access_type.value if registration.access_type else 'None'}")
                    print(f"     - Registered At: {registration.registered_at}")
                else:
                    print(f"  ❌ NO REGISTRATION FOUND")

        print("\n" + "=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    check_payments()
