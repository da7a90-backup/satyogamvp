"""
Seed script for Principles & Practice course with full component structure.
This creates a complete course with 7 classes, each containing:
- Introduction component
- Video lesson with description & transcription
- Key concepts (text content)
- Writing prompts
- Additional materials (with video, essay, and guided meditation tabs)

Usage: python scripts/seed_pp_course.py
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.course import (
    Course,
    CourseClass,
    CourseComponent,
    Instructor,
    ComponentCategory,
    ComponentType,
    CourseStructure,
)
import uuid
from datetime import datetime


def create_instructor(db):
    """Create or get the instructor."""
    instructor = db.query(Instructor).filter(Instructor.name == "Radha Ma").first()

    if not instructor:
        instructor = Instructor(
            id=uuid.uuid4(),
            name="Radha Ma",
            bio="Radha Ma is the director of the gyani (knowledge) department of the Sat Yoga Institute.",
            photo_url="https://via.placeholder.com/150",
            email="radhama@satyoga.org",
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)
        print(f"✓ Created instructor: {instructor.name}")
    else:
        print(f"✓ Found existing instructor: {instructor.name}")

    return instructor


def create_course(db, instructor_id):
    """Create the Principles & Practice course."""
    # Check if course already exists
    existing = db.query(Course).filter(Course.slug == "principles-practice").first()

    if existing:
        print(f"⚠ Course 'principles-practice' already exists. Deleting and recreating...")
        db.delete(existing)
        db.commit()

    selling_page_data = {
        "intro_video_url": "https://example.com/intro.mp4",
        "intro_video_title": "Introduction to Principles & Practice",
        "what_you_will_learn": [
            {
                "title": "Enter the Great Mystery",
                "description": "Enter the Great Mystery and pierce the veil of illusion! In this opening class, you will discover the fascinating history of the ancient mystery and wisdom schools."
            },
            {
                "title": "Powerful Skills for Self-Realization",
                "description": "Advance on the path to liberation, learning the same reality-altering perspectives and processes of real consciousness transformation offered by the esoteric traditions."
            },
            {
                "title": "How to Unlock Your Mind",
                "description": "Explore the structures and functions of the various levels of consciousness, including the spiritual, shamanic, specialized, common, and supreme levels."
            }
        ],
        "course_features": {
            "video_classes": "Seven Video Classes",
            "guided_meditations": "Guided Meditations",
            "study_materials": "Study Aids",
            "support_info": "All Classes have Curriculum Study Aids",
            "curriculum_aids": "Study Aids and Supplementary Curriculum"
        },
        "preview_images": [
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300"
        ],
        "featured_quote": {
            "text": "A wisdom school, devoted to the attainment by students of these higher levels of knowledge, will only attract those with the courage to leave the herd mentality.",
            "author": "Shunyamurti",
            "author_image": "https://via.placeholder.com/100"
        }
    }

    course = Course(
        id=uuid.uuid4(),
        slug="principles-practice",
        title="Sat Yoga Principles & Practice",
        description="The Secrets of the Inner Labyrinth - A 7-class initiation into the philosophy of Sat Yoga",
        price=197.00,
        instructor_id=instructor_id,
        thumbnail_url="https://via.placeholder.com/600x400",
        cloudflare_image_id="sample-cloudflare-id",
        is_published=True,
        difficulty_level="intermediate",
        structure_template=CourseStructure.PRINCIPLES_PRACTICE,
        selling_page_data=selling_page_data,
    )

    db.add(course)
    db.commit()
    db.refresh(course)
    print(f"✓ Created course: {course.title}")

    return course


def create_class_with_components(db, course_id, class_number, class_title, class_description):
    """Create a class with all its components."""

    # Create the class
    course_class = CourseClass(
        id=uuid.uuid4(),
        course_id=course_id,
        title=f"Class {class_number} - {class_title}",
        description=class_description,
        order_index=class_number,
        duration=2700,  # 45 minutes in seconds
    )

    db.add(course_class)
    db.commit()
    db.refresh(course_class)
    print(f"  ✓ Created class: {course_class.title}")

    # Component 1: Video Lesson
    video_component = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        component_category=ComponentCategory.VIDEO_LESSON,
        type=ComponentType.VIDEO,
        title=f"Video: {class_title}",
        cloudflare_stream_uid=f"sample-video-{class_number}",
        duration=2700,  # 45 minutes
        order_index=1,
        description=f"Enter the Great Mystery... This is class {class_number} of the Principles & Practice course.",
        transcription=f"Namaste. Welcome to class {class_number} of Introduction to Sat Yoga: Principles and Practice.\n\nI am Radha Ma, the director of the gyani (knowledge) department of the Sat Yoga Institute, and I will be teaching this course...",
        has_tabs=True,
    )
    db.add(video_component)

    # Component 2: Key Concepts
    key_concepts = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        component_category=ComponentCategory.KEY_CONCEPTS,
        type=ComponentType.TEXT,
        title="Key concepts",
        content=f"""# The Role of Culture

Culture consists of culturing, the fermentation that leads to an alchemical transformation of consciousness. Only a pure culture of integrated love, law, and power, freed from any form of domination that is based on conquest, will produce leaders with the ability to guide, govern, heal the sick, resolve social antagonisms, prevent wars, and sustain the integrity of law and customs to ensure the highest quality of life for all beings.

## The Wisdom School & The Mystery School

Two types of schools developed concurrently in the ancient world: the wisdom school and the mystery school. They had two different functions, operating in different modes of consciousness—the symbolic and the experiential—but were symbiotic and congruent.

### The Wisdom School

A wisdom school is a curriculum that addresses the full spectrum of intelligence needed for coping with the enigmas of existence and fulfilling one's potential...

*[Continue with full text content]*
""",
        duration=1980,  # 33 minutes reading time
        order_index=2,
    )
    db.add(key_concepts)

    # Component 3: Writing Prompts
    writing_prompts = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        component_category=ComponentCategory.WRITING_PROMPTS,
        type=ComponentType.TEXT,
        title="Writing prompts & Further reflection",
        content=f"""Answer the following questions to explore what you were able to get out of this class:

1. What has impacted you most by what you have learned here about mystery and wisdom schools?

2. Do you want to be a part of a wisdom school? Why?

3. Does this teaching on the Sat Yoga Wisdom School resonate with your life goals? In what way?

## On the 7 Realms of Knowledge:

4. What relationship do you have to the common knowledge of your society? Since the common knowledge has suddenly changed radically as a result of the pandemic, has this created disorientation? Can you perceive the difference between knowledge and truth?

5. Did you learn some form of specialized knowledge? Did you choose it because of an inner yearning to know, or more in order to advance in economic or social status? Has it brought you the benefits you sought? Is that knowledge stable or does it keep changing, requiring an ongoing re-education?

6. Do you understand the difference between forbidden and unbearable knowledge? Have you fully faced those aspects of reality, or do you still accept the dominant ideology, or a whitewashed familiarity, or your own preferred narrative, or a censored version of current events without question? Do you hold history may still be repressed traumas you resist uncovering?

7. Have you ever encountered profound metaphysical ideas from a philosophic or spiritual tradition that changed your life? Was it difficult to shift your paradigm of reality? Did you encounter resistance from others who were threatened by your change of perspective? Are you open to even more radical shifts in understanding?

8. Do you have personal experience of shamanic knowledge? Have you been helped by a shaman of some sort? Have you experimented with entheogens? Have you had paranormal experiences of other kinds? If so, how have they impacted you? Would you consider a psychotherapist to be a kind of shaman? Has your sense of reality or of who you are been affected by such a relationship?

9. Do you sense there is validity to the concept of Supreme Knowledge? Is there a yearning in your heart for such knowledge? How are you making effort to attain that ultimate realization? Have you practiced meditation? Have you had success in silencing the mind? Do you wish to go further on the Hero's Journey?
""",
        duration=1800,  # 30 minutes reflection time
        order_index=3,
    )
    db.add(writing_prompts)

    # Component 4: Additional Materials (parent component with tabs)
    additional_materials = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        component_category=ComponentCategory.ADDITIONAL_MATERIALS,
        type=ComponentType.VIDEO,
        title="Additional materials from Shunyamurti",
        has_tabs=True,
        order_index=4,
    )
    db.add(additional_materials)
    db.commit()
    db.refresh(additional_materials)

    # Sub-component 4a: Additional Video
    additional_video = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        parent_component_id=additional_materials.id,
        component_category=ComponentCategory.ADDITIONAL_MATERIALS,
        type=ComponentType.VIDEO,
        title="Dying into supreme knowledge",
        cloudflare_stream_uid=f"additional-video-{class_number}",
        duration=480,
        description="Shunyamurti elaborates on the 7 Realms of Knowledge, expressing the capacities of each type of knowledge and their relationship to intelligence development...",
        order_index=1,
    )
    db.add(additional_video)

    # Sub-component 4b: Essay
    additional_essay = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        parent_component_id=additional_materials.id,
        component_category=ComponentCategory.ADDITIONAL_MATERIALS,
        type=ComponentType.TEXT,
        title="The marriage of logic and mysticism",
        essay_content=f"""# The Marriage of Logic and Mysticism

The Sat Yoga Institute is a school of logic. Our philosophy is based on the understanding that everything in the universe, including the universe as a whole, has a precise logico-mathematical structure—everything except the intelligence that gives rise to the universe, and that comes to understand itself, and realize itself, through its own process of coming to consciousness, which is what we are.

Since everything has a logical structure, including the human mind, we can attain mastery over the world, and over the mind, through a complete grasp of the logics that serve as its operating system...

*[Continue with full essay content]*
""",
        order_index=2,
    )
    db.add(additional_essay)

    # Sub-component 4c: Guided Meditation (Audio)
    additional_audio = CourseComponent(
        id=uuid.uuid4(),
        class_id=course_class.id,
        parent_component_id=additional_materials.id,
        component_category=ComponentCategory.ADDITIONAL_MATERIALS,
        type=ComponentType.AUDIO,
        title="Abide as the shining self",
        audio_url=f"https://example.com/audio/meditation-{class_number}.mp3",
        duration=203,  # 3:23
        description="Enter deeply into the stillness of thought-free presence, the silence of pure consciousness. Surrender and dissolve into the luminous Self that shines from the center of Being and transmits beyond infinity.",
        order_index=3,
    )
    db.add(additional_audio)

    db.commit()
    print(f"    ✓ Created 4 components with sub-components")

    return course_class


def main():
    """Main seeding function."""
    print("\n" + "="*60)
    print("SEEDING PRINCIPLES & PRACTICE COURSE")
    print("="*60 + "\n")

    db = SessionLocal()

    try:
        # Step 1: Create Instructor
        print("Step 1: Creating instructor...")
        instructor = create_instructor(db)

        # Step 2: Create Course
        print("\nStep 2: Creating course...")
        course = create_course(db, instructor.id)

        # Step 3: Create Classes with Components
        print("\nStep 3: Creating classes and components...")

        classes_data = [
            {
                "number": 1,
                "title": "The concept of the Wisdom and Mystery School",
                "description": "Enter the Great Mystery and pierce the veil of illusion!"
            },
            {
                "number": 2,
                "title": "The structure of the sat yoga wisdom school",
                "description": "Understanding the comprehensive curriculum of Sat Yoga"
            },
            {
                "number": 3,
                "title": "The three loci of mind",
                "description": "Exploring consciousness and the architecture of the mind"
            },
            {
                "number": 4,
                "title": "The structure of the ego",
                "description": "Deconstructing the false self and understanding ego dynamics"
            },
            {
                "number": 5,
                "title": "The seven bodies",
                "description": "Journey through the koshas and levels of embodiment"
            },
            {
                "number": 6,
                "title": "Sat yoga's kundalini map",
                "description": "Understanding energy channels, chakras, and spiritual awakening"
            },
            {
                "number": 7,
                "title": "The ten yogas",
                "description": "Integrating the complete path of yoga practices"
            }
        ]

        for class_data in classes_data:
            create_class_with_components(
                db,
                course.id,
                class_data["number"],
                class_data["title"],
                class_data["description"]
            )

        # Step 4: Create Welcome and Completion components
        print("\nStep 4: Creating special components (Welcome, Completion, Addendum)...")

        # Get first class for welcome component
        first_class = db.query(CourseClass).filter(
            CourseClass.course_id == course.id,
            CourseClass.order_index == 1
        ).first()

        # Create a special "Welcome" class
        welcome_class = CourseClass(
            id=uuid.uuid4(),
            course_id=course.id,
            title="Welcome!",
            description="Introduction to the course",
            order_index=0,
        )
        db.add(welcome_class)
        db.commit()
        db.refresh(welcome_class)

        welcome_component = CourseComponent(
            id=uuid.uuid4(),
            class_id=welcome_class.id,
            component_category=ComponentCategory.INTRODUCTION,
            type=ComponentType.TEXT,
            title="Introduction",
            content="Welcome to Sat Yoga Principles & Practice! This course will guide you through 7 comprehensive classes...",
            order_index=1,
        )
        db.add(welcome_component)

        # Create Completion class
        completion_class = CourseClass(
            id=uuid.uuid4(),
            course_id=course.id,
            title="Course completed",
            description="Congratulations on completing the course!",
            order_index=99,
        )
        db.add(completion_class)
        db.commit()
        db.refresh(completion_class)

        completion_component = CourseComponent(
            id=uuid.uuid4(),
            class_id=completion_class.id,
            component_category=ComponentCategory.COMPLETION,
            type=ComponentType.TEXT,
            title="Course Completion",
            content="Congratulations! You have completed the Principles & Practice course. May you continue on the path of wisdom and realization.",
            order_index=1,
        )
        db.add(completion_component)

        # Create Addendum class
        addendum_class = CourseClass(
            id=uuid.uuid4(),
            course_id=course.id,
            title="Course addendum",
            description="Additional resources and materials",
            order_index=100,
        )
        db.add(addendum_class)
        db.commit()
        db.refresh(addendum_class)

        addendum_component = CourseComponent(
            id=uuid.uuid4(),
            class_id=addendum_class.id,
            component_category=ComponentCategory.ADDENDUM,
            type=ComponentType.TEXT,
            title="Additional Resources",
            content="Here are additional resources and recommended readings for deeper study...",
            order_index=1,
        )
        db.add(addendum_component)

        db.commit()
        print("  ✓ Created Welcome, Completion, and Addendum components")

        # Summary
        print("\n" + "="*60)
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\nCourse: {course.title}")
        print(f"Slug: {course.slug}")
        print(f"Classes: 10 (including Welcome, 7 main classes, Completion, Addendum)")
        print(f"Components per class: 4 (Video, Key Concepts, Writing Prompts, Additional Materials)")
        print(f"Total components: ~40")
        print(f"\nYou can now access the course at: /api/courses/{course.slug}")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
