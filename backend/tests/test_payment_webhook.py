"""Unit tests for payment webhook handler."""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from unittest.mock import patch
import uuid

from app.models.user import User, UserProfile, MembershipTierEnum
from app.models.payment import Payment, PaymentStatus, PaymentType
from app.models.course import Course, CourseEnrollment, EnrollmentStatus
from app.models.retreat import Retreat, RetreatRegistration, RetreatType, RegistrationStatus, AccessType
from app.models.product import Product, ProductType, Order, OrderItem, OrderStatus, UserProductAccess
from app.core.security import get_password_hash
from app.routers.payments import grant_access_after_payment, send_payment_confirmation_email


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_session_local(db_session: Session, monkeypatch):
    """
    Patch SessionLocal to return the test database session.
    This ensures background tasks use the same in-memory test database.

    We wrap the session in a class that prevents close() from actually closing it,
    since that would detach all objects and break the tests.
    """
    class MockSession:
        def __call__(self):
            # Create a wrapper that delegates everything to db_session
            # but prevents close() from actually closing
            class SessionWrapper:
                def __getattr__(self, name):
                    if name == "close":
                        # Don't actually close the test session
                        return lambda: None
                    return getattr(db_session, name)

                def __enter__(self):
                    return db_session.__enter__()

                def __exit__(self, *args):
                    # Don't close on context manager exit
                    return None

            return SessionWrapper()

    monkeypatch.setattr("app.routers.payments.SessionLocal", MockSession())
    yield


@pytest.fixture
def test_user_with_profile(db_session: Session) -> User:
    """Create a test user with profile."""
    user = User(
        email="webhook-test@example.com",
        name="Webhook Test User",
        password_hash=get_password_hash("testpass123"),
        membership_tier=MembershipTierEnum.FREE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(user_id=user.id)
    db_session.add(profile)

    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_course(db_session: Session) -> Course:
    """Create a test course."""
    course = Course(
        slug="test-webhook-course",
        title="Test Webhook Course",
        description="Course for webhook testing",
        price=99.99,
        is_published=True,
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)
    return course


@pytest.fixture
def test_retreat(db_session: Session) -> Retreat:
    """Create a test retreat."""
    retreat = Retreat(
        slug="test-webhook-retreat",
        title="Test Webhook Retreat",
        description="Retreat for webhook testing",
        type=RetreatType.ONLINE,
        price_lifetime=199.99,
        price_limited=49.99,
        is_published=True,
        start_date=datetime.utcnow() + timedelta(days=30),
        end_date=datetime.utcnow() + timedelta(days=37),
    )
    db_session.add(retreat)
    db_session.commit()
    db_session.refresh(retreat)
    return retreat


@pytest.fixture
def test_product(db_session: Session) -> Product:
    """Create a test product."""
    product = Product(
        slug="test-webhook-product",
        title="Test Webhook Product",
        description="Product for webhook testing",
        price=29.99,
        type=ProductType.AUDIO,
        is_available=True,
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


# ============================================================================
# COURSE ENROLLMENT ACCESS TESTS
# ============================================================================

def test_grant_course_access_after_payment(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_course: Course,
):
    """Test that course access is granted after successful payment."""
    # Create payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=99.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.COURSE,
        reference_id=str(test_course.id),
        tilopay_transaction_id="TXN-12345",
    )
    db_session.add(payment)
    db_session.flush()

    # Create enrollment (without payment_id initially)
    enrollment = CourseEnrollment(
        user_id=test_user_with_profile.id,
        course_id=test_course.id,
        status=EnrollmentStatus.ACTIVE,  # Enrollments start as ACTIVE by default
    )
    db_session.add(enrollment)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.COURSE.value,
        reference_id=str(test_course.id),
    )

    # Refresh enrollment
    db_session.refresh(enrollment)

    # Verify access was granted
    assert enrollment.payment_id == payment.id
    assert enrollment.status == EnrollmentStatus.ACTIVE


def test_grant_course_access_no_enrollment(
    db_session: Session,
    test_user_with_profile: User,
    test_course: Course,
):
    """Test that function handles missing enrollment gracefully."""
    # Create payment but NO enrollment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=99.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.COURSE,
        reference_id=str(test_course.id),
        tilopay_transaction_id="TXN-12345",
    )
    db_session.add(payment)
    db_session.commit()

    # Call the access granting function (should not crash)
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.COURSE.value,
        reference_id=str(test_course.id),
    )

    # Should not create enrollment automatically
    enrollment = (
        db_session.query(CourseEnrollment)
        .filter(
            CourseEnrollment.user_id == test_user_with_profile.id,
            CourseEnrollment.course_id == test_course.id,
        )
        .first()
    )
    assert enrollment is None


# ============================================================================
# RETREAT REGISTRATION ACCESS TESTS
# ============================================================================

def test_grant_retreat_access_after_payment(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_retreat: Retreat,
):
    """Test that retreat access is granted after successful payment."""
    # Create payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=199.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.RETREAT,
        reference_id=str(test_retreat.id),
        tilopay_transaction_id="TXN-67890",
    )
    db_session.add(payment)
    db_session.flush()

    # Create registration (without payment_id initially)
    registration = RetreatRegistration(
        user_id=test_user_with_profile.id,
        retreat_id=test_retreat.id,
        access_type=AccessType.LIFETIME,
        status=RegistrationStatus.PENDING,
    )
    db_session.add(registration)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.RETREAT.value,
        reference_id=str(test_retreat.id),
    )

    # Refresh registration
    db_session.refresh(registration)

    # Verify access was granted
    assert registration.payment_id == payment.id
    assert registration.status == RegistrationStatus.CONFIRMED


def test_grant_retreat_access_with_limited_access(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_retreat: Retreat,
):
    """Test retreat access with 12-day limited access."""
    # Create payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=49.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.RETREAT,
        reference_id=str(test_retreat.id),
        tilopay_transaction_id="TXN-11111",
    )
    db_session.add(payment)
    db_session.flush()

    # Create registration with 12-day access
    access_expires_at = datetime.utcnow() + timedelta(days=12)
    registration = RetreatRegistration(
        user_id=test_user_with_profile.id,
        retreat_id=test_retreat.id,
        access_type=AccessType.LIMITED_12DAY,
        access_expires_at=access_expires_at,
        status=RegistrationStatus.PENDING,
    )
    db_session.add(registration)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.RETREAT.value,
        reference_id=str(test_retreat.id),
    )

    # Refresh registration
    db_session.refresh(registration)

    # Verify access was granted and expiration preserved
    assert registration.payment_id == payment.id
    assert registration.status == RegistrationStatus.CONFIRMED
    assert registration.access_type == AccessType.LIMITED_12DAY
    assert registration.access_expires_at is not None


# ============================================================================
# PRODUCT PURCHASE ACCESS TESTS
# ============================================================================

def test_grant_product_access_after_payment(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_product: Product,
):
    """Test that product access is granted after successful payment."""
    # Create order
    order = Order(
        user_id=test_user_with_profile.id,
        order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
        total_amount=29.99,
        status=OrderStatus.PENDING,
    )
    db_session.add(order)
    db_session.flush()

    # Add order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=test_product.id,
        quantity=1,
        price_at_purchase=29.99,
    )
    db_session.add(order_item)

    # Create payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=29.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.PRODUCT,
        reference_id=str(order.id),
        tilopay_transaction_id="TXN-99999",
    )
    db_session.add(payment)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.PRODUCT.value,
        reference_id=str(order.id),
    )

    # Refresh order
    db_session.refresh(order)

    # Verify order status updated
    assert order.status == OrderStatus.COMPLETED
    assert order.payment_id == payment.id

    # Verify product access was granted
    access = (
        db_session.query(UserProductAccess)
        .filter(
            UserProductAccess.user_id == test_user_with_profile.id,
            UserProductAccess.product_id == test_product.id,
        )
        .first()
    )
    assert access is not None
    assert access.order_id == order.id


def test_grant_product_access_prevents_duplicates(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_product: Product,
):
    """Test that duplicate product access is not created."""
    # Create order
    order = Order(
        user_id=test_user_with_profile.id,
        order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
        total_amount=29.99,
        status=OrderStatus.PENDING,
    )
    db_session.add(order)
    db_session.flush()

    # Add order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=test_product.id,
        quantity=1,
        price_at_purchase=29.99,
    )
    db_session.add(order_item)

    # Create payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=29.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.PRODUCT,
        reference_id=str(order.id),
        tilopay_transaction_id="TXN-88888",
    )
    db_session.add(payment)

    # Pre-create access (simulating duplicate webhook)
    existing_access = UserProductAccess(
        user_id=test_user_with_profile.id,
        product_id=test_product.id,
        order_id=order.id,
    )
    db_session.add(existing_access)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.PRODUCT.value,
        reference_id=str(order.id),
    )

    # Verify only one access record exists
    access_count = (
        db_session.query(UserProductAccess)
        .filter(
            UserProductAccess.user_id == test_user_with_profile.id,
            UserProductAccess.product_id == test_product.id,
        )
        .count()
    )
    assert access_count == 1


# ============================================================================
# RETREAT REGISTRATION FROM METADATA TESTS
# ============================================================================

def test_create_retreat_registration_from_metadata_lifetime(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_retreat: Retreat,
):
    """Test that retreat registration is created from payment metadata (lifetime access)."""
    # Create payment WITH metadata but NO existing registration
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=199.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.RETREAT,
        reference_id=str(test_retreat.id),
        payment_metadata={"access_type": "lifetime"},  # This is the key!
        tilopay_transaction_id="TXN-META-001",
    )
    db_session.add(payment)
    db_session.commit()

    # Verify no registration exists yet
    existing = (
        db_session.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == test_user_with_profile.id,
            RetreatRegistration.retreat_id == test_retreat.id,
        )
        .first()
    )
    assert existing is None, "Registration should not exist before webhook processing"

    # Call the access granting function (simulating webhook)
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.RETREAT.value,
        reference_id=str(test_retreat.id),
    )

    # Verify registration was created
    registration = (
        db_session.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == test_user_with_profile.id,
            RetreatRegistration.retreat_id == test_retreat.id,
        )
        .first()
    )

    assert registration is not None, "Registration should be created from metadata"
    assert registration.payment_id == payment.id
    assert registration.status == RegistrationStatus.CONFIRMED
    assert registration.access_type == AccessType.LIFETIME
    assert registration.access_expires_at is None  # Lifetime has no expiration


def test_create_retreat_registration_from_metadata_limited(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_retreat: Retreat,
):
    """Test that retreat registration is created from payment metadata (12-day limited access)."""
    # Create payment WITH metadata but NO existing registration
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=49.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.RETREAT,
        reference_id=str(test_retreat.id),
        payment_metadata={"access_type": "limited_12day"},  # 12-day access
        tilopay_transaction_id="TXN-META-002",
    )
    db_session.add(payment)
    db_session.commit()

    # Verify no registration exists yet
    existing = (
        db_session.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == test_user_with_profile.id,
            RetreatRegistration.retreat_id == test_retreat.id,
        )
        .first()
    )
    assert existing is None, "Registration should not exist before webhook processing"

    # Call the access granting function (simulating webhook)
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.RETREAT.value,
        reference_id=str(test_retreat.id),
    )

    # Verify registration was created
    registration = (
        db_session.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == test_user_with_profile.id,
            RetreatRegistration.retreat_id == test_retreat.id,
        )
        .first()
    )

    assert registration is not None, "Registration should be created from metadata"
    assert registration.payment_id == payment.id
    assert registration.status == RegistrationStatus.CONFIRMED
    assert registration.access_type == AccessType.LIMITED_12DAY
    assert registration.access_expires_at is not None  # Should have expiration
    # Verify expiration is 12 days after retreat end date
    expected_expiration = test_retreat.end_date + timedelta(days=12)
    assert registration.access_expires_at == expected_expiration


def test_no_registration_without_metadata(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_retreat: Retreat,
):
    """Test that registration is NOT created if payment metadata is missing."""
    # Create payment WITHOUT metadata
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=199.99,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.RETREAT,
        reference_id=str(test_retreat.id),
        payment_metadata=None,  # No metadata!
        tilopay_transaction_id="TXN-NO-META",
    )
    db_session.add(payment)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.RETREAT.value,
        reference_id=str(test_retreat.id),
    )

    # Verify registration was NOT created
    registration = (
        db_session.query(RetreatRegistration)
        .filter(
            RetreatRegistration.user_id == test_user_with_profile.id,
            RetreatRegistration.retreat_id == test_retreat.id,
        )
        .first()
    )
    assert registration is None, "Registration should not be created without metadata"


# ============================================================================
# EDGE CASES AND ERROR HANDLING
# ============================================================================

def test_grant_access_payment_not_completed(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_course: Course,
):
    """Test that access is not granted if payment is not completed."""
    # Create PENDING payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=99.99,
        currency="USD",
        status=PaymentStatus.PENDING,  # Not completed!
        payment_type=PaymentType.COURSE,
        reference_id=str(test_course.id),
    )
    db_session.add(payment)
    db_session.flush()

    # Create enrollment
    enrollment = CourseEnrollment(
        user_id=test_user_with_profile.id,
        course_id=test_course.id,
        status=EnrollmentStatus.ACTIVE,
    )
    db_session.add(enrollment)
    db_session.commit()

    # Call the access granting function
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.COURSE.value,
        reference_id=str(test_course.id),
    )

    # Refresh enrollment
    db_session.refresh(enrollment)

    # Verify access was NOT granted
    assert enrollment.payment_id is None
    assert enrollment.status == EnrollmentStatus.ACTIVE  # Unchanged


def test_grant_access_payment_not_found(
    db_session: Session,
    mock_session_local,
    test_user_with_profile: User,
    test_course: Course,
):
    """Test that function handles non-existent payment gracefully."""
    # Create enrollment
    enrollment = CourseEnrollment(
        user_id=test_user_with_profile.id,
        course_id=test_course.id,
        status=EnrollmentStatus.ACTIVE,
    )
    db_session.add(enrollment)
    db_session.commit()

    # Call with fake payment ID (should not crash)
    grant_access_after_payment(
        payment_id="00000000-0000-0000-0000-000000000000",
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.COURSE.value,
        reference_id=str(test_course.id),
    )

    # Refresh enrollment
    db_session.refresh(enrollment)

    # Verify access was NOT granted
    assert enrollment.payment_id is None
    assert enrollment.status == EnrollmentStatus.ACTIVE  # Unchanged


# ============================================================================
# DONATION PAYMENT TYPE (NO ACCESS TO GRANT)
# ============================================================================

def test_grant_access_donation_payment(
    db_session: Session,
    test_user_with_profile: User,
):
    """Test that donation payments don't crash the access granting function."""
    # Create donation payment
    payment = Payment(
        user_id=test_user_with_profile.id,
        amount=50.00,
        currency="USD",
        status=PaymentStatus.COMPLETED,
        payment_type=PaymentType.DONATION,
        reference_id=None,  # Donations don't have reference
        tilopay_transaction_id="TXN-DONATION",
    )
    db_session.add(payment)
    db_session.commit()

    # Call the access granting function (should not crash)
    grant_access_after_payment(
        payment_id=str(payment.id),
        user_id=str(test_user_with_profile.id),
        payment_type=PaymentType.DONATION.value,
        reference_id=None,
    )

    # No assertions needed - just verify it doesn't crash
