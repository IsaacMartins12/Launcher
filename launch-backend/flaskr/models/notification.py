"""Notification model — alerts for students about submission status changes."""

from datetime import datetime, timezone

from flaskr.extensions import db


class Notification(db.Model):
    """Represents an in-app notification for a user."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(300), nullable=False)
    type = db.Column(db.String(30), nullable=False, default="info")  # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    registro_id = db.Column(db.Integer, nullable=True)  # optional reference to related submission
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", backref=db.backref("notifications", lazy="dynamic"))

    def __repr__(self):
        return f"<Notification {self.id} user={self.user_id}>"

    def to_dict(self):
        """Serialize notification to dictionary."""
        return {
            "id": self.id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "registro_id": self.registro_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
