from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from config.database import Base
from datetime import datetime

class LLM(Base):
    """LLM model for defining LLM configurations"""
    __tablename__ = "llms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    provider = Column(String(50), nullable=False) # OpenAI, Gemini, etc.
    model = Column(String(255), nullable=False) # gpt-4, claude-3, etc.
    
    # JSONB for storing flexible configuration
    # headers: {"Authorization": "Bearer {{env.API_KEY}}"}
    headers = Column(JSONB, default=dict)
    
    # Env Variable Definition (Requirement schemas)
    # [{"key": "API_KEY", "value": "********", "isPassword": true}] - Stored structure might differ, 
    # but strictly we need to know what env vars are EXPECTED. 
    # Actually, mimicking Tool's `env_var_defs` might be better or just storing the configuration structure.
    # In `CreateLLMPage`, we have `environmentVariables` array. 
    # Let's store the definitions here. The actual values are in LLMSecret.
    env_vars = Column(JSONB, default=list)
    
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", backref="llms")

    def __repr__(self):
        return f"<LLM {self.name} ({self.provider})>"
