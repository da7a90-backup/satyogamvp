#!/usr/bin/env python3
"""
Script to check what data exists for the "Principles & Practice" course in the database
and identify any missing "Additional Materials from Shunyamurti" sections.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.course import Course, CourseComponent

def check_course_data():
    db: Session = SessionLocal()

    try:
        # Find the "Principles & Practice" course
        course = db.query(Course).filter(
            Course.title.ilike('%principles%practice%')
        ).first()

        if not course:
            print("❌ 'Principles & Practice' course not found in database!")
            print("\nAvailable courses:")
            courses = db.query(Course).all()
            for c in courses:
                print(f"  - {c.title} (id: {c.id}, slug: {c.slug})")
            return

        print(f"✅ Found course: {course.title}")
        print(f"   ID: {course.id}")
        print(f"   Slug: {course.slug}")
        print(f"   Structure: {course.structure_template}")
        print()

        # Get all components
        components = db.query(CourseComponent).filter(
            CourseComponent.course_id == course.id
        ).order_by(CourseComponent.menu_order).all()

        print(f"Total components: {len(components)}")
        print()

        # Analyze component structure
        main_components = [c for c in components if not c.parent_component_id]
        print(f"Main-level components: {len(main_components)}")

        # Check for "Additional Materials" sections
        additional_materials = [c for c in components if 'additional' in c.title.lower() and 'materials' in c.title.lower()]

        print(f"\n'Additional Materials' components found: {len(additional_materials)}")
        for comp in additional_materials:
            print(f"  - {comp.title} (ID: {comp.id}, Order: {comp.menu_order})")
            print(f"    Category: {comp.component_category}")
            print(f"    Has tabs: {comp.has_tabs}")

            # Check for sub-components
            sub_components = db.query(CourseComponent).filter(
                CourseComponent.parent_component_id == comp.id
            ).count()
            print(f"    Sub-components: {sub_components}")
            print()

        # Group components by pattern
        print("\n📋 Component structure overview:")
        for i, comp in enumerate(main_components, 1):
            sub_count = db.query(CourseComponent).filter(
                CourseComponent.parent_component_id == comp.id
            ).count()

            sub_label = f" ({sub_count} sub-components)" if sub_count > 0 else ""
            print(f"{i}. {comp.title} [{comp.component_category}]{sub_label}")

        # Expected structure based on JSON
        print("\n\n📌 Expected structure for each lesson (from WordPress):")
        print("  1. Video Lesson (e.g., '1.1 Video: ...')")
        print("  2. Key Concepts (e.g., '1.2 Key Concepts')")
        print("  3. Writing Prompts (e.g., '1.3 Writing Prompts & Further Reflection')")
        print("  4. Additional Materials from Shunyamurti (e.g., '1.4 Additional Materials from Shunyamurti')")
        print("     - Sub-items: Video teachings, essays, guided meditations")

    finally:
        db.close()

if __name__ == "__main__":
    check_course_data()
