"""Admin/Institution routes — review and approve/reject submissions."""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from flaskr.extensions import db
from flaskr.models import User, Registro

admin_bp = Blueprint("admin", __name__)

VALID_STATUSES = {"Aprovado", "Rejeitado"}


@admin_bp.route("/inst", methods=["GET"])
@jwt_required()
def list_all_submissions():
    """List all submissions (for admin review)."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    registros = Registro.query.order_by(Registro.created_at.desc()).all()
    return jsonify([r.to_dict(include_user=True) for r in registros]), 200


@admin_bp.route("/inst", methods=["PUT"])
@jwt_required()
def update_submission_status():
    """Approve or reject a submission."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    registro_id = data.get("id_certificate")
    new_status = data.get("status", "").strip()

    if not registro_id:
        return jsonify({"error": "Campo obrigatório: id_certificate"}), 400

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Status inválido. Use: {', '.join(VALID_STATUSES)}"}), 400

    registro = db.session.get(Registro, registro_id)
    if not registro:
        return jsonify({"error": "Registro não encontrado"}), 404

    registro.status = new_status
    registro.rejection_reason = data.get("rejection_reason") if new_status == "Rejeitado" else None
    registro.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify({"status": "Atualizado", "registro": registro.to_dict()}), 200


def _is_admin():
    """Check if the current user has admin privileges."""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    return user and user.is_admin
