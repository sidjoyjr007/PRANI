from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from config.database import Base
import uuid

class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    instructions = Column(String, nullable=True)
    
    # Capabilities as a list of strings
    capabilities = Column(JSONB, default=list, nullable=False)
    
    # Linked Resources
    # We store IDs as JSON lists for flexibility, though M2M tables are cleaner for strict SQL.
    # Given the requirement for "Snapshot" style or simple linking, JSONB is fine for now, 
    # but strictly speaking, foreign keys would catch deletions. 
    # For now, logical linking as requested.
    tool_ids = Column(JSONB, default=list, nullable=False)
    mcp_server_ids = Column(JSONB, default=list, nullable=False)
    
    # LLM Config
    llm_id = Column(UUID(as_uuid=True), ForeignKey("llms.id"), nullable=True)
    
    # Ownership
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Settings
    human_in_loop = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
