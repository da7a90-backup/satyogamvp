#!/usr/bin/env python3
"""
Script to seed default forum categories for the community forum.
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.forum import ForumCategory


def seed_forum_categories():
    """Create default forum categories."""
    db: Session = SessionLocal()

    try:
        print("🚀 Seeding forum categories...")

        # Check if categories already exist
        existing = db.query(ForumCategory).count()
        if existing > 0:
            print(f"⚠️  {existing} categories already exist")
            response = input("Delete and recreate? (yes/no): ")
            if response.lower() != 'yes':
                print("Aborting.")
                return
            # Delete all existing categories
            db.query(ForumCategory).delete()
            db.commit()
            print("✅ Deleted existing categories")

        # Default categories
        categories = [
            {
                "name": "General Discussion",
                "slug": "general-discussion",
                "description": "Share your thoughts, questions, and experiences with the community",
                "icon": "💬",
                "order": 1
            },
            {
                "name": "Teachings & Practice",
                "slug": "teachings-practice",
                "description": "Discuss teachings, meditation practices, and spiritual insights",
                "icon": "🧘",
                "order": 2
            },
            {
                "name": "Course Questions",
                "slug": "course-questions",
                "description": "Ask questions about course content and get guidance",
                "icon": "📚",
                "order": 3
            },
            {
                "name": "Retreat Reflections",
                "slug": "retreat-reflections",
                "description": "Share your experiences and insights from retreats",
                "icon": "🌟",
                "order": 4
            },
            {
                "name": "Community Support",
                "slug": "community-support",
                "description": "Offer and receive support from fellow members",
                "icon": "🤝",
                "order": 5
            },
            {
                "name": "Announcements",
                "slug": "announcements",
                "description": "Official announcements from the Sat Yoga team",
                "icon": "📢",
                "order": 0
            }
        ]

        created_categories = []
        for cat_data in categories:
            category = ForumCategory(
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=cat_data["description"],
                icon=cat_data["icon"],
                order=cat_data["order"],
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(category)
            created_categories.append(category)
            print(f"  ✅ Created category: {cat_data['name']}")

        db.commit()

        print(f"\n🎉 Successfully created {len(created_categories)} forum categories!")
        for cat in created_categories:
            print(f"   - {cat.icon} {cat.name}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_forum_categories()
