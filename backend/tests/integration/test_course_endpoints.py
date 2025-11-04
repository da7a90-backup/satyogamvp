"""Integration tests for course enrollment endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.course import Course, CourseClass, CourseComponent, Instructor, ComponentType
from app.models.payment import Payment, PaymentStatus


class TestCourseListingEndpoints:
    """Test course listing and detail endpoints."""

    def test_get_courses_no_auth(self, client: TestClient, db_session: Session):
        """Test getting course list without authentication."""
        # Create a published course
        instructor = Instructor(
            name="Test Instructor",
            bio="Test Bio",
        )
        db_session.add(instructor)
        db_session.flush()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=99.99,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.get("/api/courses/")

        assert response.status_code == 200
        data = response.json()
        assert "courses" in data
        assert data["total"] == 1
        assert data["courses"][0]["slug"] == "test-course"
        assert data["courses"][0]["is_enrolled"] is False

    def test_get_courses_with_auth_shows_enrollment(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that enrolled courses show enrollment status for logged-in users."""
        # Create instructor
        instructor = Instructor(
            name="Test Instructor",
            bio="Test Bio",
        )
        db_session.add(instructor)
        db_session.commit()

        # Create course
        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=99.99,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        # Enroll user
        from app.models.course import CourseEnrollment

        enrollment = CourseEnrollment(
            user_id=test_user.id,
            course_id=course.id,
        )
        db_session.add(enrollment)
        db_session.commit()

        response = client.get("/api/courses/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["courses"][0]["is_enrolled"] is True
        assert data["courses"][0]["progress_percentage"] == 0.0

    def test_get_course_by_slug_not_found(self, client: TestClient):
        """Test getting nonexistent course returns 404."""
        response = client.get("/api/courses/nonexistent-course")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_course_by_slug_not_enrolled(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test getting course details when not enrolled shows limited info."""
        instructor = Instructor(
            name="Test Instructor",
            bio="Test Bio",
            photo_url="http://example.com/avatar.jpg",
        )
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=99.99,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.get("/api/courses/test-course", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "test-course"
        assert data["is_enrolled"] is False
        assert data["can_access"] is False
        assert "classes" not in data  # Should not show course structure

    def test_get_course_by_slug_enrolled_shows_structure(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test getting course details when enrolled shows full structure."""
        # Create instructor
        instructor = Instructor(
            name="Test Instructor",
            bio="Test Bio",
        )
        db_session.add(instructor)
        db_session.commit()

        # Create course
        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=99.99,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        # Create class and component
        course_class = CourseClass(
            course_id=course.id,
            title="Class 1",
            description="First class",
            order_index=1,
        )
        db_session.add(course_class)
        db_session.commit()

        component = CourseComponent(
            class_id=course_class.id,
            title="Video 1",
            type=ComponentType.VIDEO,
            content="http://example.com/video1.mp4",
            order_index=1,
        )
        db_session.add(component)
        db_session.commit()

        # Enroll user
        from app.models.course import CourseEnrollment

        enrollment = CourseEnrollment(
            user_id=test_user.id,
            course_id=course.id,
        )
        db_session.add(enrollment)
        db_session.commit()

        response = client.get("/api/courses/test-course", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["is_enrolled"] is True
        assert data["can_access"] is True
        assert "classes" in data
        assert len(data["classes"]) == 1
        assert data["classes"][0]["title"] == "Class 1"
        assert len(data["classes"][0]["components"]) == 1
        assert data["classes"][0]["components"][0]["title"] == "Video 1"


class TestCourseEnrollmentEndpoints:
    """Test course enrollment functionality."""

    def test_enroll_without_auth(self, client: TestClient, db_session: Session):
        """Test that enrollment requires authentication."""
        # Create course
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,  # Free course
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(
            "/api/courses/enroll",
            json={"course_id": str(course.id)},
        )

        assert response.status_code == 403

    def test_enroll_free_course_success(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test successful enrollment in free course."""
        # Create instructor
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        # Create free course
        course = Course(
            slug="free-course",
            title="Free Course",
            description="Free Description",
            price=0,  # Free
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(
            "/api/courses/enroll",
            json={"course_id": str(course.id)},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "enrollment" in data
        assert data["enrollment"]["course_id"] == str(course.id)
        assert "Successfully enrolled" in data["message"]

    def test_enroll_paid_course_without_payment(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that paid course requires payment."""
        # Create instructor
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        # Create paid course
        course = Course(
            slug="paid-course",
            title="Paid Course",
            description="Paid Description",
            price=99.99,  # Paid
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(
            "/api/courses/enroll",
            json={"course_id": str(course.id)},
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "payment required" in response.json()["detail"].lower()

    def test_enroll_paid_course_with_completed_payment(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test successful enrollment with valid payment."""
        # Create instructor
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        # Create paid course
        course = Course(
            slug="paid-course",
            title="Paid Course",
            description="Paid Description",
            price=99.99,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        # Create completed payment
        payment = Payment(
            user_id=test_user.id,
            amount=99.99,
            currency="USD",
            payment_type="course",
            status=PaymentStatus.COMPLETED,
            reference_id=str(course.id),
        )
        db_session.add(payment)
        db_session.commit()

        response = client.post(
            "/api/courses/enroll",
            json={
                "course_id": str(course.id),
                "payment_id": str(payment.id),
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "enrollment" in data
        assert "Successfully enrolled" in data["message"]

    def test_enroll_duplicate_enrollment(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that duplicate enrollment is prevented."""
        # Create instructor
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        # Create course
        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        # First enrollment
        response1 = client.post(
            "/api/courses/enroll",
            json={"course_id": str(course.id)},
            headers=auth_headers,
        )
        assert response1.status_code == 200

        # Attempt duplicate enrollment
        response2 = client.post(
            "/api/courses/enroll",
            json={"course_id": str(course.id)},
            headers=auth_headers,
        )

        assert response2.status_code == 400
        assert "already enrolled" in response2.json()["detail"].lower()

    def test_enroll_nonexistent_course(
        self, client: TestClient, test_user, auth_headers
    ):
        """Test enrolling in nonexistent course returns 404."""
        response = client.post(
            "/api/courses/enroll",
            json={"course_id": "00000000-0000-0000-0000-000000000000"},
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_my_enrollments(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test getting user's enrolled courses."""
        # Create instructor
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        # Create courses
        course1 = Course(
            slug="course-1",
            title="Course 1",
            description="Description 1",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        course2 = Course(
            slug="course-2",
            title="Course 2",
            description="Description 2",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add_all([course1, course2])
        db_session.commit()

        # Enroll in both courses
        from app.models.course import CourseEnrollment

        enrollment1 = CourseEnrollment(user_id=test_user.id, course_id=course1.id)
        enrollment2 = CourseEnrollment(user_id=test_user.id, course_id=course2.id)
        db_session.add_all([enrollment1, enrollment2])
        db_session.commit()

        response = client.get("/api/courses/my-enrollments", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "enrollments" in data
        assert len(data["enrollments"]) == 2
        assert data["enrollments"][0]["progress_percentage"] == 0.0


class TestCourseProgressEndpoints:
    """Test course progress tracking functionality."""

    def test_update_progress_without_auth(self, client: TestClient, db_session: Session):
        """Test that progress update requires authentication."""
        response = client.post(
            "/api/courses/progress",
            json={
                "component_id": "00000000-0000-0000-0000-000000000000",
                "progress_percentage": 50.0,
                "completed": False,
            },
        )

        assert response.status_code == 403

    def test_update_progress_not_enrolled(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that progress update requires enrollment."""
        # Create course with component
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        course_class = CourseClass(
            course_id=course.id,
            title="Class 1",
            description="First class",
            order_index=1,
        )
        db_session.add(course_class)
        db_session.commit()

        component = CourseComponent(
            class_id=course_class.id,
            title="Video 1",
            type=ComponentType.VIDEO,
            content="http://example.com/video.mp4",
            order_index=1,
        )
        db_session.add(component)
        db_session.commit()

        # Try to update progress without enrollment
        response = client.post(
            "/api/courses/progress",
            json={
                "component_id": str(component.id),
                "progress_percentage": 50.0,
                "completed": False,
            },
            headers=auth_headers,
        )

        assert response.status_code == 403
        assert "not enrolled" in response.json()["detail"].lower()

    def test_update_progress_success(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test successful progress update."""
        # Create course structure
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        course_class = CourseClass(
            course_id=course.id,
            title="Class 1",
            description="First class",
            order_index=1,
        )
        db_session.add(course_class)
        db_session.commit()

        component = CourseComponent(
            class_id=course_class.id,
            title="Video 1",
            type=ComponentType.VIDEO,
            content="http://example.com/video.mp4",
            order_index=1,
        )
        db_session.add(component)
        db_session.commit()

        # Enroll user
        from app.models.course import CourseEnrollment

        enrollment = CourseEnrollment(user_id=test_user.id, course_id=course.id)
        db_session.add(enrollment)
        db_session.commit()

        # Update progress
        response = client.post(
            "/api/courses/progress",
            json={
                "component_id": str(component.id),
                "progress_percentage": 75.0,
                "completed": False,
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "progress" in data
        assert data["progress"]["progress_percentage"] == 75.0
        assert data["progress"]["completed"] is False
        assert data["course_completed"] is False

    def test_update_progress_completion_marks_course_complete(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that completing all components marks course as complete."""
        # Create course with one component
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        course_class = CourseClass(
            course_id=course.id,
            title="Class 1",
            description="First class",
            order_index=1,
        )
        db_session.add(course_class)
        db_session.commit()

        component = CourseComponent(
            class_id=course_class.id,
            title="Video 1",
            type=ComponentType.VIDEO,
            content="http://example.com/video.mp4",
            order_index=1,
        )
        db_session.add(component)
        db_session.commit()

        # Enroll user
        from app.models.course import CourseEnrollment

        enrollment = CourseEnrollment(user_id=test_user.id, course_id=course.id)
        db_session.add(enrollment)
        db_session.commit()

        # Complete the component
        response = client.post(
            "/api/courses/progress",
            json={
                "component_id": str(component.id),
                "progress_percentage": 100.0,
                "completed": True,
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["course_progress"] == 100.0
        assert data["course_completed"] is True

    def test_get_course_progress(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test getting detailed course progress."""
        # Create course structure
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        # Enroll user
        from app.models.course import CourseEnrollment

        enrollment = CourseEnrollment(user_id=test_user.id, course_id=course.id)
        db_session.add(enrollment)
        db_session.commit()

        response = client.get(
            f"/api/courses/progress/{course.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "course_id" in data
        assert "overall_progress" in data
        assert "progress_details" in data
        assert data["overall_progress"] == 0.0  # No components yet

    def test_get_course_progress_not_enrolled(
        self, client: TestClient, db_session: Session, test_user, auth_headers
    ):
        """Test that progress endpoint requires enrollment."""
        # Create course
        instructor = Instructor(name="Test Instructor", bio="Test Bio")
        db_session.add(instructor)
        db_session.commit()

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            price=0,
            is_published=True,
            instructor_id=instructor.id,
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(
            f"/api/courses/progress/{course.id}",
            headers=auth_headers,
        )

        assert response.status_code == 403
        assert "not enrolled" in response.json()["detail"].lower()
