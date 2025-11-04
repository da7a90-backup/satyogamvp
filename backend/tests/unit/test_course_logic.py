"""Unit tests for course enrollment and access control logic."""
import pytest
from unittest.mock import Mock
from app.routers.courses import user_can_access_course
from app.models.user import User, MembershipTierEnum
from app.models.course import Course, CourseEnrollment


# Note: Progress calculation tests are in integration tests
# because they involve complex SQLAlchemy queries that are
# better tested with a real database.


class TestCourseAccessControl:
    """Test course access control logic."""

    def test_unpublished_course_access_denied(self):
        """Test that unpublished courses are not accessible."""
        mock_db = Mock()

        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            is_published=False,
        )

        access = user_can_access_course(user, course, mock_db)

        assert access["can_access"] is False
        assert access["is_enrolled"] is False
        assert "not yet published" in access["reason"].lower()

    def test_not_enrolled_user_denied(self):
        """Test that users not enrolled cannot access course."""
        mock_db = Mock()

        # Mock enrollment query to return None (not enrolled)
        mock_db.query.return_value.filter.return_value.first.return_value = None

        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )
        user.id = "user123"

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            is_published=True,
        )
        course.id = "course123"

        access = user_can_access_course(user, course, mock_db)

        assert access["can_access"] is False
        assert access["is_enrolled"] is False
        assert "not enrolled" in access["reason"].lower()

    def test_enrolled_user_granted_access(self):
        """Test that enrolled users can access course."""
        mock_db = Mock()

        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )
        user.id = "user123"

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            is_published=True,
        )
        course.id = "course123"

        # Mock enrollment found
        enrollment = CourseEnrollment(
            user_id="user123",
            course_id="course123",
        )
        mock_db.query.return_value.filter.return_value.first.return_value = enrollment

        access = user_can_access_course(user, course, mock_db)

        assert access["can_access"] is True
        assert access["is_enrolled"] is True
        assert access["reason"] == "Enrolled"
        assert access["enrollment"] == enrollment

    def test_enrolled_user_unpublished_course_denied(self):
        """Test that even enrolled users cannot access unpublished courses."""
        mock_db = Mock()

        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )

        course = Course(
            slug="test-course",
            title="Test Course",
            description="Test Description",
            is_published=False,  # Unpublished
        )

        access = user_can_access_course(user, course, mock_db)

        # Should deny before checking enrollment
        assert access["can_access"] is False
        assert access["is_enrolled"] is False
        assert "not yet published" in access["reason"].lower()
