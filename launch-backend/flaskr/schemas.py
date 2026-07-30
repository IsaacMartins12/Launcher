"""Request validation schemas using Marshmallow."""

from marshmallow import Schema, fields, validate, validates, ValidationError


class LoginSchema(Schema):
    """Validates login request payload."""

    username = fields.String(required=True, validate=validate.Length(min=1, max=80))
    password = fields.String(required=True, validate=validate.Length(min=1, max=120))


class SubmissionSchema(Schema):
    """Validates a complementary hours submission."""

    title = fields.String(required=True, validate=validate.Length(min=1, max=100))
    type = fields.String(required=True, validate=validate.Length(min=1, max=30))
    hours = fields.Integer(required=True, strict=True)
    certificate = fields.Raw(load_default="")
    category_id = fields.Integer(load_default=None)

    @validates("hours")
    def validate_hours(self, value):
        if value <= 0:
            raise ValidationError("Horas devem ser um número positivo.")
        if value > 500:
            raise ValidationError("Horas não podem exceder 500.")


class StatusUpdateSchema(Schema):
    """Validates status update (approve/reject/revert) payload."""

    id_certificate = fields.Integer(required=True)
    status = fields.String(
        required=True,
        validate=validate.OneOf(["Aprovado", "Rejeitado", "Em Análise"]),
    )
    rejection_reason = fields.String(
        load_default=None,
        validate=validate.Length(max=500),
    )


class ProfileUpdateSchema(Schema):
    """Validates profile update payload."""

    name = fields.String(validate=validate.Length(min=1, max=80))
    turma = fields.String(validate=validate.Length(min=1, max=80))


class CategorySchema(Schema):
    """Validates category creation/update payload."""

    name = fields.String(required=True, validate=validate.Length(min=1, max=50))
    max_hours = fields.Integer(required=True)
    weight = fields.Float(load_default=1.0)
    description = fields.String(
        load_default=None,
        validate=validate.Length(max=200),
    )

    @validates("max_hours")
    def validate_max_hours(self, value):
        if value <= 0:
            raise ValidationError("Limite de horas deve ser positivo.")
        if value > 500:
            raise ValidationError("Limite não pode exceder 500.")

    @validates("weight")
    def validate_weight(self, value):
        if value <= 0:
            raise ValidationError("Peso deve ser positivo.")
        if value > 5:
            raise ValidationError("Peso não pode exceder 5.")
