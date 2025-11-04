"""Unit tests for security functions."""
import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class TestPasswordHashing:
    """Test password hashing functions."""

    def test_password_hashing(self):
        """Test that password hashing works."""
        password = "mysecretpassword"
        hashed = get_password_hash(password)

        assert hashed != password
        assert hashed.startswith("$2b$")

    def test_password_verification(self):
        """Test that password verification works."""
        password = "mysecretpassword"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False


class TestJWTTokens:
    """Test JWT token functions."""

    def test_create_access_token(self):
        """Test creating an access token."""
        data = {"sub": "user123"}
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self):
        """Test creating a refresh token."""
        data = {"sub": "user123"}
        token = create_refresh_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token(self):
        """Test decoding an access token."""
        user_id = "user123"
        data = {"sub": user_id}
        token = create_access_token(data)

        decoded = decode_token(token)

        assert decoded is not None
        assert decoded["sub"] == user_id
        assert decoded["type"] == "access"

    def test_decode_refresh_token(self):
        """Test decoding a refresh token."""
        user_id = "user456"
        data = {"sub": user_id}
        token = create_refresh_token(data)

        decoded = decode_token(token)

        assert decoded is not None
        assert decoded["sub"] == user_id
        assert decoded["type"] == "refresh"

    def test_decode_invalid_token(self):
        """Test decoding an invalid token."""
        invalid_token = "invalid.token.here"
        decoded = decode_token(invalid_token)

        assert decoded is None
