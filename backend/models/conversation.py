from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from config.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Todos: Add User Auth later if needed, currently nullable or omitted based on auth status. Plan said nullable/todo.
    # I'll include it as nullable for future proofing if User model exists.
    # Checking user.py content from step 3159, User model exists.
    # user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) 
    # For now, I'll omit user_id strictly if auth isn't fully wired up in the plan, but the plan mentioned it.
    # Let's stick to the plan: "user_id: UUID (FK, nullable/todo)". I'll add it nullable.
    title = Column(String, nullable=False, default="New Conversation")
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    # agent = relationship("Agent") # Optional, if we want to access agent details directly

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(JSONB, nullable=False) # Rich content
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
