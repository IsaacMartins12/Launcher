from flask import Flask
import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

#from .flaskr import db
#from . import auth

MYSQL_USER = 'root'
MYSQL_PASSWORD = 'root'
MYSQL_DATABASE = 'launch'
MYSQL_HOST = 'localhost'

'''
MYSQL_USER = 'admin'
MYSQL_PASSWORD = 'admin'
MYSQL_HOST = 'db'
MYSQL_DATABASE = 'launch'
'''


DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sql'),
    )

    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

    app.config['UPLOAD_FOLDER'] = './uploads'

    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15 * 60  # Tempo de vida em segundos (15 minutos)

    CORS(app)

    
    engine = create_engine(DATABASE_URL)
    Base = declarative_base()

    Session = sessionmaker(bind=engine)

    #login_manager = LoginManager(app)
    jwt = JWTManager(app)
    #login_manager.init_app(app)  

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass



    
    #db.init_app(app)

    # Blueprint de autenticacao

    #app.register_blueprint(auth.bp)

    return app