"""User model."""

from flaskr.extensions import db


class User(db.Model):
    """Represents a system user (student or admin)."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    turma = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    registros = db.relationship("Registro", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.username}>"

    def to_dict(self):
        """Serialize user to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "turma": self.turma,
            "username": self.username,
            "is_admin": bool(self.is_admin),
        }
