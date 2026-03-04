from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.conversation import Conversation, Message
from schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate
from uuid import UUID
from datetime import datetime
from typing import List, Any
import tiktoken
import json

class ConversationService:
    def __init__(self, db: Session):
        self.db = db
        self._tokenizer = tiktoken.get_encoding("cl100k_base")

    def _calculate_tokens(self, role: str, content: Any) -> int:
        try:
            content_str = content if isinstance(content, str) else json.dumps(content)
            # Simple approximation of OpenAI message token counting
            return len(self._tokenizer.encode(role)) + len(self._tokenizer.encode(content_str)) + 4
        except Exception:
            return 0

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
        try:
            conversation = Conversation(**conversation_data.model_dump(), user_id=user_id)
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
            return conversation
        except Exception:
            self.db.rollback()
            raise

    def update_conversation(self, conversation_id: UUID, conversation_data: ConversationUpdate, user_id: UUID):
        try:
            conversation = self.get_conversation(conversation_id, user_id)
            if not conversation:
                return None
            
            update_data = conversation_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(conversation, key, value)
            
            self.db.commit()
            self.db.refresh(conversation)
            return conversation
        except Exception:
            self.db.rollback()
            raise

    def delete_conversation(self, conversation_id: UUID, user_id: UUID):
        try:
            conversation = self.get_conversation(conversation_id, user_id)
            if conversation:
                self.db.delete(conversation)
                self.db.commit()
                return True
            return False
        except Exception:
            self.db.rollback()
            raise

    def add_message(self, conversation_id: UUID, message_data: MessageCreate, user_id: UUID = None, created_at: datetime = None):
        try:
            conversation = self.get_conversation(conversation_id, user_id=user_id)
            if not conversation:
                return None
            
            message = Message(
                conversation_id=conversation_id,
                role=message_data.role,
                content=message_data.content,
                tokens=self._calculate_tokens(message_data.role, message_data.content)
            )
            if created_at:
                message.created_at = created_at
                
            self.db.add(message)
            conversation.updated_at = datetime.now()
            
            self.db.commit()
            self.db.refresh(message)
            return message
        except Exception:
            self.db.rollback()
            raise

    def get_messages(self, conversation_id: UUID, user_id: UUID = None):
        query = self.db.query(Message).filter(Message.conversation_id == conversation_id)
        if user_id:
            query = query.join(Conversation).filter(Conversation.user_id == user_id)
        return query.order_by(Message.created_at).all()

    def delete_messages(self, message_ids: List[UUID], user_id: UUID = None):
        if not message_ids:
            return
        try:
            query = self.db.query(Message).filter(Message.id.in_(message_ids))
            if user_id:
                query = query.join(Conversation).filter(Conversation.user_id == user_id)
            query.delete(synchronize_session=False)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def update_message(self, message_id: UUID, content: Any, user_id: UUID = None):
        try:
            message = self.get_message(message_id, user_id=user_id)
            if message:
                message.content = content
                message.tokens = self._calculate_tokens(message.role, content)
                self.db.commit()
                self.db.refresh(message)
                return message
            return None
        except Exception:
            self.db.rollback()
            raise

    def bulk_update_messages(self, updates: List[dict], user_id: UUID = None):
        if not updates:
            return
        try:
            for update in updates:
                message = self.get_message(update["id"], user_id=user_id)
                if message:
                    message.content = update["content"]
                    message.tokens = self._calculate_tokens(message.role, update["content"])
            
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
