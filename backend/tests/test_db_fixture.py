"""Test that database fixture works correctly."""
from sqlalchemy.orm import Session
from app.models.user import User, UserProfile, MembershipTierEnum
from app.core.security import get_password_hash


def test_db_session_creates_tables(db_session: Session):
    """Test that tables are created in test database."""
    # Try to create a user directly
    user = User(
        email="fixture-test@example.com",
        name="Fixture Test",
        password_hash=get_password_hash("testpass"),
        membership_tier=MembershipTierEnum.FREE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()  # Get the ID

    # Create profile
    profile = UserProfile(user_id=user.id)
    db_session.add(profile)

    db_session.commit()

    # Query it back
    queried_user = db_session.query(User).filter(User.email == "fixture-test@example.com").first()
    assert queried_user is not None
    assert queried_user.name == "Fixture Test"
    print(f"✓ Successfully created and queried user with ID: {queried_user.id}")
