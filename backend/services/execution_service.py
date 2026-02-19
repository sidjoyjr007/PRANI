from sqlalchemy.orm import Session
from typing import Iterator, List, Dict, Any, Optional
from uuid import UUID
import json
import logging

from models.agent import Agent
from models.llm import LLM
from models.secret import LLMSecret
from models.conversation import Message

from services.agent_service import AgentService
from services.conversation_service import ConversationService
from schemas.conversation import MessageCreate

from llm.factory import LLMFactory
from llm.types import ProviderMessage, LLMStreamChunk
from utils.encryption import decrypt_value

logger = logging.getLogger(__name__)

class ExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.agent_service = AgentService
        self.conversation_service = ConversationService(db)

    def _resolve_secrets(self, llm_id: UUID) -> Dict[str, str]:
        """
        Resolves encrypted secrets for an LLM.
        """
        secrets = self.db.query(LLMSecret).filter(LLMSecret.llm_id == llm_id).all()
        resolved = {}
        for s in secrets:
            try:
                resolved[s.name] = decrypt_value(s.encrypted_value)
            except Exception as e:
                logger.error(f"Failed to decrypt secret {s.name}: {e}")
                resolved[s.name] = ""
        return resolved

    def _prepare_history(self, session_id: UUID, new_user_content: str, agent: Agent) -> List[ProviderMessage]:
        """
        Fetches history and constructs the provider message list.
        """
        # 1. System Prompt
        messages = []
        if agent.description:
             messages.append(ProviderMessage(role="system", content=agent.description))
        
        # 2. History
        # We need to fetch messages from DB. limiting context window might be needed later.
        # Ensure we don't fetch the message we just added (if we added it already).
        # OR implementation strategy: Add User message to DB *before* this call, and include it in fetch?
        # Better: Pass new input explicitly, fetch *previous* history.
        
        db_messages = self.conversation_service.get_messages(session_id)
        for m in db_messages:
            # Skip if it matches the current user input? No, rely on predictable ID or just fetch all.
            # Convert DB Message to ProviderMessage
            # content in DB is JSONB. ProviderMessage expects str or list.
            # For now, assume simple string content or handle basic list.
            
            content = m.content
            if isinstance(content, str):
                pass
            elif isinstance(content, list):
                # Check for OpenAI-style parts
                pass
            elif isinstance(content, dict) and "text" in content:
                content = content["text"]
            
            # Handle tool calls in history (future)
            
            messages.append(ProviderMessage(role=m.role, content=content)) # basic mapping

        # 3. New User Message
        # If we saved it to DB already, it might be in db_messages.
        # Let's say the API adds it to DB first.
        # So db_messages includes it.
        
        return messages

    def run_agent(self, agent_id: UUID, session_id: UUID, user_content: str) -> Iterator[str]:
        """
        Main execution loop. Returns a generator yielding SSE data strings.
        """
        # 1. Fetch Agent & LLM
        agent = self.agent_service.get_agent(self.db, agent_id)
        if not agent:
            yield f"data: {json.dumps({'error': 'Agent not found'})}\n\n"
            return

        if not agent.llm_id:
            yield f"data: {json.dumps({'error': 'Agent has no LLM configured'})}\n\n"
            return
            
        llm = self.db.query(LLM).filter(LLM.id == agent.llm_id).first()
        if not llm:
            yield f"data: {json.dumps({'error': 'LLM configuration not found'})}\n\n"
            return

        # 2. Save User Message to DB
        # We do this synchronously before streaming to ensure state consistency
        user_msg = self.conversation_service.add_message(
            session_id, 
            MessageCreate(role="user", content=user_content)
        )
        
        # 3. Resolve Secrets & Init Provider
        secrets = self._resolve_secrets(llm.id)
        try:
            provider = LLMFactory.create_provider(llm, secrets)
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        # 4. Prepare Context
        # Fetch fresh history which now includes the user message we just saved
        messages = self._prepare_history(session_id, user_content, agent)
        
        # 5. Stream Response
        full_response = []
        
        try:
            for chunk in provider.stream(messages):
                if chunk.content:
                    full_response.append(chunk.content)
                    # Yield SSE format
                    data = json.dumps({"content": chunk.content, "role": "assistant"})
                    yield f"data: {data}\n\n"
                
                # Handle tool calls (future)
                
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': f'Streaming error: {str(e)}'})}\n\n"
            # Fallthrough to save what we have?

        # 6. Save Assistant Response to DB
        final_content = "".join(full_response)
        if final_content:
            self.conversation_service.add_message(
                session_id,
                MessageCreate(role="assistant", content=final_content)
            )
            yield f"data: [DONE]\n\n"
