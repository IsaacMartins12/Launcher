"""Authentication routes (login/logout)."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from flaskr.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Campos obrigatórios: username, password"}), 400

    user = User.query.filter_by(username=username, password=password).first()

    if not user:
        return jsonify({
            "is_Logged": False,
            "is_Admin": False,
            "token": "",
        }), 401

    access_token = create_access_token(identity=user.username)

    return jsonify({
        "is_Logged": True,
        "is_Admin": bool(user.is_admin),
        "token": access_token,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout endpoint (stateless — client discards token)."""
    return jsonify({"logout": True}), 200
