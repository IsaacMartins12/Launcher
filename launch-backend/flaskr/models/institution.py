"""Institution model — represents a school/university tenant."""

from datetime import datetime, timezone

from flaskr.extensions import db


class Institution(db.Model):
    """Represents an institution (tenant) in the multi-tenant system."""

    __tablename__ = "institutions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(60), unique=True, nullable=False)
    goal_hours = db.Column(db.Integer, default=200, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    users = db.relationship("User", back_populates="institution", lazy="dynamic")
    categories = db.relationship("Category", back_populates="institution", lazy="dynamic")

    def __repr__(self):
        return f"<Institution {self.slug}>"

    def to_dict(self):
        """Serialize institution to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "goal_hours": self.goal_hours,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
