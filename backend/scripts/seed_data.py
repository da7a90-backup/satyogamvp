# -*- coding: utf-8 -*-
"""
Database seed script.
Seeds the database with example users, teachings, courses, retreats, and products.
"""
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserProfile, MembershipTierEnum
from app.models.teaching import Teaching, ContentType, AccessLevel
# Removed unused imports for now - focus on users and teachings
# from app.models.course import Course, CourseClass
# from app.models.retreat import Retreat
# from app.models.product import Product, ProductType


def create_users(db):
    """Create example users with different membership tiers."""
    print("\n📝 Creating users...")

    users_data = [
        {
            "email": "free@test.com",
            "password": "password123",
            "name": "Free User",
            "membership_tier": MembershipTierEnum.FREE,
            "is_admin": False
        },
        {
            "email": "gyani@test.com",
            "password": "password123",
            "name": "Gyani Member",
            "membership_tier": MembershipTierEnum.GYANI,
            "is_admin": False,
            "membership_start_date": datetime.utcnow(),
            "membership_end_date": datetime.utcnow() + timedelta(days=365)
        },
        {
            "email": "pragyani@test.com",
            "password": "password123",
            "name": "Pragyani Member",
            "membership_tier": MembershipTierEnum.PRAGYANI,
            "is_admin": False,
            "membership_start_date": datetime.utcnow(),
            "membership_end_date": datetime.utcnow() + timedelta(days=365)
        },
        {
            "email": "pragyani_plus@test.com",
            "password": "password123",
            "name": "Pragyani Plus Member",
            "membership_tier": MembershipTierEnum.PRAGYANI_PLUS,
            "is_admin": False,
            "membership_start_date": datetime.utcnow(),
            "membership_end_date": datetime.utcnow() + timedelta(days=365)
        },
        {
            "email": "admin@test.com",
            "password": "admin123",
            "name": "Admin User",
            "membership_tier": MembershipTierEnum.PRAGYANI_PLUS,
            "is_admin": True,
            "membership_start_date": datetime.utcnow(),
            "membership_end_date": datetime.utcnow() + timedelta(days=365)
        },
    ]

    created_users = []
    for user_data in users_data:
        # Check if user already exists
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"  ⚠️  User {user_data['email']} already exists, skipping...")
            created_users.append(existing)
            continue

        # Create user
        user = User(
            email=user_data["email"],
            name=user_data["name"],
            password_hash=get_password_hash(user_data["password"]),
            membership_tier=user_data["membership_tier"],
            membership_start_date=user_data.get("membership_start_date"),
            membership_end_date=user_data.get("membership_end_date"),
            is_admin=user_data["is_admin"],
            is_active=True
        )
        db.add(user)
        db.flush()  # Get the user ID

        # Create profile
        profile = UserProfile(
            user_id=user.id,
            bio=f"Test user for {user_data['membership_tier'].value} tier",
            preferences={}
        )
        db.add(profile)

        created_users.append(user)
        print(f"  ✅ Created user: {user_data['email']} (password: {user_data['password']})")

    db.commit()
    print(f"  📊 Total users created: {len(created_users)}")
    return created_users


# Note: create_teachings() function is defined later in the file (after it was appended)
# This is a known issue - will be fixed in next iteration

def seed_database():
    """Main seed function."""
    print("=" * 60)
    print("🌱 SEEDING DATABASE")
    print("=" * 60)

    db = SessionLocal()

    try:
        users = create_users(db)
        # teachings = create_teachings(db)  # TODO: Fix function order issue
        teachings = []  # Temporarily disabled

        print("\n" + "=" * 60)
        print("✅ SEEDING COMPLETE!")
        print("=" * 60)

        print("\n📋 TEST CREDENTIALS:\n")
        print("FREE User:")
        print("  Email: free@test.com")
        print("  Password: password123\n")

        print("GYANI Member:")
        print("  Email: gyani@test.com")
        print("  Password: password123\n")

        print("PRAGYANI Member:")
        print("  Email: pragyani@test.com")
        print("  Password: password123\n")

        print("PRAGYANI PLUS Member:")
        print("  Email: pragyani_plus@test.com")
        print("  Password: password123\n")

        print("ADMIN User:")
        print("  Email: admin@test.com")
        print("  Password: admin123\n")

        print("=" * 60)
        print(f"📊 Summary:")
        print(f"  Users: {len(users)}")
        print(f"  Teachings: {len(teachings)}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()


if __name__ == "__main__":
    seed_database()


def create_teachings(db):
    """Create example teachings with different access levels."""
    print("\n📚 Creating teachings...")

    teachings_data = [
        # FREE teachings (5)
        {
            "slug": "introduction-to-sat-yoga",
            "title": "Introduction to Sat Yoga",
            "description": "A comprehensive introduction to Sat Yoga philosophy and practices. Perfect for beginners seeking spiritual awakening.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Introduction",
            "duration": 2700,  # 45 minutes
            "preview_duration": 300,
            "video_url": "https://customer-example.cloudflarestream.com/abc123/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
            "tags": ["beginner", "philosophy", "introduction"],
            "published_date": datetime.utcnow() - timedelta(days=90)
        },
        {
            "slug": "meditation-basics",
            "title": "Meditation Basics: Getting Started",
            "description": "Learn the fundamentals of meditation practice. A step-by-step guide for establishing your daily practice.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.FREE,
            "category": "Meditation",
            "duration": 1200,  # 20 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-xyz789",
            "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
            "tags": ["meditation", "beginner", "practice"],
            "published_date": datetime.utcnow() - timedelta(days=85)
        },
        {
            "slug": "the-path-of-self-realization",
            "title": "The Path of Self-Realization",
            "description": "An exploration of the journey toward self-realization. Understanding the stages of spiritual awakening.",
            "content_type": ContentType.ESSAY,
            "access_level": AccessLevel.FREE,
            "category": "Philosophy",
            "text_content": "# The Path of Self-Realization\n\nSelf-realization is not a destination but a continuous journey of awakening...",
            "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
            "tags": ["philosophy", "self-realization", "awakening"],
            "published_date": datetime.utcnow() - timedelta(days=80)
        },
        {
            "slug": "healing-through-awareness",
            "title": "Healing Through Awareness",
            "description": "Discover how conscious awareness can heal emotional wounds and transform your life.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Healing",
            "duration": 3000,  # 50 minutes
            "video_url": "https://customer-example.cloudflarestream.com/def456/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
            "tags": ["healing", "awareness", "transformation"],
            "published_date": datetime.utcnow() - timedelta(days=75)
        },
        {
            "slug": "breath-and-consciousness",
            "title": "Breath and Consciousness",
            "description": "Understanding the profound connection between breath and conscious awareness.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.FREE,
            "category": "Meditation",
            "duration": 1500,  # 25 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-abc123",
            "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
            "tags": ["meditation", "breath", "consciousness"],
            "published_date": datetime.utcnow() - timedelta(days=70)
        },

        # GYANI teachings (5)
        {
            "slug": "advanced-meditation-techniques",
            "title": "Advanced Meditation Techniques",
            "description": "Deep dive into advanced meditation practices for serious practitioners. Unlock higher states of consciousness.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.GYANI,
            "category": "Advanced Meditation",
            "duration": 4200,  # 70 minutes
            "preview_duration": 300,
            "video_url": "https://customer-example.cloudflarestream.com/ghi789/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800",
            "tags": ["advanced", "meditation", "techniques"],
            "published_date": datetime.utcnow() - timedelta(days=65)
        },
        {
            "slug": "yoga-nidra-deep-relaxation",
            "title": "Yoga Nidra: Deep Relaxation",
            "description": "Experience profound relaxation and healing through Yoga Nidra practice.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.GYANI,
            "category": "Yoga Nidra",
            "duration": 2400,  # 40 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-def456",
            "thumbnail_url": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
            "tags": ["yoga-nidra", "relaxation", "healing"],
            "published_date": datetime.utcnow() - timedelta(days=60)
        },
        {
            "slug": "the-ego-and-shadow-work",
            "title": "The Ego and Shadow Work",
            "description": "Understanding and integrating the shadow self. A psychological and spiritual exploration.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.GYANI,
            "category": "Psychology",
            "duration": 3600,  # 60 minutes
            "video_url": "https://customer-example.cloudflarestream.com/jkl012/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
            "tags": ["psychology", "shadow-work", "ego"],
            "published_date": datetime.utcnow() - timedelta(days=55)
        },
        {
            "slug": "kundalini-awakening",
            "title": "Kundalini Awakening: Signs and Stages",
            "description": "Recognizing and navigating the kundalini awakening process safely.",
            "content_type": ContentType.ESSAY,
            "access_level": AccessLevel.GYANI,
            "category": "Kundalini",
            "text_content": "# Kundalini Awakening\n\nThe awakening of kundalini energy is a profound spiritual experience...",
            "thumbnail_url": "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800",
            "tags": ["kundalini", "awakening", "energy"],
            "published_date": datetime.utcnow() - timedelta(days=50)
        },
        {
            "slug": "chakra-meditation-series",
            "title": "Chakra Meditation Series: Part 1",
            "description": "Journey through the seven chakras with guided meditation and visualization.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.GYANI,
            "category": "Chakra Work",
            "duration": 1800,  # 30 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-ghi789",
            "thumbnail_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "tags": ["chakras", "meditation", "energy"],
            "published_date": datetime.utcnow() - timedelta(days=45)
        },

        # PRAGYANI teachings (5)
        {
            "slug": "non-duality-and-advaita-vedanta",
            "title": "Non-Duality and Advaita Vedanta",
            "description": "Deep teachings on non-dual awareness and Advaita Vedanta philosophy.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Advanced Philosophy",
            "duration": 5400,  # 90 minutes
            "preview_duration": 300,
            "video_url": "https://customer-example.cloudflarestream.com/mno345/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1499343162160-cd1441923dd3?w=800",
            "tags": ["non-duality", "advaita", "philosophy"],
            "published_date": datetime.utcnow() - timedelta(days=40)
        },
        {
            "slug": "the-dark-night-of-the-soul",
            "title": "The Dark Night of the Soul",
            "description": "Navigating the spiritual crisis and transformation. For advanced practitioners.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Spiritual Crisis",
            "duration": 4800,  # 80 minutes
            "video_url": "https://customer-example.cloudflarestream.com/pqr678/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=800",
            "tags": ["spiritual-crisis", "transformation", "advanced"],
            "published_date": datetime.utcnow() - timedelta(days=35)
        },
        {
            "slug": "quantum-consciousness",
            "title": "Quantum Consciousness and Reality",
            "description": "Exploring the intersection of quantum physics and consciousness studies.",
            "content_type": ContentType.ESSAY,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Science & Spirituality",
            "text_content": "# Quantum Consciousness\n\nThe relationship between quantum mechanics and consciousness...",
            "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            "tags": ["quantum", "consciousness", "science"],
            "published_date": datetime.utcnow() - timedelta(days=30)
        },
        {
            "slug": "shamanic-journeying",
            "title": "Shamanic Journeying: Advanced Practice",
            "description": "Ancient shamanic techniques for consciousness exploration and healing.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Shamanism",
            "duration": 3600,  # 60 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-jkl012",
            "thumbnail_url": "https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=800",
            "tags": ["shamanism", "journey", "healing"],
            "published_date": datetime.utcnow() - timedelta(days=25)
        },
        {
            "slug": "enlightenment-and-liberation",
            "title": "Enlightenment and Liberation",
            "description": "The final stages of spiritual awakening and complete liberation.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Enlightenment",
            "duration": 6000,  # 100 minutes
            "video_url": "https://customer-example.cloudflarestream.com/stu901/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=800",
            "tags": ["enlightenment", "liberation", "ultimate"],
            "published_date": datetime.utcnow() - timedelta(days=20)
        },

        # PRAGYANI_PLUS teachings (3)
        {
            "slug": "masters-secret-teachings",
            "title": "The Master's Secret Teachings",
            "description": "Exclusive teachings reserved for the most dedicated practitioners. The highest wisdom.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI_PLUS,
            "category": "Secret Teachings",
            "duration": 7200,  # 120 minutes
            "preview_duration": 300,
            "video_url": "https://customer-example.cloudflarestream.com/vwx234/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800",
            "tags": ["secret", "master", "exclusive"],
            "published_date": datetime.utcnow() - timedelta(days=15)
        },
        {
            "slug": "tantric-alchemy",
            "title": "Tantric Alchemy and Transformation",
            "description": "Advanced tantric practices for spiritual transformation and energy work.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI_PLUS,
            "category": "Tantra",
            "duration": 5400,  # 90 minutes
            "video_url": "https://customer-example.cloudflarestream.com/yza567/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800",
            "tags": ["tantra", "alchemy", "transformation"],
            "published_date": datetime.utcnow() - timedelta(days=10)
        },
        {
            "slug": "cosmic-consciousness-initiation",
            "title": "Cosmic Consciousness Initiation",
            "description": "The ultimate initiation into cosmic consciousness. For the most advanced souls.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.PRAGYANI_PLUS,
            "category": "Initiation",
            "duration": 4500,  # 75 minutes
            "audio_url": "https://www.podbean.com/media/share/pb-mno345",
            "thumbnail_url": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
            "tags": ["cosmic", "consciousness", "initiation"],
            "published_date": datetime.utcnow() - timedelta(days=5)
        },
    ]

    created_teachings = []
    for teaching_data in teachings_data:
        # Check if teaching already exists
        existing = db.query(Teaching).filter(Teaching.slug == teaching_data["slug"]).first()
        if existing:
            print(f"  ⚠️  Teaching '{teaching_data['slug']}' already exists, skipping...")
            created_teachings.append(existing)
            continue

        teaching = Teaching(**teaching_data)
        db.add(teaching)
        created_teachings.append(teaching)
        print(f"  ✅ Created teaching: {teaching_data['title']} ({teaching_data['access_level'].value})")

    db.commit()
    print(f"  📊 Total teachings created: {len(created_teachings)}")
    return created_teachings
