#!/usr/bin/env python3
"""
Script to seed "Fundamentals of Meditation" course from course11360_COMPLETE.json
This course has a simple flat structure - just lessons with embedded video/audio.
"""

import sys
import os
import json
import re
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.course import Course, CourseClass, CourseComponent, ComponentCategory, CourseStructure
from app.models.user import User

def extract_cloudflare_video_ids(content: str) -> list:
    """Extract Cloudflare Stream UIDs from iframe src"""
    pattern = r'cloudflarestream\.com/([a-f0-9]+)/iframe'
    matches = re.findall(pattern, content)
    return matches

def extract_podbean_audio_ids(content: str) -> list:
    """Extract Podbean audio IDs from iframe src"""
    pattern = r'i=([a-z0-9\-]+)-pb'
    matches = re.findall(pattern, content)
    return matches

def seed_fundamentals_course():
    db: Session = SessionLocal()

    try:
        print("🚀 Starting Fundamentals of Meditation course migration...")

        # Check if course already exists
        existing = db.query(Course).filter(Course.slug == "fundamentals-of-meditation").first()
        if existing:
            print(f"⚠️  Course already exists with ID: {existing.id}")
            response = input("Delete and recreate? (yes/no): ")
            if response.lower() != 'yes':
                print("Aborting.")
                return
            # Delete existing course (cascade will handle classes/components)
            db.delete(existing)
            db.commit()
            print("✅ Deleted existing course")

        # Load JSON data
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'course11360_COMPLETE.json')
        with open(json_path, 'r') as f:
            lessons_data = json.load(f)

        print(f"📚 Found {len(lessons_data)} lessons in JSON")

        # Get instructor from existing Principles & Practice course
        existing_course = db.query(Course).filter(Course.slug == "principles-practice").first()
        if not existing_course:
            print("❌ No existing course found to get instructor from!")
            print("Please provide an instructor UUID:")
            instructor_id_str = input("Instructor UUID: ")
            from uuid import UUID
            instructor_id = UUID(instructor_id_str)
        else:
            instructor_id = existing_course.instructor_id

        # Create course
        course = Course(
            title="The Fundamentals of Meditation",
            slug="fundamentals-of-meditation",
            description="Shunyamurti introduces a simple approach to meditation practice, outlining fundamental techniques to expand your consciousness through the simple act of being present.",
            price=0.00,  # Free course
            instructor_id=instructor_id,
            is_published=True,
            difficulty_level="beginner",
            structure_template=CourseStructure.FUNDAMENTALS_MEDITATION,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(course)
        db.flush()
        print(f"✅ Created course: {course.title} (ID: {course.id})")

        # Create a single class to hold all lessons
        course_class = CourseClass(
            course_id=course.id,
            title="Fundamentals of Meditation",
            description="Complete meditation fundamentals course",
            order_index=1,
            duration=None
        )
        db.add(course_class)
        db.flush()
        print(f"✅ Created class: {course_class.title}")

        # Create components from lessons
        for idx, lesson in enumerate(lessons_data, 1):
            title = lesson.get('title', f'Lesson {idx}')
            content = lesson.get('content', '')

            # Extract video IDs
            cloudflare_videos = lesson.get('cloudflare_videos', [])
            if not cloudflare_videos:
                cloudflare_videos = extract_cloudflare_video_ids(content)

            # Extract audio IDs
            podbean_audios = lesson.get('podbean_audios', [])
            if not podbean_audios:
                podbean_audios = extract_podbean_audio_ids(content)

            # Determine component category based on title
            if 'teaching' in title.lower():
                category = ComponentCategory.VIDEO_LESSON
            elif 'exercise' in title.lower():
                category = ComponentCategory.VIDEO_LESSON
            elif 'meditation' in title.lower():
                category = ComponentCategory.VIDEO_LESSON
            elif 'essay' in title.lower():
                category = ComponentCategory.ADDITIONAL_MATERIALS
            else:
                category = ComponentCategory.VIDEO_LESSON

            component = CourseComponent(
                class_id=course_class.id,
                component_category=category,
                title=title,
                content=content,
                cloudflare_stream_uid=cloudflare_videos[0] if cloudflare_videos else None,
                audio_url=f"https://www.podbean.com/player-v2/?i={podbean_audios[0]}" if podbean_audios else None,
                order_index=idx,
                has_tabs=False,  # Simple structure, no tabs
                parent_component_id=None  # Flat structure, no nesting
            )
            db.add(component)
            print(f"  ✅ Added lesson {idx}: {title[:50]}...")

        db.commit()
        print(f"\n🎉 Successfully created Fundamentals of Meditation course!")
        print(f"   - Course ID: {course.id}")
        print(f"   - Slug: {course.slug}")
        print(f"   - Structure: {course.structure_template}")
        print(f"   - Total lessons: {len(lessons_data)}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_fundamentals_course()
