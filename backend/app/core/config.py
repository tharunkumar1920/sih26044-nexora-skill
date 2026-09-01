import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SIH26044 — AI-Powered Skill Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih2026-ayush-skill-intelligence-super-secret-key-3214")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Relational Database URL (SQLite default for easy local execution, supports PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sih_platform.db")

    # Configurable Engine Matching Weights
    WEIGHT_REQUIRED_SKILLS: float = 0.40
    WEIGHT_ASSESSMENT_SCORE: float = 0.20
    WEIGHT_PROJECTS_CERTS: float = 0.15
    WEIGHT_SOFT_SKILLS: float = 0.10
    WEIGHT_EDUCATION: float = 0.10
    WEIGHT_CAREER_INTEREST: float = 0.05

    class Config:
        case_sensitive = True

settings = Settings()
