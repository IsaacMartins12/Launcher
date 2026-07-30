"""Student routes — view and submit complementary hours."""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from flaskr.extensions import db
from flaskr.models import User, Registro, Category, Notification
from flaskr.schemas import SubmissionSchema

student_bp = Blueprint("student", __name__)

_submission_schema = SubmissionSchema()


@student_bp.route("/aluno", methods=["GET"])
@jwt_required()
def list_submissions():
    """List all active submissions for the authenticated student.

    Supports pagination via query params: ?page=1&per_page=20
    """
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    page = request.args.get("page", 1, type=int)
    per_page = min(
        request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"], type=int),
        current_app.config["MAX_PAGE_SIZE"],
    )

    query = Registro.active().filter_by(user_id=user.id).order_by(Registro.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "data": [r.to_dict() for r in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        },
    }), 200


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

    created = []
    for item in items:
        try:
            data = _submission_schema.load(item)
        except ValidationError as err:
            return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

        # Resolve category
        category_id = data.get("category_id")
        category = None
        if category_id:
            category = db.session.get(Category, category_id)
            if not category:
                return jsonify({"error": f"Categoria ID {category_id} não encontrada"}), 400

            # Block submission only if student already reached max approved hours
            approved_hours = db.session.query(
                db.func.coalesce(db.func.sum(Registro.hours), 0)
            ).filter(
                Registro.user_id == user.id,
                Registro.category_id == category.id,
                Registro.deleted_at.is_(None),
                Registro.status == "Aprovado",
            ).scalar()

            if approved_hours >= category.max_hours:
                return jsonify({
                    "error": f"Você já atingiu o limite de {category.max_hours}h aprovadas em '{category.name}'. "
                             f"Não é possível enviar mais atividades nesta categoria."
                }), 400

        certificate_raw = data.get("certificate", "")
        if isinstance(certificate_raw, list):
            certificate = ", ".join(certificate_raw)
        else:
            certificate = str(certificate_raw)

        registro = Registro(
            user_id=user.id,
            category_id=category_id,
            title=data["title"],
            type=category.name if category else data["type"],
            hours=data["hours"],
            certificate=certificate,
            status="Em Análise",
            created_at=datetime.now(timezone.utc),
        )
        db.session.add(registro)
        created.append(registro)

    db.session.commit()
    current_app.logger.info(
        "User %s created %d submission(s)", user.username, len(created)
    )

    # Notify all admins about new submissions
    admins = User.query.filter_by(is_admin=True).all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            message=f"{user.name} enviou {len(created)} atividade(s) para análise.",
            type="info",
        )
        db.session.add(notif)
    db.session.commit()

    return jsonify({"mensagem": "Dados salvos com sucesso!"}), 201


@student_bp.route("/aluno/<int:registro_id>", methods=["DELETE"])
@jwt_required()
def delete_submission(registro_id):
    """Soft-delete a submission (only if still pending)."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    registro = Registro.active().filter_by(id=registro_id, user_id=user.id).first()
    if not registro:
        return jsonify({"error": "Registro não encontrado"}), 404

    if registro.status != "Em Análise":
        return jsonify({"error": "Só é possível excluir registros pendentes"}), 400

    registro.soft_delete()
    db.session.commit()
    current_app.logger.info(
        "User %s soft-deleted registro %d", user.username, registro_id
    )
    return jsonify({"mensagem": "Registro removido com sucesso"}), 200


@student_bp.route("/aluno/<int:registro_id>", methods=["PUT"])
@jwt_required()
def update_submission(registro_id):
    """Update a submission (only if still pending)."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    registro = Registro.active().filter_by(id=registro_id, user_id=user.id).first()
    if not registro:
        return jsonify({"error": "Registro não encontrado"}), 404

    if registro.status != "Em Análise":
        return jsonify({"error": "Só é possível editar registros pendentes"}), 400

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    try:
        data = _submission_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    # Resolve category
    category_id = data.get("category_id")
    category = None
    if category_id:
        category = db.session.get(Category, category_id)
        if not category:
            return jsonify({"error": f"Categoria ID {category_id} não encontrada"}), 400

    registro.title = data["title"]
    registro.type = category.name if category else data["type"]
    registro.hours = data["hours"]
    registro.category_id = category_id

    certificate_raw = data.get("certificate", "")
    if isinstance(certificate_raw, list):
        registro.certificate = ", ".join(certificate_raw)
    else:
        registro.certificate = str(certificate_raw)

    registro.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({"mensagem": "Registro atualizado", "registro": registro.to_dict()}), 200


@student_bp.route("/aluno/<int:registro_id>/resubmit", methods=["POST"])
@jwt_required()
def resubmit(registro_id):
    """Resubmit a rejected submission (resets status to 'Em Análise')."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    registro = Registro.active().filter_by(id=registro_id, user_id=user.id).first()
    if not registro:
        return jsonify({"error": "Registro não encontrado"}), 404

    if registro.status != "Rejeitado":
        return jsonify({"error": "Só é possível reenviar registros rejeitados"}), 400

    registro.status = "Em Análise"
    registro.rejection_reason = None
    registro.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    current_app.logger.info(
        "User %s resubmitted registro %d", user.username, registro_id
    )
    return jsonify({"mensagem": "Reenviado para análise", "registro": registro.to_dict()}), 200


# ─── Helpers ────────────────────────────────────────────────────────────────────


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
