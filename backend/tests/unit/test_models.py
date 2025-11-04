"""Unit tests for database models."""
import pytest
from app.models.user import User, UserProfile, MembershipTierEnum
from app.models.teaching import Teaching, ContentType, AccessLevel
from app.models.course import Course, Instructor
from app.models.payment import Payment, PaymentStatus, PaymentType


class TestUserModel:
    """Test User model."""

    def test_create_user(self, db_session):
        """Test creating a user."""
        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hashed_password",
            membership_tier=MembershipTierEnum.FREE,
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.membership_tier == MembershipTierEnum.FREE
        assert user.is_active is True
        assert user.is_admin is False

    def test_user_profile_relationship(self, db_session):
        """Test user profile relationship."""
        user = User(
            email="test@example.com",
            name="Test User",
            password_hash="hashed_password",
        )
        db_session.add(user)
        db_session.flush()

        profile = UserProfile(
            user_id=user.id,
            phone="+1234567890",
            bio="Test bio",
        )
        db_session.add(profile)
        db_session.commit()

        assert user.profile is not None
        assert user.profile.phone == "+1234567890"


class TestTeachingModel:
    """Test Teaching model."""

    def test_create_teaching(self, db_session):
        """Test creating a teaching."""
        teaching = Teaching(
            slug="test-teaching",
            title="Test Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.FREE,
            video_url="https://example.com/video.mp4",
        )
        db_session.add(teaching)
        db_session.commit()

        assert teaching.id is not None
        assert teaching.slug == "test-teaching"
        assert teaching.access_level == AccessLevel.FREE
        assert teaching.view_count == 0

    def test_teaching_access_levels(self, db_session):
        """Test different teaching access levels."""
        free_teaching = Teaching(
            slug="free",
            title="Free",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.FREE,
        )
        pragyani_teaching = Teaching(
            slug="pragyani",
            title="Pragyani",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI,
        )

        db_session.add_all([free_teaching, pragyani_teaching])
        db_session.commit()

        assert free_teaching.access_level == AccessLevel.FREE
        assert pragyani_teaching.access_level == AccessLevel.PRAGYANI


class TestCourseModel:
    """Test Course model."""

    def test_create_instructor(self, db_session):
        """Test creating an instructor."""
        instructor = Instructor(
            name="Test Instructor",
            bio="Expert teacher",
        )
        db_session.add(instructor)
        db_session.commit()

        assert instructor.id is not None
        assert instructor.name == "Test Instructor"

    def test_create_course(self, db_session):
        """Test creating a course."""
        instructor = Instructor(name="Test Instructor")
        db_session.add(instructor)
        db_session.flush()

        course = Course(
            slug="test-course",
            title="Test Course",
            price=99.00,
            instructor_id=instructor.id,
            is_published=True,
        )
        db_session.add(course)
        db_session.commit()

        assert course.id is not None
        assert course.slug == "test-course"
        assert course.price == 99.00
        assert course.is_published is True


class TestPaymentModel:
    """Test Payment model."""

    def test_create_payment(self, db_session, test_user):
        """Test creating a payment."""
        payment = Payment(
            user_id=test_user.id,
            amount=99.00,
            currency="USD",
            payment_type=PaymentType.COURSE,
            status=PaymentStatus.PENDING,
        )
        db_session.add(payment)
        db_session.commit()

        assert payment.id is not None
        assert payment.amount == 99.00
        assert payment.status == PaymentStatus.PENDING

    def test_payment_status_updates(self, db_session, test_user):
        """Test updating payment status."""
        payment = Payment(
            user_id=test_user.id,
            amount=50.00,
            payment_type=PaymentType.DONATION,
            status=PaymentStatus.PENDING,
        )
        db_session.add(payment)
        db_session.commit()

        # Update status
        payment.status = PaymentStatus.COMPLETED
        db_session.commit()

        assert payment.status == PaymentStatus.COMPLETED
