import asyncio
import os
import uuid
import json
import logging
import re
from typing import AsyncIterator, List, Optional, Dict, Any
import time

from sqlalchemy.orm import Session
from pydantic import ValidationError

from engine.events import EventBus, AgentEvent, AgentEventType
from engine.memory import ContextManager
from engine.tools import ToolRegistry
from engine.executor import DockerExecutor

# PRANI-PERF: Pre-compiled regexes to avoid re-compilation in tight loops
RE_THINKING_FULL = re.compile(r"<thinking>(.*?)</thinking>", re.DOTALL)
RE_THINKING_START = re.compile(r"<thinking>(.*)", re.DOTALL)
RE_SCRUB_THINKING = re.compile(r"<thinking>.*?(</thinking>|$)", re.DOTALL)
RE_JSON_MARKDOWN = re.compile(r"```json.*?```", re.DOTALL)
RE_TOOL_CALL_MIRROR = re.compile(r"\{\s*\"tool_calls\".*?\}\s*\]", re.DOTALL)
RE_RECURSIVE_JSON = re.compile(r"\{[^{}]*\"[^{}]*\".*?\}", re.DOTALL)
RE_JSON_KV_PATTERN = re.compile(r'\"[a-zA-Z0-9_\-]+\"\s*:\s*[\"\{\[\d]')
RE_TECH_CHARS = re.compile(r"[\{\}\[\]\"\:,\\]")

# Emit configuration
CHUNK_EMIT_INTERVAL = 0.05  # 50ms batching
CHUNK_MAX_SIZE = 40        # or 40 characters
from engine.subtasks import SubtaskManager, Subtask, SubtaskStatus
from engine.prompts import get_action_system_prompt, get_compression_prompt
from engine.tool_defs import (
    BUILTIN_TOOL_DEFS, 
    BUILTIN_TOOL_DESCRIPTIONS,
    TOOL_ADD_SUBTASKS, 
    TOOL_UPDATE_SUBTASK_STATUS,
    TOOL_READ_TOOL_RESULTS,
    TOOL_READ_TOOL_RESULTS_DEF
)
from models.agent import Agent
from models.secret import UserToolSecret
from utils.encryption import decrypt_value
from utils.execution import execute_python_tool
from llm.factory import LLMFactory
from llm.types import ProviderMessage, LLMStreamChunk, ToolCall

logger = logging.getLogger(__name__)

SUMMARIZATION_THRESHOLD = int(os.getenv("SUMMARIZATION_THRESHOLD", "60000"))

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
        self.memory = ContextManager(db, uuid.UUID(session_id), agent, user_id)
        self.tool_registry = ToolRegistry(db)
        self.executor = DockerExecutor()

        
        from services.state_service import StateService
        self.state_service = StateService()
        self.subtask_manager = SubtaskManager.from_dict(subtask_state) if subtask_state else SubtaskManager()
        self._last_emitted_plan_hash = None
        
        self.loop_count = 0
        self.max_loops = 15
        self.run_id = str(uuid.uuid4())
        self.action_history: List[str] = []
        self.pending_tool_refinement: Optional[Dict] = None
        
        # Pre-extract allowed IDs for thread-safe tool retrieval
        self.allowed_tool_ids = [tid for tid in agent.tool_ids] if agent.tool_ids else []
        self.allowed_mcp_ids = [sid for sid in agent.mcp_server_ids] if agent.mcp_server_ids else []
        
        # Performance trackers
        self._chunks_since_abort_check = 0
        self._is_confident_not_garbage = False
        self._tool_search_cache = {}
        self._last_plan_report = None

    def clean_tool_name(self, name: str) -> str:
        if not name: return ""
        return name.replace("default_api:", "").replace("default_api.", "")
    async def run(self, user_input: str, approved_tool_calls: Optional[List[Dict]] = None) -> None:
        logger.debug(f"AgenticLoop.run: entered. session_id={self.session_id}, has_input={bool(user_input)}, has_approval={bool(approved_tool_calls)}")
        try:
            # 0. Start execution immediately for UI responsiveness
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_START, metadata={"run_id": self.run_id}, run_id=self.run_id))
            
            # 1. Automated Context Summarization (Threshold-based)
            if await self._should_summarize():
                await self._execute_summarization()
                
            if not user_input:
                user_input = await self.memory.get_goal_text()
            
            logger.debug(f"Loop run started. session_id={self.session_id}, is_approved_turn={bool(approved_tool_calls)}")

            is_approved_turn = bool(approved_tool_calls)
            
            while self.loop_count < self.max_loops:
                self.loop_count += 1
                
                await self.state_service.save_agent_state(self.session_id, "THINKING")
                
                # Setup Iteration - Optimized but sequential to avoid session race conditions
                status_report = self.subtask_manager.get_status_report()
                current_task = self.subtask_manager.get_current_task()
                
                if current_task and current_task.status == SubtaskStatus.PENDING:
                    self.subtask_manager.mark_in_progress(current_task.id)
                    status_report = self.subtask_manager.get_status_report()

                t0 = time.time()
                tool_defs, system_prompt = await self._get_tools_and_prompt(user_input, status_report, current_task)
                t_tools = time.time() - t0
                
                t0 = time.time()
                context = await self.memory.get_active_context()
                t_context = time.time() - t0
                
                logger.info(f"Loop Timing - Tools: {t_tools:.3f}s, Context: {t_context:.3f}s")
                
                self._enrich_context(context, system_prompt)

                logger.info(
                    f"Agent Iteration {self.loop_count}",
                    extra={
                        "status": status_report,
                        "current_task": current_task.description if current_task else None,
                        "context_summary": context
                    }
                )

                t0 = time.time()
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Iteration {self.loop_count}: Thinking...", run_id=self.run_id))
                turn_data = {}
                await self._get_turn_action(turn_data, approved_tool_calls, tool_defs, context, current_task, status_report, user_input)
                t_turn = time.time() - t0
                
                logger.info(f"Loop Timing - Tools: {t_tools:.3f}s, Context: {t_context:.3f}s, TurnAction: {t_turn:.3f}s")
                

                
                full_content = turn_data.get("full_content", "")
                tool_calls_buffer = turn_data.get("tool_calls", [])
                thoughts = turn_data.get("thoughts", [])
                is_complete = turn_data.get("is_complete", False)
                subtask_status = turn_data.get("current_subtask_status")

                if self._detect_loop(full_content, tool_calls_buffer):
                    # 1. Set transient flag
                    self.loop_warning_triggered = True
                    
                    # 2. Emit a non-error status to the user so they know the agent is self-correcting
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Loop detected. Self-correcting...", run_id=self.run_id))
                    
                    # 3. Clear the tools so they don't execute
                    tool_calls_buffer = []
                    
                    # 4. Continue to the next loop iteration so the LLM reads the warning and tries again
                    continue

                # 1. Execute Actions (Highest priority)
                if tool_calls_buffer:
                    await self.state_service.save_agent_state(self.session_id, "TOOL_EXECUTION")
                    is_approval_required = await self._execute_tool_calls(tool_calls_buffer, full_content, thoughts, is_approved_turn)
                    if is_approval_required:
                        await self.state_service.save_agent_state(self.session_id, "AWAITING_APPROVAL")
                        await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                        return 

                    await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    is_approved_turn = False
                    continue 

                # 2. Check complete state
                if is_complete:
                    await self.state_service.clear_plan(self.session_id)
                    await self.memory.add_message(role="assistant", content=full_content, thoughts=thoughts) # Persist final msg
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=full_content, run_id=self.run_id))
                    break 

                # 3. Intermediate Subtask Check
                if subtask_status:
                    await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    continue 

                # 4. We did nothing useful but generated a message (or just stalled out)
                if full_content and not tool_calls_buffer:
                    await self.memory.add_message(role="assistant", content=full_content, thoughts=thoughts)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=full_content, run_id=self.run_id))
                    break

                # 5. Turn Summarization Failsafe:
                # If we executed tools but haven't given a message yet, AND we are nearing the end or subtasks are done
                # Guard: Only summarize ONCE to prevent infinite loops (loop_count < max - 2)
                if not full_content and not tool_calls_buffer and self.loop_count > 0:
                    if self.loop_count >= self.max_loops - 2:
                         # We've tried enough, don't loop forever
                         break
                    
                    # Force a "Summary" turn
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Summarizing results...", run_id=self.run_id))
                    continue

            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE, run_id=self.run_id))
            
        except asyncio.CancelledError:
            logger.info(f"Execution cancelled for run {self.run_id}")
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Cancelled", run_id=self.run_id))
            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE, run_id=self.run_id))
            raise  # bubble up to caller to silently close the task
            
        except Exception as e:
            logger.error(f"Loop Error: {e}")
            await self.state_service.clear_agent_state(self.session_id)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content=str(e), run_id=self.run_id))


    async def _get_tools_and_prompt(self, user_input, status_report, current_task, parse_error=""):
        current_subtask_desc = current_task.description if current_task else user_input
        
        # Optimization: Cache tool search results for the same subtask
        cache_key = f"{current_subtask_desc}|{self.allowed_tool_ids}|{self.allowed_mcp_ids}"
        if cache_key in self._tool_search_cache:
            tool_recs = self._tool_search_cache[cache_key]
        else:
            tool_recs = self.tool_registry.search_tools(
                query=current_subtask_desc, 
                tool_ids=self.allowed_tool_ids, 
                mcp_server_ids=self.allowed_mcp_ids, 
                limit=10
            )
            self._tool_search_cache[cache_key] = tool_recs

        unique_tools = {}
        for t in tool_recs:
            name = self.clean_tool_name(t["name"])
            if name not in unique_tools:
                unique_tools[name] = t
        
        tool_defs = list(BUILTIN_TOOL_DEFS)
        tools_desc_list = list(BUILTIN_TOOL_DESCRIPTIONS)
        
        for name, t in unique_tools.items():
            t_func = {"name": name, "description": t.get("description", ""), "parameters": t.get("schema", {})}
            tool_defs.append({"type": "function", "function": t_func})
            tools_desc_list.append(f"- {name}: {t_func.get('description', '')}\n  Schema: {json.dumps(t_func.get('parameters', {}), indent=2)}")
        
        # Dynamic Tool Injection: Only add read_tool_results if context contains virtual pruning markers
        context = await self.memory.get_active_context()
        has_pruning = any("[VIRTUAL PRUNE" in m.content for m in context if isinstance(m.content, str))
        if has_pruning:
            tool_defs.append(TOOL_READ_TOOL_RESULTS_DEF)
            t_func = TOOL_READ_TOOL_RESULTS_DEF["function"]
            tools_desc_list.append(f"- {t_func['name']}: {t_func['description']}\n  Schema: {json.dumps(t_func['parameters'], indent=2)}")
            logger.debug("Surgical read tool injected into LLM context.")

        history_text = await self.memory.get_history_text(limit=10)
        system_prompt = get_action_system_prompt(
            agent_role=self.agent.name or "Autonomous Agent",
            agent_instructions=self.agent.instructions or "",
            tools_desc="\n".join(tools_desc_list), 
            status_report=status_report,
            current_subtask=current_subtask_desc,
            session_history=history_text,
            parse_error=parse_error,
            global_goal=user_input
        )
        return tool_defs, system_prompt

    def _enrich_context(self, context, system_prompt):
        # 1. Handle main system prompt (ensure it's at index 0 and unique)
        if context and context[0].role == "system":
            context[0].content = system_prompt
        else:
            context.insert(0, ProviderMessage(role="system", content=system_prompt))
            
        # 2. Handle tool refinement hints (avoid duplicates)
        if self.pending_tool_refinement:
            hint = f"IMPORTANT: Previous tool failed. Refinement: {json.dumps(self.pending_tool_refinement)}"
            if not any(m.role == "system" and m.content == hint for m in context):
                # Insert after main system prompt
                context.insert(1, ProviderMessage(role="system", content=hint))

        # 3. Handle loop guardrail ephemerally
        if getattr(self, 'loop_warning_triggered', False):
            warning_msg = "SYSTEM GUARDRAIL: You are caught in a repeating loop. You have attempted the exact same action/tool_call multiple times without success. You MUST completely change your approach, use different tools, or ask the user for clarification. Do not repeat the previous action."
            if not any(m.role == "system" and m.content == warning_msg for m in context):
                context.insert(1, ProviderMessage(role="system", content=warning_msg))
            # Reset after injection to prevent sticky warnings if they break out of the loop
            self.loop_warning_triggered = False

    async def _get_turn_action(self, result: dict, approved_calls, tool_defs, context, current_task, status_report, user_input) -> None:
        if self.loop_count == 1 and approved_calls:
            logger.debug(f"_get_turn_action: Resuming with {len(approved_calls)} calls")
            # Provide immediate feedback for resumed tools
            for tc in approved_calls:
                t_name = tc.get("function", {}).get("name")
                display_name = f"Executing {t_name}..."
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=display_name, run_id=self.run_id))
                
            result.update({"full_content": "Resuming...", "tool_calls": [ToolCall(**atc) for atc in approved_calls], "thoughts": ["Approved."], "is_complete": False})
            return

        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Thinking...", run_id=self.run_id))
        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_START, content="Thinking...", run_id=self.run_id))

        max_retries = 3
        parse_error = ""

        # Fallback variables declared outside loop to handle exhausted retries gracefully
        tool_calls = []
        final_thoughts = []
        is_complete = False
        final_message = ""
        subtask_status = None

        for attempt in range(max_retries):
            # Update system prompt with the parse_error context if there is one
            tool_defs, system_prompt = await self._get_tools_and_prompt(user_input, status_report, current_task, parse_error)
            self._enrich_context(context, system_prompt)
            
            # Set initial transient status
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Thinking...", run_id=self.run_id))

            full_content = ""
            current_thought = ""
            current_message = ""
            streamed_tools = []
            

            # State tracker for streaming chunks
            in_thinking_tag = False
            error_occurred = False
            
            try:
                # PRANI-PERF: Switching to chat endpoint per user request to resolve hanging issues.
                response = await asyncio.to_thread(self.llm.chat, context, tools=tool_defs)
                full_content = response.content or ""
                streamed_tools = response.tool_calls or []
                
                # Emit the full content as chunks for UI compatibility if needed
                # (Or just let the final consolidation handle it)
                if "<thinking>" in full_content:
                    # Minimal parsing for immediate feedback
                    thinking_match = RE_THINKING_FULL.search(full_content)
                    if thinking_match:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_CHUNK, content=thinking_match.group(1), run_id=self.run_id))
                    
                    # Also emit message part
                    msg_only = RE_SCRUB_THINKING.sub("", full_content).strip()
                    if msg_only:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=msg_only, run_id=self.run_id))
                else:
                    if full_content:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=full_content, run_id=self.run_id))


            except Exception as e:
                logger.error(f"Action parse attempt {attempt+1} stream error: {e}")
                parse_error = f"Network or parsing error occurred: {e}. Please try again."
                error_occurred = True
                
            if error_occurred:
                continue
            
            # Finalize block
            import re
            
            # 1. Clean up the final full_content string completely to prevent chunk boundary leaks
            final_thoughts = []
            for match in RE_THINKING_FULL.finditer(full_content):
                final_thoughts.append(match.group(1).strip())
                
            # If the tag is unclosed, grab whatever's after <thinking>
            if not final_thoughts and "<thinking>" in full_content:
                unclosed_match = RE_THINKING_START.search(full_content)
                if unclosed_match:
                    final_thoughts.append(unclosed_match.group(1).strip())
                    
            # Absolute Zero Garbage: Strip ALL JSON-like structures and technical codes
            final_message = RE_SCRUB_THINKING.sub("", full_content).strip()
            
            # Remove Markdown JSON blocks
            final_message = RE_JSON_MARKDOWN.sub("", final_message)
            # Remove mirrored tool call structures
            final_message = RE_TOOL_CALL_MIRROR.sub("", final_message)
            # General JSON catch-all
            final_message = RE_RECURSIVE_JSON.sub("", final_message)
            
            final_message = final_message.strip()
            
            # Emergency bypass: if message looks like pure technical gibberish, kill it
            if self._is_garbage_json(final_message):
                final_message = ""
            
            has_content = bool(final_message) or bool(final_thoughts)
            
            # 2. Check for Hallucinations vs Completion
            if not streamed_tools:
                if current_task and not has_content:
                    # The LLM output NOTHING, but there's an active subtask! This is a likely failure/stall.
                    parse_error = "You did not output any response or tool calls. Please continue your task."
                    continue
                else:
                    is_complete = not current_task # Task is done if no tools and no subtask active
            
            # 3. If we reached here, the execution pass was a structural success. Save it.
            tool_calls = streamed_tools
            
            if final_thoughts:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content="\n".join(final_thoughts), run_id=self.run_id))
                
            if is_complete and has_content:
                # Execution history already moved to add_message inside loop where appropriate
                # but for simple responses we do it here.
                # Since we already handle it in 'run', we can skip this or confirm it doesn't double-save
                # We'll rely on the 'run' method for the final persistence to avoid duplicate saves in cache.
                pass
                
            # Break as we successfully streamed/parsed
            break

        # If we exhausted retries, emit a final error so the user isn't stuck
        if attempt == max_retries - 1 and (error_occurred or (current_task and not streamed_tools)):
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content=f"Failed to generate a valid action after {max_retries} attempts: {parse_error}", run_id=self.run_id))
            is_complete = True

        result.update({
            "full_content": final_message,
            "tool_calls": tool_calls,
            "thoughts": final_thoughts,
            "is_complete": is_complete,
            "current_subtask_status": subtask_status
        })

        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_END, run_id=self.run_id))

    async def _execute_tool_calls(self, tool_calls, content, thoughts, is_approved) -> bool:
        display_text = content.strip()
        
        internal_tools = {TOOL_ADD_SUBTASKS, TOOL_UPDATE_SUBTASK_STATUS}
        requires_approval = any(self.clean_tool_name(tc.function["name"]) not in internal_tools for tc in tool_calls)
        is_internal_only = all(self.clean_tool_name(tc.function["name"]) in internal_tools for tc in tool_calls)
        
        logger.debug(f"_execute_tool_calls: requires_approval={requires_approval} (tools: {[tc.function['name'] for tc in tool_calls]})")
        
        # 0. Prep: Scrub thinking tags from tool call arguments to prevent UI leakage
        for tc in tool_calls:
            try:
                args_str = tc.function.get("arguments", "{}")
                # Strip <thinking> tags and their content from the arguments JSON-string
                import re
                args_str = re.sub(r"<thinking>.*?</thinking>", "", args_str, flags=re.DOTALL)
                tc.function["arguments"] = args_str.strip()
            except Exception:
                pass

        if self.agent.human_in_loop and not is_approved and requires_approval:
            # IMPORTANT: Save state with the PRE-EXECUTION status to ensure we can resume
            await self.state_service.save_agent_state(self.session_id, "AWAITING_APPROVAL")
            await self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts) # Add thoughts here
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.APPROVAL_REQUIRED, metadata={"tool_calls": [t.dict() for t in tool_calls]}, run_id=self.run_id))
            return True

        # If we reach here, we are approved or it's internal
        await self.state_service.save_agent_state(self.session_id, "TOOL_EXECUTION")
        
        # Only add a new message to memory if it's an internal tool that skipped the pause block above
        if not is_approved:
            await self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts, status="Executing")
        
        for tc in tool_calls:
            res = "" # Explicit initialization
            t_name = tc.function["name"]
            
            # 1. Handle Built-in Universal Tools first
            if t_name == TOOL_ADD_SUBTASKS:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments")}, run_id=self.run_id))
                try:
                    args = json.loads(tc.function["arguments"])
                    tasks = args.get("tasks", [])
                    for t_data in tasks:
                        desc = t_data.get("description")
                        if desc:
                            new_id = f"task_{uuid.uuid4().hex[:6]}"
                            self.subtask_manager.add_subtask(Subtask(id=new_id, description=desc))
                            self.subtask_manager.execution_order.append(new_id)
                    
                    await self._emit_plan_if_changed()
                    res = f"Successfully added {len(tasks)} tasks to the plan."
                except Exception as e:
                    res = f"Error adding subtasks: {e}"
                    
                is_error = isinstance(res, str) and res.startswith("Error")
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=not is_error)
                self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if is_error else None
                continue
                
            if t_name == TOOL_UPDATE_SUBTASK_STATUS:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments")}, run_id=self.run_id))
                try:
                    args = json.loads(tc.function["arguments"])
                    status = args.get("status")
                    result_msg = args.get("result")
                    
                    current_task = self.subtask_manager.get_current_task()
                    if not current_task:
                        res = "Error: No active subtask to update."
                    else:
                        if status == "COMPLETED":
                            self.subtask_manager.mark_completed(current_task.id, result=result_msg)
                        elif status == "FAILED":
                            self.subtask_manager.mark_failed(current_task.id, error=result_msg)
                        else:
                            current_task.result = result_msg
                            
                        await self._emit_plan_if_changed()
                        res = f"Updated current task '{current_task.description}' to {status}."
                        # Sync to frontend status
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Step {status.lower()}: {current_task.description}", run_id=self.run_id))
                except Exception as e:
                    res = f"Error updating subtask: {e}"
                    
                is_error = isinstance(res, str) and res.startswith("Error")
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=not is_error)
                self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if is_error else None
                continue
            
            if t_name == TOOL_READ_TOOL_RESULTS:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments")}, run_id=self.run_id))
                try:
                    args = json.loads(tc.function["arguments"])
                    msg_id = args.get("message_id")
                    start_char = max(0, int(args.get("start_char", 0)))
                    # Default end_char is 2000 chars from start, capped at a reasonable limit for return
                    default_end = start_char + 2000
                    end_char = int(args.get("end_char", default_end))
                    
                    # Hard cap on surgical read length to prevent context bloat
                    if end_char - start_char > 3000:
                        end_char = start_char + 3000

                    # 1. Fetch from DB
                    msg = await asyncio.to_thread(self.memory.conversation_service.get_message, uuid.UUID(msg_id), user_id=self.user_id)
                    
                    if not msg or str(msg.conversation_id) != self.session_id:
                        res = "Error: Message ID not found in this session."
                    else:
                        full_text = msg.content.get("text") if isinstance(msg.content, dict) else str(msg.content)
                        # 2. Slice (Clamping)
                        actual_end = min(len(full_text), end_char)
                        res = full_text[start_char:actual_end]
                        if not res:
                            res = "[No content at this offset range]"
                except Exception as e:
                    res = f"Error performing surgical read: {e}"
                
                # Surgical reads are ALWAYS stealth (display=False)
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=False)
                continue

            logger.debug(f"_execute_tool_calls: executing {t_name}")
            tool_rec = await asyncio.to_thread(self.tool_registry.get_tool_by_name, t_name, self.allowed_tool_ids, self.allowed_mcp_ids)
            
            if not is_internal_only:
                # 0. Mission Control Status: Provide immediate feedback to the UI
                display_name = f"Executing {t_name}..."
                
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=display_name, run_id=self.run_id))
                
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments"), "source": tool_rec.get("source") if tool_rec else "?"}, run_id=self.run_id))
            
            try:
                if not tool_rec: 
                    logger.error(f"_execute_tool_calls: tool {t_name} not found")
                    res = "Error: Tool not found."
                elif tool_rec.get("source") == "mcp": 
                    logger.debug(f"_execute_tool_calls: calling MCP tool {t_name}")
                    res = await self._execute_mcp_tool(tool_rec, tc)
                else: 
                    logger.debug(f"_execute_tool_calls: calling Python tool {t_name}")
                    res = await self._execute_python_tool(tool_rec, tc)
            except Exception as e: 
                logger.error(f"_execute_tool_calls: exception during {t_name}: {e}", exc_info=True)
                res = f"Error: {e}"

            is_error = isinstance(res, str) and res.startswith("Error")

            if not is_internal_only:
                if is_error:
                    # Emit a volatile status update instead of a permanent red error block
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"{t_name} error. Self-correcting...", run_id=self.run_id))
                else:
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_OUTPUT, content=str(res), metadata={"tool": t_name}, run_id=self.run_id))
            
            # Save to SQL but hide from UI if it's an error to keep the user experience clean
            await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=not is_error)
            self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if is_error else None
            
        return False

    async def _execute_mcp_tool(self, tool_rec, tc):
        args = json.loads(tc.function["arguments"]) if tc.function["arguments"] else {}
        res = await self.tool_registry.mcp_service.call_mcp_tool(self.db, uuid.UUID(tool_rec["metadata"]["server_id"]), tool_rec["name"], args)
        if res.get("success"):
            c = res.get("result", {})
            return c.get("content") if isinstance(c, dict) and "content" in c else str(c)
        return f"MCP Error: {res.get('error')}"

    async def _execute_python_tool(self, tool_rec, tc):
        args = json.loads(tc.function["arguments"]) if tc.function["arguments"] else {}
        res = await asyncio.get_running_loop().run_in_executor(None, lambda: execute_python_tool(tool_rec['metadata']['content'], args, self._resolve_tool_secrets(tool_rec.get("id")), tool_rec.get("input_fields")))
        return res.get("result") if res.get("success") else f"Error: {res.get('error')}"

    def _detect_loop(self, content, tools):
        if tools:
            # If tools are used, signature is based purely on the exact tools and their arguments
            sig = str(sorted([(t.function['name'], t.function.get('arguments', '')) for t in tools]))
        else:
            # If no tools, signature is the text content
            sig = content.strip()

        self.action_history.append(sig)
        # PRANI-PERF: Cap history to prevent memory leak
        if len(self.action_history) > 15:
            self.action_history = self.action_history[-15:]
            
        # Detect cyclic loops: if this EXACT signature appears 3 or more times in the whole history
        return self.action_history.count(sig) >= 3

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        if not tool_id: return {}
        secrets = self.db.query(UserToolSecret).filter(UserToolSecret.tool_id == uuid.UUID(str(tool_id)), UserToolSecret.user_id == self.user_id).all()
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}

    def _is_garbage_json(self, text: str) -> bool:
        """
        Regex-based 'Absolute Zero Garbage' cleaner 3.2 (High-Sensitivity).
        Optimized: Returns False immediately if we've already deemed this stream 'clean'.
        """
        if self._is_confident_not_garbage:
            return False
            
        t = text.strip()
        if not t: return False
        
        # 1. Catch definite JSON starts or fragments (even short ones)
        if t in ["{}", "[]", '{"', '["', '},', '],', '}]']:
            return True
        
        # 2. Key-value pattern detection (e.g. "tool_calls":)
        if RE_JSON_KV_PATTERN.search(t):
            return True

        # 3. Density Check: Very strict for short strings to catch JSON structures
        total = len(t)
        tech_chars = len(RE_TECH_CHARS.findall(t))
        
        is_garbage = False
        if total < 20:
            if (tech_chars / total) > 0.6: is_garbage = True
        elif total < 50:
            if (tech_chars / total) > 0.4: is_garbage = True
        else:
            if (tech_chars / total) > 0.25: is_garbage = True
            
        # Optimization PRANI-PERF: Once we have > 60 characters and it's NOT garbage, 
        # we stop checking for the rest of this session stream.
        if not is_garbage and total > 60:
            self._is_confident_not_garbage = True
            
        return is_garbage

    def _scrub_metadata(self, data: Any) -> Any:
        """
        Recursively scrubs <thinking> tags and technical JSON remnants from strings.
        Final defensive layer for Absolute Zero Garbage.
        """
        import re
        if isinstance(data, str):
            # 1. Nuke <thinking>
            res = re.sub(r"<thinking>.*?</thinking>", "", data, flags=re.DOTALL)
            # 2. Nuke trailing/leading JSON technical characters
            res = re.sub(r"[\{\}\[\]\"\:,\s]*$", "", res) # trailing remnants
            res = re.sub(r"^[\{\}\[\]\"\:,\s]*", "", res) # leading remnants
            return res.strip()
        if isinstance(data, list):
            return [self._scrub_metadata(item) for item in data]
        if isinstance(data, dict):
            return {k: self._scrub_metadata(v) for k, v in data.items()}
        return data

    async def _emit_plan_if_changed(self):
        """Saves plan to Redis and emits PLAN event only if the structure has changed."""
        import hashlib
        plan_dict = self.subtask_manager.to_dict()
        plan_json = json.dumps(plan_dict, sort_keys=True)
        plan_hash = hashlib.md5(plan_json.encode()).hexdigest()
        
        if plan_hash != self._last_emitted_plan_hash:
            await self.state_service.save_plan(self.session_id, plan_dict)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.PLAN, metadata={"plan": plan_dict}, run_id=self.run_id))
            self._last_emitted_plan_hash = plan_hash

    async def _should_summarize(self) -> bool:
        """
        Checks if the tokens added since the last summary exceed the threshold.
        """
        db_messages = await self.memory._get_db_messages()
        
        # Calculate tokens since last context_restoration
        delta_tokens = 0
        for m in reversed(db_messages):
            if m.role == "system" and isinstance(m.content, dict) and m.content.get("type") == "context_restoration":
                break
            delta_tokens += m.tokens or 0
        
        return delta_tokens > SUMMARIZATION_THRESHOLD

    async def _execute_summarization(self):
        """
        Runs a distillation pass to compress current context into a Fact Node.
        """
        logger.info(f"Triggering Context Summarization for session {self.session_id}")
        
        # 1. Get full history for the summarizer
        full_context = await self.memory.get_active_context()
        
        # 2. Call LLM with Compression Prompt
        compression_prompt = get_compression_prompt()
        summary_messages = full_context + [ProviderMessage(role="user", content=compression_prompt)]
        
        summary_text = ""
        # We use a non-streaming call or collect the stream for the summary
        async for chunk in self._call_llm_stream(summary_messages):
            # Support both chunk.text (Gemini) and chunk.content (OpenAI/HF)
            val = getattr(chunk, 'text', None) or getattr(chunk, 'content', None)
            if val:
                summary_text += val
        
        if summary_text:
            # 3. Save as a Hidden Fact Node
            await self.memory.add_message(
                role="system",
                content=summary_text,
                metadata_type="context_restoration",
                display=False
            )
            logger.info("Context Summarization completed and saved to SQL.")

    async def _call_llm_stream(self, messages: List[ProviderMessage], tools: List[Dict] = None) -> AsyncIterator[Any]:
        loop = asyncio.get_running_loop()
        queue = asyncio.Queue()
        
        def run_stream():
            try:
                # Assuming provider implements .stream() yielding LLMStreamChunk
                for chunk in self.llm.stream(messages, tools=tools):
                    loop.call_soon_threadsafe(queue.put_nowait, chunk)
            except Exception as e:
                loop.call_soon_threadsafe(queue.put_nowait, e)
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)
                
        loop.run_in_executor(None, run_stream)
        
        while True:
            item = await queue.get()
            if item is None:
                break
            if isinstance(item, Exception):
                raise item
            yield item
