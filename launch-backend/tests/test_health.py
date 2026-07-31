"""Tests for health check endpoint."""


class TestHealthCheck:
    """GET /health"""

    def test_health_returns_200(self, client):
        """Health check returns 200 when app is running."""
        resp = client.get("/health")
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    def test_health_no_auth_required(self, client):
        """Health check does not require authentication."""
        resp = client.get("/health")
        # Should not be 401
        assert resp.status_code == 200
