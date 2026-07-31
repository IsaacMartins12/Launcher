"""Tests for admin routes — submission review and category management."""

from tests.conftest import get_student_token, get_admin_token, auth_header


class TestListAllSubmissions:
    """GET /inst"""

    def test_admin_can_list(self, client):
        """Admin can list all submissions."""
        token = get_admin_token(client)
        resp = client.get("/inst", headers=auth_header(token))

        assert resp.status_code == 200
        assert "data" in resp.get_json()
        assert "pagination" in resp.get_json()

    def test_student_cannot_list(self, client):
        """Student is denied access to admin list."""
        token = get_student_token(client)
        resp = client.get("/inst", headers=auth_header(token))

        assert resp.status_code == 403

    def test_filter_by_status(self, client):
        """Admin can filter by status."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Create a submission
        client.post("/files", json={
            "title": "Curso Test", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst?status=Em Análise", headers=auth_header(admin_token))
        assert resp.get_json()["pagination"]["total"] == 1

        resp = client.get("/inst?status=Aprovado", headers=auth_header(admin_token))
        assert resp.get_json()["pagination"]["total"] == 0

    def test_search_by_name(self, client):
        """Admin can search submissions by student name."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Curso X", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst?search=Maria", headers=auth_header(admin_token))
        assert resp.get_json()["pagination"]["total"] == 1

        resp = client.get("/inst?search=ZZZ", headers=auth_header(admin_token))
        assert resp.get_json()["pagination"]["total"] == 0


class TestUpdateStatus:
    """PUT /inst"""

    def test_approve_submission(self, client):
        """Admin can approve a pending submission."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Aprovar Este", "type": "Curso", "hours": 20, "category_id": 1,
        }, headers=auth_header(student_token))

        # Get submission ID
        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        # Approve
        resp = client.put("/inst", json={
            "id_certificate": reg_id,
            "status": "Aprovado",
        }, headers=auth_header(admin_token))

        assert resp.status_code == 200
        assert resp.get_json()["registro"]["status"] == "Aprovado"

    def test_reject_with_reason(self, client):
        """Admin can reject with a reason."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Rejeitar Este", "type": "Curso", "hours": 20, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        resp = client.put("/inst", json={
            "id_certificate": reg_id,
            "status": "Rejeitado",
            "rejection_reason": "Certificado ilegível",
        }, headers=auth_header(admin_token))

        assert resp.status_code == 200
        assert resp.get_json()["registro"]["status"] == "Rejeitado"
        assert resp.get_json()["registro"]["rejection_reason"] == "Certificado ilegível"

    def test_revert_decision(self, client):
        """Admin can revert an approved submission back to pending."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Reverter", "type": "Curso", "hours": 20, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        # Approve first
        client.put("/inst", json={
            "id_certificate": reg_id, "status": "Aprovado",
        }, headers=auth_header(admin_token))

        # Revert
        resp = client.put("/inst", json={
            "id_certificate": reg_id, "status": "Em Análise",
        }, headers=auth_header(admin_token))

        assert resp.status_code == 200
        assert resp.get_json()["registro"]["status"] == "Em Análise"

    def test_approve_notifies_student(self, client):
        """Approving a submission creates a notification for the student."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        client.post("/files", json={
            "title": "Notificar", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        client.put("/inst", json={
            "id_certificate": reg_id, "status": "Aprovado",
        }, headers=auth_header(admin_token))

        # Check student notifications
        resp = client.get("/notifications", headers=auth_header(student_token))
        notifications = resp.get_json()["notifications"]

        assert any("aprovada" in n["message"] for n in notifications)

    def test_student_cannot_update_status(self, client):
        """Student cannot change submission status."""
        student_token = get_student_token(client)

        resp = client.put("/inst", json={
            "id_certificate": 1, "status": "Aprovado",
        }, headers=auth_header(student_token))

        assert resp.status_code == 403

    def test_update_nonexistent_registro(self, client):
        """Updating a non-existent submission returns 404."""
        admin_token = get_admin_token(client)

        resp = client.put("/inst", json={
            "id_certificate": 9999, "status": "Aprovado",
        }, headers=auth_header(admin_token))

        assert resp.status_code == 404

    def test_approval_warning_over_limit(self, client):
        """Admin gets warning when approval exceeds category limit."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Submit 90h for Curso (max 80h)
        client.post("/files", json={
            "title": "Curso Grande", "type": "Curso", "hours": 90, "category_id": 1,
        }, headers=auth_header(student_token))

        resp = client.get("/inst", headers=auth_header(admin_token))
        reg_id = resp.get_json()["data"][0]["id"]

        resp = client.put("/inst", json={
            "id_certificate": reg_id, "status": "Aprovado",
        }, headers=auth_header(admin_token))

        assert resp.status_code == 200
        assert "warning" in resp.get_json()


class TestCategories:
    """CRUD /categories"""

    def test_list_categories(self, client):
        """Any authenticated user can list categories."""
        token = get_student_token(client)
        resp = client.get("/categories", headers=auth_header(token))

        assert resp.status_code == 200
        categories = resp.get_json()
        assert len(categories) == 4  # seeded in conftest
        assert any(c["name"] == "Curso" for c in categories)

    def test_create_category_admin(self, client):
        """Admin can create a new category."""
        token = get_admin_token(client)
        resp = client.post("/categories", json={
            "name": "Estágio",
            "max_hours": 200,
            "weight": 2.0,
            "description": "Estágio obrigatório",
        }, headers=auth_header(token))

        assert resp.status_code == 201
        assert resp.get_json()["category"]["name"] == "Estágio"

    def test_create_category_student_denied(self, client):
        """Student cannot create categories."""
        token = get_student_token(client)
        resp = client.post("/categories", json={
            "name": "Hack", "max_hours": 999, "weight": 1.0,
        }, headers=auth_header(token))

        assert resp.status_code == 403

    def test_create_duplicate_category(self, client):
        """Cannot create category with existing name."""
        token = get_admin_token(client)
        resp = client.post("/categories", json={
            "name": "Curso", "max_hours": 50, "weight": 1.0,
        }, headers=auth_header(token))

        assert resp.status_code == 409

    def test_update_category(self, client):
        """Admin can update a category."""
        token = get_admin_token(client)
        resp = client.put("/categories/1", json={
            "name": "Curso Online",
            "max_hours": 100,
            "weight": 1.2,
        }, headers=auth_header(token))

        assert resp.status_code == 200
        assert resp.get_json()["category"]["name"] == "Curso Online"
        assert resp.get_json()["category"]["max_hours"] == 100

    def test_delete_category_no_registros(self, client):
        """Admin can delete a category with no linked submissions."""
        token = get_admin_token(client)

        # Create a new one to delete
        client.post("/categories", json={
            "name": "Temporária", "max_hours": 10, "weight": 1.0,
        }, headers=auth_header(token))

        # Find its ID
        resp = client.get("/categories", headers=auth_header(token))
        cat = next(c for c in resp.get_json() if c["name"] == "Temporária")

        resp = client.delete(f"/categories/{cat['id']}", headers=auth_header(token))
        assert resp.status_code == 200

    def test_delete_category_with_registros(self, client):
        """Cannot delete category that has linked submissions."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Create submission in category 1
        client.post("/files", json={
            "title": "Linked", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))

        # Try deleting category 1
        resp = client.delete("/categories/1", headers=auth_header(admin_token))
        assert resp.status_code == 409
        assert "vinculado" in resp.get_json()["error"].lower()

    def test_invalid_category_data(self, client):
        """Reject category with invalid data."""
        token = get_admin_token(client)

        # Zero hours
        resp = client.post("/categories", json={
            "name": "Invalid", "max_hours": 0, "weight": 1.0,
        }, headers=auth_header(token))
        assert resp.status_code == 400

        # Weight too high
        resp = client.post("/categories", json={
            "name": "Invalid2", "max_hours": 50, "weight": 10.0,
        }, headers=auth_header(token))
        assert resp.status_code == 400
