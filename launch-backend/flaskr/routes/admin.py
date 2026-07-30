"""Admin/Institution routes — review, approve/reject submissions, manage categories."""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from flaskr.extensions import db
from flaskr.models import User, Registro, Category
from flaskr.schemas import StatusUpdateSchema, CategorySchema

admin_bp = Blueprint("admin", __name__)

_status_schema = StatusUpdateSchema()
_category_schema = CategorySchema()


# ─── Submissions ────────────────────────────────────────────────────────────────


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
    """Approve, reject, or revert a submission status."""
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

    # Warn admin if approval exceeds category limit
    warning = None
    if new_status == "Aprovado" and registro.category_id:
        category = registro.category
        if category:
            approved_hours = db.session.query(
                db.func.coalesce(db.func.sum(Registro.hours), 0)
            ).filter(
                Registro.user_id == registro.user_id,
                Registro.category_id == category.id,
                Registro.deleted_at.is_(None),
                Registro.status == "Aprovado",
            ).scalar()

            if approved_hours > category.max_hours:
                warning = (
                    f"Atenção: o aluno agora tem {approved_hours}h aprovadas em '{category.name}' "
                    f"(limite: {category.max_hours}h). Apenas {category.max_hours}h serão contabilizadas."
                )

    response = {"status": "Atualizado", "registro": registro.to_dict()}
    if warning:
        response["warning"] = warning

    return jsonify(response), 200


# ─── Categories CRUD ────────────────────────────────────────────────────────────


@admin_bp.route("/categories", methods=["GET"])
@jwt_required()
def list_categories():
    """List all activity categories (available to all authenticated users)."""
    categories = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in categories]), 200


@admin_bp.route("/categories", methods=["POST"])
@jwt_required()
def create_category():
    """Create a new activity category (admin only)."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    try:
        data = _category_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    # Check if name already exists
    existing = Category.query.filter_by(name=data["name"]).first()
    if existing:
        return jsonify({"error": f"Categoria '{data['name']}' já existe"}), 409

    category = Category(
        name=data["name"],
        max_hours=data["max_hours"],
        weight=data.get("weight", 1.0),
        description=data.get("description"),
    )
    db.session.add(category)
    db.session.commit()

    current_app.logger.info("Admin created category: %s", category.name)
    return jsonify({"mensagem": "Categoria criada", "category": category.to_dict()}), 201


@admin_bp.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id):
    """Update an existing category (admin only)."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Categoria não encontrada"}), 404

    try:
        data = _category_schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({"error": "Dados inválidos", "detail": err.messages}), 400

    if "name" in data:
        category.name = data["name"]
    if "max_hours" in data:
        category.max_hours = data["max_hours"]
    if "weight" in data:
        category.weight = data["weight"]
    if "description" in data:
        category.description = data["description"]

    db.session.commit()
    return jsonify({"mensagem": "Categoria atualizada", "category": category.to_dict()}), 200


@admin_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    """Delete a category (admin only). Fails if registros are linked."""
    if not _is_admin():
        return jsonify({"error": "Acesso negado"}), 403

    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Categoria não encontrada"}), 404

    # Check if any registros use this category
    linked_count = Registro.active().filter_by(category_id=category_id).count()
    if linked_count > 0:
        return jsonify({
            "error": f"Não é possível excluir: {linked_count} registro(s) vinculado(s)"
        }), 409

    db.session.delete(category)
    db.session.commit()

    current_app.logger.info("Admin deleted category: %s", category.name)
    return jsonify({"mensagem": "Categoria removida"}), 200


# ─── Helpers ────────────────────────────────────────────────────────────────────


def _is_admin():
    """Check if the current user has admin privileges."""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    return user and user.is_admin
