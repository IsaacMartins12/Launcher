"""Notification routes — list, mark as read."""

from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from flaskr.extensions import db
from flaskr.models import User, Notification

notification_bp = Blueprint("notification", __name__)


@notification_bp.route("/notifications", methods=["GET"])
@jwt_required()
def list_notifications():
    """List notifications for the authenticated user (newest first, max 50)."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    notifications = (
        Notification.query
        .filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    }), 200


@notification_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a single notification as read."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
    if not notification:
        return jsonify({"error": "Notificação não encontrada"}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({"mensagem": "Marcada como lida"}), 200


@notification_bp.route("/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read for the authenticated user."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({"mensagem": "Todas marcadas como lidas"}), 200


def _get_current_user():
    """Retrieve the authenticated user from JWT identity."""
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()
