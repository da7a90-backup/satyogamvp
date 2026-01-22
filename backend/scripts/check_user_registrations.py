"""Check user registrations and access flags."""

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

def check_registrations():
    db = SessionLocal()

    try:
        # Get all users
        users = db.query(User).all()

        for user in users:
            print("=" * 70)
            print(f"User: {user.email}")
            print("=" * 70)

            # Get all registrations for this user
            registrations = db.query(RetreatRegistration).filter(
                RetreatRegistration.user_id == user.id
            ).all()

            if not registrations:
                print("  No registrations\n")
                continue

            for reg in registrations:
                retreat = reg.retreat
                print(f"\n  Retreat: {retreat.title}")
                print(f"  Slug: {retreat.slug}")
                print(f"  Registration Status: {reg.status.value}")
                print(f"  Access Type: {reg.access_type.value if reg.access_type else 'N/A'}")

                # Check access
                access_info = user_can_access_retreat(user, retreat, db)
                print(f"  Can Access: {access_info['can_access']}")
                print(f"  Reason: {access_info['reason']}")
                print(f"  Is Registered: {access_info['is_registered']}")

            print()

    finally:
        db.close()

if __name__ == "__main__":
    check_registrations()
