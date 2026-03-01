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

class EventBus:
    """
    Redis-backed event bus.
    In the agent loop, events will be published to `session:{session_id}`.
    Clients can subscribe to this channel using the async `subscribe()` method.
    """
    def __init__(self):
        # Create a single connection pool for the bus instance (or could be global)
        self.redis_client = redis.from_url(settings.redis_url)

    async def emit(self, event: AgentEvent):
        """
        Asynchronously publish the AgentEvent JSON payload to the corresponding Redis channel.
        """
        try:
            channel = f"session:{event.session_id}"
            # Serialize the event to JSON
            payload = event.model_dump_json()
            # Trace log
            print(f"[EVENT] Emitting {event.type} to {channel} (run_id={event.run_id})")
            # Publish to Redis
            await self.redis_client.publish(channel, payload)
        except Exception as e:
            logger.error(f"Failed to publish event to Redis: {e}")
            
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
