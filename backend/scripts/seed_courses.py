"""
Seed courses data into the database
Usage: python scripts/seed_courses.py [path_to_courses_json]
"""
import sys
import os
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.course import (
    Course,
    CourseClass,
    CourseComponent,
    Instructor,
    ComponentType
)
from sqlalchemy.exc import IntegrityError


def seed_courses(json_file_path: str):
    """Seed courses from a JSON file"""

    # Load JSON data
    if not os.path.exists(json_file_path):
        print(f"❌ Error: File not found: {json_file_path}")
        return

    with open(json_file_path, 'r') as f:
        data = json.load(f)

    db = SessionLocal()

    try:
        # First, create instructors if they don't exist
        instructors_map = {}

        if 'instructors' in data:
            print("\n📚 Creating instructors...")
            for instructor_data in data['instructors']:
                instructor = db.query(Instructor).filter(
                    Instructor.name == instructor_data['name']
                ).first()

                if not instructor:
                    instructor = Instructor(
                        name=instructor_data['name'],
                        bio=instructor_data.get('bio'),
                        photo_url=instructor_data.get('photo_url'),
                        email=instructor_data.get('email')
                    )
                    db.add(instructor)
                    db.flush()
                    print(f"  ✅ Created instructor: {instructor.name}")
                else:
                    print(f"  ⏭️  Instructor already exists: {instructor.name}")

                instructors_map[instructor_data['name']] = instructor.id

        # Now create courses
        print("\n📖 Creating courses...")
        for course_data in data['courses']:
            # Check if course already exists
            existing_course = db.query(Course).filter(
                Course.slug == course_data['slug']
            ).first()

            if existing_course:
                print(f"  ⏭️  Course already exists: {course_data['title']}")
                continue

            # Get instructor ID
            instructor_id = None
            if 'instructor_name' in course_data and course_data['instructor_name']:
                instructor_id = instructors_map.get(course_data['instructor_name'])

            # Create course
            course = Course(
                slug=course_data['slug'],
                title=course_data['title'],
                description=course_data.get('description', ''),
                price=course_data.get('price', 0.0),
                instructor_id=instructor_id,
                thumbnail_url=course_data.get('thumbnail_url'),
                cloudflare_image_id=course_data.get('cloudflare_image_id'),
                is_published=course_data.get('is_published', True),
                difficulty_level=course_data.get('difficulty_level')
            )

            db.add(course)
            db.flush()

            print(f"  ✅ Created course: {course.title}")

            # Create classes
            if 'classes' in course_data:
                print(f"     Creating {len(course_data['classes'])} classes...")

                for class_data in course_data['classes']:
                    course_class = CourseClass(
                        course_id=course.id,
                        title=class_data['title'],
                        description=class_data.get('description'),
                        order_index=class_data['order_index'],
                        video_url=class_data.get('video_url'),
                        duration=class_data.get('duration', 0),
                        materials=class_data.get('materials')
                    )

                    db.add(course_class)
                    db.flush()

                    print(f"       ✅ Class {class_data['order_index']}: {course_class.title}")

                    # Create components
                    if 'components' in class_data:
                        for comp_data in class_data['components']:
                            component_type = ComponentType[comp_data['type'].upper()]

                            component = CourseComponent(
                                class_id=course_class.id,
                                type=component_type,
                                title=comp_data['title'],
                                content=comp_data.get('content'),
                                cloudflare_stream_uid=comp_data.get('cloudflare_stream_uid'),
                                duration=comp_data.get('duration', 0),
                                order_index=comp_data['order_index']
                            )

                            db.add(component)

                        print(f"         ✅ Added {len(class_data['components'])} components")

        # Commit all changes
        db.commit()
        print("\n✅ All courses seeded successfully!")

    except IntegrityError as e:
        db.rollback()
        print(f"\n❌ Error seeding data: {e}")
        raise
    except Exception as e:
        db.rollback()
        print(f"\n❌ Unexpected error: {e}")
        raise
    finally:
        db.close()


def create_sample_json():
    """Create a sample JSON file for reference"""
    sample_data = {
        "instructors": [
            {
                "name": "John Doe",
                "bio": "Expert meditation teacher",
                "photo_url": "https://example.com/photo.jpg",
                "email": "john@example.com"
            }
        ],
        "courses": [
            {
                "slug": "introduction-to-meditation",
                "title": "Introduction to Meditation",
                "description": "Learn the basics of meditation",
                "price": 0.0,
                "instructor_name": "John Doe",
                "thumbnail_url": "https://example.com/thumb.jpg",
                "cloudflare_image_id": "abc123",
                "is_published": True,
                "difficulty_level": "beginner",
                "classes": [
                    {
                        "title": "Getting Started",
                        "description": "Your first meditation session",
                        "order_index": 1,
                        "video_url": None,
                        "duration": 1200,
                        "materials": "Optional reading materials",
                        "components": [
                            {
                                "type": "video",
                                "title": "Welcome Video",
                                "content": None,
                                "cloudflare_stream_uid": "xyz789",
                                "duration": 300,
                                "order_index": 1
                            },
                            {
                                "type": "text",
                                "title": "Introduction Text",
                                "content": "Welcome to the course!",
                                "order_index": 2
                            }
                        ]
                    }
                ]
            }
        ]
    }

    sample_file = Path(__file__).parent / 'sample_courses.json'
    with open(sample_file, 'w') as f:
        json.dump(sample_data, f, indent=2)

    print(f"✅ Sample JSON created at: {sample_file}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/seed_courses.py <path_to_courses.json>")
        print("\nOr create a sample JSON file:")
        print("  python scripts/seed_courses.py --create-sample")
        sys.exit(1)

    if sys.argv[1] == '--create-sample':
        create_sample_json()
    else:
        json_file = sys.argv[1]
        seed_courses(json_file)
