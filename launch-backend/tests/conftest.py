"""Test configuration and shared fixtures.

This file sets up:
- A Flask app configured for testing (SQLite in-memory, no CSRF, etc.)
- A fresh database for each test function (isolation)
- Pre-seeded users, categories, and helper functions to get JWT tokens
"""

import pytest

from flaskr import create_app
from flaskr.extensions import db as _db
from flaskr.models import User, Category


class TestConfig:
    """Configuration for testing — uses SQLite in memory."""

    TESTING = True
    SECRET_KEY = "test-secret"
    JWT_SECRET_KEY = "test-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100


@pytest.fixture(scope="function")
def app():
    """Create a fresh application for each test."""
    application = create_app.__wrapped__(None) if hasattr(create_app, "__wrapped__") else None

    # Build the app manually to inject TestConfig
    from flask import Flask
    from flasgger import Swagger
    from flaskr.extensions import db, jwt, cors
    from flaskr.swagger_config import SWAGGER_TEMPLATE, SWAGGER_CONFIG

    application = Flask(__name__)
    application.config.from_object(TestConfig)

    db.init_app(application)
    jwt.init_app(application)
    cors.init_app(application)

    # Register blueprints
    from flaskr.routes import auth_bp, student_bp, admin_bp, profile_bp, health_bp
    from flaskr.routes.notification import notification_bp
    from flaskr.routes.dashboard import dashboard_bp

    application.register_blueprint(auth_bp)
    application.register_blueprint(student_bp)
    application.register_blueprint(admin_bp)
    application.register_blueprint(profile_bp)
    application.register_blueprint(health_bp)
    application.register_blueprint(notification_bp)
    application.register_blueprint(dashboard_bp)

    # Register error handlers
    from flask import jsonify

    @application.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Requisição inválida", "detail": str(error)}), 400

    @application.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso não encontrado"}), 404

    @application.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Método HTTP não permitido"}), 405

    @application.errorhandler(422)
    def unprocessable(error):
        return jsonify({"error": "Dados não processáveis", "detail": str(error)}), 422

    @application.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

    with application.app_context():
        db.create_all()
        _seed_data(db)

    yield application

    # Cleanup
    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    """Test client for making HTTP requests."""
    return app.test_client()


@pytest.fixture()
def db_session(app):
    """Direct database session access for assertions."""
    with app.app_context():
        yield _db.session


def _seed_data(db):
    """Seed test database with baseline data."""
    # Students
    student1 = User(name="Maria Clara Santos", turma="3AE", username="170819", is_admin=False)
    student1.set_password("1234")

    student2 = User(name="João Pedro Oliveira", turma="3BE", username="170821", is_admin=False)
    student2.set_password("1234")

    # Admin
    admin = User(name="Prof. Carlos Diretor", turma="Coordenação", username="170820", is_admin=True)
    admin.set_password("123")

    db.session.add_all([student1, student2, admin])
    db.session.commit()

    # Categories
    categories = [
        Category(name="Curso", max_hours=80, weight=1.0, description="Cursos livres"),
        Category(name="Palestra", max_hours=40, weight=0.8, description="Participação em palestras"),
        Category(name="Workshop", max_hours=60, weight=1.0, description="Oficinas práticas"),
        Category(name="Monitoria", max_hours=100, weight=1.5, description="Atuação como monitor"),
    ]
    db.session.add_all(categories)
    db.session.commit()


# ─── Helper functions ──────────────────────────────────────────────────────────


def get_student_token(client):
    """Login as student and return JWT token."""
    resp = client.post("/login", json={"username": "170819", "password": "1234"})
    return resp.get_json()["token"]


def get_admin_token(client):
    """Login as admin and return JWT token."""
    resp = client.post("/login", json={"username": "170820", "password": "123"})
    return resp.get_json()["token"]


def auth_header(token):
    """Build Authorization header dict."""
    return {"Authorization": f"Bearer {token}"}
