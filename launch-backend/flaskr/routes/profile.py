"""Profile routes — view and update user profile."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from flaskr.extensions import db
from flaskr.models import User

profile_bp = Blueprint("profile", __name__)


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

    data = request.get_json()

    name = data.get("name", "").strip()
    turma = data.get("turma", "").strip()

    if name:
        user.name = name
    if turma:
        user.turma = turma

    db.session.commit()
    return jsonify({"mensagem": "Perfil atualizado com sucesso!", "user": user.to_dict()}), 200


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
