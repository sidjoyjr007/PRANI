from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import uuid

class AgentEventType(str, Enum):
    # Lifecycle
    LOOP_START = "loop_start"
    LOOP_COMPLETE = "loop_complete"
    ERROR = "error"
    
    # Thought Process
    THOUGHT_START = "thought_start"
    THOUGHT = "thought"
    THOUGHT_END = "thought_end"
    
    # Tool Execution
    TOOL_PLANNED = "tool_planned"
    TOOL_START = "tool_start"
    TOOL_OUTPUT = "tool_output"
    
    # Human in the Loop
    APPROVAL_REQUIRED = "approval_required"
    
    # Content
    MESSAGE = "message"
    STATUS = "status"
    
class AgentEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    type: AgentEventType
    session_id: str
    run_id: Optional[str] = None
    
    # Content payload
    content: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True

class EventBus:
    """
    Simple in-memory event bus for the agent loop.
    In production, this could be replaced by Redis/Kafka, but for now 
    it just yields events to the SSE generator.
    """
    def __init__(self):
        self._subscribers = []

    def emit(self, event: AgentEvent):
        """
        Since we are using Python generators for SSE, we don't 'store' events 
        but rather returns them to be yielded by the caller.
        
        However, for decoupling, the AgenticLoop will take an 'event_handler' callback.
        """
        # This is a placeholder for more complex pub/sub if needed later.
        pass
    
    @staticmethod
    def create_event(
        session_id: str, 
        event_type: AgentEventType, 
        content: str = "", 
        metadata: Dict[str, Any] = None
    ) -> AgentEvent:
        return AgentEvent(
            session_id=str(session_id),
            type=event_type,
            content=content,
            metadata=metadata or {}
        )
