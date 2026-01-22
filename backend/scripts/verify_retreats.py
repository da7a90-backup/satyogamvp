"""Quick script to verify retreats in the database."""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.retreat import Retreat, RetreatType

engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)

def verify_retreats():
    db = SessionLocal()

    try:
        # Get all online retreats
        retreats = db.query(Retreat).filter(
            Retreat.type == RetreatType.ONLINE,
            Retreat.is_published == True
        ).all()

        print(f"\nFound {len(retreats)} online retreat(s):\n")

        for retreat in retreats:
            print("=" * 70)
            print(f"Title: {retreat.title}")
            print(f"Slug: {retreat.slug}")
            print(f"ID: {retreat.id}")
            print(f"Type: {retreat.type.value}")
            print(f"Price (Lifetime): ${retreat.price_lifetime}")
            print(f"Price (12-day): ${retreat.price_limited}")
            print(f"Start Date: {retreat.start_date}")
            print(f"End Date: {retreat.end_date}")
            print(f"Published: {retreat.is_published}")
            print(f"URL: http://localhost:3000/retreats/online/{retreat.slug}")
            print()

    finally:
        db.close()

if __name__ == "__main__":
    verify_retreats()
