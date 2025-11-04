"""Unit tests for membership access control logic."""
import pytest
from app.routers.teachings import user_can_access_teaching
from app.models.user import User, MembershipTierEnum
from app.models.teaching import Teaching, AccessLevel, ContentType


class TestAccessControl:
    """Test access control logic for teachings."""

    def test_free_teaching_accessible_to_all(self):
        """Test that free teachings are accessible to everyone."""
        teaching = Teaching(
            slug="free-teaching",
            title="Free Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.FREE,
        )

        # Test with no user
        access = user_can_access_teaching(None, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"
        assert access["preview_duration"] is None

        # Test with free user
        free_user = User(
            email="free@test.com",
            name="Free User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )
        access = user_can_access_teaching(free_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"

        # Test with pragyani user
        pragyani_user = User(
            email="pragyani@test.com",
            name="Pragyani User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )
        access = user_can_access_teaching(pragyani_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"

    def test_preview_teaching_free_user_gets_preview(self):
        """Test that free users get preview access to PREVIEW teachings."""
        teaching = Teaching(
            slug="preview-teaching",
            title="Preview Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PREVIEW,
            preview_duration=600,  # 10 minutes
        )

        free_user = User(
            email="free@test.com",
            name="Free User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )

        access = user_can_access_teaching(free_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "preview"
        assert access["preview_duration"] == 600

    def test_preview_teaching_paid_user_gets_full_access(self):
        """Test that paid members get full access to PREVIEW teachings."""
        teaching = Teaching(
            slug="preview-teaching",
            title="Preview Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PREVIEW,
            preview_duration=600,
        )

        pragyani_user = User(
            email="pragyani@test.com",
            name="Pragyani User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )

        access = user_can_access_teaching(pragyani_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"
        assert access["preview_duration"] is None

    def test_preview_teaching_no_user_denied(self):
        """Test that unauthenticated users cannot access PREVIEW teachings."""
        teaching = Teaching(
            slug="preview-teaching",
            title="Preview Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PREVIEW,
        )

        access = user_can_access_teaching(None, teaching)
        assert access["can_access"] is False
        assert access["access_type"] == "none"

    def test_pragyani_teaching_pragyani_user_access(self):
        """Test that PRAGYANI users can access PRAGYANI teachings."""
        teaching = Teaching(
            slug="pragyani-teaching",
            title="Pragyani Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI,
        )

        pragyani_user = User(
            email="pragyani@test.com",
            name="Pragyani User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )

        access = user_can_access_teaching(pragyani_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"

    def test_pragyani_teaching_pragyani_plus_user_access(self):
        """Test that PRAGYANI_PLUS users can access PRAGYANI teachings."""
        teaching = Teaching(
            slug="pragyani-teaching",
            title="Pragyani Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI,
        )

        pragyani_plus_user = User(
            email="pragyani_plus@test.com",
            name="Pragyani Plus User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI_PLUS,
        )

        access = user_can_access_teaching(pragyani_plus_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"

    def test_pragyani_teaching_free_user_denied(self):
        """Test that FREE users cannot access PRAGYANI teachings."""
        teaching = Teaching(
            slug="pragyani-teaching",
            title="Pragyani Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI,
        )

        free_user = User(
            email="free@test.com",
            name="Free User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )

        access = user_can_access_teaching(free_user, teaching)
        assert access["can_access"] is False
        assert access["access_type"] == "none"

    def test_pragyani_plus_teaching_pragyani_plus_user_access(self):
        """Test that PRAGYANI_PLUS users can access PRAGYANI_PLUS teachings."""
        teaching = Teaching(
            slug="pragyani-plus-teaching",
            title="Pragyani Plus Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI_PLUS,
        )

        pragyani_plus_user = User(
            email="pragyani_plus@test.com",
            name="Pragyani Plus User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI_PLUS,
        )

        access = user_can_access_teaching(pragyani_plus_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "full"

    def test_pragyani_plus_teaching_pragyani_user_denied(self):
        """Test that PRAGYANI users cannot access PRAGYANI_PLUS teachings."""
        teaching = Teaching(
            slug="pragyani-plus-teaching",
            title="Pragyani Plus Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI_PLUS,
        )

        pragyani_user = User(
            email="pragyani@test.com",
            name="Pragyani User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.PRAGYANI,
        )

        access = user_can_access_teaching(pragyani_user, teaching)
        assert access["can_access"] is False
        assert access["access_type"] == "none"

    def test_pragyani_plus_teaching_free_user_denied(self):
        """Test that FREE users cannot access PRAGYANI_PLUS teachings."""
        teaching = Teaching(
            slug="pragyani-plus-teaching",
            title="Pragyani Plus Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PRAGYANI_PLUS,
        )

        free_user = User(
            email="free@test.com",
            name="Free User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )

        access = user_can_access_teaching(free_user, teaching)
        assert access["can_access"] is False
        assert access["access_type"] == "none"

    def test_preview_duration_default(self):
        """Test that preview duration defaults to 300 seconds (5 min)."""
        teaching = Teaching(
            slug="preview-teaching",
            title="Preview Teaching",
            content_type=ContentType.VIDEO,
            access_level=AccessLevel.PREVIEW,
            preview_duration=None,  # No duration specified
        )

        free_user = User(
            email="free@test.com",
            name="Free User",
            password_hash="hash",
            membership_tier=MembershipTierEnum.FREE,
        )

        access = user_can_access_teaching(free_user, teaching)
        assert access["can_access"] is True
        assert access["access_type"] == "preview"
        assert access["preview_duration"] == 300  # Default 5 minutes
