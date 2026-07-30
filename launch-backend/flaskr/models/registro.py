"""Registro (submission) model."""

from datetime import datetime, timezone

from flaskr.extensions import db


class Registro(db.Model):
    """Represents a complementary hours submission."""

    __tablename__ = "registros"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
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
    category = db.relationship("Category", back_populates="registros")

    def __repr__(self):
        return f"<Registro {self.id} - {self.title}>"

    @property
    def is_deleted(self):
        """Check if record was soft-deleted."""
        return self.deleted_at is not None

    @property
    def weighted_hours(self):
        """Calculate hours with category weight applied.

        Caps hours at category max_hours — if a student submits 50h
        but the category allows max 40h, only 40h are counted.
        """
        if self.category:
            capped = min(self.hours, self.category.max_hours)
            return capped * self.category.weight
        return float(self.hours)

    def soft_delete(self):
        """Mark record as deleted without removing from database."""
        self.deleted_at = datetime.now(timezone.utc)

    def to_dict(self, include_user=False):
        """Serialize registro to dictionary."""
        data = {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "hours": self.hours,
            "weighted_hours": self.weighted_hours,
            "certificate": self.certificate,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "category_id": self.category_id,
            "category": self.category.name if self.category else self.type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_user:
            data["aluno"] = self.user.name if self.user else "Desconhecido"
            data["turma"] = self.user.turma if self.user else ""
        return data

    @classmethod
    def active(cls):
        """Return query filtered to exclude soft-deleted records."""
        return cls.query.filter(cls.deleted_at.is_(None))
