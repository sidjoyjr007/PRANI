from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pydantic import field_validator
from typing import List, Optional


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
    # Server Configuration
    debug: bool = True
    # Change type to str | List[str] to allow pydantic-settings to read the raw string from env
    # The validator will then convert it to a list
    allowed_origins: str | List[str] = [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:3000"
    ]
    
    # Frontend
    frontend_url: str = "http://localhost:5173"
    
    # Encryption
    encryption_key: Optional[str] = None
    
    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            # Check if it looks like a JSON list (starts with [)
            if v.strip().startswith("["):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass # Fallback to comma split
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
