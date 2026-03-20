from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from config.database import Base
import uuid
import enum

class RunStatus(enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DeploymentRun(Base):
    __tablename__ = "deployment_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(Enum(RunStatus), default=RunStatus.PENDING)
    
    run_input = Column(String, nullable=True) # Specific input supplied during trigger
    logs = Column(Text, nullable=True) # or JSONB if structured
    output = Column(JSONB, nullable=True) # Store resulting output or state
    messages = Column(JSONB, nullable=True) # Isolated memory for the run
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
