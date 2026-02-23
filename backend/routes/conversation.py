from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from config.database import get_db
from schemas.conversation import (
    ConversationCreate, 
    ConversationUpdate, 
    ConversationResponse, 
    ConversationListResponse,
    MessageCreate,
    MessageResponse
)
from services.conversation_service import ConversationService
from models.conversation import Conversation, Message
from middleware.security import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=List[ConversationResponse])
def get_conversations(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    conversations = service.get_conversations(user_id=current_user.id, skip=skip, limit=limit)
    return conversations

@router.post("/", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    return service.create_conversation(conversation, user_id=current_user.id)

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: UUID, conversation: ConversationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    updated_conversation = service.update_conversation(conversation_id, conversation, user_id=current_user.id)

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    success = service.delete_conversation(conversation_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

from fastapi.responses import StreamingResponse
from services.execution_service import ExecutionService

@router.post("/{conversation_id}/messages", response_model=None)
async def add_message(conversation_id: UUID, message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Adds a user message and streams the agent's response.
    Returns a StreamingResponse (Server-Sent Events).
    """
    conversation_service = ConversationService(db)
    # Verify conversation exists first
    conversation = conversation_service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # If no agent attached, just save the message (fallback behavior, or raise error)
    if not conversation.agent_id:
        # Fallback: Just save user message
        created_message = conversation_service.add_message(conversation_id, message)
        # Mock stream or return JSON? 
        # For consistency with frontend expecting stream, we might want to mock a stream 
        # or handle this case in frontend. 
        # For now, let's just return the message as JSON if no agent (client handles 200 JSON vs Stream).
        # Actually, best to enforce Agent for now or stream a "No agent selected" message.
        return created_message

    execution_service = ExecutionService(db)
    
    # Create generator
    # We pass user content string. Handle rich content parsing if needed.
    user_content = message.content if isinstance(message.content, str) else str(message.content)

    return StreamingResponse(
        execution_service.run_agent(conversation.agent_id, conversation_id, user_id=current_user.id, user_content=user_content),
        media_type="text/event-stream"
    )

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(conversation_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    # Verify conversation exists
    conversation = service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return service.get_messages(conversation_id, user_id=current_user.id)

from schemas.execution import ApprovalRequest

@router.post("/{conversation_id}/resume", response_model=None)
async def resume_execution(conversation_id: UUID, request: ApprovalRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Resumes execution for a paused conversation (HITL).
    Accepts approved tool calls and continues the agent loop.
    """
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation.agent_id:
        raise HTTPException(status_code=400, detail="Conversation has no agent attached")

    execution_service = ExecutionService(db)
    
    return StreamingResponse(
        execution_service.run_agent(
            agent_id=conversation.agent_id, 
            session_id=conversation_id, 
            user_id=current_user.id,
            user_content=None, 
            approved_tool_calls=request.approved_tool_calls
        ),
        media_type="text/event-stream"
    )
