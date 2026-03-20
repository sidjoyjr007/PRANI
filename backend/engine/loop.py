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
from engine.workspace import WorkspacePlanner
from llm.types import ProviderMessage
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
        workspace_state: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None
    ):
        self.agent = agent
        self.session_id = session_id
        self.db = db
        self.user_id = user_id
        self.llm = llm_provider
        self.bus = event_bus
        self.run_id = run_id or str(uuid.uuid4())
        
        self.memory = ContextManager(db, uuid.UUID(session_id), agent, user_id, run_id=uuid.UUID(self.run_id) if self.run_id else None)
        self.tool_registry = ToolRegistry(db)
        self.workspace_planner = WorkspacePlanner()
        if workspace_state: self.workspace_planner.from_dict(workspace_state)
        
        # New specialized handlers
        self.cleaner = ResponseCleaner()
        self.tool_handler = ToolHandler(
            db, user_id, session_id, event_bus, self.memory, 
            self.workspace_planner, self.tool_registry, agent, self.run_id
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
                
                # Set up context and Inject Virtual Markdown Workspace
                context = await self.memory.get_active_context()
                
                plan_md = self.workspace_planner.get_plan_markdown()
                if plan_md:
                    workspace_prompt = f"VIRTUAL WORKSPACE PLAN:\n{plan_md}\n\n(Remember: Update this using `update_workspace` as you progress.)"
                    # Inject at the very beginning of the context window so it's always top-of-mind
                    context.insert(0, ProviderMessage(role="system", content=workspace_prompt))

                # UI Pulse & State Sync
                await self._emit_plan_if_changed()
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Step {self.loop_count}: Thinking...", run_id=self.run_id))

                # 0.5 Stall Guard: Force pivot if a task fails too many times
                stall_guidance = ""
                # This stall guard is now handled by the cleaner.detect_loop
                
                if stall_guidance:
                    context.insert(0, ProviderMessage(role="system", content=stall_guidance))

                active_task_desc = self.workspace_planner.get_active_task()
                enriched_input = user_input
                if active_task_desc:
                    enriched_input = f"User Request: {user_input}\nCurrent Focus: {active_task_desc}" if user_input else f"Current Focus: {active_task_desc}"

                turn_data = {}
                await self.action_handler.get_turn_action(
                    turn_data, approved_tool_calls, [], context, enriched_input, 
                    self.tool_handler.pending_tool_refinement, 
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
                    # Enhanced Stall Guard via Cleaner:
                    stall_prompt = "SYSTEM PROTOCOL ERROR: You are stuck in a repeating cycle of failed or identical actions. You are STALLED. You MUST use 'update_workspace' to rewrite your plan.md and take a fundamentally different approach."
                    await self.memory.add_message(role="system", content=stall_prompt, display=False)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Loop detected. Forcing pivot...", run_id=self.run_id))
                    tool_calls_buffer = []
                    continue

                # 0.7 Exit Guard: Refuse completion if subtasks are active
                if is_complete and not self.workspace_planner.is_plan_fully_resolved():
                    logger.warning(f"Exit Guard triggered for session {self.session_id}")
                    exit_error = "SYSTEM PROTOCOL ERROR: You attempted to complete the session, but your workspace plan still has unchecked tasks ('- [ ]'). You MUST either complete them, mark them as checked intentionally, or REMOVE them from the plan using 'update_workspace' before you can finish."
                    
                    # Inject error as a system message and force continue
                    await self.memory.add_message(role="system", content=exit_error, display=False)
                    is_complete = False
                    # Allow one more thinking turn to fix the state
                    continue

                # 1. Execute Actions
                if tool_calls_buffer:
                    await self.state_service.save_agent_state(self.session_id, "TOOL_EXECUTION")
                    is_approval_required = await self.tool_handler.execute_tool_calls(tool_calls_buffer, full_content, thoughts, is_approved_turn)
                    if is_approval_required:
                        await self.state_service.save_agent_state(self.session_id, "AWAITING_APPROVAL")
                        await self.state_service.save_plan(self.session_id, self.workspace_planner.to_dict())
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
        plan_md = self.workspace_planner.get_plan_markdown()
        plan_hash = hashlib.md5(plan_md.encode()).hexdigest()
        
        if plan_hash != self._last_emitted_plan_hash:
            # Save the dict (which wraps the string)
            await self.state_service.save_plan(self.session_id, self.workspace_planner.to_dict())
            # Emit just the string to the frontend
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.PLAN, content=plan_md, run_id=self.run_id))
            self._last_emitted_plan_hash = plan_hash
