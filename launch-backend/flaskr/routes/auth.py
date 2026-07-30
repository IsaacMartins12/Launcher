"""Authentication routes (login/logout)."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

from flaskr.models import User
from flaskr.schemas import LoginSchema

auth_bp = Blueprint("auth", __name__)

_login_schema = LoginSchema()


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    try:
        data = _login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    username = data["username"].strip()
    password = data["password"]

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        current_app.logger.warning("Login failed for username: %s", username)
        return jsonify({
            "is_Logged": False,
            "is_Admin": False,
            "token": "",
        }), 401

    access_token = create_access_token(identity=user.username)
    current_app.logger.info("User %s logged in successfully", username)

    return jsonify({
        "is_Logged": True,
        "is_Admin": bool(user.is_admin),
        "token": access_token,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout endpoint (stateless — client discards token)."""
    return jsonify({"logout": True}), 200
