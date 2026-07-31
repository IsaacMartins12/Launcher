"""Swagger/Flasgger configuration."""

SWAGGER_TEMPLATE = {
    "info": {
        "title": "Complementary Hours API",
        "description": "REST API for managing academic complementary hours. Students submit activities, admins approve/reject them.",
        "version": "1.0.0",
        "contact": {
            "name": "Isaac Martins",
            "url": "https://github.com/IsaacMartins12/Launcher",
        },
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT token. Format: Bearer {token}",
        }
    },
    "security": [{"Bearer": []}],
    "tags": [
        {"name": "Auth", "description": "Authentication endpoints"},
        {"name": "Student", "description": "Student submission management"},
        {"name": "Admin", "description": "Admin review and category management"},
        {"name": "Categories", "description": "Activity category CRUD"},
        {"name": "Notifications", "description": "In-app notifications"},
        {"name": "Dashboard", "description": "Aggregated metrics"},
        {"name": "Profile", "description": "User profile management"},
        {"name": "Health", "description": "System health check"},
    ],
}

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs",
}
