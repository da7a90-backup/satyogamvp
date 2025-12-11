"""Courses router with enrollment and progress tracking."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user, get_current_admin
from ..models.user import User
from ..models.course import (
    Course,
    CourseClass,
    CourseComponent,
    CourseEnrollment,
    CourseProgress,
    CourseComment,
    Instructor,
)
from ..models.payment import Payment, PaymentStatus
from ..schemas.course import (
    CourseResponse,
    CourseDetailResponse,
    CourseEnrollmentCreate,
    CourseProgressUpdate,
    CourseProgressResponse,
    CourseCreate,
    CourseUpdate,
    CourseClassCreate,
    CourseComponentBase,
    CourseCommentCreate,
    InstructorBase,
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


# ============================================================================
# ADMIN - COURSE MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/admin/all", response_model=dict)
async def get_all_courses_admin(
    skip: int = 0,
    limit: int = 50,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get all courses (including unpublished) - Admin only."""
    query = db.query(Course)
    courses = query.offset(skip).limit(limit).all()
    total = query.count()

    result = []
    for course in courses:
        result.append({
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
            "description": course.description,
            "thumbnail_url": course.thumbnail_url,
            "cloudflare_image_id": course.cloudflare_image_id,
            "price": float(course.price) if course.price else 0.0,
            "instructor": {
                "id": str(course.instructor.id),
                "name": course.instructor.name,
            } if course.instructor else None,
            "is_published": course.is_published,
            "difficulty_level": course.difficulty_level,
            "created_at": course.created_at.isoformat(),
            "updated_at": course.updated_at.isoformat(),
        })

    return {"courses": result, "total": total, "skip": skip, "limit": limit}


@router.post("/admin/create", response_model=dict)
async def create_course_admin(
    course_data: CourseCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new course - Admin only."""
    # Check if slug already exists
    existing = db.query(Course).filter(Course.slug == course_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course with this slug already exists")

    # Create course
    course = Course(
        slug=course_data.slug,
        title=course_data.title,
        description=course_data.description,
        price=course_data.price,
        instructor_id=course_data.instructor_id,
        is_published=course_data.is_published,
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return {
        "message": "Course created successfully",
        "course": {
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
        },
    }


@router.put("/admin/{course_id}", response_model=dict)
async def update_course_admin(
    course_id: str,
    course_data: CourseUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update an existing course - Admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check slug uniqueness if being updated
    if course_data.slug and course_data.slug != course.slug:
        existing = db.query(Course).filter(Course.slug == course_data.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Course with this slug already exists")

    # Update fields
    if course_data.slug is not None:
        course.slug = course_data.slug
    if course_data.title is not None:
        course.title = course_data.title
    if course_data.description is not None:
        course.description = course_data.description
    if course_data.price is not None:
        course.price = course_data.price
    if course_data.instructor_id is not None:
        course.instructor_id = course_data.instructor_id
    if course_data.is_published is not None:
        course.is_published = course_data.is_published

    db.commit()
    db.refresh(course)

    return {
        "message": "Course updated successfully",
        "course": {
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
        },
    }


@router.delete("/admin/{course_id}", response_model=dict)
async def delete_course_admin(
    course_id: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a course - Admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    return {"message": "Course deleted successfully"}


# ============================================================================
# ADMIN - CLASS MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/admin/{course_id}/classes", response_model=dict)
async def create_class_admin(
    course_id: str,
    class_data: CourseClassCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new class for a course - Admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Create class
    course_class = CourseClass(
        course_id=course_id,
        title=class_data.title,
        description=class_data.description,
        order_index=class_data.order_index,
        video_url=class_data.video_url,
        duration=class_data.duration,
    )

    db.add(course_class)
    db.commit()
    db.refresh(course_class)

    # Create components if provided
    for comp_data in class_data.components:
        component = CourseComponent(
            class_id=course_class.id,
            type=comp_data.type,
            title=comp_data.title,
            content=comp_data.content,
            order_index=comp_data.order_index,
        )
        db.add(component)

    db.commit()

    return {
        "message": "Class created successfully",
        "class": {
            "id": str(course_class.id),
            "title": course_class.title,
        },
    }


@router.put("/admin/classes/{class_id}", response_model=dict)
async def update_class_admin(
    class_id: str,
    class_data: CourseClassCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a class - Admin only."""
    course_class = db.query(CourseClass).filter(CourseClass.id == class_id).first()
    if not course_class:
        raise HTTPException(status_code=404, detail="Class not found")

    course_class.title = class_data.title
    course_class.description = class_data.description
    course_class.order_index = class_data.order_index
    course_class.video_url = class_data.video_url
    course_class.duration = class_data.duration

    db.commit()

    return {
        "message": "Class updated successfully",
        "class": {
            "id": str(course_class.id),
            "title": course_class.title,
        },
    }


@router.delete("/admin/classes/{class_id}", response_model=dict)
async def delete_class_admin(
    class_id: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a class - Admin only."""
    course_class = db.query(CourseClass).filter(CourseClass.id == class_id).first()
    if not course_class:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(course_class)
    db.commit()

    return {"message": "Class deleted successfully"}


# ============================================================================
# ADMIN - COMPONENT MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/admin/classes/{class_id}/components", response_model=dict)
async def create_component_admin(
    class_id: str,
    component_data: CourseComponentBase,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Add a component to a class - Admin only."""
    course_class = db.query(CourseClass).filter(CourseClass.id == class_id).first()
    if not course_class:
        raise HTTPException(status_code=404, detail="Class not found")

    component = CourseComponent(
        class_id=class_id,
        type=component_data.type,
        title=component_data.title,
        content=component_data.content,
        order_index=component_data.order_index,
    )

    db.add(component)
    db.commit()
    db.refresh(component)

    return {
        "message": "Component added successfully",
        "component": {
            "id": str(component.id),
            "title": component.title,
            "type": component.type.value,
        },
    }


@router.put("/admin/components/{component_id}", response_model=dict)
async def update_component_admin(
    component_id: str,
    component_data: CourseComponentBase,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a component - Admin only."""
    component = db.query(CourseComponent).filter(CourseComponent.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    component.type = component_data.type
    component.title = component_data.title
    component.content = component_data.content
    component.order_index = component_data.order_index

    db.commit()

    return {
        "message": "Component updated successfully",
        "component": {
            "id": str(component.id),
            "title": component.title,
        },
    }


@router.delete("/admin/components/{component_id}", response_model=dict)
async def delete_component_admin(
    component_id: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a component - Admin only."""
    component = db.query(CourseComponent).filter(CourseComponent.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    db.delete(component)
    db.commit()

    return {"message": "Component deleted successfully"}


# ============================================================================
# ADMIN - INSTRUCTOR MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/admin/instructors", response_model=dict)
async def get_instructors_admin(
    skip: int = 0,
    limit: int = 50,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get all instructors - Admin only."""
    query = db.query(Instructor)
    instructors = query.offset(skip).limit(limit).all()
    total = query.count()

    result = []
    for instructor in instructors:
        result.append({
            "id": str(instructor.id),
            "name": instructor.name,
            "bio": instructor.bio,
            "photo_url": instructor.photo_url,
            "email": instructor.email,
            "created_at": instructor.created_at.isoformat(),
        })

    return {"instructors": result, "total": total, "skip": skip, "limit": limit}


@router.post("/admin/instructors", response_model=dict)
async def create_instructor_admin(
    instructor_data: InstructorBase,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new instructor - Admin only."""
    instructor = Instructor(
        name=instructor_data.name,
        bio=instructor_data.bio,
        photo_url=instructor_data.photo_url,
    )

    db.add(instructor)
    db.commit()
    db.refresh(instructor)

    return {
        "message": "Instructor created successfully",
        "instructor": {
            "id": str(instructor.id),
            "name": instructor.name,
        },
    }


@router.put("/admin/instructors/{instructor_id}", response_model=dict)
async def update_instructor_admin(
    instructor_id: str,
    instructor_data: InstructorBase,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update an instructor - Admin only."""
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    instructor.name = instructor_data.name
    instructor.bio = instructor_data.bio
    instructor.photo_url = instructor_data.photo_url

    db.commit()

    return {
        "message": "Instructor updated successfully",
        "instructor": {
            "id": str(instructor.id),
            "name": instructor.name,
        },
    }


@router.delete("/admin/instructors/{instructor_id}", response_model=dict)
async def delete_instructor_admin(
    instructor_id: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete an instructor - Admin only."""
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    # Check if instructor has courses
    if instructor.courses:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete instructor with assigned courses"
        )

    db.delete(instructor)
    db.commit()

    return {"message": "Instructor deleted successfully"}


# ============================================================================
# COURSE COMMENT ENDPOINTS
# ============================================================================

@router.get("/{course_id}/comments", response_model=dict)
async def get_course_comments(
    course_id: str,
    class_id: Optional[str] = None,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get comments for a course or specific class."""
    # Build query
    query = db.query(CourseComment).filter(CourseComment.course_id == course_id)

    if class_id:
        query = query.filter(CourseComment.class_id == class_id)
    else:
        # Only course-level comments
        query = query.filter(CourseComment.class_id == None)

    comments = query.order_by(CourseComment.created_at.desc()).all()

    result = []
    for comment in comments:
        result.append({
            "id": str(comment.id),
            "user_id": str(comment.user_id),
            "user_name": comment.user.full_name if comment.user else "Unknown",
            "course_id": str(comment.course_id),
            "class_id": str(comment.class_id) if comment.class_id else None,
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat(),
        })

    return {"comments": result, "total": len(result)}


@router.post("/{course_id}/comments", response_model=dict)
async def create_comment(
    course_id: str,
    comment_data: CourseCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a comment to a course or class."""
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Verify user is enrolled
    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == course_id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="You must be enrolled in this course to comment"
        )

    # Create comment
    comment = CourseComment(
        user_id=current_user.id,
        course_id=course_id,
        class_id=comment_data.class_id,
        content=comment_data.content,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "message": "Comment added successfully",
        "comment": {
            "id": str(comment.id),
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
        },
    }


@router.put("/comments/{comment_id}", response_model=dict)
async def update_comment(
    comment_id: str,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a comment - only by comment owner."""
    comment = db.query(CourseComment).filter(CourseComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Verify ownership
    if str(comment.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")

    comment.content = content
    db.commit()

    return {
        "message": "Comment updated successfully",
        "comment": {
            "id": str(comment.id),
            "content": comment.content,
        },
    }


@router.delete("/comments/{comment_id}", response_model=dict)
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a comment - owner or admin."""
    comment = db.query(CourseComment).filter(CourseComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Verify ownership or admin
    if str(comment.user_id) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}


# ============================================================================
# VIDEO TIMESTAMP TRACKING ENDPOINTS
# ============================================================================

@router.post("/progress/video-timestamp", response_model=dict)
async def save_video_timestamp(
    component_id: str,
    timestamp: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save video timestamp for resume functionality."""
    # Get component
    component = db.query(CourseComponent).filter(CourseComponent.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    # Get course and verify enrollment
    course_class = component.course_class
    course = course_class.course

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
            CourseProgress.component_id == component_id,
        )
        .first()
    )

    if not progress:
        progress = CourseProgress(
            enrollment_id=enrollment.id,
            class_id=course_class.id,
            component_id=component_id,
        )
        db.add(progress)

    # Update timestamp and calculate progress percentage
    progress.video_timestamp = timestamp
    progress.last_accessed = datetime.utcnow()

    # Calculate progress based on video duration
    if component.duration and component.duration > 0:
        progress.progress_percentage = min(int((timestamp / component.duration) * 100), 100)

        # Mark as completed if watched 95% or more
        if progress.progress_percentage >= 95:
            progress.completed = True

    db.commit()

    return {
        "message": "Timestamp saved successfully",
        "timestamp": timestamp,
        "progress_percentage": progress.progress_percentage,
        "completed": progress.completed,
    }


@router.get("/progress/video-timestamp/{course_id}/{class_id}/{component_id}", response_model=dict)
async def get_video_timestamp(
    course_id: str,
    class_id: str,
    component_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get saved video timestamp for resume."""
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
        return {"timestamp": 0, "progress_percentage": 0, "completed": False}

    # Get progress record
    progress = (
        db.query(CourseProgress)
        .filter(
            CourseProgress.enrollment_id == enrollment.id,
            CourseProgress.component_id == component_id,
        )
        .first()
    )

    if not progress:
        return {"timestamp": 0, "progress_percentage": 0, "completed": False}

    return {
        "timestamp": progress.video_timestamp,
        "progress_percentage": progress.progress_percentage,
        "completed": progress.completed,
    }
