"""
Script to clear all retreat registrations for a user.

This allows testing the retreat payment flow from scratch.
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.retreat import RetreatRegistration
from app.models.user import User

# Create database engine
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)


def clear_user_registrations(db, user_email: str):
    """Clear all retreat registrations for a specific user."""
    print(f"\nLooking for user with email: {user_email}")

    # Find user
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        print(f"❌ User not found with email: {user_email}")
        return

    print(f"✅ Found user: {user.name} (ID: {user.id})")

    # Get all registrations
    registrations = db.query(RetreatRegistration).filter(
        RetreatRegistration.user_id == user.id
    ).all()

    if not registrations:
        print(f"\n✅ User has no retreat registrations - nothing to clear!")
        return

    print(f"\nFound {len(registrations)} retreat registration(s):")
    for reg in registrations:
        print(f"  - Retreat ID: {reg.retreat_id}")
        print(f"    Status: {reg.status.value}")
        print(f"    Access Type: {reg.access_type.value if reg.access_type else 'N/A'}")
        print(f"    Registered: {reg.registered_at}")

    # Delete all registrations
    print(f"\n🗑️  Deleting all {len(registrations)} registration(s)...")
    for reg in registrations:
        db.delete(reg)

    db.commit()

    print(f"\n✅ Successfully cleared all retreat registrations for {user.name}!")
    print(f"   You can now test the payment flow from scratch.")


def main():
    """Run the script."""
    db = SessionLocal()

    try:
        print("=" * 70)
        print("CLEAR RETREAT REGISTRATIONS SCRIPT")
        print("=" * 70)

        # Default to test user email
        user_email = "free@test.com"

        # Allow command line argument for different email
        if len(sys.argv) > 1:
            user_email = sys.argv[1]

        clear_user_registrations(db, user_email)

        print("\n" + "=" * 70)
        print("✅ CLEAR COMPLETE!")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
