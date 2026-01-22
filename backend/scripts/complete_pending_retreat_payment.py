"""
Script to complete the pending retreat payment and create registration.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.payment import Payment, PaymentStatus
from app.models.retreat import RetreatRegistration, RegistrationStatus, AccessType, Retreat
from datetime import datetime, timedelta
import uuid

def complete_pending_payment():
    db = SessionLocal()
    try:
        # The payment ID from the user's redirect URL
        payment_id = "860e9046-513d-4d22-8ecb-70fd8f7502d8"
        tilopay_transaction = "4130066"

        # Get the payment
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            print(f"❌ Payment {payment_id} not found")
            return

        print(f"✓ Found payment: {payment.id}")
        print(f"  Status: {payment.status}")
        print(f"  Amount: ${payment.amount}")
        print(f"  Type: {payment.payment_type}")
        print(f"  Reference (Retreat ID): {payment.reference_id}")
        print(f"  Metadata: {payment.payment_metadata}")

        # Update payment status
        payment.status = PaymentStatus.COMPLETED
        payment.tilopay_transaction_id = tilopay_transaction
        payment.payment_method = "Visa"
        db.commit()
        print(f"\n✓ Payment marked as COMPLETED")

        # Get access type from metadata
        access_type = None
        if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
            access_type_str = payment.payment_metadata.get('access_type')
            if access_type_str:
                try:
                    access_type = AccessType(access_type_str)
                    print(f"✓ Access type: {access_type_str}")
                except ValueError:
                    print(f"❌ Invalid access type: {access_type_str}")

        # Check if registration already exists
        registration = (
            db.query(RetreatRegistration)
            .filter(
                RetreatRegistration.user_id == payment.user_id,
                RetreatRegistration.retreat_id == payment.reference_id,
            )
            .first()
        )

        if registration:
            # Update existing registration
            print(f"\n✓ Found existing registration: {registration.id}")
            registration.payment_id = payment.id
            registration.status = RegistrationStatus.CONFIRMED
            if access_type:
                registration.access_type = access_type
            db.commit()
            print(f"✓ Registration updated")
        elif access_type:
            # Create new registration
            retreat = db.query(Retreat).filter(Retreat.id == payment.reference_id).first()
            if retreat:
                print(f"\n✓ Found retreat: {retreat.title}")

                # Calculate expiration for 12-day access
                access_expires_at = None
                if access_type == AccessType.LIMITED_12DAY:
                    if retreat.end_date:
                        access_expires_at = retreat.end_date + timedelta(days=12)
                    else:
                        access_expires_at = datetime.utcnow() + timedelta(days=12)
                    print(f"  Access expires: {access_expires_at}")

                registration = RetreatRegistration(
                    user_id=payment.user_id,
                    retreat_id=payment.reference_id,
                    access_type=access_type,
                    payment_id=payment.id,
                    status=RegistrationStatus.CONFIRMED,
                    access_expires_at=access_expires_at,
                )
                db.add(registration)
                db.commit()
                db.refresh(registration)
                print(f"\n✅ Retreat registration created:")
                print(f"   ID: {registration.id}")
                print(f"   User ID: {registration.user_id}")
                print(f"   Retreat ID: {registration.retreat_id}")
                print(f"   Access: {access_type}")
                print(f"   Status: {registration.status}")
            else:
                print(f"❌ Retreat not found: {payment.reference_id}")
        else:
            print(f"❌ No access type found in payment metadata")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    complete_pending_payment()
