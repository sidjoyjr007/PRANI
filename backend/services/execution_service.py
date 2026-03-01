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
from services.state_service import StateService

logger = logging.getLogger(__name__)

class ExecutionService:
    _active_tasks: Dict[UUID, asyncio.Task] = {}

    def __init__(self, db: Session):
        self.db = db
        self.agent_service = AgentService
        self.conversation_service = ConversationService(db)
        self.event_bus = EventBus()

    def abort_agent(self, session_id: UUID) -> bool:
        """
        Cancels an active background agent execution loop.
        """
        task = self._active_tasks.get(session_id)
        if task and not task.done():
            task.cancel()
            return True
        return False

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

    async def run_agent_background(
        self, 
        agent_id: UUID, 
        session_id: UUID, 
        user_id: UUID, 
        user_content: str = None, 
        approved_tool_calls: List[Dict] = None
    ) -> None:
        """
        Main execution entry point, running as a background task.
        Executes the AgenticLoop. The loop will asynchronously publish events via EventBus.
        """
        from config.database import SessionLocal
        
        # We create a new local DB session for the background task to prevent thread sharing issues
        db = SessionLocal()
        
        print(f"[DEBUG] ExecutionService: run_agent_background started. session_id={session_id}, is_resume={bool(approved_tool_calls)}")
        
        try:
            # 1. Fetch Agent & LLM
            agent = self.agent_service.get_agent(db, agent_id, user_id=user_id)
            if not agent:
                await self.event_bus.emit(self.event_bus.create_event(str(session_id), AgentEventType.ERROR, content="Agent not found"))
                return

            if not agent.llm_id:
                await self.event_bus.emit(self.event_bus.create_event(str(session_id), AgentEventType.ERROR, content="Agent has no LLM configured"))
                return
                
            llm_config = db.query(LLM).filter(LLM.id == agent.llm_id).first()
            if not llm_config:
                await self.event_bus.emit(self.event_bus.create_event(str(session_id), AgentEventType.ERROR, content="LLM configuration not found"))
                return

            # 2. Resolve Secrets & Init Provider
            # For background tasks, we must fetch fresh secrets on the new session
            # However, since UserToolSecret resolves lazily inside the loop, the loop needs the new DB session.
            
            # Use original db for resolve_secrets since _resolve_secrets uses self.db
            # Wait, let's inject the new DB session
            secrets = db.query(LLMSecret).filter(LLMSecret.llm_id == llm_config.id).all()
            resolved_secrets = {}
            for s in secrets:
                try:
                    resolved_secrets[s.name] = decrypt_value(s.encrypted_value)
                except Exception as e:
                    logger.error(f"Failed to decrypt secret {s.name}: {e}")
                    resolved_secrets[s.name] = ""
                    
            try:
                provider = LLMFactory.create_provider(llm_config, resolved_secrets)
            except Exception as e:
                await self.event_bus.emit(self.event_bus.create_event(str(session_id), AgentEventType.ERROR, content=str(e)))
                return

            state_service = StateService()
                
            # 3. Handle Subtask State
            # If there's new user_content (a new request), clear any old state to start fresh
            if user_content and not approved_tool_calls:
                state_service.clear_plan(str(session_id))
                subtask_state = None
                # Explicitly notify frontend to clear the plan UI
                await self.event_bus.emit(self.event_bus.create_event(
                    str(session_id), 
                    AgentEventType.PLAN, 
                    metadata={"plan": {"subtasks": {}, "execution_order": []}}
                ))
            else:
                # If it's a resume (or no new text), try to load state
                subtask_state = state_service.load_plan(str(session_id))

            # 4. Instantiate Engine
            loop = AgenticLoop(
                agent=agent,
                session_id=str(session_id),
                db=db, # Pass the new background DB session
                llm_provider=provider,
                event_bus=self.event_bus,
                user_id=user_id,
                subtask_state=subtask_state
            )
            
            # Store the current running task for cancellation
            current_task = asyncio.current_task()
            if current_task:
                self.__class__._active_tasks[session_id] = current_task

            # 5. Run Loop
            # Use empty string if no user content (e.g. resume flow)
            input_text = user_content or ""
            
            await loop.run(user_input=input_text, approved_tool_calls=approved_tool_calls)
                
        except asyncio.CancelledError:
            logger.info(f"Agent execution for session {session_id} was successfully canceled.")
            # Important: CancelledError should be allowed to bubble if needed by asyncio, 
            # but usually in background tasks it's safe to just catch and log it so it exits cleanly.
        except Exception as e:
            logger.error(f"Execution Error: {e}")
            import traceback
            traceback.print_exc()
            await self.event_bus.emit(self.event_bus.create_event(str(session_id), AgentEventType.ERROR, content=str(e)))
        finally:
            if session_id in self.__class__._active_tasks:
                del self.__class__._active_tasks[session_id]
            db.close()
