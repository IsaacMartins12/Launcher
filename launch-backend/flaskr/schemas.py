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

    @validates("hours")
    def validate_hours(self, value):
        if value <= 0:
            raise ValidationError("Horas devem ser um número positivo.")
        if value > 500:
            raise ValidationError("Horas não podem exceder 500.")


class StatusUpdateSchema(Schema):
    """Validates status update (approve/reject) payload."""

    id_certificate = fields.Integer(required=True)
    status = fields.String(
        required=True,
        validate=validate.OneOf(["Aprovado", "Rejeitado"]),
    )
    rejection_reason = fields.String(
        load_default=None,
        validate=validate.Length(max=500),
    )


class ProfileUpdateSchema(Schema):
    """Validates profile update payload."""

    name = fields.String(validate=validate.Length(min=1, max=80))
    turma = fields.String(validate=validate.Length(min=1, max=80))
