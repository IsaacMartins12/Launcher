"""Health check route for monitoring and container orchestration."""

from flask import Blueprint, jsonify
from sqlalchemy import text

from flaskr.extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Check application and database health.
    ---
    tags:
      - Health
    security: []
    responses:
      200:
        description: System is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            database:
              type: string
              example: connected
      503:
        description: System is unhealthy
    """
    status = {"status": "healthy", "database": "connected"}

    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        status["status"] = "unhealthy"
        status["database"] = "disconnected"
        return jsonify(status), 503

    return jsonify(status), 200
