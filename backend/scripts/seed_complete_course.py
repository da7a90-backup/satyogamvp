"""
Seed the complete Principles & Practice course from course9_COMPLETE.json
Removes old courses and creates a comprehensive course with all components.
"""

import sys
import os
import json
import re
from bs4 import BeautifulSoup

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.course import (
    Course, CourseClass, CourseComponent, Instructor,
    ComponentCategory, CourseStructure, Base
)


def extract_cloudflare_video_id(html_content):
    """Extract Cloudflare Stream UID from iframe HTML"""
    if not html_content:
        return None

    # Try to find iframe with cloudflare stream
    match = re.search(r'iframe\.cloudflarestream\.com/([a-zA-Z0-9]+)', html_content)
    if match:
        return match.group(1)

    return None


def extract_text_from_html(html_content):
    """Extract clean text from HTML content"""
    if not html_content:
        return ""

    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        # Remove iframe tags
        for iframe in soup.find_all('iframe'):
            iframe.decompose()
        return soup.get_text(strip=True, separator='\n')
    except:
        # Fallback: just strip HTML tags with regex
        clean = re.sub('<.*?>', '', html_content)
        return clean.strip()


def categorize_component(title):
    """Determine component category from title"""
    title_lower = title.lower()

    if 'video' in title_lower:
        return ComponentCategory.VIDEO_LESSON
    elif 'key concept' in title_lower:
        return ComponentCategory.KEY_CONCEPTS
    elif 'writing prompt' in title_lower or 'reflection' in title_lower:
        return ComponentCategory.WRITING_PROMPTS
    elif 'additional material' in title_lower or 'shunyamurti' in title_lower:
        return ComponentCategory.ADDITIONAL_MATERIALS
    elif 'welcome' in title_lower or 'introduction' in title_lower:
        return ComponentCategory.INTRODUCTION
    elif 'completed' in title_lower or 'completion' in title_lower:
        return ComponentCategory.COMPLETION
    elif 'addendum' in title_lower:
        return ComponentCategory.ADDENDUM
    else:
        return ComponentCategory.VIDEO_LESSON  # Default


def parse_class_number(title):
    """Extract class number from title (e.g., '1.1 Video...' -> 1)"""
    match = re.match(r'^(\d+)\.', title)
    if match:
        return int(match.group(1))
    return 0


def estimate_duration(content, category):
    """Estimate content duration in seconds"""
    if category == ComponentCategory.VIDEO_LESSON:
        # Videos are typically 40-50 minutes
        return 2700  # 45 minutes default
    elif category == ComponentCategory.KEY_CONCEPTS:
        # Reading time estimate: ~200 words per minute
        word_count = len(content.split()) if content else 0
        return max(600, (word_count // 200) * 60)  # At least 10 min
    elif category == ComponentCategory.WRITING_PROMPTS:
        return 2700  # 45 minutes for reflection
    elif category == ComponentCategory.ADDITIONAL_MATERIALS:
        return 2700  # 45 minutes
    else:
        return 600  # 10 minutes default


def clean_title(title):
    """Clean up title by removing numbering prefix"""
    # Remove pattern like "1.1 " from the beginning
    cleaned = re.sub(r'^\d+\.\d+\s+', '', title)
    return cleaned


def group_components_by_class(components_data):
    """Group components by their class number"""
    classes = {}

    for comp in components_data:
        class_num = parse_class_number(comp['title'])

        if class_num not in classes:
            classes[class_num] = {
                'class_number': class_num,
                'components': []
            }

        classes[class_num]['components'].append(comp)

    return classes


def create_course_structure(db: Session):
    """Create the complete course structure"""

    print("=== Starting Course Seeding ===\n")

    # 1. Delete existing courses
    print("1. Deleting existing courses...")
    db.query(Course).delete()
    db.commit()
    print("   ✓ All courses deleted\n")

    # 2. Create or get instructor
    print("2. Creating instructor...")
    instructor = db.query(Instructor).filter(Instructor.name == "Shunyamurti").first()
    if not instructor:
        instructor = Instructor(
            name="Shunyamurti",
            bio="Founder and spiritual director of Sat Yoga Institute",
            photo_url=None
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)
    print(f"   ✓ Instructor: {instructor.name}\n")

    # 3. Load course data from JSON
    print("3. Loading course9_COMPLETE.json...")
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'course9_COMPLETE.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        components_data = json.load(f)
    print(f"   ✓ Loaded {len(components_data)} components\n")

    # 4. Create course
    print("4. Creating course...")
    course = Course(
        slug="principles-practice",
        title="Sat Yoga Principles & Practice",
        description="Dive into the profound teachings of Sat Yoga with this comprehensive course covering the principles and practices of consciousness transformation. Learn the fundamental concepts of the wisdom school, explore the structure of the psyche, and develop practices for awakening to your true nature.",
        price=350.00,
        instructor_id=instructor.id,
        is_published=True,
        difficulty_level="intermediate",
        structure_template=CourseStructure.PRINCIPLES_PRACTICE,
        selling_page_data={
            "intro_video_url": None,
            "intro_video_title": "Introduction to Sat Yoga Principles & Practice",
            "what_you_will_learn": [
                {
                    "title": "The Concept of the Wisdom and Mystery School",
                    "description": "Understand the foundational philosophy and purpose of Sat Yoga's approach to spiritual awakening."
                },
                {
                    "title": "The Structure of the Sat Yoga Wisdom School",
                    "description": "Explore the comprehensive framework for consciousness transformation."
                },
                {
                    "title": "The Three Loci of Mind",
                    "description": "Learn about the ego, soul, and Atman and their roles in the psyche."
                },
                {
                    "title": "The Structure of the Ego",
                    "description": "Discover the mechanisms of the ego and how it creates suffering."
                },
                {
                    "title": "The Seven Bodies",
                    "description": "Understand the multi-dimensional nature of human consciousness."
                },
                {
                    "title": "Sat Yoga's Kundalini Map",
                    "description": "Navigate the path of kundalini awakening with precision and safety."
                },
                {
                    "title": "The Ten Yogas",
                    "description": "Master the integrated practices for complete liberation."
                }
            ],
            "course_features": {
                "video_classes": "29 comprehensive video classes with Shunyamurti",
                "guided_meditations": "Audio meditations for each class to deepen your practice",
                "study_materials": "Detailed key concepts, transcriptions, and essays",
                "support_info": "Community forum access for questions and discussions",
                "curriculum_aids": "Writing prompts and reflection exercises for integration"
            },
            "preview_images": [],
            "featured_quote": {
                "text": "A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own.",
                "author": "Shunyamurti",
                "author_image": None
            }
        }
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    print(f"   ✓ Course created: {course.title}\n")

    # 5. Group components by class
    print("5. Grouping components by class...")
    grouped_classes = group_components_by_class(components_data)
    print(f"   ✓ Found {len(grouped_classes)} classes\n")

    # 6. Define class titles
    class_titles = {
        0: "Welcome",
        1: "The concept of the Wisdom and Mystery School",
        2: "The structure of the sat yoga wisdom school",
        3: "The three loci of mind",
        4: "The structure of the ego",
        5: "The seven bodies",
        6: "Sat yoga's kundalini map",
        7: "The ten yogas",
        8: "Course completed",
        9: "Course addendum"
    }

    # 7. Create classes and components
    print("6. Creating classes and components...\n")

    total_components = 0

    for class_num in sorted(grouped_classes.keys()):
        class_data = grouped_classes[class_num]

        # Skip class 0 if it's special (Welcome/Introduction)
        if class_num == 0:
            # Create special components directly on the course
            for comp_data in class_data['components']:
                category = categorize_component(comp_data['title'])
                if category == ComponentCategory.INTRODUCTION:
                    print(f"   → Creating Welcome component (skipped for now)")
            continue

        # Create class
        class_title = class_titles.get(class_num, f"Class {class_num}")
        print(f"   Class {class_num}: {class_title}")

        course_class = CourseClass(
            course_id=course.id,
            title=f"Class {class_num} - {class_title}",
            description=f"Class {class_num} of the Sat Yoga Principles & Practice course",
            order_index=class_num,
            duration=0  # Will be calculated from components
        )
        db.add(course_class)
        db.commit()
        db.refresh(course_class)

        # Create components for this class
        total_class_duration = 0
        component_order = 1

        for comp_data in sorted(class_data['components'], key=lambda x: x['menu_order']):
            title = clean_title(comp_data['title'])
            category = categorize_component(comp_data['title'])

            # Extract video ID
            video_id = None
            if comp_data.get('cloudflare_videos') and len(comp_data['cloudflare_videos']) > 0:
                video_id = comp_data['cloudflare_videos'][0]
            elif comp_data.get('content'):
                video_id = extract_cloudflare_video_id(comp_data['content'])

            # Extract text content
            text_content = extract_text_from_html(comp_data.get('content', ''))

            # Extract audio URL
            audio_url = None
            if comp_data.get('podbean_audios') and len(comp_data['podbean_audios']) > 0:
                audio_url = comp_data['podbean_audios'][0]

            # Estimate duration
            duration = estimate_duration(text_content, category)
            total_class_duration += duration

            # Create component
            component = CourseComponent(
                class_id=course_class.id,
                component_category=category,
                title=title,
                content=text_content if category in [ComponentCategory.KEY_CONCEPTS, ComponentCategory.WRITING_PROMPTS] else None,
                cloudflare_stream_uid=video_id,
                duration=duration,
                order_index=component_order,
                description=text_content[:500] if category == ComponentCategory.VIDEO_LESSON else None,
                transcription=text_content if category == ComponentCategory.VIDEO_LESSON and len(text_content) > 500 else None,
                audio_url=audio_url,
                has_tabs=category == ComponentCategory.ADDITIONAL_MATERIALS
            )
            db.add(component)

            print(f"      {component_order}. {title[:50]}... ({category.value})")
            component_order += 1
            total_components += 1

        # Update class duration
        course_class.duration = total_class_duration
        db.commit()
        print(f"      ✓ {component_order - 1} components created\n")

    print(f"=== Seeding Complete ===")
    print(f"✓ Course: {course.title}")
    print(f"✓ Classes: {len(grouped_classes) - 1}")  # -1 for Welcome
    print(f"✓ Total Components: {total_components}")
    print(f"\nCourse slug: {course.slug}")
    print(f"View at: http://localhost:3000/courses/{course.slug}\n")


def main():
    """Main seeding function"""
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        # Seed the course
        create_course_structure(db)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
