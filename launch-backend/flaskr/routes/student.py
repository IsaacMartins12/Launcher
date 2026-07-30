"""Student routes — view and submit complementary hours."""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from flaskr.extensions import db
from flaskr.models import User, Registro

student_bp = Blueprint("student", __name__)


@student_bp.route("/aluno", methods=["GET"])
@jwt_required()
def list_submissions():
    """List all submissions for the authenticated student."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    registros = Registro.query.filter_by(user_id=user.id).order_by(Registro.created_at.desc()).all()
    return jsonify([r.to_dict() for r in registros]), 200


@student_bp.route("/files", methods=["POST"])
@jwt_required()
def create_submissions():
    """Create one or more complementary hour submissions."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload = request.get_json()

    # Accept single object or array
    items = payload if isinstance(payload, list) else [payload]

    if not items:
        return jsonify({"error": "Nenhum registro enviado"}), 400

    for item in items:
        title = item.get("title", "").strip()
        activity_type = item.get("type", "").strip()
        hours = item.get("hours")

        if not title or not activity_type or not hours:
            return jsonify({"error": "Campos obrigatórios: title, type, hours"}), 400

        certificate_raw = item.get("certificate", "")
        if isinstance(certificate_raw, list):
            certificate = ", ".join(certificate_raw)
        else:
            certificate = str(certificate_raw)

        registro = Registro(
            user_id=user.id,
            title=title,
            type=activity_type,
            hours=int(hours),
            certificate=certificate,
            status="Em Análise",
            created_at=datetime.now(timezone.utc),
        )
        db.session.add(registro)

    db.session.commit()
    return jsonify({"mensagem": "Dados salvos com sucesso!"}), 201


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
