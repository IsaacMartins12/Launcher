from flask import Flask, render_template, request, redirect, url_for, flash, jsonify,session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user,AnonymousUserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import mysql.connector
import json
import os
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity,unset_jwt_cookies,set_access_cookies
from datetime import datetime
from flask_socketio import SocketIO, emit

from flask_restx import Resource, Api

api = Api()

app = Flask(__name__)

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

# Use 'mysql+mysqlconnector' como protocolo e '3306' como porta padrão
DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(bind=engine)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

#db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '../database.db')
'''
config = {
        'user': 'admin',
        'password': 'admin',
        'host': 'db',
        'port': '3306',
        'database': 'launch'
}
'''
config = {
        'user': 'root',
        'password': 'root',
        'host': 'localhost',
        'port': '3306',
        'database': 'launch'
}

db = SQLAlchemy(app)
   
Base.metadata.create_all(engine)

# Configurar contexto de aplicativo
app.app_context().push()

class Users(db.Model,UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    turma = db.Column(db.String(80), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password= db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def __init__(self, user_id):
        self.id = user_id

    '''def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)'''
    
    def __repr__(self):
        return f'<User {self.username}>'

class Registros(db.Model):
    __tablename__ = 'registros'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100))
    type = db.Column(db.String(30))
    hours = db.Column(db.Integer)
    certificate = db.Column(db.String(200))
    status = db.Column(db.String(50))
    created_At = db.Column(db.String(80))
    deleted_At = db.Column(db.String(80), nullable=True)
    updated_At = db.Column(db.String(80), nullable=True)
    
    user = db.relationship('Users', backref=db.backref('register_entries', lazy=True))


'''@login_manager.user_loader
def load_user(user_id):
   
    return Users.query.get(user_id)
'''

@app.route('/login', methods=['GET', 'POST'])

def login():
   
    if request.method == 'POST':
        
       if request.is_json:
            data = request.get_json()

            user = Users.query.filter_by(username=data['username'], password=data['password']).first()
            if user:
               
               #login_user(user)

               access_token = create_access_token(identity={'username': data['username']})
               resp = jsonify({'login': True})
              # return jsonify(access_token=access_token), 200
               set_access_cookies(resp, access_token)

               print(access_token)
       
               session_db = Session()

               session['username'] = data['username']  # Armazene o nome de usuário na sessão
               
               session_db.close()

               app.config['UPLOAD_FOLDER'] = os.path.join('./uploads',  session['username'])
             
               if user.is_admin == 1:
                    return jsonify({"is_Logged": True,
                            "is_Admin": True,
                            'token': access_token}),200
               else:
                    return jsonify({"is_Logged":True,
                        "is_Admin":False,
                        'token': access_token}),200
               
            else:

                return jsonify({
                        "is_Logged":False,
                        "is_Admin":False,
                        'token':''}),401
       else :  
           return {"error": "Invalid JSON request"}, 400

@app.route('/logout',methods=['POST'])
def logout():
    #logout_user()
    #return {"message": "Logged out successfully"}
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)
    return resp, 200

'''
@app.route('/index')
@login_required
def index():
    return f'Hello, {current_user.username}! You are {"admin" if current_user.is_admin else "user"}.'
'''

@app.route('/files', methods=['POST'])
#@jwt_required
def files():
    
    if request.method == 'POST':
        
        '''if current_user:
           username = current_user  # Use current_user.id instead of current_user.username
           print(username)'''

        '''print("achou o username")'''

        if not os.path.exists(app.config['UPLOAD_FOLDER']):
           os.makedirs(app.config['UPLOAD_FOLDER'])
           print("criou a pasta")

        app.config['ALLOWED_EXTENSIONS'] = {'txt', 'pdf', 'xlsx','jpg','png'}

        files = request.files.getlist('image')
        filenames = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(filename)
                filenames.append(file.filename)
        print(filenames)
        
        if request.is_json:
           registro_json = request.get_json()
           
           registro_json = registro_json[0]
           print(registro_json)
           registro = Registros(
           user_id = 1,
           title=registro_json['title'],
           type=registro_json['type'],
           hours=registro_json['hours'],
           status=registro_json['status'],
           certificate=registro_json['certificate'][0],
           #created_At=datetime.now()
           
        )
           
           db.session.add(registro)
           
           db.session.commit()

        return jsonify({"mensagem": "Dados salvos com sucesso!"}), 200
    else:

        return jsonify({"erro": "A requisição não contém dados JSON"}), 400

@app.route('/aluno', methods=['GET'])  #Já mudei esse
#@jwt_required()
def aluno():
     
     username = session.get('username')
     con = mysql.connector.connect(**config)
     cur = con.cursor()
     
     cur.execute(f'''SELECT id from users where username = "{username}"''')
     id = cur.fetchall()
     print(id)
     
     cur.execute(f'''SELECT DISTINCT * from registros where user_id = "{id[0][0]}"''')
     response = cur.fetchall()

     colunas = [i[0] for i in cur.description]
     objetos = [dict(zip(colunas, row)) for row in response]


     con.close()
     #socketio.emit('aluno_data', objetos)
     return jsonify(objetos)
    
     #con.close()

     #return response

@app.route('/inst', methods=['GET'])
#@jwt_required()
def get(self):
     
     con = mysql.connector.connect(**config)
     cur = con.cursor()
     
     cur.execute(f'''SELECT type,title,hours,certificate,status from registros ''')

     a = cur.fetchall()

     colunas = [i[0] for i in cur.description]
     objetos = [dict(zip(colunas, row)) for row in a]


     con.close()

     return objetos

@app.route('/inst', methods=['PUT'])  #Já mudei esse
#@jwt_required()
def inst_put():
     
     
     if request.method == "PUT" :

      if request.is_json:
           
        registro_json = request.get_json()
     
        username = session.get('username')
        con = mysql.connector.connect(**config)
        cur = con.cursor()
        
        cur.execute(f'''SELECT id from users where username = "{username}"''')
        id = cur.fetchall()
    
        cur.execute(f'''UPDATE registros SET status = "{registro_json['status']}", rejectionReason = "{registro_json['rejectionReason']}"
                     WHERE user_id = "{id[0][0]}"
                    AND id = "{registro_json['id_certificate']}"''')
       
        con.commit()

        con.close()
       
        return jsonify({"status":"Atualizado", "json_gerado":registro_json}),200
""""
@app.route('/protected', methods=['GET'])
#@jwt_required()
def protected():
    # Obtém a identidade do token
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
"""


if __name__ == '__main__':
    
    db.create_all()
    app.run(debug=True, port=2500)