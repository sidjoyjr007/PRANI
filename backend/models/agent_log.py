from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from config.database import Base


class AgentLog(Base):
    """
    Persists every AgentEvent emitted by the agentic loop.
    Indexed by session_id for fast retrieval.
    """
    __tablename__ = "agent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Session / Run context
    session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    run_id = Column(String, nullable=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True)

    # Log fields
    event_type = Column(String, nullable=False)   # raw AgentEventType value, e.g. "tool_start"
    level = Column(String, nullable=False)         # DEBUG | INFO | WARN | ERROR
    source = Column(String, nullable=False)        # human-readable source label
    content = Column(Text, nullable=False, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        # Compound index for the primary query pattern: session + time desc
        Index("ix_agent_logs_session_created", "session_id", "created_at"),
        Index("ix_agent_logs_agent_created", "agent_id", "created_at"),
    )
