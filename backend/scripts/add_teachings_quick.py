#!/usr/bin/env python3
"""Quick script to add teachings to database."""
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.teaching import Teaching, ContentType, AccessLevel

def add_teachings():
    """Add example teachings matching the data.ts structure."""
    db = SessionLocal()

    teachings_data = [
        # FREE teachings
        {
            "slug": "your-real-potential",
            "title": "You Don't Know Your Real Potential…",
            "description": "The human ego in its current models is a fragmented and internally conflicted operating system.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.FREE,
            "category": "Q&A",
            "duration": 2700,
            "preview_duration": 300,
            "video_url": "https://customer-example.cloudflarestream.com/abc123/manifest/video.m3u8",
            "thumbnail_url": "https://www.members.satyoga.org/wp-content/uploads/sites/5/2025/10/2Fri-Oct-3-Members-Teaching-231230_Attuning_Maha_Sukha_Evening-Teaching-QA.png",
            "tags": ["ego-structure", "nonduality"],
            "published_date": datetime.utcnow() - timedelta(days=23)
        },
        {
            "slug": "introduction-to-meditation",
            "title": "Introduction to Meditation",
            "description": "Learn the fundamentals of meditation practice.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.FREE,
            "category": "Meditation",
            "duration": 1200,
            "audio_url": "https://www.podbean.com/media/share/pb-meditation1",
            "thumbnail_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
            "tags": ["meditation", "beginner"],
            "published_date": datetime.utcnow() - timedelta(days=20)
        },
        {
            "slug": "path-of-awakening",
            "title": "The Path of Awakening",
            "description": "Understanding the spiritual journey toward self-realization.",
            "content_type": ContentType.ESSAY,
            "access_level": AccessLevel.FREE,
            "category": "Philosophy",
            "text_content": "# The Path of Awakening\n\nThe spiritual journey begins with self-inquiry...",
            "thumbnail_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
            "tags": ["awakening", "philosophy"],
            "published_date": datetime.utcnow() - timedelta(days=18)
        },
        # GYANI teachings
        {
            "slug": "advanced-breathwork",
            "title": "Advanced Breathwork Techniques",
            "description": "Deep pranayama practices for energy transformation.",
            "content_type": ContentType.MEDITATION,
            "access_level": AccessLevel.GYANI,
            "category": "Advanced Meditation",
            "duration": 2400,
            "audio_url": "https://www.podbean.com/media/share/pb-breathwork",
            "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
            "tags": ["breathwork", "pranayama", "energy"],
            "published_date": datetime.utcnow() - timedelta(days=15)
        },
        {
            "slug": "shadow-integration",
            "title": "Shadow Integration Practice",
            "description": "Working with the unconscious shadow aspects of the psyche.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.GYANI,
            "category": "Psychology",
            "duration": 3600,
            "video_url": "https://customer-example.cloudflarestream.com/shadow123/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
            "tags": ["shadow-work", "psychology"],
            "published_date": datetime.utcnow() - timedelta(days=12)
        },
        # PRAGYANI teachings
        {
            "slug": "non-dual-awareness",
            "title": "Non-Dual Awareness",
            "description": "Direct recognition of the non-dual nature of reality.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI,
            "category": "Advanced Philosophy",
            "duration": 5400,
            "video_url": "https://customer-example.cloudflarestream.com/nondual/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1499343162160-cd1441923dd3?w=800",
            "tags": ["nonduality", "advaita"],
            "published_date": datetime.utcnow() - timedelta(days=8)
        },
        # PRAGYANI_PLUS teachings
        {
            "slug": "secret-teachings-of-tantra",
            "title": "Secret Teachings of Tantra",
            "description": "Advanced tantric practices for consciousness transformation.",
            "content_type": ContentType.VIDEO,
            "access_level": AccessLevel.PRAGYANI_PLUS,
            "category": "Tantra",
            "duration": 7200,
            "video_url": "https://customer-example.cloudflarestream.com/tantra/manifest/video.m3u8",
            "thumbnail_url": "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800",
            "tags": ["tantra", "secret-teachings"],
            "published_date": datetime.utcnow() - timedelta(days=3)
        },
    ]

    print("Adding teachings to database...\n")

    for t_data in teachings_data:
        # Check if exists
        existing = db.query(Teaching).filter(Teaching.slug == t_data["slug"]).first()
        if existing:
            print(f"⚠️  Teaching '{t_data['slug']}' already exists, skipping...")
            continue

        teaching = Teaching(**t_data)
        db.add(teaching)
        print(f"✅ Added: {t_data['title']} ({t_data['access_level'].value})")

    db.commit()
    print("\n✅ Done! Teachings added successfully.")
    db.close()

if __name__ == "__main__":
    add_teachings()
