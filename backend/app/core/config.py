import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nyaya AI Backend"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./nyaya_ai.db"
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")
    UPLOAD_DIR: str = "uploads"
    ENCRYPTION_KEY: str = Field(default="Wr4wu2D_VAuO3-4j4L-3rLV4ul7dHvvSf1sXJe7CCVw=", env="ENCRYPTION_KEY")
    JWT_SECRET: str = Field(default="nyaya_ai_super_secret_jwt_key_2026_production", env="JWT_SECRET")
    # Brevo SMTP Configuration
    BREVO_SMTP_HOST: str = Field(default="smtp-relay.brevo.com", env="BREVO_SMTP_HOST")
    BREVO_SMTP_PORT: int = Field(default=587, env="BREVO_SMTP_PORT")
    BREVO_SMTP_USER: str = Field(default="", env="BREVO_SMTP_USER")
    BREVO_SMTP_PASS: str = Field(default="", env="BREVO_SMTP_PASS")
    BREVO_SENDER_EMAIL: str = Field(default="noreply@nyayaai.com", env="BREVO_SENDER_EMAIL")
    BREVO_SENDER_NAME: str = Field(default="Nyaya AI", env="BREVO_SENDER_NAME")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
