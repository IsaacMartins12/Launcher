"""Tenant resolution utilities for multi-tenancy."""

from flask_jwt_extended import get_jwt_identity

from flaskr.models import User


def get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()


def get_tenant_id():
    """Get the institution_id of the currently authenticated user."""
    user = get_current_user()
    return user.institution_id if user else None
