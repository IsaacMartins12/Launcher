"""Tests for dashboard routes — admin and student metrics."""

from tests.conftest import get_student_token, get_admin_token, auth_header


class TestAdminDashboard:
    """GET /dashboard/admin"""

    def test_admin_dashboard_empty(self, client):
        """Admin dashboard works even with no submissions."""
        token = get_admin_token(client)
        resp = client.get("/dashboard/admin", headers=auth_header(token))
        data = resp.get_json()

        assert resp.status_code == 200
        assert "overview" in data
        assert "categories" in data
        assert "students" in data
        assert data["overview"]["total_submissions"] == 0

    def test_admin_dashboard_with_data(self, client):
        """Admin dashboard reflects submitted data."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Create submissions
        client.post("/files", json={
            "title": "Curso A", "type": "Curso", "hours": 30, "category_id": 1,
        }, headers=auth_header(student_token))

        client.post("/files", json={
            "title": "Palestra B", "type": "Palestra", "hours": 4, "category_id": 2,
        }, headers=auth_header(student_token))

        resp = client.get("/dashboard/admin", headers=auth_header(admin_token))
        data = resp.get_json()

        assert data["overview"]["total_submissions"] == 2
        assert data["overview"]["pending"] == 2

    def test_admin_dashboard_student_denied(self, client):
        """Student cannot access admin dashboard."""
        token = get_student_token(client)
        resp = client.get("/dashboard/admin", headers=auth_header(token))

        assert resp.status_code == 403

    def test_admin_dashboard_approval_rate(self, client, db_session, app):
        """Approval rate is calculated correctly."""
        student_token = get_student_token(client)
        admin_token = get_admin_token(client)

        # Create 2 submissions
        client.post("/files", json={
            "title": "A", "type": "Curso", "hours": 10, "category_id": 1,
        }, headers=auth_header(student_token))
        client.post("/files", json={
            "title": "B", "type": "Curso", "hours": 20, "category_id": 1,
        }, headers=auth_header(student_token))

        # Approve one, reject other
        with app.app_context():
            from flaskr.models import Registro
            regs = Registro.query.all()
            regs[0].status = "Aprovado"
            regs[1].status = "Rejeitado"
            db_session.commit()

        resp = client.get("/dashboard/admin", headers=auth_header(admin_token))
        data = resp.get_json()

        assert data["overview"]["approved"] == 1
        assert data["overview"]["rejected"] == 1
        assert data["overview"]["approval_rate"] == 50.0


class TestStudentDashboard:
    """GET /dashboard/student"""

    def test_student_dashboard_empty(self, client):
        """Student dashboard works with no submissions."""
        token = get_student_token(client)
        resp = client.get("/dashboard/student", headers=auth_header(token))
        data = resp.get_json()

        assert resp.status_code == 200
        assert "overview" in data
        assert "categories" in data
        assert data["overview"]["total_submissions"] == 0
        assert data["overview"]["goal_percentage"] == 0

    def test_student_dashboard_with_submissions(self, client, db_session, app):
        """Student dashboard shows correct progress after approval."""
        student_token = get_student_token(client)

        client.post("/files", json={
            "title": "Curso Python", "type": "Curso", "hours": 40, "category_id": 1,
        }, headers=auth_header(student_token))

        # Approve it
        with app.app_context():
            from flaskr.models import Registro
            reg = Registro.query.first()
            reg.status = "Aprovado"
            db_session.commit()

        resp = client.get("/dashboard/student", headers=auth_header(student_token))
        data = resp.get_json()

        assert data["overview"]["approved_hours"] == 40
        assert data["overview"]["approved"] == 1
        # 40/200 * 100 = 20%
        assert data["overview"]["goal_percentage"] == 20.0

    def test_student_dashboard_category_progress(self, client, db_session, app):
        """Category progress shows remaining hours correctly."""
        student_token = get_student_token(client)

        client.post("/files", json={
            "title": "Monitoria", "type": "Monitoria", "hours": 60, "category_id": 4,
        }, headers=auth_header(student_token))

        with app.app_context():
            from flaskr.models import Registro
            reg = Registro.query.first()
            reg.status = "Aprovado"
            db_session.commit()

        resp = client.get("/dashboard/student", headers=auth_header(student_token))
        categories = resp.get_json()["categories"]

        monitoria = next(c for c in categories if c["category"] == "Monitoria")
        assert monitoria["approved_hours"] == 60
        assert monitoria["remaining"] == 40  # max 100 - 60
        assert monitoria["percentage"] == 60.0

    def test_dashboard_requires_auth(self, client):
        """Dashboard endpoints require authentication."""
        resp = client.get("/dashboard/admin")
        assert resp.status_code == 401

        resp = client.get("/dashboard/student")
        assert resp.status_code == 401
