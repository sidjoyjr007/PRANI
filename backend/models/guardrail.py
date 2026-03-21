from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from config.database import Base
import uuid
import enum

class GuardrailType(enum.Enum):
    INPUT = "input"
    OUTPUT = "output"
    EXECUTION = "execution"

class GuardrailAction(enum.Enum):
    BLOCK = "block"
    WARN = "warn"
    MODIFY = "modify"

class GuardrailMechanism(enum.Enum):
    REGEX = "regex"
    LLM_JUDGE = "llm_judge"

class Guardrail(Base):
    __tablename__ = "guardrails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    type = Column(Enum(GuardrailType), nullable=False)
    mechanism = Column(Enum(GuardrailMechanism), nullable=False)
    action = Column(Enum(GuardrailAction), nullable=False, default=GuardrailAction.BLOCK)
    
    # The actual rule: could be a Regex string, an LLM system prompt, or a Python snippet
    logic = Column(Text, nullable=False)
    
    # Optional JSON configuration (e.g., regex flags, specific models to use)
    config = Column(JSONB, default=dict)
    
    # Ownership - if null, it is a "system default" guardrail available to everyone
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AgentGuardrail(Base):
    __tablename__ = "agent_guardrails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    guardrail_id = Column(UUID(as_uuid=True), ForeignKey("guardrails.id", ondelete="CASCADE"), nullable=False)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
