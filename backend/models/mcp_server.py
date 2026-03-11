from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from config.database import Base
from datetime import datetime

class MCPServer(Base):
    """
    MCP Server model for defining MCP server configurations.
    Connects to external MCP servers via URL (SSE/Stdio/etc).
    """
    __tablename__ = "mcp_servers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(1024), nullable=False) # e.g. http://localhost:3000/sse
    
    # JSONB for storing flexible configuration
    # headers: {"Authorization": "Bearer {{env.API_KEY}}", "X-Custom-Header": "value"}
    headers = Column(JSONB, default=dict)
    
    # Env Variable Definition (Requirement schemas)
    # [{"key": "API_KEY", "value": "********", "isPassword": true}]
    # Actual values stored in MCPSecret
    env_vars = Column(JSONB, default=list)
    
    is_active = Column(Boolean, default=True)
    
    # Sync Status Tracking
    sync_status = Column(String(50), default="PENDING") # PENDING, SYNCED, FAILED
    sync_error = Column(Text, nullable=True)
    last_synced_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", backref="mcp_servers")

    def __repr__(self):
        return f"<MCPServer {self.name} ({self.url})>"
