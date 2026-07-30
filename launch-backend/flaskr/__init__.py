"""Application factory for the Flask app."""

import os

from flask import Flask

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

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True)

    # Register blueprints
    _register_blueprints(app)

    # Create tables if they don't exist (dev convenience)
    with app.app_context():
        db.create_all()

    return app


def _register_blueprints(app):
    """Register all route blueprints."""
    from flaskr.routes import auth_bp, student_bp, admin_bp, profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(profile_bp)
