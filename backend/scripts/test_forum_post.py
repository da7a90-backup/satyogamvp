"""
Test script to debug forum posting issues.
This script will:
1. Check if a retreat exists with forum enabled
2. Get a test user
3. Create a valid JWT token
4. Test the forum POST endpoint
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.retreat import Retreat, RetreatRegistration, AccessType, RegistrationStatus
from app.models.user import User
from app.core.security import create_access_token
import requests
import json

def test_forum_posting():
    db: Session = SessionLocal()

    try:
        print("=" * 80)
        print("FORUM POSTING DIAGNOSTIC TEST")
        print("=" * 80)

        # 1. Find a retreat with forum enabled
        print("\n1. Checking for retreats with forum enabled...")
        retreat = db.query(Retreat).filter(
            Retreat.is_published == True,
            Retreat.forum_enabled == True
        ).first()

        if not retreat:
            print("   ❌ No published retreats with forum enabled found!")
            print("   Looking for any retreat to enable forum on...")
            retreat = db.query(Retreat).filter(Retreat.is_published == True).first()

            if retreat:
                print(f"   Found retreat: {retreat.title} (slug: {retreat.slug})")
                print(f"   Enabling forum for this retreat...")
                retreat.forum_enabled = True
                db.commit()
                print(f"   ✅ Forum enabled for retreat: {retreat.slug}")
            else:
                print("   ❌ No published retreats found at all!")
                return
        else:
            print(f"   ✅ Found retreat with forum enabled: {retreat.title} (slug: {retreat.slug})")

        # 2. Find a test user
        print("\n2. Finding a test user...")
        user = db.query(User).first()

        if not user:
            print("   ❌ No users found in database!")
            return

        print(f"   ✅ Found user: {user.name} (email: {user.email})")
        print(f"      User ID: {user.id}")

        # 3. Check if user is registered for the retreat
        print("\n3. Checking retreat registration...")
        registration = db.query(RetreatRegistration).filter(
            RetreatRegistration.user_id == user.id,
            RetreatRegistration.retreat_id == retreat.id
        ).first()

        if not registration:
            print("   ⚠️  User is not registered for this retreat. Creating registration...")
            registration = RetreatRegistration(
                user_id=user.id,
                retreat_id=retreat.id,
                status=RegistrationStatus.CONFIRMED,
                access_type=AccessType.LIFETIME
            )
            db.add(registration)
            db.commit()
            print(f"   ✅ Created registration for user")
        else:
            print(f"   ✅ User is already registered")
            print(f"      Status: {registration.status.value}")
            print(f"      Access Type: {registration.access_type.value if registration.access_type else 'None'}")

        # 4. Generate JWT token
        print("\n4. Generating JWT token...")
        token = create_access_token(data={"sub": str(user.id)})
        print(f"   ✅ Token generated: {token[:50]}...")

        # 5. Test the forum POST endpoint
        print("\n5. Testing forum POST endpoint...")
        url = f"http://localhost:8000/api/retreats/{retreat.slug}/forum"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "title": "Test Forum Post",
            "category": "general",
            "content": "This is a test post created by the diagnostic script."
        }

        print(f"   URL: {url}")
        print(f"   Headers: Authorization: Bearer {token[:30]}...")
        print(f"   Payload: {json.dumps(payload, indent=6)}")

        try:
            response = requests.post(url, headers=headers, json=payload)
            print(f"\n   Response Status: {response.status_code}")
            print(f"   Response Body:")
            print(f"   {json.dumps(response.json(), indent=6)}")

            if response.status_code == 200:
                print("\n   ✅ Forum post created successfully!")
            else:
                print(f"\n   ❌ Failed to create forum post!")

        except Exception as e:
            print(f"\n   ❌ Error making request: {str(e)}")

        # 6. Print summary for frontend testing
        print("\n" + "=" * 80)
        print("FRONTEND TESTING INFORMATION")
        print("=" * 80)
        print(f"Retreat Slug: {retreat.slug}")
        print(f"Token to use in browser localStorage:")
        print(f"localStorage.setItem('fastapi_token', '{token}');")
        print(f"\nThen navigate to: http://localhost:3000/dashboard/user/retreats/{retreat.slug}")
        print("=" * 80)

    finally:
        db.close()

if __name__ == "__main__":
    test_forum_posting()
