"""Registro (submission) model."""

from datetime import datetime, timezone

from flaskr.extensions import db


class Registro(db.Model):
    """Represents a complementary hours submission."""

    __tablename__ = "registros"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    hours = db.Column(db.Integer, nullable=False)
    certificate = db.Column(db.String(200))
    status = db.Column(db.String(50), default="Em Análise")
    rejection_reason = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="registros")

    def __repr__(self):
        return f"<Registro {self.id} - {self.title}>"

    def to_dict(self, include_user=False):
        """Serialize registro to dictionary."""
        data = {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "hours": self.hours,
            "certificate": self.certificate,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_user:
            data["aluno"] = self.user.name if self.user else "Desconhecido"
        return data
