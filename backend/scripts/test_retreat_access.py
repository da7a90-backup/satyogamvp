"""Test script to verify retreat access control in the API."""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.retreat import Retreat, RetreatRegistration, RetreatType
from app.models.user import User
from app.routers.retreats import user_can_access_retreat

engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)

def test_access():
    db = SessionLocal()

    try:
        # Get the new retreat
        retreat = db.query(Retreat).filter(
            Retreat.slug == "awakening-consciousness-2026"
        ).first()

        if not retreat:
            print("❌ New retreat not found!")
            return

        # Get a test user
        user = db.query(User).first()
        if not user:
            print("❌ No users in database!")
            return

        print("=" * 70)
        print(f"Testing access control for:")
        print(f"  Retreat: {retreat.title}")
        print(f"  User: {user.email}")
        print("=" * 70)

        # Check if user is registered
        registration = db.query(RetreatRegistration).filter(
            RetreatRegistration.user_id == user.id,
            RetreatRegistration.retreat_id == retreat.id
        ).first()

        print(f"\nRegistration exists: {registration is not None}")

        # Test the access check function
        access_info = user_can_access_retreat(user, retreat, db)

        print(f"\nAccess Info:")
        print(f"  can_access: {access_info['can_access']}")
        print(f"  reason: {access_info['reason']}")
        print(f"  is_registered: {access_info['is_registered']}")

        # Expected behavior
        if not registration:
            expected_access = False
            expected_reason = "Not registered for this retreat"
        else:
            expected_access = True
            expected_reason = "Registered"

        print(f"\nExpected:")
        print(f"  can_access: {expected_access}")
        print(f"  reason: {expected_reason}")

        # Verify
        if access_info['can_access'] == expected_access:
            print("\n✅ Access control is working correctly!")
        else:
            print("\n❌ Access control is NOT working correctly!")

    finally:
        db.close()

if __name__ == "__main__":
    test_access()
