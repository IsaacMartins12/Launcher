"""User model."""

import bcrypt

from flaskr.extensions import db


class User(db.Model):
    """Represents a system user (student or admin)."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey("institutions.id"), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    turma = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    institution = db.relationship("Institution", back_populates="users")
    registros = db.relationship("Registro", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.username}>"

    def set_password(self, raw_password):
        """Hash and set the user password."""
        self.password = bcrypt.hashpw(
            raw_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, raw_password):
        """Verify a raw password against the stored hash.

        Also handles legacy plaintext passwords by hashing them on first
        successful comparison (migration strategy).
        """
        stored = self.password

        # Legacy plaintext check (passwords that were not hashed yet)
        if not stored.startswith("$2b$") and not stored.startswith("$2a$"):
            if stored == raw_password:
                # Migrate to hashed password on successful login
                self.set_password(raw_password)
                db.session.commit()
                return True
            return False

        return bcrypt.checkpw(raw_password.encode("utf-8"), stored.encode("utf-8"))

    def to_dict(self):
        """Serialize user to dictionary (never expose password)."""
        return {
            "id": self.id,
            "name": self.name,
            "turma": self.turma,
            "username": self.username,
            "is_admin": bool(self.is_admin),
            "institution_id": self.institution_id,
            "institution": self.institution.name if self.institution else None,
        }
