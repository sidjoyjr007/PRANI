from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from config.database import Base
from datetime import datetime


class Tool(Base):
    """Tool model for defining tools"""
    __tablename__ = "tools"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    code = Column(Text, nullable=False)  # Executable code
    
    # Categories: ["finance", "analysis"]
    categories = Column(JSONB, default=list)
    
    # Input Fields Definition
    # Schema: [{"name": "url", "type": "string", "description": "Target URL", "default": "http://example.com", "required": true}]
    input_fields = Column(JSONB, default=list)
    
    # Env Variable Definition (Requirement only)
    # Schema: [{"name": "API_KEY", "description": "Key for API", "required": true}]
    env_var_defs = Column(JSONB, default=list)
    
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", backref="tools")

    def __repr__(self):
        return f"<Tool {self.name}>"
