#!/usr/bin/env python3
"""Check newsletter subscribers in the database."""

import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.email import NewsletterSubscriber

def check_subscribers():
    """Check how many newsletter subscribers exist."""
    db = SessionLocal()
    try:
        # Count subscribers by status
        total = db.query(NewsletterSubscriber).count()
        active = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.status == "active"
        ).count()

        print(f"📧 Newsletter Subscribers Summary:")
        print(f"   Total subscribers: {total}")
        print(f"   Active subscribers: {active}")

        if total > 0:
            print(f"\n📋 First 10 subscribers:")
            subscribers = db.query(NewsletterSubscriber).limit(10).all()
            for sub in subscribers:
                print(f"   - {sub.email} ({sub.name or 'No name'}) - Status: {sub.status}")
        else:
            print("\n⚠️  No subscribers found in database!")
            print("   Consider adding test subscribers using add_test_subscribers.py")

    finally:
        db.close()

if __name__ == "__main__":
    check_subscribers()
