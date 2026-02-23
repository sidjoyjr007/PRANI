from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.conversation import Conversation, Message
from schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate
from uuid import UUID
from datetime import datetime
from typing import List, Any

class ConversationService:
    def __init__(self, db: Session):
        self.db = db

    def get_conversations(self, user_id: UUID, limit: int = 50, skip: int = 0):
        # Ordered by updated_at desc (most recent first)
        return self.db.query(Conversation).filter(Conversation.user_id == user_id).order_by(desc(Conversation.updated_at)).offset(skip).limit(limit).all()

    def get_conversation(self, conversation_id: UUID, user_id: UUID = None):
        query = self.db.query(Conversation).filter(Conversation.id == conversation_id)
        if user_id:
            query = query.filter(Conversation.user_id == user_id)
        return query.first()

    def get_message(self, message_id: UUID, user_id: UUID = None):
        query = self.db.query(Message).filter(Message.id == message_id)
        if user_id:
            query = query.join(Conversation).filter(Conversation.user_id == user_id)
        return query.first()

    def create_conversation(self, conversation_data: ConversationCreate, user_id: UUID):
        conversation = Conversation(**conversation_data.model_dump(), user_id=user_id)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def update_conversation(self, conversation_id: UUID, conversation_data: ConversationUpdate, user_id: UUID):
        conversation = self.get_conversation(conversation_id, user_id)
        if not conversation:
            return None
        
        update_data = conversation_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(conversation, key, value)
        
        # Also update 'updated_at' manually if desired, but SQLAlchemy hook handles it
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: UUID, user_id: UUID):
        conversation = self.get_conversation(conversation_id, user_id)
        if conversation:
            self.db.delete(conversation)
            self.db.commit()
            return True
        return False

    def add_message(self, conversation_id: UUID, message_data: MessageCreate, user_id: UUID = None, created_at: datetime = None):
        conversation = self.get_conversation(conversation_id, user_id=user_id)
        if not conversation:
            return None
        
        message = Message(
            conversation_id=conversation_id,
            role=message_data.role,
            content=message_data.content
        )
        if created_at:
            message.created_at = created_at
            
        self.db.add(message)
        
        # Update conversation.updated_at
        conversation.updated_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_messages(self, conversation_id: UUID, user_id: UUID = None):
        query = self.db.query(Message).filter(Message.conversation_id == conversation_id)
        if user_id:
            query = query.join(Conversation).filter(Conversation.user_id == user_id)
        return query.order_by(Message.created_at).all()

    def delete_messages(self, message_ids: List[UUID], user_id: UUID = None):
        if not message_ids:
            return
        query = self.db.query(Message).filter(Message.id.in_(message_ids))
        if user_id:
            query = query.join(Conversation).filter(Conversation.user_id == user_id)
        query.delete(synchronize_session=False)
        self.db.commit()

    def update_message(self, message_id: UUID, content: Any, user_id: UUID = None):
        message = self.get_message(message_id, user_id=user_id)
        if message:
            message.content = content
            self.db.commit()
            self.db.refresh(message)
            return message
        return None
