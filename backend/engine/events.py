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
    THOUGHT_CHUNK = "thought_chunk"
    THOUGHT_END = "thought_end"
    
    # Tool Execution
    TOOL_PLANNED = "tool_planned"
    TOOL_START = "tool_start"
    TOOL_OUTPUT = "tool_output"
    
    # Human in the Loop
    APPROVAL_REQUIRED = "approval_required"
    
    # Content
    MESSAGE = "message"
    MESSAGE_CHUNK = "message_chunk"
    STATUS = "status"
    PLAN = "plan"
    
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

import json
import redis.asyncio as redis
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

# ─── Level / Source mappings ─────────────────────────────────────────────────
# These transform the raw AgentEventType into human-readable log metadata
_LEVEL_MAP: Dict[str, str] = {
    AgentEventType.LOOP_START: "INFO",
    AgentEventType.LOOP_COMPLETE: "INFO",
    AgentEventType.ERROR: "ERROR",
    AgentEventType.THOUGHT_START: "DEBUG",
    AgentEventType.THOUGHT: "DEBUG",
    AgentEventType.THOUGHT_CHUNK: "DEBUG",
    AgentEventType.THOUGHT_END: "DEBUG",
    AgentEventType.TOOL_PLANNED: "DEBUG",
    AgentEventType.TOOL_START: "INFO",
    AgentEventType.TOOL_OUTPUT: "INFO",
    AgentEventType.APPROVAL_REQUIRED: "WARN",
    AgentEventType.MESSAGE: "INFO",
    AgentEventType.MESSAGE_CHUNK: "DEBUG",
    AgentEventType.STATUS: "INFO",
    AgentEventType.PLAN: "INFO",
}

_SOURCE_MAP: Dict[str, str] = {
    AgentEventType.LOOP_START: "Agent Loop",
    AgentEventType.LOOP_COMPLETE: "Agent Loop",
    AgentEventType.ERROR: "Agent",
    AgentEventType.THOUGHT_START: "Reasoning",
    AgentEventType.THOUGHT: "Reasoning",
    AgentEventType.THOUGHT_CHUNK: "Reasoning",
    AgentEventType.THOUGHT_END: "Reasoning",
    AgentEventType.TOOL_PLANNED: "Tool Handler",
    AgentEventType.TOOL_START: "Tool Handler",
    AgentEventType.TOOL_OUTPUT: "Tool Handler",
    AgentEventType.APPROVAL_REQUIRED: "Human in Loop",
    AgentEventType.MESSAGE: "Response",
    AgentEventType.MESSAGE_CHUNK: "Response",
    AgentEventType.STATUS: "Execution Engine",
    AgentEventType.PLAN: "Task Planner",
}

class EventBus:
    """
    Redis-backed event bus.
    In the agent loop, events will be published to `session:{session_id}`.
    Clients can subscribe to this channel using the async `subscribe()` method.
    Events are also persisted to the `agent_logs` PostgreSQL table.
    """
    def __init__(self):
        # Create a single connection pool for the bus instance (or could be global)
        self.redis_client = redis.from_url(settings.redis_url)

    async def emit(self, event: AgentEvent):
        """
        Asynchronously publish the AgentEvent JSON payload to the corresponding Redis channel
        and persist it to the agent_logs table for later retrieval.
        """
        try:
            channel = f"session:{event.session_id}"
            payload = event.model_dump_json()
            print(f"[EVENT] Emitting {event.type} to {channel} (run_id={event.run_id})")
            await self.redis_client.publish(channel, payload)
        except Exception as e:
            logger.error(f"Failed to publish event to Redis: {e}")

        # Persist to DB (best-effort — never let a DB failure block the agent)
        try:
            await self._persist_log(event)
        except Exception as e:
            logger.error(f"Failed to persist log entry: {e}")

    async def _persist_log(self, event: AgentEvent) -> None:
        """Write the event to the agent_logs table."""
        import asyncio
        from config.database import SessionLocal
        from models.agent_log import AgentLog

        event_type_str = str(event.type)
        level = _LEVEL_MAP.get(event_type_str, "INFO")
        source = _SOURCE_MAP.get(event_type_str, "Agent")

        # Truncate noisy chunk events to keep the log clean
        # Use .value to correctly compare with raw string produced by pydantic enum serialization
        if event_type_str in (AgentEventType.THOUGHT_CHUNK.value, AgentEventType.MESSAGE_CHUNK.value):
            return  # Skip streaming chunks — only log final thought/message events

        # Run DB write in a thread executor so we don't block the async loop
        def _write():
            db = SessionLocal()
            try:
                # Build content string — prefer content field, fall back to metadata summary
                content = event.content or ""
                if not content and event.metadata:
                    # Summarise metadata keys so the log row is human-readable
                    meta_parts = []
                    for k, v in event.metadata.items():
                        if k in ("tool", "run_id"):
                            meta_parts.append(f"{k}={v}")
                    content = ", ".join(meta_parts) if meta_parts else str(event.metadata)[:200]

                log_entry = AgentLog(
                    session_id=uuid.UUID(event.session_id),
                    run_id=event.run_id,
                    event_type=event_type_str,
                    level=level,
                    source=source,
                    content=content[:2000],  # guard against huge tool outputs
                )
                db.add(log_entry)
                db.commit()
            finally:
                db.close()

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _write)
            
    async def subscribe(self, session_id: str):
        """
        Creates a new Redis PubSub object and subscribes to the session's channel.
        Yields events as they arrive.
        """
        pubsub = self.redis_client.pubsub()
        channel = f"session:{session_id}"
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                # pubsub.listen() also yields subscribe/unsubscribe lifecycle messages
                if message['type'] == 'message':
                    # The actual payload is in the 'data' field (bytes)
                    data = message['data'].decode('utf-8')
                    # We expect data to be valid JSON, yielded as SSE 'data'
                    yield f"data: {data}\n\n"
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
    
    @staticmethod
    def create_event(
        session_id: str, 
        event_type: AgentEventType, 
        content: str = "", 
        metadata: Dict[str, Any] = None,
        run_id: Optional[str] = None
    ) -> AgentEvent:
        return AgentEvent(
            session_id=str(session_id),
            type=event_type,
            content=content,
            metadata=metadata or {},
            run_id=run_id
        )
