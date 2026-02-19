from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.conversation import Conversation, Message
from schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate
from uuid import UUID
from datetime import datetime

class ConversationService:
    def __init__(self, db: Session):
        self.db = db

    def get_conversations(self, limit: int = 50, skip: int = 0):
        # Ordered by updated_at desc (most recent first)
        return self.db.query(Conversation).order_by(desc(Conversation.updated_at)).offset(skip).limit(limit).all()

    def get_conversation(self, conversation_id: UUID):
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def create_conversation(self, conversation_data: ConversationCreate):
        conversation = Conversation(**conversation_data.model_dump())
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def update_conversation(self, conversation_id: UUID, conversation_data: ConversationUpdate):
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None
        
        update_data = conversation_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(conversation, key, value)
        
        # Also update 'updated_at' manually if desired, but SQLAlchemy hook handles it
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: UUID):
        conversation = self.get_conversation(conversation_id)
        if conversation:
            self.db.delete(conversation)
            self.db.commit()
            return True
        return False

    def add_message(self, conversation_id: UUID, message_data: MessageCreate):
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None
        
        message = Message(
            conversation_id=conversation_id,
            role=message_data.role,
            content=message_data.content
        )
        self.db.add(message)
        
        # Update conversation.updated_at
        conversation.updated_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_messages(self, conversation_id: UUID):
        return self.db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
