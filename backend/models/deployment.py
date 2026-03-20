from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from config.database import Base
import uuid
import enum

class TriggerType(enum.Enum):
    API = "API"
    SCHEDULED = "SCHEDULED"

class DeploymentStatus(enum.Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    FAILED = "FAILED"

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    trigger_type = Column(Enum(TriggerType), nullable=False, default=TriggerType.API)
    schedule_cron = Column(String, nullable=True) # e.g. "0 * * * *"
    
    # Hashed API key to trigger the webhook
    api_key_hash = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.IDLE)
    default_input = Column(String, nullable=True) # Custom task instructions for the agent when triggered
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
