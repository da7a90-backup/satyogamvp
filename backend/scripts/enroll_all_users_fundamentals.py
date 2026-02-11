#!/usr/bin/env python3
"""
Script to enroll all existing users in the Fundamentals of Meditation course.
This is a one-time migration script for existing users.
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.course import Course, CourseEnrollment, EnrollmentStatus


def enroll_all_users():
    """Enroll all users who aren't already enrolled in Fundamentals of Meditation."""
    db: Session = SessionLocal()

    try:
        print("🚀 Starting bulk enrollment in Fundamentals of Meditation...")

        # Get the Fundamentals of Meditation course
        fundamentals_course = db.query(Course).filter(
            Course.slug == "fundamentals-of-meditation"
        ).first()

        if not fundamentals_course:
            print("❌ Fundamentals of Meditation course not found!")
            print("   Please run: python backend/scripts/seed_fundamentals_course.py")
            return

        print(f"✅ Found course: {fundamentals_course.title} (ID: {fundamentals_course.id})")

        # Get all users
        all_users = db.query(User).all()
        print(f"📊 Total users in database: {len(all_users)}")

        # Get users already enrolled
        existing_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == fundamentals_course.id
        ).all()
        enrolled_user_ids = {enrollment.user_id for enrollment in existing_enrollments}
        print(f"📊 Already enrolled: {len(enrolled_user_ids)}")

        # Enroll users who aren't enrolled yet
        newly_enrolled = 0
        for user in all_users:
            if user.id not in enrolled_user_ids:
                enrollment = CourseEnrollment(
                    user_id=user.id,
                    course_id=fundamentals_course.id,
                    status=EnrollmentStatus.ACTIVE,
                    enrolled_at=datetime.utcnow()
                )
                db.add(enrollment)
                newly_enrolled += 1
                print(f"  ✅ Enrolled: {user.email}")

        db.commit()

        print(f"\n🎉 Enrollment complete!")
        print(f"   - Total users: {len(all_users)}")
        print(f"   - Already enrolled: {len(enrolled_user_ids)}")
        print(f"   - Newly enrolled: {newly_enrolled}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    enroll_all_users()
