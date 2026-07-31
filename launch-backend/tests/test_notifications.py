"""Tests for notification routes."""

from tests.conftest import get_student_token, get_admin_token, auth_header


class TestListNotifications:
    """GET /notifications"""

    def test_list_empty(self, client):
        """User with no notifications gets empty list."""
        token = get_student_token(client)
        resp = client.get("/notifications", headers=auth_header(token))
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["notifications"] == []
        assert data["unread_count"] == 0

    def test_list_requires_auth(self, client):
        """Notifications require authentication."""
        resp = client.get("/notifications")
        assert resp.status_code == 401

    def test_notifications_created_on_approval(self, client):
        """Student receives notification when submission is approved."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Student submits
        client.post("/files", json={
            "title": "Testar Notif", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        # Admin approves
        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        client.put("/inst", json={
            "id_certificate": reg_id, "status": "Aprovado",
        }, headers=auth_header(admin_token))

        # Student checks notifications
        resp = client.get("/notifications", headers=auth_header(student_token))
        data = resp.get_json()

        assert data["unread_count"] >= 1
        assert any("aprovada" in n["message"] for n in data["notifications"])

    def test_notifications_created_on_rejection(self, client):
        """Student receives notification when submission is rejected."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Rejeitar Notif", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        client.put("/inst", json={
            "id_certificate": reg_id,
            "status": "Rejeitado",
            "rejection_reason": "Sem assinatura",
        }, headers=auth_header(admin_token))

        resp = client.get("/notifications", headers=auth_header(student_token))
        data = resp.get_json()

        assert any("rejeitada" in n["message"] for n in data["notifications"])
        assert any("Sem assinatura" in n["message"] for n in data["notifications"])

    def test_admin_gets_notification_on_submission(self, client):
        """Admin receives notification when student submits."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Novo Envio", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/notifications", headers=auth_header(admin_token))
        data = resp.get_json()

        assert data["unread_count"] >= 1
        assert any("para análise" in n["message"] for n in data["notifications"])


class TestMarkAsRead:
    """PUT /notifications/:id/read and PUT /notifications/read-all"""

    def test_mark_single_as_read(self, client):
        """Mark a single notification as read."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Generate notification
        client.post("/files", json={
            "title": "Gerar Notif", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        # Admin has notification now
        resp = client.get("/notifications", headers=auth_header(admin_token))
        notif_id = resp.get_json()["notifications"][0]["id"]

        # Mark as read
        resp = client.put(f"/notifications/{notif_id}/read", headers=auth_header(admin_token))
        assert resp.status_code == 200

        # Verify
        resp = client.get("/notifications", headers=auth_header(admin_token))
        assert resp.get_json()["unread_count"] == 0

    def test_mark_all_as_read(self, client):
        """Mark all notifications as read."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Generate multiple notifications
        client.post("/files", json=[
            {"title": "A", "type": "Curso", "hours": 10, "category_id": 1},
            {"title": "B", "type": "Curso", "hours": 20, "category_id": 1},
        ], headers=auth_header(student_token))

        # Mark all as read
        resp = client.put("/notifications/read-all", headers=auth_header(admin_token))
        assert resp.status_code == 200

        # Verify
        resp = client.get("/notifications", headers=auth_header(admin_token))
        assert resp.get_json()["unread_count"] == 0

    def test_mark_nonexistent_notification(self, client):
        """Cannot mark non-existent notification as read."""
        token = get_student_token(client)
        resp = client.put("/notifications/9999/read", headers=auth_header(token))

        assert resp.status_code == 404
