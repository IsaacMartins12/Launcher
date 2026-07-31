"""Tests for student routes — submissions CRUD."""

from tests.conftest import get_student_token, get_admin_token, auth_header


class TestListSubmissions:
    """GET /aluno"""

    def test_list_empty(self, client):
        """Student with no submissions gets empty list."""
        token = get_student_token(client)
        resp = client.get("/aluno", headers=auth_header(token))
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["data"] == []
        assert data["pagination"]["total"] == 0

    def test_list_requires_auth(self, client):
        """Endpoint rejects unauthenticated requests."""
        resp = client.get("/aluno")

        assert resp.status_code == 401

    def test_list_with_submissions(self, client):
        """Student sees own submissions after creating them."""
        token = get_student_token(client)

        # Create a submission first
        client.post("/files", json={
            "title": "Curso Python",
            "type": "Curso",
            "hours": 40,
            "category_id": 1,
        }, headers=auth_header(token))

        resp = client.get("/aluno", headers=auth_header(token))
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["pagination"]["total"] == 1
        assert data["data"][0]["title"] == "Curso Python"

    def test_filter_by_status(self, client):
        """Filter submissions by status."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "Atividade 1",
            "type": "Curso",
            "hours": 10,
            "category_id": 1,
        }, headers=auth_header(token))

        # All new submissions are "Em Análise"
        resp = client.get("/aluno?status=Aprovado", headers=auth_header(token))
        assert resp.get_json()["pagination"]["total"] == 0

        resp = client.get("/aluno?status=Em Análise", headers=auth_header(token))
        assert resp.get_json()["pagination"]["total"] == 1

    def test_search_by_title(self, client):
        """Search submissions by title."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "Docker Workshop",
            "type": "Workshop",
            "hours": 20,
            "category_id": 3,
        }, headers=auth_header(token))

        resp = client.get("/aluno?search=Docker", headers=auth_header(token))
        assert resp.get_json()["pagination"]["total"] == 1

        resp = client.get("/aluno?search=Java", headers=auth_header(token))
        assert resp.get_json()["pagination"]["total"] == 0


class TestCreateSubmission:
    """POST /files"""

    def test_create_single(self, client):
        """Create a single submission successfully."""
        token = get_student_token(client)
        resp = client.post("/files", json={
            "title": "Curso de Flask",
            "type": "Curso",
            "hours": 30,
            "certificate": "flask-cert.pdf",
            "category_id": 1,
        }, headers=auth_header(token))

        assert resp.status_code == 201
        assert "Dados salvos" in resp.get_json()["mensagem"]

    def test_create_multiple(self, client):
        """Create multiple submissions in a single request."""
        token = get_student_token(client)
        resp = client.post("/files", json=[
            {"title": "Curso A", "type": "Curso", "hours": 10, "category_id": 1},
            {"title": "Curso B", "type": "Curso", "hours": 20, "category_id": 1},
        ], headers=auth_header(token))

        assert resp.status_code == 201

    def test_create_requires_auth(self, client):
        """Submission creation requires authentication."""
        resp = client.post("/files", json={
            "title": "Test", "type": "Curso", "hours": 10
        })

        assert resp.status_code == 401

    def test_create_invalid_hours(self, client):
        """Reject submission with zero or negative hours."""
        token = get_student_token(client)
        resp = client.post("/files", json={
            "title": "Invalid",
            "type": "Curso",
            "hours": 0,
            "category_id": 1,
        }, headers=auth_header(token))

        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_create_missing_title(self, client):
        """Reject submission without title."""
        token = get_student_token(client)
        resp = client.post("/files", json={
            "type": "Curso",
            "hours": 20,
        }, headers=auth_header(token))

        assert resp.status_code == 400

    def test_create_invalid_category(self, client):
        """Reject submission with non-existent category."""
        token = get_student_token(client)
        resp = client.post("/files", json={
            "title": "Test",
            "type": "Curso",
            "hours": 10,
            "category_id": 9999,
        }, headers=auth_header(token))

        assert resp.status_code == 400
        assert "não encontrada" in resp.get_json()["error"]

    def test_create_notifies_admin(self, client):
        """Creating a submission generates notification for admin."""
        token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Novo Curso",
            "type": "Curso",
            "hours": 20,
            "category_id": 1,
        }, headers=auth_header(token))

        # Check admin notifications
        resp = client.get("/notifications", headers=auth_header(admin_token))
        notifications = resp.get_json()["notifications"]

        assert len(notifications) > 0
        assert "Maria Clara Santos" in notifications[0]["message"]

    def test_create_blocked_when_category_limit_reached(self, client, db_session, app):
        """Block submission when student already reached max approved hours in category."""
        token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Create and approve submissions totaling 80h (Curso max = 80)
        client.post("/files", json={
            "title": "Curso 1", "type": "Curso", "hours": 80, "category_id": 1,
        }, headers=auth_header(token))

        # Approve it as admin
        with app.app_context():
            from flaskr.models import Registro
            reg = Registro.query.first()
            reg.status = "Aprovado"
            db_session.commit()

        # Try submitting again — should be blocked
        resp = client.post("/files", json={
            "title": "Curso 2", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(token))

        assert resp.status_code == 400
        assert "limite" in resp.get_json()["error"].lower()


class TestDeleteSubmission:
    """DELETE /aluno/:id"""

    def test_delete_pending(self, client):
        """Student can delete a pending submission."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "To Delete", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(token))

        # Get submission ID
        resp = client.get("/aluno", headers=auth_header(token))
        submission_id = resp.get_json()["data"][0]["id"]

        # Delete it
        resp = client.delete(f"/aluno/{submission_id}", headers=auth_header(token))
        assert resp.status_code == 200
        assert "removido" in resp.get_json()["mensagem"].lower()

        # Confirm it's gone from list
        resp = client.get("/aluno", headers=auth_header(token))
        assert resp.get_json()["pagination"]["total"] == 0

    def test_delete_nonexistent(self, client):
        """Cannot delete submission that doesn't exist."""
        token = get_student_token(client)
        resp = client.delete("/aluno/9999", headers=auth_header(token))

        assert resp.status_code == 404


class TestUpdateSubmission:
    """PUT /aluno/:id"""

    def test_update_pending(self, client):
        """Student can edit a pending submission."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "Original", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(token))

        resp = client.get("/aluno", headers=auth_header(token))
        submission_id = resp.get_json()["data"][0]["id"]

        resp = client.put(f"/aluno/{submission_id}", json={
            "title": "Updated Title",
            "type": "Curso",
            "hours": 25,
            "category_id": 1,
        }, headers=auth_header(token))

        assert resp.status_code == 200
        assert resp.get_json()["registro"]["title"] == "Updated Title"
        assert resp.get_json()["registro"]["hours"] == 25


class TestResubmit:
    """POST /aluno/:id/resubmit"""

    def test_resubmit_rejected(self, client, db_session, app):
        """Student can resubmit a rejected submission."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "Rejected One", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(token))

        # Manually reject it
        with app.app_context():
            from flaskr.models import Registro
            reg = Registro.query.first()
            reg.status = "Rejeitado"
            reg.rejection_reason = "Motivo teste"
            db_session.commit()
            reg_id = reg.id

        resp = client.post(f"/aluno/{reg_id}/resubmit", headers=auth_header(token))

        assert resp.status_code == 200
        assert resp.get_json()["registro"]["status"] == "Em Análise"

    def test_resubmit_non_rejected_fails(self, client):
        """Cannot resubmit a submission that is not rejected."""
        token = get_student_token(client)

        client.post("/files", json={
            "title": "Pending One", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(token))

        resp = client.get("/aluno", headers=auth_header(token))
        submission_id = resp.get_json()["data"][0]["id"]

        resp = client.post(f"/aluno/{submission_id}/resubmit", headers=auth_header(token))

        assert resp.status_code == 400
        assert "rejeitados" in resp.get_json()["error"].lower()
