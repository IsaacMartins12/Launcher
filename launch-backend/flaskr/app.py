from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import datetime
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)

MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'launch')
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')

DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

CORS(app, supports_credentials=True)
jwt = JWTManager(app)

config = {
    'user': MYSQL_USER,
    'password': MYSQL_PASSWORD,
    'host': MYSQL_HOST,
    'port': '3306',
    'database': MYSQL_DATABASE
}

db = SQLAlchemy(app)
app.app_context().push()


class Users(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    turma = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

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
    rejection_reason = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('Users', backref=db.backref('register_entries', lazy=True))


# ==================== LOGIN ====================

@app.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON request"}), 400

    data = request.get_json()
    user = Users.query.filter_by(username=data.get('username'), password=data.get('password')).first()

    if user:
        access_token = create_access_token(identity=user.username)

        return jsonify({
            "is_Logged": True,
            "is_Admin": bool(user.is_admin),
            "token": access_token
        }), 200
    else:
        return jsonify({
            "is_Logged": False,
            "is_Admin": False,
            "token": ""
        }), 401


@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'logout': True}), 200


# ==================== ALUNO ====================

@app.route('/aluno', methods=['GET'])
@jwt_required()
def aluno():
    username = get_jwt_identity()
    user = Users.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    registros = Registros.query.filter_by(user_id=user.id).all()
    result = []
    for r in registros:
        result.append({
            "id": r.id,
            "title": r.title,
            "type": r.type,
            "hours": r.hours,
            "certificate": r.certificate,
            "status": r.status,
            "created_at": str(r.created_at) if r.created_at else None
        })

    return jsonify(result), 200


@app.route('/files', methods=['POST'])
@jwt_required()
def files():
    username = get_jwt_identity()
    user = Users.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not request.is_json:
        return jsonify({"error": "JSON esperado"}), 400

    registros_json = request.get_json()

    # Aceita array ou objeto único
    if not isinstance(registros_json, list):
        registros_json = [registros_json]

    for item in registros_json:
        registro = Registros(
            user_id=user.id,
            title=item.get('title'),
            type=item.get('type'),
            hours=item.get('hours'),
            status=item.get('status', 'Em Análise'),
            certificate=', '.join(item.get('certificate', [])) if isinstance(item.get('certificate'), list) else item.get('certificate', ''),
            created_at=datetime.utcnow()
        )
        db.session.add(registro)

    db.session.commit()
    return jsonify({"mensagem": "Dados salvos com sucesso!"}), 200


# ==================== INSTITUIÇÃO ====================

@app.route('/inst', methods=['GET'])
@jwt_required()
def inst_get():
    registros = Registros.query.all()
    result = []
    for r in registros:
        user = Users.query.get(r.user_id)
        result.append({
            "id": r.id,
            "title": r.title,
            "type": r.type,
            "hours": r.hours,
            "certificate": r.certificate,
            "status": r.status,
            "rejection_reason": r.rejection_reason,
            "aluno": user.name if user else "Desconhecido",
            "created_at": str(r.created_at) if r.created_at else None
        })
    return jsonify(result), 200


@app.route('/inst', methods=['PUT'])
@jwt_required()
def inst_put():
    if not request.is_json:
        return jsonify({"error": "JSON esperado"}), 400

    data = request.get_json()
    registro = Registros.query.get(data.get('id_certificate'))

    if not registro:
        return jsonify({"error": "Registro não encontrado"}), 404

    registro.status = data.get('status', registro.status)
    registro.rejection_reason = data.get('rejection_reason', None)
    registro.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"status": "Atualizado"}), 200


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True, port=2500)
