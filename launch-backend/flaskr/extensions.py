"""Flask extensions instantiation.

Extensions are initialized here without the app instance,
then bound to the app in the application factory (__init__.py).
"""

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
