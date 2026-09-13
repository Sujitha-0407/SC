import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secure-student-app-secret-key-2026!@#$")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secure-jwt-token-secret-key-2026!@#$")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///student_management.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False