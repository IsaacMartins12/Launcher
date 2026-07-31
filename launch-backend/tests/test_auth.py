"""Tests for authentication routes (login/logout)."""

from tests.conftest import get_student_token, auth_header


class TestLogin:
    """POST /login"""

    def test_login_success_student(self, client):
        """Student logs in with valid credentials."""
        resp = client.post("/login", json={"username": "170819", "password": "1234"})
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["is_Logged"] is True
        assert data["is_Admin"] is False
        assert len(data["token"]) > 0

    def test_login_success_admin(self, client):
        """Admin logs in with valid credentials."""
        resp = client.post("/login", json={"username": "170820", "password": "123"})
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["is_Logged"] is True
        assert data["is_Admin"] is True
        assert len(data["token"]) > 0

    def test_login_wrong_password(self, client):
        """Login fails with incorrect password."""
        resp = client.post("/login", json={"username": "170819", "password": "wrong"})
        data = resp.get_json()

        assert resp.status_code == 401
        assert data["is_Logged"] is False
        assert data["token"] == ""

    def test_login_nonexistent_user(self, client):
        """Login fails for username that doesn't exist."""
        resp = client.post("/login", json={"username": "999999", "password": "1234"})

        assert resp.status_code == 401
        assert resp.get_json()["is_Logged"] is False

    def test_login_missing_fields(self, client):
        """Login fails when required fields are missing."""
        resp = client.post("/login", json={"username": "170819"})

        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_login_empty_username(self, client):
        """Login fails with empty username."""
        resp = client.post("/login", json={"username": "", "password": "1234"})

        assert resp.status_code == 400

    def test_login_not_json(self, client):
        """Login fails when Content-Type is not JSON."""
        resp = client.post("/login", data="username=170819&password=1234")

        assert resp.status_code == 400
        assert "Content-Type" in resp.get_json()["error"]


class TestLogout:
    """POST /logout"""

    def test_logout_success(self, client):
        """Logout always returns success (stateless)."""
        resp = client.post("/logout")
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["logout"] is True
