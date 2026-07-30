"""Profile routes — view and update user profile."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from flaskr.extensions import db
from flaskr.models import User
from flaskr.schemas import ProfileUpdateSchema

profile_bp = Blueprint("profile", __name__)

_profile_schema = ProfileUpdateSchema()


@profile_bp.route("/perfil", methods=["GET"])
@jwt_required()
def get_profile():
    """Return the authenticated user's profile."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify(user.to_dict()), 200


@profile_bp.route("/perfil", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update the authenticated user's profile (name, turma)."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    try:
        data = _profile_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    if data.get("name"):
        user.name = data["name"]
    if data.get("turma"):
        user.turma = data["turma"]

    db.session.commit()
    current_app.logger.info("User %s updated profile", user.username)
    return jsonify({"mensagem": "Perfil atualizado com sucesso!", "user": user.to_dict()}), 200


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
