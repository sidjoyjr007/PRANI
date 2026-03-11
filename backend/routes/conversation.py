from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

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

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def add_message(conversation_id: UUID, message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversation_service = ConversationService(db)
    # Verify conversation exists first
    conversation = conversation_service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # If no agent attached, just save the message (fallback behavior, or raise error)
    if not conversation.agent_id:
        # Fallback: Just save user message
        created_message = conversation_service.add_message(conversation_id, message)
        return created_message

    # Save the user message to the database first
    created_message = conversation_service.add_message(conversation_id, message)

    execution_service = ExecutionService(db)

    user_content = message.content if isinstance(message.content, str) else str(message.content)

    # Launch agent loop in the background
    # Launch agent loop in the background, keeping a strong reference
    execution_service.launch_agent(
        agent_id=conversation.agent_id, 
        session_id=conversation_id, 
        user_id=current_user.id, 
        user_content=user_content
    )

    return created_message

from engine.events import EventBus

@router.get("/{conversation_id}/events")
async def stream_conversation_events(conversation_id: UUID, current_user: User = Depends(get_current_user)):
    """
    Subscribe to agent execution events for this conversation via Redis Pub/Sub.
    Returns a Server-Sent Events (SSE) stream.
    """
    event_bus = EventBus()
    return StreamingResponse(
        event_bus.subscribe(str(conversation_id)),
        media_type="text/event-stream"
    )

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(conversation_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ConversationService(db)
    # Verify conversation exists
    conversation = service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = service.get_messages(conversation_id, user_id=current_user.id)
    # Filter out technical "garbage" (tool results and internal system prompts) for the UI
    return [m for m in messages if m.role not in ["tool", "system"]]

from services.state_service import StateService

@router.get("/{conversation_id}/plan")
async def get_conversation_plan(conversation_id: UUID, current_user: User = Depends(get_current_user)):
    state_service = StateService()
    plan = await state_service.load_plan(str(conversation_id))
    if not plan:
        return {"plan": None}
    return {"plan": plan}

@router.get("/{conversation_id}/state")
async def get_conversation_state(conversation_id: UUID, current_user: User = Depends(get_current_user)):
    """
    Returns the current agent execution state (e.g. IDLE, THINKING, TOOL_EXECUTION, AWAITING_APPROVAL)
    and the current execution plan. Used by UI to reconstruct view gracefully.
    """
    state_service = StateService()
    plan = await state_service.load_plan(str(conversation_id))
    agent_state = await state_service.load_agent_state(str(conversation_id))
    return {"plan": plan, "agent_state": agent_state or "IDLE"}

from schemas.execution import ApprovalRequest

@router.post("/{conversation_id}/resume", response_model=dict)
async def resume_execution(conversation_id: UUID, request: ApprovalRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.debug(f"POST /resume: session_id={conversation_id}, tools={[tc.get('function', {}).get('name') for tc in request.approved_tool_calls]}")
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation.agent_id:
        raise HTTPException(status_code=400, detail="Conversation has no agent attached")

    execution_service = ExecutionService(db)
    
    # Launch agent loop in the background, keeping a strong reference
    execution_service.launch_agent(
        agent_id=conversation.agent_id, 
        session_id=conversation_id, 
        user_id=current_user.id,
        user_content=None, 
        approved_tool_calls=request.approved_tool_calls
    )
    
    return {"status": "resumed"}

@router.post("/{conversation_id}/abort", response_model=dict)
async def abort_execution(conversation_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Aborts an active agent execution loop for the given conversation.
    """
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    execution_service = ExecutionService(db)
    success = execution_service.abort_agent(conversation_id)
    
    if success:
        from engine.events import EventBus, AgentEventType
        event_bus = EventBus()
        await event_bus.emit(
            event_bus.create_event(str(conversation_id), AgentEventType.ERROR, content="Agent execution aborted by user.")
        )
        return {"status": "aborted"}
    else:
        # It's fine if there wasn't an active task, we just tell the client
        return {"status": "no_active_task"}

