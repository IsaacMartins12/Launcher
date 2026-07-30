"""Admin/Institution routes — review and approve/reject submissions."""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from flaskr.extensions import db
from flaskr.models import User, Registro
from flaskr.schemas import StatusUpdateSchema

admin_bp = Blueprint("admin", __name__)

_status_schema = StatusUpdateSchema()


@admin_bp.route("/inst", methods=["GET"])
@jwt_required()
def list_all_submissions():
    """List all active submissions (for admin review).

    Supports pagination via query params: ?page=1&per_page=20
    """
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = min(
        request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"], type=int),
        current_app.config["MAX_PAGE_SIZE"],
    )

    query = Registro.active().order_by(Registro.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "data": [r.to_dict(include_user=True) for r in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        },
    }), 200


@admin_bp.route("/inst", methods=["PUT"])
@jwt_required()
def update_submission_status():
    """Approve or reject a submission."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    try:
        data = _status_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    registro_id = data["id_certificate"]
    new_status = data["status"]

    registro = db.session.get(Registro, registro_id)
    if not registro or registro.is_deleted:
        return jsonify({"error": "Registro não encontrado"}), 404

    registro.status = new_status
    registro.rejection_reason = data.get("rejection_reason") if new_status == "Rejeitado" else None
    registro.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    admin_username = get_jwt_identity()
    current_app.logger.info(
        "Admin %s set registro %d to '%s'", admin_username, registro_id, new_status
    )

    return jsonify({"status": "Atualizado", "registro": registro.to_dict()}), 200


def _is_admin():
    """Check if the current user has admin privileges."""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    return user and user.is_admin
