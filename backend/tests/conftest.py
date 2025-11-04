"""
Pytest configuration and fixtures for testing.
"""
import pytest
import sys
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import Base FIRST so models can inherit from it
from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token

# Now import ALL models to register them with Base
from app.models.user import User, UserProfile, MembershipTierEnum
from app.models.teaching import Teaching, TeachingAccess, TeachingFavorite, ContentType, AccessLevel
from app.models.course import (
    Course, Instructor, CourseClass, CourseComponent,
    CourseEnrollment, CourseProgress, CourseComment, ComponentType
)
from app.models.retreat import Retreat, RetreatPortal, RetreatRegistration
from app.models.product import Product, Order, OrderItem, UserProductAccess
from app.models.payment import Payment
from app.models.membership import MembershipTier, Subscription
from app.models.event import Event, UserCalendar
from app.models.blog import Blog
from app.models.forms import Application, ContactSubmission
from app.models.email import NewsletterSubscriber, EmailTemplate, EmailCampaign, EmailAutomation, EmailSent
from app.models.analytics import AnalyticsEvent, UserAnalytics

# Import the main app
# Note: app.main creates tables on startup via lifespan, but we'll override get_db
# so tests use the test database
from app.main import app


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Create test session maker
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)

    # Create session
    session = TestSessionLocal()

    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> TestClient:
    """Create a test client with overridden database dependency."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Use TestClient without triggering lifespan (which creates tables on production DB)
    with TestClient(app, raise_server_exceptions=True) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        name="Test User",
        password_hash=get_password_hash("testpass123"),
        membership_tier=MembershipTierEnum.FREE,
        is_active=True,
        is_admin=False,
    )
    db_session.add(user)
    db_session.flush()  # Flush to get user.id

    # Create profile
    profile = UserProfile(user_id=user.id)
    db_session.add(profile)

    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_pragyani_user(db_session: Session) -> User:
    """Create a test user with Pragyani membership."""
    user = User(
        email="pragyani@example.com",
        name="Pragyani User",
        password_hash=get_password_hash("testpass123"),
        membership_tier=MembershipTierEnum.PRAGYANI,
        is_active=True,
        is_admin=False,
    )
    db_session.add(user)
    db_session.flush()  # Flush to get user.id

    profile = UserProfile(user_id=user.id)
    db_session.add(profile)

    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin_user(db_session: Session) -> User:
    """Create a test admin user."""
    user = User(
        email="admin@example.com",
        name="Admin User",
        password_hash=get_password_hash("adminpass123"),
        membership_tier=MembershipTierEnum.PRAGYANI_PLUS,
        is_active=True,
        is_admin=True,
    )
    db_session.add(user)
    db_session.flush()  # Flush to get user.id

    profile = UserProfile(user_id=user.id)
    db_session.add(profile)

    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Generate authentication headers for test user."""
    access_token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_auth_headers(test_admin_user: User) -> dict:
    """Generate authentication headers for admin user."""
    access_token = create_access_token({"sub": str(test_admin_user.id)})
    return {"Authorization": f"Bearer {access_token}"}


# ============================================================================
# MOCK EXTERNAL SERVICES
# ============================================================================

from tests.mocks.mock_services import (
    MockMixpanelService,
    MockGA4Service,
    MockSendGridService,
)


@pytest.fixture
def mock_mixpanel():
    """Mock Mixpanel service."""
    service = MockMixpanelService()
    yield service
    service.clear_events()


@pytest.fixture
def mock_ga4():
    """Mock GA4 service."""
    service = MockGA4Service()
    yield service
    service.clear_events()


@pytest.fixture
def mock_sendgrid():
    """Mock SendGrid service."""
    service = MockSendGridService()
    yield service
    service.clear_sent_emails()


@pytest.fixture(autouse=True)
def mock_external_services(monkeypatch, mock_mixpanel, mock_ga4, mock_sendgrid):
    """Automatically mock all external services for every test."""
    # Patch the service instances where they're defined
    # The services are imported as: from app.services import mixpanel_service
    # So we need to patch at app.services module level

    import app.services
    monkeypatch.setattr(app.services, 'mixpanel_service', mock_mixpanel)
    monkeypatch.setattr(app.services, 'ga4_service', mock_ga4)
    monkeypatch.setattr(app.services, 'sendgrid_service', mock_sendgrid)

    yield

    # Cleanup is automatic with monkeypatch
