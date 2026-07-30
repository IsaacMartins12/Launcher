"""Models package."""

from flaskr.models.category import Category
from flaskr.models.registro import Registro
from flaskr.models.user import User

__all__ = ["User", "Registro", "Category"]
