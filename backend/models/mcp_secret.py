from sqlalchemy import Column, String, ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from config.database import Base

class MCPSecret(Base):
    """
    Stores encrypted secrets for MCP servers.
    Link secrets strictly to the MCP configuration, accessible by the owner.
    """
    __tablename__ = "mcp_secrets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mcp_id = Column(UUID(as_uuid=True), ForeignKey("mcp_servers.id"), nullable=False)
    
    name = Column(String(255), nullable=False)     # e.g., "API_KEY"
    encrypted_value = Column(String, nullable=False) # Fernet encrypted
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    mcp_server = relationship("MCPServer", backref="secrets")
    
    # Constraints: One value per variable per MCP Server
    __table_args__ = (
        UniqueConstraint('mcp_id', 'name', name='uq_mcp_secret'),
    )

    def __repr__(self):
        return f"<MCPSecret {self.name}>"
