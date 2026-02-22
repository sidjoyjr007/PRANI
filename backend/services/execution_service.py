from sqlalchemy.orm import Session
from typing import Iterator, List, Dict, Any, Optional
from uuid import UUID
import json
import logging
import asyncio

from models.agent import Agent
from models.llm import LLM
from models.secret import LLMSecret
from models.conversation import Message

from services.agent_service import AgentService
from services.conversation_service import ConversationService
from schemas.conversation import MessageCreate

from llm.factory import LLMFactory
from utils.encryption import decrypt_value

from engine.loop import AgenticLoop
from engine.events import EventBus, AgentEventType

logger = logging.getLogger(__name__)

class ExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.agent_service = AgentService
        self.conversation_service = ConversationService(db)
        self.event_bus = EventBus()

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

    async def run_agent(self, agent_id: UUID, session_id: UUID, user_content: str = None, approved_tool_calls: List[Dict] = None) -> Iterator[str]:
        """
        Main execution entry point.
        Now orchestrates the AgenticLoop and yields SSE events.
        bSupports standard chat and HITL resume.
        """
        # 1. Fetch Agent & LLM
        agent = self.agent_service.get_agent(self.db, agent_id)
        if not agent:
            yield f"data: {json.dumps({'error': 'Agent not found'})}\n\n"
            return

        if not agent.llm_id:
            yield f"data: {json.dumps({'error': 'Agent has no LLM configured'})}\n\n"
            return
            
        llm_config = self.db.query(LLM).filter(LLM.id == agent.llm_id).first()
        if not llm_config:
            yield f"data: {json.dumps({'error': 'LLM configuration not found'})}\n\n"
            return

        # 2. Save User Message to DB (Only if new content)
        if user_content:
            # We do this synchronously before starting the loop
            self.conversation_service.add_message(
                session_id, 
                MessageCreate(role="user", content=user_content)
            )
        
        # 3. Resolve Secrets & Init Provider
        secrets = self._resolve_secrets(llm_config.id)
        try:
            provider = LLMFactory.create_provider(llm_config, secrets)
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        try:
            print("[run_agent] Starting agent loop instantiation.")
            # 4. Instantiate Engine
            loop = AgenticLoop(
                agent=agent,
                session_id=str(session_id),
                db=self.db,
                llm_provider=provider,
                event_bus=self.event_bus
            )
            print("[run_agent] AgenticLoop instantiated successfully.")
            
            # 5. Run Loop and Stream Events
            print(f"[run_agent] Starting async for loop over AgenticLoop.run() with user content: '{user_content}'")
            
            # Use empty string if no user content (e.g. resume flow)
            input_text = user_content or ""
            
            count = 0
            async for event in loop.run(user_input=input_text, approved_tool_calls=approved_tool_calls):
                count += 1
                print(f"[run_agent] Received event #{count}: {event.type}")
                
                from fastapi.encoders import jsonable_encoder
                
                # Convert AgentEvent to frontend-friendly JSON
                # Using jsonable_encoder to handle nested Pydantic models like ToolCall
                payload = jsonable_encoder(event)
                
                # Yield the structured event
                yield f"data: {json.dumps(payload)}\n\n"

            print("[run_agent] Loop finished successfully.")
            # End of stream
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Execution Error: {e}")
            print(f"[run_agent] Caught Exception: {e}")
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
