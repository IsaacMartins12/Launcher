"""Application factory for the Flask app."""

import logging
import os
import sys

from flask import Flask, jsonify

from flaskr.config import config_by_name
from flaskr.extensions import cors, db, jwt


def create_app(config_name=None):
    """Create and configure the Flask application.

    Args:
        config_name: Configuration profile ('development' or 'production').

    Returns:
        Configured Flask application instance.
    """
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["development"]))

    # Configure logging
    _configure_logging(app)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True)

    # Register error handlers
    _register_error_handlers(app)

    # Register blueprints
    _register_blueprints(app)

    # Create tables if they don't exist (dev convenience)
    with app.app_context():
        db.create_all()

    app.logger.info("Application started in %s mode", config_name)
    return app


def _configure_logging(app):
    """Configure structured logging."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    ))

    app.logger.handlers = [handler]
    app.logger.setLevel(logging.INFO if not app.debug else logging.DEBUG)


def _register_error_handlers(app):
    """Register global error handlers that always return JSON."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Requisição inválida", "detail": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso não encontrado"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Método HTTP não permitido"}), 405

    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({"error": "Dados não processáveis", "detail": str(error)}), 422

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error("Internal Server Error: %s", error)
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


def _register_blueprints(app):
    """Register all route blueprints."""
    from flaskr.routes import auth_bp, student_bp, admin_bp, profile_bp, health_bp
    from flaskr.routes.notification import notification_bp
    from flaskr.routes.dashboard import dashboard_bp
    from flaskr.routes.institution import institution_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(institution_bp)
