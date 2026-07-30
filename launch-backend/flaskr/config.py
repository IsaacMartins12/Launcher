"""Application configuration."""

import os


class Config:
    """Base configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_TOKEN_LOCATION = ["headers"]

    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "root")
    MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "launch")
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
