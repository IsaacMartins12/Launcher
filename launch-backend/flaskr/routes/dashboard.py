"""Dashboard routes — aggregated metrics for admin and student."""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from flaskr.extensions import db
from flaskr.models import User, Registro, Category

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard/admin", methods=["GET"])
@jwt_required()
def admin_dashboard():
    """Aggregated metrics for the admin panel.

    Returns overall stats, per-category breakdown, per-student summary,
    and recent activity.
    """
    user = _get_current_user()
    if not user or not user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    # Overall stats
    total_submissions = Registro.active().count()
    pending = Registro.active().filter_by(status="Em Análise").count()
    approved = Registro.active().filter_by(status="Aprovado").count()
    rejected = Registro.active().filter_by(status="Rejeitado").count()

    total_approved_hours = db.session.query(
        func.coalesce(func.sum(Registro.hours), 0)
    ).filter(
        Registro.deleted_at.is_(None),
        Registro.status == "Aprovado",
    ).scalar()

    # Per-category breakdown
    category_stats = db.session.query(
        Category.name,
        func.count(Registro.id).label("count"),
        func.coalesce(func.sum(Registro.hours), 0).label("total_hours"),
        func.sum(
            db.case((Registro.status == "Aprovado", Registro.hours), else_=0)
        ).label("approved_hours"),
    ).outerjoin(
        Registro,
        (Registro.category_id == Category.id) & (Registro.deleted_at.is_(None))
    ).group_by(Category.id, Category.name).all()

    categories_breakdown = [
        {
            "category": row.name,
            "submissions": row.count,
            "total_hours": int(row.total_hours),
            "approved_hours": int(row.approved_hours or 0),
        }
        for row in category_stats
    ]

    # Per-student summary (top students by approved hours)
    student_stats = db.session.query(
        User.name,
        User.turma,
        func.count(Registro.id).label("submissions"),
        func.coalesce(func.sum(
            db.case((Registro.status == "Aprovado", Registro.hours), else_=0)
        ), 0).label("approved_hours"),
    ).join(
        Registro, (Registro.user_id == User.id) & (Registro.deleted_at.is_(None))
    ).filter(
        User.is_admin == False
    ).group_by(User.id, User.name, User.turma).order_by(
        func.sum(db.case((Registro.status == "Aprovado", Registro.hours), else_=0)).desc()
    ).limit(20).all()

    students_summary = [
        {
            "name": row.name,
            "turma": row.turma,
            "submissions": row.submissions,
            "approved_hours": int(row.approved_hours),
        }
        for row in student_stats
    ]

    # Approval rate
    decided = approved + rejected
    approval_rate = round((approved / decided * 100), 1) if decided > 0 else 0

    return jsonify({
        "overview": {
            "total_submissions": total_submissions,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "total_approved_hours": int(total_approved_hours),
            "approval_rate": approval_rate,
        },
        "categories": categories_breakdown,
        "students": students_summary,
    }), 200


@dashboard_bp.route("/dashboard/student", methods=["GET"])
@jwt_required()
def student_dashboard():
    """Aggregated metrics for the authenticated student.

    Returns personal progress, per-category breakdown with limits,
    and status distribution.
    """
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Status distribution
    status_counts = db.session.query(
        Registro.status,
        func.count(Registro.id),
    ).filter(
        Registro.user_id == user.id,
        Registro.deleted_at.is_(None),
    ).group_by(Registro.status).all()

    status_map = {status: count for status, count in status_counts}

    # Total hours
    total_hours = db.session.query(
        func.coalesce(func.sum(Registro.hours), 0)
    ).filter(
        Registro.user_id == user.id,
        Registro.deleted_at.is_(None),
    ).scalar()

    approved_hours = db.session.query(
        func.coalesce(func.sum(Registro.hours), 0)
    ).filter(
        Registro.user_id == user.id,
        Registro.deleted_at.is_(None),
        Registro.status == "Aprovado",
    ).scalar()

    # Per-category progress (approved hours vs limit)
    category_progress = db.session.query(
        Category.name,
        Category.max_hours,
        Category.weight,
        func.coalesce(func.sum(
            db.case((Registro.status == "Aprovado", Registro.hours), else_=0)
        ), 0).label("approved_hours"),
        func.count(Registro.id).label("submissions"),
    ).outerjoin(
        Registro,
        (Registro.category_id == Category.id)
        & (Registro.user_id == user.id)
        & (Registro.deleted_at.is_(None))
    ).group_by(Category.id, Category.name, Category.max_hours, Category.weight).all()

    categories = [
        {
            "category": row.name,
            "max_hours": row.max_hours,
            "weight": row.weight,
            "approved_hours": int(row.approved_hours),
            "remaining": max(0, row.max_hours - int(row.approved_hours)),
            "percentage": round(min(int(row.approved_hours) / row.max_hours * 100, 100), 1),
            "submissions": row.submissions,
        }
        for row in category_progress
    ]

    # Goal progress (200h default)
    goal = 200
    goal_percentage = round(min(int(approved_hours) / goal * 100, 100), 1)

    return jsonify({
        "overview": {
            "total_submissions": sum(status_map.values()),
            "total_hours": int(total_hours),
            "approved_hours": int(approved_hours),
            "pending": status_map.get("Em Análise", 0),
            "approved": status_map.get("Aprovado", 0),
            "rejected": status_map.get("Rejeitado", 0),
            "goal": goal,
            "goal_percentage": goal_percentage,
        },
        "categories": categories,
    }), 200


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
