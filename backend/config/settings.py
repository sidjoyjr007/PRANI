from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )
    
    # Database
    database_url: str = "postgresql://prani_user:prani_password@localhost:5432/prani_db"
    
    # JWT Configuration
    jwt_secret_key: str = "change-me-to-a-secure-random-string-min-32-chars"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    
    # SMTP Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "your-email@gmail.com"
    smtp_password: str = "your-app-password"
    sender_email: str = "noreply@prani.com"
    sender_name: str = "Prani"
    
    # Server Configuration
    debug: bool = True
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Frontend
    frontend_url: str = "http://localhost:5173"
    
    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
