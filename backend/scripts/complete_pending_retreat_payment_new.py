"""Manually complete a pending retreat payment and create registration."""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.payment import Payment, PaymentStatus, PaymentType
from app.routers.payments import grant_access_after_payment

engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)

def complete_payment(payment_id_str: str):
    db = SessionLocal()

    try:
        import uuid
        payment_uuid = uuid.UUID(payment_id_str)

        # Get payment
        payment = db.query(Payment).filter(Payment.id == payment_uuid).first()

        if not payment:
            print(f"❌ Payment not found: {payment_id_str}")
            return

        print(f"\nPayment Found:")
        print(f"  ID: {payment.id}")
        print(f"  User ID: {payment.user_id}")
        print(f"  Amount: ${payment.amount}")
        print(f"  Status: {payment.status.value}")
        print(f"  Type: {payment.payment_type.value}")
        print(f"  Reference ID: {payment.reference_id}")
        print(f"  Metadata: {payment.payment_metadata}")

        if payment.status == PaymentStatus.COMPLETED:
            print("\n⚠️ Payment is already completed")
            return

        # Mark as completed
        payment.status = PaymentStatus.COMPLETED
        payment.tilopay_transaction_id = "MANUAL-TEST-" + str(payment.id)[:8]
        payment.payment_method = "Manual Test"
        db.commit()

        print(f"\n✅ Payment marked as completed")

        # Call grant_access_after_payment (same as webhook would do)
        print(f"\n🔄 Granting access...")
        grant_access_after_payment(
            str(payment.id),
            str(payment.user_id),
            payment.payment_type.value,
            payment.reference_id
        )

        print(f"\n✅ Access granted!")
        print(f"\nYou should now see the retreat in 'My Online Retreats'")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def get_most_recent_pending_payment():
    """Get the most recent pending retreat payment."""
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(
            Payment.payment_type == PaymentType.RETREAT,
            Payment.status == PaymentStatus.PENDING
        ).order_by(desc(Payment.created_at)).first()

        return str(payment.id) if payment else None
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 70)
    print("COMPLETING PENDING RETREAT PAYMENT")
    print("=" * 70)

    # Get most recent pending payment
    payment_id = get_most_recent_pending_payment()

    if not payment_id:
        print("\n❌ No pending retreat payments found")
        print("\n" + "=" * 70)
        exit(1)

    print(f"\nFound pending payment: {payment_id}")
    complete_payment(payment_id)

    print("\n" + "=" * 70)
    print("DONE!")
    print("=" * 70)
