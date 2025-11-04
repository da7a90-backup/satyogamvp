"""Integration tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_user(self, client: TestClient):
        """Test user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "name": "New User",
                "password": "password123",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client: TestClient, test_user):
        """Test that duplicate email registration fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "name": "Another User",
                "password": "password123",
            },
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_login_success(self, client: TestClient, test_user):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "testpass123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_wrong_password(self, client: TestClient, test_user):
        """Test login with wrong password."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "wrongpassword",
            },
        )

        assert response.status_code == 401

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with nonexistent user."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nobody@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == 401

    def test_get_current_user(self, client: TestClient, test_user, auth_headers):
        """Test getting current user info."""
        response = client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["name"] == test_user.name
        assert data["membership_tier"] == test_user.membership_tier.value

    def test_get_current_user_without_auth(self, client: TestClient):
        """Test that /me requires authentication."""
        response = client.get("/api/auth/me")

        assert response.status_code == 403  # No auth header
