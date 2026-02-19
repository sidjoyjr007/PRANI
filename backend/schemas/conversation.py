from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

# Message Schemas
class MessageBase(BaseModel):
    role: str # 'user', 'assistant', 'system'
    content: Any # JSONB (str or dict/list for tool calls)

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Conversation Schemas
class ConversationBase(BaseModel):
    title: str

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    agent_id: Optional[UUID] = None

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    agent_id: Optional[UUID] = None

class ConversationResponse(ConversationBase):
    id: UUID
    # user_id: Optional[UUID] = None
    agent_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ConversationListResponse(BaseModel):
    id: UUID
    title: str
    agent_id: Optional[UUID] = None
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
