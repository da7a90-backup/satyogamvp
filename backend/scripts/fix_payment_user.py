"""Fix payment user_id."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.payment import Payment
from app.models.user import User

def fix_payment(payment_id: str, user_email: str):
    db = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"❌ User not found: {user_email}")
            return
        
        # Find payment
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            print(f"❌ Payment not found: {payment_id}")
            return
        
        print(f"Assigning payment to user: {user.name} ({user.email})")
        payment.user_id = user.id
        db.commit()
        print(f"✅ Payment updated")
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/fix_payment_user.py <payment_id> <user_email>")
        sys.exit(1)
    
    fix_payment(sys.argv[1], sys.argv[2])
