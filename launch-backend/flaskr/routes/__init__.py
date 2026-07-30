"""Routes package.

All blueprints are registered here for clean import in the factory.
"""

from flaskr.routes.auth import auth_bp
from flaskr.routes.student import student_bp
from flaskr.routes.admin import admin_bp
from flaskr.routes.profile import profile_bp

__all__ = ["auth_bp", "student_bp", "admin_bp", "profile_bp"]
