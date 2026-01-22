"""
Manually complete a pending payment for testing purposes.
This simulates what the Tilopay webhook would do.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.payment import Payment, PaymentStatus, PaymentType
from app.models.retreat import RetreatRegistration, RegistrationStatus, AccessType, Retreat
from datetime import datetime, timedelta
import uuid


def complete_payment(payment_id: str):
    """Complete a pending payment and grant access."""
    db = SessionLocal()
    try:
        # Find the payment
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            print(f"❌ Payment {payment_id} not found")
            return
        
        print(f"\n📋 Payment Details:")
        print(f"   ID: {payment.id}")
        print(f"   Status: {payment.status}")
        print(f"   Type: {payment.payment_type}")
        print(f"   Amount: ${payment.amount}")
        print(f"   User ID: {payment.user_id}")
        print(f"   Reference ID: {payment.reference_id}")
        print(f"   Metadata: {payment.payment_metadata}")
        
        if payment.status == PaymentStatus.COMPLETED:
            print(f"\n⚠️  Payment already completed")
            return
        
        # Update payment status
        payment.status = PaymentStatus.COMPLETED
        payment.tilopay_transaction_id = f"TEST-{uuid.uuid4().hex[:16]}"
        db.commit()
        
        print(f"\n✅ Payment marked as COMPLETED")
        
        # Grant access for retreat payments
        if payment.payment_type == PaymentType.RETREAT and payment.reference_id:
            print(f"\n🎫 Granting retreat access...")
            
            # Get access_type from metadata
            access_type_str = None
            if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
                access_type_str = payment.payment_metadata.get('access_type')
            
            if not access_type_str:
                print(f"❌ No access_type in payment metadata!")
                return
            
            print(f"   Access Type: {access_type_str}")
            
            # Convert to enum
            try:
                access_type = AccessType(access_type_str)
            except ValueError:
                print(f"❌ Invalid access_type: {access_type_str}")
                return
            
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
                registration.payment_id = payment.id
                registration.status = RegistrationStatus.CONFIRMED
                registration.access_type = access_type
                db.commit()
                print(f"✅ Updated existing registration")
            else:
                # Create new registration
                retreat = db.query(Retreat).filter(Retreat.id == payment.reference_id).first()
                if not retreat:
                    print(f"❌ Retreat not found: {payment.reference_id}")
                    return
                
                # Calculate expiration for 12-day access
                access_expires_at = None
                if access_type == AccessType.LIMITED_12DAY:
                    if retreat.end_date:
                        access_expires_at = retreat.end_date + timedelta(days=12)
                    else:
                        access_expires_at = datetime.utcnow() + timedelta(days=12)
                    print(f"   Expires: {access_expires_at}")
                
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
                
                print(f"✅ Created new registration: {registration.id}")
                print(f"   Retreat: {retreat.title}")
                print(f"   Status: {registration.status}")
                print(f"   Access: {registration.access_type}")
        
        print(f"\n🎉 Payment completed and access granted!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


def list_pending_payments():
    """List all pending payments."""
    db = SessionLocal()
    try:
        payments = (
            db.query(Payment)
            .filter(Payment.status == PaymentStatus.PENDING)
            .order_by(Payment.created_at.desc())
            .limit(10)
            .all()
        )
        
        if not payments:
            print("No pending payments found")
            return
        
        print(f"\n📋 Pending Payments ({len(payments)}):\n")
        for p in payments:
            print(f"   {p.id}")
            print(f"   └─ {p.payment_type.value} | ${p.amount} | {p.created_at}")
            if p.payment_metadata:
                print(f"      Metadata: {p.payment_metadata}")
            print()
        
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python scripts/complete_pending_payment.py list")
        print("  python scripts/complete_pending_payment.py <payment_id>")
        sys.exit(1)
    
    if sys.argv[1] == "list":
        list_pending_payments()
    else:
        payment_id = sys.argv[1]
        complete_payment(payment_id)
