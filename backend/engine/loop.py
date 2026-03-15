import asyncio
import os
import uuid
import json
import logging
from typing import List, Optional, Dict, Any
import time

from sqlalchemy.orm import Session
from engine.events import EventBus, AgentEventType
from engine.memory import ContextManager
from engine.tools import ToolRegistry
from engine.subtasks import SubtaskManager, SubtaskStatus
from engine.logic.cleaner import ResponseCleaner
from engine.logic.tool_handler import ToolHandler
from engine.logic.action_handler import ActionHandler
from models.agent import Agent

logger = logging.getLogger(__name__)

class AgenticLoop:
    def __init__(
        self, 
        agent: Agent, 
        session_id: str,
        db: Session,
        llm_provider, 
        event_bus: EventBus,
        user_id: uuid.UUID,
        subtask_state: Optional[Dict[str, Any]] = None
    ):
        self.agent = agent
        self.session_id = session_id
        self.db = db
        self.user_id = user_id
        self.llm = llm_provider
        self.bus = event_bus
        self.run_id = str(uuid.uuid4())
        
        self.memory = ContextManager(db, uuid.UUID(session_id), agent, user_id)
        self.tool_registry = ToolRegistry(db)
        self.subtask_manager = SubtaskManager.from_dict(subtask_state) if subtask_state else SubtaskManager()
        
        # New specialized handlers
        self.cleaner = ResponseCleaner()
        self.tool_handler = ToolHandler(
            db, user_id, session_id, event_bus, self.memory, 
            self.subtask_manager, self.tool_registry, agent, self.run_id
        )
        self.action_handler = ActionHandler(
            llm_provider, event_bus, self.memory, session_id, self.run_id,
            self.tool_registry, agent, user_id, self.cleaner
        )
        
        from services.state_service import StateService
        self.state_service = StateService()
        
        self.loop_count = 0
        self.max_loops = 15
        self._last_emitted_plan_hash = None
        self.loop_warning_triggered = False

    async def run(self, user_input: str, approved_tool_calls: Optional[List[Dict]] = None) -> None:
        logger.debug(f"AgenticLoop.run: entered. session_id={self.session_id}")
        try:
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_START, metadata={"run_id": self.run_id}, run_id=self.run_id))
            
            # 1. Automated Context Summarization
            if await self.action_handler.should_summarize():
                await self.action_handler.execute_summarization()
                
            if not user_input:
                user_input = await self.memory.get_goal_text()
            
            is_approved_turn = bool(approved_tool_calls)
            
            while self.loop_count < self.max_loops:
                self.loop_count += 1
                await self.state_service.save_agent_state(self.session_id, "THINKING")
                
                # Setup Iteration
                status_report = self.subtask_manager.get_status_report()
                current_task = self.subtask_manager.get_current_task()
                
                if current_task and current_task.status == SubtaskStatus.PENDING:
                    self.subtask_manager.mark_in_progress(current_task.id)
                    status_report = self.subtask_manager.get_status_report()

                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Iteration {self.loop_count}: Thinking...", run_id=self.run_id))
                
                context = await self.memory.get_active_context()
                turn_data = {}
                await self.action_handler.get_turn_action(
                    turn_data, approved_tool_calls, [], context, current_task, 
                    status_report, user_input, self.tool_handler.pending_tool_refinement, 
                    self.loop_warning_triggered
                )
                
                full_content = turn_data.get("full_content", "")
                tool_calls_buffer = turn_data.get("tool_calls", [])
                thoughts = turn_data.get("thoughts", [])
                is_complete = turn_data.get("is_complete", False)

                # PRANI-FIX: Clear approved_tool_calls after the first turn so we don't re-execute them
                approved_tool_calls = None
                
                # Reset loop warning after it has been used by action_handler
                self.loop_warning_triggered = False

                if self.cleaner.detect_loop(full_content, tool_calls_buffer):
                    self.loop_warning_triggered = True
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Loop detected. Self-correcting...", run_id=self.run_id))
                    tool_calls_buffer = []
                    continue

                # 1. Execute Actions
                if tool_calls_buffer:
                    await self.state_service.save_agent_state(self.session_id, "TOOL_EXECUTION")
                    is_approval_required = await self.tool_handler.execute_tool_calls(tool_calls_buffer, full_content, thoughts, is_approved_turn)
                    if is_approval_required:
                        await self.state_service.save_agent_state(self.session_id, "AWAITING_APPROVAL")
                        await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                        return 

                    await self._emit_plan_if_changed()
                    is_approved_turn = False
                    continue 

                # 2. Check complete state
                if is_complete:
                    await self.state_service.clear_plan(self.session_id)
                    await self.memory.add_message(role="assistant", content=full_content, thoughts=thoughts)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=full_content, run_id=self.run_id))
                    break 

                # 3. Final Fallback
                if full_content and not tool_calls_buffer:
                    await self.memory.add_message(role="assistant", content=full_content, thoughts=thoughts)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=full_content, run_id=self.run_id))
                    if is_complete:
                        break
                    else:
                        # PRANI-FIX: Fix for Flaw #2 (Status Update Trap)
                        # We have a message but no tools AND we are not "complete" (likely subtasks exist).
                        # Let the loop continue so the agent can keep working autonomously.
                        continue

            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE, run_id=self.run_id))
            
        except asyncio.CancelledError:
            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE, run_id=self.run_id))
            raise  
            
        except Exception as e:
            logger.error(f"Loop Error: {e}")
            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content=str(e), run_id=self.run_id))

    async def _emit_plan_if_changed(self):
        import hashlib
        plan_dict = self.subtask_manager.to_dict()
        plan_json = json.dumps(plan_dict, sort_keys=True)
        plan_hash = hashlib.md5(plan_json.encode()).hexdigest()
        
        if plan_hash != self._last_emitted_plan_hash:
            await self.state_service.save_plan(self.session_id, plan_dict)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.PLAN, metadata={"plan": plan_dict}, run_id=self.run_id))
            self._last_emitted_plan_hash = plan_hash
