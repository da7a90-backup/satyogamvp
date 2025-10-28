"""Courses router with enrollment and progress tracking."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user
from ..models.user import User
from ..models.course import (
    Course,
    CourseClass,
    CourseComponent,
    CourseEnrollment,
    CourseProgress,
)
from ..models.payment import Payment, PaymentStatus
from ..schemas.course import (
    CourseResponse,
    CourseDetailResponse,
    CourseEnrollmentCreate,
    CourseProgressUpdate,
    CourseProgressResponse,
)
from ..services import mixpanel_service

router = APIRouter()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_course_progress(user_id: str, course_id: str, db: Session) -> float:
    """
    Calculate the overall progress percentage for a user in a course.
    Progress is based on component-level completion.
    """
    # Get total number of components in the course
    total_components = (
        db.query(func.count(CourseComponent.id))
        .join(CourseClass)
        .filter(CourseClass.course_id == course_id)
        .scalar()
    )

    if total_components == 0:
        return 0.0

    # Get user's enrollment
    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id,
        )
        .first()
    )

    if not enrollment:
        return 0.0

    # Get number of completed components for this enrollment
    completed_components = (
        db.query(func.count(CourseProgress.id))
        .filter(
            CourseProgress.enrollment_id == enrollment.id,
            CourseProgress.completed == True,
        )
        .scalar()
    )

    return (completed_components / total_components) * 100


def user_can_access_course(user: User, course: Course, db: Session) -> dict:
    """
    Check if user can access a course.
    Returns access info dict with can_access, reason, enrollment status.
    """
    # Check if course is published
    if not course.is_published:
        return {
            "can_access": False,
            "reason": "Course is not yet published",
            "is_enrolled": False,
        }

    # Check if user is enrolled
    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == user.id,
            CourseEnrollment.course_id == course.id,
        )
        .first()
    )

    if not enrollment:
        return {
            "can_access": False,
            "reason": "Not enrolled in this course",
            "is_enrolled": False,
        }

    return {
        "can_access": True,
        "reason": "Enrolled",
        "is_enrolled": True,
        "enrollment": enrollment,
    }


# ============================================================================
# COURSE ENDPOINTS
# ============================================================================

@router.get("/", response_model=dict)
async def get_courses(
    skip: int = 0,
    limit: int = 50,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get all published courses."""
    query = db.query(Course).filter(Course.is_published == True)

    courses = query.offset(skip).limit(limit).all()
    total = query.count()

    # Add enrollment status for logged-in users
    result = []
    for course in courses:
        course_data = {
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
            "description": course.description,
            "thumbnail_url": course.thumbnail_url,
            "price": float(course.price) if course.price else 0.0,
            "instructor_name": course.instructor.name if course.instructor else None,
            "is_enrolled": False,
            "progress_percentage": 0.0,
        }

        # Check enrollment if user is logged in
        if user:
            enrollment = (
                db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.user_id == user.id,
                    CourseEnrollment.course_id == course.id,
                )
                .first()
            )

            if enrollment:
                course_data["is_enrolled"] = True
                course_data["progress_percentage"] = calculate_course_progress(
                    str(user.id), str(course.id), db
                )

        result.append(course_data)

    return {"courses": result, "total": total, "skip": skip, "limit": limit}


@router.get("/{slug}", response_model=dict)
async def get_course(
    slug: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get a single course by slug with full details."""
    course = db.query(Course).filter(Course.slug == slug).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Basic course data
    course_data = {
        "id": str(course.id),
        "slug": course.slug,
        "title": course.title,
        "description": course.description,
        "thumbnail_url": course.thumbnail_url,
        "price": float(course.price) if course.price else 0.0,
        "instructor": {
            "id": str(course.instructor.id),
            "name": course.instructor.name,
            "bio": course.instructor.bio,
            "photo_url": course.instructor.photo_url,
        }
        if course.instructor
        else None,
        "is_published": course.is_published,
        "can_access": False,
        "is_enrolled": False,
    }

    # Check access if user is logged in
    if user:
        access_info = user_can_access_course(user, course, db)
        course_data["can_access"] = access_info["can_access"]
        course_data["is_enrolled"] = access_info["is_enrolled"]

        if access_info["is_enrolled"]:
            enrollment = access_info["enrollment"]
            course_data["enrolled_at"] = enrollment.enrolled_at.isoformat()
            course_data["progress_percentage"] = calculate_course_progress(
                str(user.id), str(course.id), db
            )

            # Include course structure if user has access
            classes = (
                db.query(CourseClass)
                .filter(CourseClass.course_id == course.id)
                .order_by(CourseClass.order_index)
                .all()
            )

            course_data["classes"] = []
            for cls in classes:
                class_data = {
                    "id": str(cls.id),
                    "title": cls.title,
                    "description": cls.description,
                    "order": cls.order_index,
                    "components": [],
                }

                # Get components for this class
                components = (
                    db.query(CourseComponent)
                    .filter(CourseComponent.class_id == cls.id)
                    .order_by(CourseComponent.order_index)
                    .all()
                )

                for component in components:
                    # Check if user has completed this component
                    progress = (
                        db.query(CourseProgress)
                        .filter(
                            CourseProgress.enrollment_id == enrollment.id,
                            CourseProgress.component_id == component.id,
                        )
                        .first()
                    )

                    class_data["components"].append({
                        "id": str(component.id),
                        "title": component.title,
                        "component_type": component.type.value,
                        "content": component.content,
                        "order": component.order_index,
                        "completed": progress.completed if progress else False,
                        "progress_percentage": (
                            progress.progress_percentage if progress else 0.0
                        ),
                    })

                course_data["classes"].append(class_data)

    return course_data


# ============================================================================
# ENROLLMENT ENDPOINTS
# ============================================================================

@router.post("/enroll", response_model=dict)
async def enroll_in_course(
    enrollment_data: CourseEnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Enroll user in a course.
    Requires payment verification if course has a price.
    """
    course = db.query(Course).filter(Course.id == enrollment_data.course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing_enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course.id,
        )
        .first()
    )

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Verify payment if course has a price
    if course.price and course.price > 0:
        if not enrollment_data.payment_id:
            raise HTTPException(
                status_code=400,
                detail="Payment required for this course"
            )

        # Verify payment
        payment = (
            db.query(Payment)
            .filter(
                Payment.id == enrollment_data.payment_id,
                Payment.user_id == current_user.id,
                Payment.status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        if not payment:
            raise HTTPException(
                status_code=400,
                detail="Valid payment not found"
            )

    # Create enrollment
    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course.id,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    # Track analytics
    await mixpanel_service.track_course_enrollment(
        str(current_user.id),
        str(course.id),
        course.title,
    )

    return {
        "message": "Successfully enrolled in course",
        "enrollment": {
            "id": str(enrollment.id),
            "course_id": str(enrollment.course_id),
            "enrolled_at": enrollment.enrolled_at.isoformat(),
        },
    }


@router.get("/my-enrollments", response_model=dict)
async def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all courses the user is enrolled in."""
    enrollments = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.user_id == current_user.id)
        .all()
    )

    result = []
    for enrollment in enrollments:
        course = enrollment.course
        progress = calculate_course_progress(str(current_user.id), str(course.id), db)

        result.append({
            "id": str(enrollment.id),
            "course": {
                "id": str(course.id),
                "slug": course.slug,
                "title": course.title,
                "description": course.description,
                "thumbnail_url": course.thumbnail_url,
                "instructor_name": course.instructor.name if course.instructor else None,
            },
            "enrolled_at": enrollment.enrolled_at.isoformat(),
            "completed_at": (
                enrollment.completed_at.isoformat() if enrollment.completed_at else None
            ),
            "progress_percentage": progress,
        })

    return {"enrollments": result}


# ============================================================================
# PROGRESS TRACKING ENDPOINTS
# ============================================================================

@router.post("/progress", response_model=dict)
async def update_progress(
    progress_data: CourseProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update progress for a specific course component."""
    # Get component
    component = (
        db.query(CourseComponent)
        .filter(CourseComponent.id == progress_data.component_id)
        .first()
    )

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    # Get course
    course_class = component.course_class
    course = course_class.course

    # Verify user is enrolled
    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course.id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Get or create progress record
    progress = (
        db.query(CourseProgress)
        .filter(
            CourseProgress.enrollment_id == enrollment.id,
            CourseProgress.component_id == component.id,
        )
        .first()
    )

    if not progress:
        progress = CourseProgress(
            enrollment_id=enrollment.id,
            class_id=component.class_id,
            component_id=component.id,
        )
        db.add(progress)

    # Update progress
    progress.progress_percentage = progress_data.progress_percentage
    progress.completed = progress_data.completed
    progress.last_accessed = datetime.utcnow()

    # If marked as completed, set completion time
    if progress_data.completed and not progress.completed_at:
        progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)

    # Check if entire course is now completed
    overall_progress = calculate_course_progress(str(current_user.id), str(course.id), db)

    if overall_progress >= 100 and not enrollment.completed_at:
        enrollment.completed_at = datetime.utcnow()
        db.commit()

    return {
        "message": "Progress updated successfully",
        "progress": {
            "component_id": str(progress.component_id),
            "progress_percentage": progress.progress_percentage,
            "completed": progress.completed,
            "completed_at": (
                progress.completed_at.isoformat() if progress.completed_at else None
            ),
        },
        "course_progress": overall_progress,
        "course_completed": overall_progress >= 100,
    }


@router.get("/progress/{course_id}", response_model=dict)
async def get_course_progress(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed progress for a course."""
    # Verify enrollment
    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course_id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Get all progress records for this enrollment
    progress_records = (
        db.query(CourseProgress)
        .filter(CourseProgress.enrollment_id == enrollment.id)
        .all()
    )

    progress_data = []
    for progress in progress_records:
        progress_data.append({
            "component_id": str(progress.component_id),
            "component_title": progress.component.title,
            "progress_percentage": progress.progress_percentage,
            "completed": progress.completed,
            "completed_at": (
                progress.completed_at.isoformat() if progress.completed_at else None
            ),
            "last_accessed": (
                progress.last_accessed.isoformat() if progress.last_accessed else None
            ),
        })

    overall_progress = calculate_course_progress(str(current_user.id), course_id, db)

    return {
        "course_id": course_id,
        "overall_progress": overall_progress,
        "enrolled_at": enrollment.enrolled_at.isoformat(),
        "completed_at": (
            enrollment.completed_at.isoformat() if enrollment.completed_at else None
        ),
        "progress_details": progress_data,
    }
