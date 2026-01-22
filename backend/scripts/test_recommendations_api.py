#!/usr/bin/env python3
"""
Test script for Recommendations API endpoints and access control.

Tests:
1. User endpoints - FREE tier (should return 403)
2. User endpoints - GYANI+ tiers (should return 200)
3. Admin endpoints - Create, Read, Update, Delete
4. Access control validation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, MembershipTierEnum
from app.models.recommendation import Recommendation
from app.core.security import create_access_token
import requests
import json

BASE_URL = "http://localhost:8000"

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e

def create_test_user(db: Session, email: str, tier: MembershipTierEnum, is_admin: bool = False):
    """Create or update test user with specified tier."""
    user = db.query(User).filter(User.email == email).first()

    if user:
        user.membership_tier = tier
        user.is_admin = is_admin
    else:
        user = User(
            email=email,
            name=f"Test {tier.value}",
            membership_tier=tier,
            is_admin=is_admin,
            is_active=True,
            email_verified=True
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user

def create_test_recommendation(db: Session, rec_type: str, display_order: int):
    """Create a test recommendation."""
    if rec_type == 'book':
        rec = Recommendation(
            slug=f"test-book-{display_order}",
            title=f"Test Book {display_order}",
            recommendation_type='book',
            author="Test Author",
            amazon_url="https://amazon.com/test",
            category="Philosophy",
            access_level='gyani',
            display_order=display_order,
            description="Test book description"
        )
    else:
        rec = Recommendation(
            slug=f"test-documentary-{display_order}",
            title=f"Test Documentary {display_order}",
            recommendation_type='documentary',
            youtube_id="dQw4w9WgXcQ",
            duration=120,
            category="Spirituality",
            access_level='gyani',
            display_order=display_order,
            description="Test documentary description"
        )

    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def test_user_endpoint_free_tier():
    """Test user endpoint with FREE tier - should return 403."""
    print("\n🧪 Test 1: User endpoint with FREE tier")

    db = get_db()
    try:
        # Create FREE tier user
        user = create_test_user(db, "free@test.com", MembershipTierEnum.FREE)
        token = create_access_token(data={"sub": str(user.id)})

        # Try to access user endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/recommendations", headers=headers)

        if response.status_code == 403:
            print("✅ PASS: FREE tier correctly denied access (403)")
            print(f"   Error message: {response.json().get('detail', 'N/A')}")
            return True
        else:
            print(f"❌ FAIL: Expected 403, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False
    finally:
        db.close()

def test_user_endpoint_gyani_tier():
    """Test user endpoint with GYANI tier - should return 200."""
    print("\n🧪 Test 2: User endpoint with GYANI tier")

    db = get_db()
    try:
        # Create GYANI tier user
        user = create_test_user(db, "gyani@test.com", MembershipTierEnum.GYANI)
        token = create_access_token(data={"sub": str(user.id)})

        # Try to access user endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/recommendations", headers=headers)

        if response.status_code == 200:
            print("✅ PASS: GYANI tier granted access (200)")
            data = response.json()
            print(f"   Returned {len(data.get('recommendations', []))} recommendations")
            return True
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False
    finally:
        db.close()

def test_user_endpoint_pragyani_tier():
    """Test user endpoint with PRAGYANI tier - should return 200."""
    print("\n🧪 Test 3: User endpoint with PRAGYANI tier")

    db = get_db()
    try:
        # Create PRAGYANI tier user
        user = create_test_user(db, "pragyani@test.com", MembershipTierEnum.PRAGYANI)
        token = create_access_token(data={"sub": str(user.id)})

        # Try to access user endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/recommendations", headers=headers)

        if response.status_code == 200:
            print("✅ PASS: PRAGYANI tier granted access (200)")
            data = response.json()
            print(f"   Returned {len(data.get('recommendations', []))} recommendations")
            return True
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False
    finally:
        db.close()

def test_user_endpoint_pragyani_plus_tier():
    """Test user endpoint with PRAGYANI_PLUS tier - should return 200."""
    print("\n🧪 Test 4: User endpoint with PRAGYANI_PLUS tier")

    db = get_db()
    try:
        # Create PRAGYANI_PLUS tier user
        user = create_test_user(db, "pragyaniplus@test.com", MembershipTierEnum.PRAGYANI_PLUS)
        token = create_access_token(data={"sub": str(user.id)})

        # Try to access user endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/recommendations", headers=headers)

        if response.status_code == 200:
            print("✅ PASS: PRAGYANI_PLUS tier granted access (200)")
            data = response.json()
            print(f"   Returned {len(data.get('recommendations', []))} recommendations")
            return True
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False
    finally:
        db.close()

def test_admin_crud_operations():
    """Test admin CRUD operations."""
    print("\n🧪 Test 5: Admin CRUD operations")

    db = get_db()
    try:
        # Create admin user
        admin = create_test_user(db, "admin@test.com", MembershipTierEnum.PRAGYANI_PLUS, is_admin=True)
        token = create_access_token(data={"sub": str(admin.id)})
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Test 5a: Create book recommendation
        print("\n  5a. CREATE book recommendation")
        book_data = {
            "slug": "api-test-book",
            "title": "API Test Book",
            "recommendation_type": "book",
            "author": "API Test Author",
            "amazon_url": "https://amazon.com/api-test",
            "category": "Testing",
            "access_level": "gyani",
            "display_order": 999,
            "description": "Created via API test"
        }
        response = requests.post(f"{BASE_URL}/api/recommendations/admin", headers=headers, json=book_data)

        if response.status_code == 200:
            print("     ✅ Book created successfully")
            book_id = response.json()["id"]
        else:
            print(f"     ❌ Failed to create book: {response.status_code}")
            print(f"     Response: {response.text}")
            return False

        # Test 5b: Create documentary recommendation
        print("\n  5b. CREATE documentary recommendation")
        doc_data = {
            "slug": "api-test-doc",
            "title": "API Test Documentary",
            "recommendation_type": "documentary",
            "youtube_id": "test123456",
            "duration": 180,
            "category": "Testing",
            "access_level": "gyani",
            "display_order": 1000,
            "description": "Created via API test"
        }
        response = requests.post(f"{BASE_URL}/api/recommendations/admin", headers=headers, json=doc_data)

        if response.status_code == 200:
            print("     ✅ Documentary created successfully")
            doc_id = response.json()["id"]
        else:
            print(f"     ❌ Failed to create documentary: {response.status_code}")
            return False

        # Test 5c: Read all recommendations (admin)
        print("\n  5c. READ all recommendations (admin)")
        response = requests.get(f"{BASE_URL}/api/recommendations/admin", headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(f"     ✅ Retrieved {len(data['recommendations'])} recommendations")
        else:
            print(f"     ❌ Failed to read recommendations: {response.status_code}")
            return False

        # Test 5d: Update book recommendation
        print("\n  5d. UPDATE book recommendation")
        update_data = {
            "title": "Updated API Test Book",
            "author": "Updated Author"
        }
        response = requests.put(f"{BASE_URL}/api/recommendations/admin/{book_id}", headers=headers, json=update_data)

        if response.status_code == 200:
            updated = response.json()
            if updated["title"] == "Updated API Test Book":
                print("     ✅ Book updated successfully")
            else:
                print("     ❌ Book update didn't persist")
                return False
        else:
            print(f"     ❌ Failed to update book: {response.status_code}")
            return False

        # Test 5e: Delete recommendations
        print("\n  5e. DELETE recommendations")
        response1 = requests.delete(f"{BASE_URL}/api/recommendations/admin/{book_id}", headers=headers)
        response2 = requests.delete(f"{BASE_URL}/api/recommendations/admin/{doc_id}", headers=headers)

        if response1.status_code == 200 and response2.status_code == 200:
            print("     ✅ Both recommendations deleted successfully")
        else:
            print(f"     ❌ Failed to delete: Book={response1.status_code}, Doc={response2.status_code}")
            return False

        print("\n✅ PASS: All admin CRUD operations successful")
        return True

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_filtering_and_pagination():
    """Test filtering and pagination features."""
    print("\n🧪 Test 6: Filtering and pagination")

    db = get_db()
    try:
        # Create test data
        user = create_test_user(db, "gyani@test.com", MembershipTierEnum.GYANI)
        token = create_access_token(data={"sub": str(user.id)})
        headers = {"Authorization": f"Bearer {token}"}

        # Create some test recommendations
        for i in range(5):
            create_test_recommendation(db, 'book', 2000 + i)
        for i in range(3):
            create_test_recommendation(db, 'documentary', 3000 + i)

        # Test 6a: Filter by type
        print("\n  6a. Filter by type (books only)")
        response = requests.get(f"{BASE_URL}/api/recommendations?recommendation_type=book", headers=headers)

        if response.status_code == 200:
            data = response.json()
            books = [r for r in data['recommendations'] if r['recommendation_type'] == 'book']
            print(f"     ✅ Retrieved {len(books)} books")
        else:
            print(f"     ❌ Failed: {response.status_code}")
            return False

        # Test 6b: Pagination
        print("\n  6b. Pagination (limit=2)")
        response = requests.get(f"{BASE_URL}/api/recommendations?limit=2", headers=headers)

        if response.status_code == 200:
            data = response.json()
            if len(data['recommendations']) <= 2:
                print(f"     ✅ Pagination working: {len(data['recommendations'])} items")
            else:
                print(f"     ❌ Pagination failed: got {len(data['recommendations'])} items")
                return False
        else:
            print(f"     ❌ Failed: {response.status_code}")
            return False

        # Cleanup test data
        for i in range(5):
            rec = db.query(Recommendation).filter(Recommendation.slug == f"test-book-{2000 + i}").first()
            if rec:
                db.delete(rec)
        for i in range(3):
            rec = db.query(Recommendation).filter(Recommendation.slug == f"test-documentary-{3000 + i}").first()
            if rec:
                db.delete(rec)
        db.commit()

        print("\n✅ PASS: Filtering and pagination working correctly")
        return True

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🚀 RECOMMENDATIONS API TEST SUITE")
    print("=" * 60)

    results = []

    # Run all tests
    results.append(("FREE tier access control", test_user_endpoint_free_tier()))
    results.append(("GYANI tier access", test_user_endpoint_gyani_tier()))
    results.append(("PRAGYANI tier access", test_user_endpoint_pragyani_tier()))
    results.append(("PRAGYANI_PLUS tier access", test_user_endpoint_pragyani_plus_tier()))
    results.append(("Admin CRUD operations", test_admin_crud_operations()))
    results.append(("Filtering and pagination", test_filtering_and_pagination()))

    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
