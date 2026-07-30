"""Institution routes — registration and management."""

import re
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from flaskr.extensions import db
from flaskr.models import Institution, User, Category

institution_bp = Blueprint("institution", __name__)

# Default categories created for every new institution
DEFAULT_CATEGORIES = [
    {"name": "Curso", "max_hours": 80, "weight": 1.0, "description": "Cursos livres, online ou presenciais"},
    {"name": "Palestra", "max_hours": 40, "weight": 0.8, "description": "Participação como ouvinte em palestras"},
    {"name": "Workshop", "max_hours": 60, "weight": 1.0, "description": "Oficinas práticas e workshops"},
    {"name": "Evento", "max_hours": 40, "weight": 0.8, "description": "Participação em eventos acadêmicos"},
    {"name": "Monitoria", "max_hours": 100, "weight": 1.5, "description": "Atuação como monitor em disciplinas"},
    {"name": "Projeto de Extensão", "max_hours": 120, "weight": 1.5, "description": "Participação em projetos de extensão"},
    {"name": "Voluntariado", "max_hours": 60, "weight": 1.2, "description": "Atividades voluntárias comprovadas"},
]


@institution_bp.route("/institutions", methods=["POST"])
def register_institution():
    """Register a new institution and its first admin user.

    This is the self-service onboarding endpoint. No auth required.
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()

    # Validate required fields
    institution_name = data.get("institution_name", "").strip()
    admin_name = data.get("admin_name", "").strip()
    admin_username = data.get("admin_username", "").strip()
    admin_password = data.get("admin_password", "").strip()

    if not all([institution_name, admin_name, admin_username, admin_password]):
        return jsonify({"error": "Todos os campos são obrigatórios: institution_name, admin_name, admin_username, admin_password"}), 400

    if len(admin_password) < 4:
        return jsonify({"error": "Senha deve ter no mínimo 4 caracteres"}), 400

    # Generate slug from institution name
    slug = _generate_slug(institution_name)

    # Check uniqueness
    if Institution.query.filter_by(slug=slug).first():
        return jsonify({"error": f"Instituição com slug '{slug}' já existe"}), 409

    if User.query.filter_by(username=admin_username).first():
        return jsonify({"error": f"Username '{admin_username}' já está em uso"}), 409

    # Create institution
    institution = Institution(
        name=institution_name,
        slug=slug,
    )
    db.session.add(institution)
    db.session.flush()  # Get the ID

    # Create admin user
    admin = User(
        institution_id=institution.id,
        name=admin_name,
        turma=institution_name,
        username=admin_username,
        password="placeholder",
        is_admin=True,
    )
    admin.set_password(admin_password)
    db.session.add(admin)

    # Create default categories for this institution
    for cat_data in DEFAULT_CATEGORIES:
        category = Category(
            institution_id=institution.id,
            **cat_data,
        )
        db.session.add(category)

    db.session.commit()

    return jsonify({
        "mensagem": "Instituição cadastrada com sucesso!",
        "institution": institution.to_dict(),
        "admin": admin.to_dict(),
    }), 201


@institution_bp.route("/institutions/me", methods=["GET"])
@jwt_required()
def get_my_institution():
    """Get the current user's institution details."""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    institution = user.institution
    if not institution:
        return jsonify({"error": "Instituição não encontrada"}), 404

    # Count stats
    user_count = User.query.filter_by(institution_id=institution.id, is_admin=False).count()
    admin_count = User.query.filter_by(institution_id=institution.id, is_admin=True).count()

    result = institution.to_dict()
    result["stats"] = {
        "students": user_count,
        "admins": admin_count,
    }

    return jsonify(result), 200


@institution_bp.route("/institutions/me/students", methods=["POST"])
@jwt_required()
def add_student():
    """Add a student to the admin's institution."""
    username = get_jwt_identity()
    admin = User.query.filter_by(username=username).first()
    if not admin or not admin.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    student_name = data.get("name", "").strip()
    student_username = data.get("username", "").strip()
    student_password = data.get("password", "").strip()
    student_turma = data.get("turma", "").strip()

    if not all([student_name, student_username, student_password, student_turma]):
        return jsonify({"error": "Campos obrigatórios: name, username, password, turma"}), 400

    if User.query.filter_by(username=student_username).first():
        return jsonify({"error": f"Username '{student_username}' já está em uso"}), 409

    student = User(
        institution_id=admin.institution_id,
        name=student_name,
        turma=student_turma,
        username=student_username,
        password="placeholder",
        is_admin=False,
    )
    student.set_password(student_password)
    db.session.add(student)
    db.session.commit()

    return jsonify({
        "mensagem": "Aluno cadastrado com sucesso!",
        "student": student.to_dict(),
    }), 201


def _generate_slug(name):
    """Generate a URL-friendly slug from institution name."""
    slug = name.lower().strip()
    slug = re.sub(r'[àáâãäå]', 'a', slug)
    slug = re.sub(r'[èéêë]', 'e', slug)
    slug = re.sub(r'[ìíîï]', 'i', slug)
    slug = re.sub(r'[òóôõö]', 'o', slug)
    slug = re.sub(r'[ùúûü]', 'u', slug)
    slug = re.sub(r'[ç]', 'c', slug)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')[:60]
