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

router = APIRouter()

@router.get("/", response_model=List[ConversationResponse])
def get_conversations(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    service = ConversationService(db)
    conversations = service.get_conversations(skip=skip, limit=limit)
    return conversations

@router.post("/", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    service = ConversationService(db)
    return service.create_conversation(conversation)

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: UUID, conversation: ConversationUpdate, db: Session = Depends(get_db)):
    service = ConversationService(db)
    updated_conversation = service.update_conversation(conversation_id, conversation)
    if not updated_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return updated_conversation

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    service = ConversationService(db)
    success = service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def add_message(conversation_id: UUID, message: MessageCreate, db: Session = Depends(get_db)):
    service = ConversationService(db)
    # Verify conversation exists first
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    created_message = service.add_message(conversation_id, message)
    return created_message

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(conversation_id: UUID, db: Session = Depends(get_db)):
    service = ConversationService(db)
    # Verify conversation exists
    conversation = service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return service.get_messages(conversation_id)
