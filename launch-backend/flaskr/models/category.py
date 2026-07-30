"""Category model — activity types with limits and weights."""

from flaskr.extensions import db


class Category(db.Model):
    """Represents an activity category configured by admin."""

    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey("institutions.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    max_hours = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, default=1.0, nullable=False)
    description = db.Column(db.String(200), nullable=True)

    institution = db.relationship("Institution", back_populates="categories")
    registros = db.relationship("Registro", back_populates="category", lazy="dynamic")

    def __repr__(self):
        return f"<Category {self.name}>"

    def to_dict(self):
        """Serialize category to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "max_hours": self.max_hours,
            "weight": self.weight,
            "description": self.description,
        }
