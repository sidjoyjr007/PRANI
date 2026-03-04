import asyncio
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
from engine.subtasks import SubtaskManager, Subtask, SubtaskStatus
from engine.intent import IntentParser
from engine.prompts import get_action_system_prompt
from models.agent import Agent
from models.secret import UserToolSecret
from utils.encryption import decrypt_value
from utils.execution import execute_python_tool
from llm.factory import LLMFactory
from llm.types import ProviderMessage, LLMStreamChunk, ToolCall

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
        self.memory = ContextManager(db, uuid.UUID(session_id), agent, user_id)
        self.tool_registry = ToolRegistry(db)
        self.executor = DockerExecutor()
        self.intent_parser = IntentParser(llm_provider)
        
        from services.state_service import StateService
        self.state_service = StateService()
        self.subtask_manager = SubtaskManager.from_dict(subtask_state) if subtask_state else SubtaskManager()
        
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

    def clean_tool_name(self, name: str) -> str:
        if not name: return ""
        return name.replace("default_api:", "").replace("default_api.", "")
    async def run(self, user_input: str, approved_tool_calls: Optional[List[Dict]] = None) -> None:
        logger.debug(f"AgenticLoop.run: entered. session_id={self.session_id}, has_input={bool(user_input)}, has_approval={bool(approved_tool_calls)}")
        try:
            # 0. Start execution immediately for UI responsiveness
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_START, metadata={"run_id": self.run_id}, run_id=self.run_id))
            
            # 1. Compact History & Goal Recovery (Sequential to avoid session race conditions)
            await self.memory.compact_history(self.llm)
            if not user_input:
                user_input = self.memory.get_goal_text()
            
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

                tool_defs, system_prompt = await asyncio.to_thread(self._get_tools_and_prompt, user_input, status_report, current_task)
                context = await asyncio.to_thread(self.memory.get_active_context)
                
                self._enrich_context(context, system_prompt)

                logger.info(
                    f"Agent Iteration {self.loop_count}",
                    extra={
                        "status": status_report,
                        "current_task": current_task.description if current_task else None,
                        "context_summary": context
                    }
                )

                # Emit turn start for UI visibility
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Iteration {self.loop_count}: Thinking...", run_id=self.run_id))
                turn_data = {}
                await self._get_turn_action(turn_data, approved_tool_calls, tool_defs, context, current_task, status_report, user_input)
                

                
                full_content = turn_data.get("full_content", "")
                tool_calls_buffer = turn_data.get("tool_calls", [])
                thoughts = turn_data.get("thoughts", [])
                is_complete = turn_data.get("is_complete", False)
                subtask_status = turn_data.get("current_subtask_status")

                if self._detect_loop(full_content, tool_calls_buffer):
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content="Loop detected.", run_id=self.run_id))
                    break

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
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=full_content, run_id=self.run_id))
                    break 

                # 3. Intermediate Subtask Check
                if subtask_status:
                    await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    continue 

                # 4. We did nothing useful but generated a message (or just stalled out)
                # If we legitimately have a text message but NO tools and NO subtask changes, we just emit and break
                if full_content and not tool_calls_buffer:
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


    def _get_tools_and_prompt(self, user_input, status_report, current_task, parse_error=""):
        current_subtask_desc = current_task.description if current_task else user_input
        tool_recs = self.tool_registry.search_tools(
            query=current_subtask_desc, 
            tool_ids=self.allowed_tool_ids, 
            mcp_server_ids=self.allowed_mcp_ids, 
            limit=10
        )
        unique_tools = {}
        for t in tool_recs:
            name = self.clean_tool_name(t["name"])
            if name not in unique_tools:
                unique_tools[name] = t
        
        tool_defs = [
            {
                "type": "function",
                "function": {
                    "name": "add_subtasks",
                    "description": "Add one or more steps/subtasks to your execution plan. Use this when you need to break down a complex goal.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "tasks": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "description": {
                                            "type": "string",
                                            "description": "A clear, action-oriented description of the task."
                                        }
                                    },
                                    "required": ["description"]
                                }
                            }
                        },
                        "required": ["tasks"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_subtask_status",
                    "description": "Update the status of the currently active subtask (e.g., mark as COMPLETED or FAILED) along with a result message.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "enum": ["COMPLETED", "FAILED"],
                                "description": "The new status of the task."
                            },
                            "result": {
                                "type": "string",
                                "description": "A message describing the outcome, or the error if it failed."
                            }
                        },
                        "required": ["status", "result"]
                    }
                }
            }
        ]
        
        tools_desc_list = [
            "- add_subtasks: Add one or more steps/subtasks to your execution plan. Use this when you need to break down a complex goal.",
            "- update_subtask_status: Update the status of the currently active subtask (e.g., mark as COMPLETED or FAILED) along with a result message."
        ]
        
        for name, t in unique_tools.items():
            t_func = {"name": name, "description": t.get("description", ""), "parameters": t.get("schema", {})}
            tool_defs.append({"type": "function", "function": t_func})
            tools_desc_list.append(f"- {name}: {t_func.get('description', '')}\n  Schema: {json.dumps(t_func.get('parameters', {}), indent=2)}")
        
        system_prompt = get_action_system_prompt(
            agent_role=self.agent.description or "Autonomous Agent",
            tools_desc="\n".join(tools_desc_list), 
            status_report=status_report,
            current_subtask=current_subtask_desc,
            session_history=self.memory.get_history_text(limit=10),
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

    async def _get_turn_action(self, result: dict, approved_calls, tool_defs, context, current_task, status_report, user_input) -> None:
        if self.loop_count == 1 and approved_calls:
            logger.debug(f"_get_turn_action: Resuming with {len(approved_calls)} calls")
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
            tool_defs, system_prompt = await asyncio.to_thread(self._get_tools_and_prompt, user_input, status_report, current_task, parse_error)
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
                async for chunk in self._call_llm_stream(context, tools=tool_defs):
                    # 0. Abort Signal Check
                    self._chunks_since_abort_check += 1
                    if self._chunks_since_abort_check >= 50:
                        self._chunks_since_abort_check = 0
                        current_status = await self.state_service.load_agent_state(self.session_id)
                        if current_status == "ABORTED":
                            logger.warning(f"loop.run: Abort signal detected for {self.session_id}")
                            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content="Execution Aborted.", run_id=self.run_id))
                            return

                    if chunk.tool_calls:
                        streamed_tools.extend(chunk.tool_calls)
                        
                    if chunk.content:
                        text_to_process = chunk.content
                        full_content += chunk.content
                        
                        while text_to_process:
                            if not in_thinking_tag:
                                start_idx = text_to_process.find("<thinking>")
                                if start_idx != -1:
                                    msg_part = text_to_process[:start_idx]
                                    current_message += msg_part
                                    if msg_part and not self._is_garbage_json(current_message):
                                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=msg_part, run_id=self.run_id))
                                    
                                    in_thinking_tag = True
                                    text_to_process = text_to_process[start_idx + len("<thinking>"):]
                                else:
                                    current_message += text_to_process
                                    if text_to_process and not self._is_garbage_json(current_message):
                                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=text_to_process, run_id=self.run_id))
                                    text_to_process = ""
                            else:
                                end_idx = text_to_process.find("</thinking>")
                                if end_idx != -1:
                                    if end_idx > 0:
                                        thought_part = text_to_process[:end_idx]
                                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_CHUNK, content=thought_part, run_id=self.run_id))
                                    
                                    in_thinking_tag = False
                                    text_to_process = text_to_process[end_idx + len("</thinking>"):]
                                else:
                                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_CHUNK, content=text_to_process, run_id=self.run_id))
                                    text_to_process = ""


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
            for match in re.finditer(r"<thinking>(.*?)</thinking>", full_content, re.DOTALL):
                final_thoughts.append(match.group(1).strip())
                
            # If the tag is unclosed, grab whatever's after <thinking>
            if not final_thoughts and "<thinking>" in full_content:
                unclosed_match = re.search(r"<thinking>(.*)", full_content, re.DOTALL)
                if unclosed_match:
                    final_thoughts.append(unclosed_match.group(1).strip())
                    
            # Absolute Zero Garbage: Strip ALL JSON-like structures and technical codes
            final_message = re.sub(r"<thinking>.*?(</thinking>|$)", "", full_content, flags=re.DOTALL).strip()
            
            # Remove Markdown JSON blocks
            final_message = re.sub(r"```json.*?```", "", final_message, flags=re.DOTALL)
            # Remove mirrored tool call structures
            final_message = re.sub(r"\{\s*\"tool_calls\".*?\}\s*\]", "", final_message, flags=re.DOTALL)
            # General JSON catch-all (recursive-ish)
            final_message = re.sub(r"\{[^{}]*\"[^{}]*\".*?\}", "", final_message, flags=re.DOTALL)
            
            final_message = final_message.strip()
            
            # Emergency bypass: if message looks like pure technical gibberish, kill it
            if self._is_garbage_json(final_message):
                final_message = ""
            
            has_content = bool(final_message) or bool(final_thoughts)
            
            # 2. Check for Hallucinations vs Completion
            if not streamed_tools:
                if current_task:
                    # The LLM output no tools, but there's an active subtask! This is a hallucination.
                    parse_error = "You have an active subtask but did not output any tool calls (like `update_subtask_status` or native tools). Please try again and remember to execute tools."
                    continue
                else:
                    is_complete = True
            
            # 3. If we reached here, the execution pass was a structural success. Save it.
            tool_calls = streamed_tools
            
            if final_thoughts:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content="\n".join(final_thoughts), run_id=self.run_id))
                
            if is_complete and has_content:
                self.memory.add_message(role="assistant", content=final_message, thoughts=final_thoughts)
                
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
        
        internal_tools = {"add_subtasks", "update_subtask_status"}
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
            self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.APPROVAL_REQUIRED, metadata={"tool_calls": [t.dict() for t in tool_calls]}, run_id=self.run_id))
            return True

        # If we reach here, we are approved or it's internal
        await self.state_service.save_agent_state(self.session_id, "TOOL_EXECUTION")
        
        # Only add a new message to memory if it's an internal tool that skipped the pause block above
        if not is_approved:
            self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts, status="Executing")
        
        for tc in tool_calls:
            t_name = tc.function["name"]
            
            # 1. Handle Built-in Universal Tools first
            if t_name == "add_subtasks":
                try:
                    args = json.loads(tc.function["arguments"])
                    tasks = args.get("tasks", [])
                    for t_data in tasks:
                        desc = t_data.get("description")
                        if desc:
                            new_id = f"task_{uuid.uuid4().hex[:6]}"
                            self.subtask_manager.add_subtask(Subtask(id=new_id, description=desc))
                            self.subtask_manager.execution_order.append(new_id)
                    
                    await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    res = f"Successfully added {len(tasks)} tasks to the plan."
                    
                    # Sync to frontend
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.PLAN, metadata={"plan": self.subtask_manager.to_dict()}, run_id=self.run_id))
                except Exception as e:
                    res = f"Error adding subtasks: {e}"
                    
                self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name)
                self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if "Error" in str(res) else None
                continue
                
            if t_name == "update_subtask_status":
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
                            
                        await self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                        res = f"Updated current task '{current_task.description}' to {status}."
                        
                        # Sync to frontend
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Step {status.lower()}: {current_task.description}", run_id=self.run_id))
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.PLAN, metadata={"plan": self.subtask_manager.to_dict()}, run_id=self.run_id))
                except Exception as e:
                    res = f"Error updating subtask: {e}"
                    
                self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name)
                self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if "Error" in str(res) else None
                continue

            logger.debug(f"_execute_tool_calls: executing {t_name}")
            tool_rec = await asyncio.to_thread(self.tool_registry.get_tool_by_name, t_name, self.allowed_tool_ids, self.allowed_mcp_ids)
            
            if not is_internal_only:
                # 0. Mission Control Status: Provide immediate feedback to the UI
                display_name = {
                    "Coinstats": "Fetching crypto data...",
                    "web-search": "Searching the web...",
                    "send_email": "Sending results via email..."
                }.get(t_name, f"Executing {t_name}...")
                
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

            if not is_internal_only:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_OUTPUT, content=str(res), metadata={"tool": t_name}, run_id=self.run_id))
            self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name)
            self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if "Error" in str(res) else None
            
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
        sig = f"{content}|{sorted([t.function['name'] for t in tools])}"
        self.action_history.append(sig)
        return len(self.action_history) >= 3 and all(s == sig for s in self.action_history[-3:])

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        if not tool_id: return {}
        secrets = self.db.query(UserToolSecret).filter(UserToolSecret.tool_id == uuid.UUID(str(tool_id)), UserToolSecret.user_id == self.user_id).all()
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}

    def _is_garbage_json(self, text: str) -> bool:
        """
        Regex-based 'Absolute Zero Garbage' cleaner 3.2 (High-Sensitivity).
        Aggressively flags JSON fragments, especially in short strings.
        Optimized: Returns False immediately if we've already deemed this stream 'clean'.
        """
        if self._is_confident_not_garbage:
            return False
            
        import re
        t = text.strip()
        if not t: return False
        
        # 1. Catch definite JSON starts or fragments (even short ones)
        if t in ["{}", "[]", '{"', '["', '},', '],', '}]']:
            return True
        
        # 2. Key-value pattern detection
        json_pattern = r'\"[a-zA-Z0-9_\-]+\"\s*:\s*[\"\{\[\d]'
        if re.search(json_pattern, t):
            # If we see a key-value pair, it's definitely garbage for the message field
            return True

        # 3. Density Check: Very strict for short strings
        tech_chars = len(re.findall(r"[\{\}\[\]\"\:,\\]", t))
        total = len(t)
        
        is_garbage = False
        if total < 20:
            if (tech_chars / total) > 0.6: is_garbage = True
        elif total < 50:
            if (tech_chars / total) > 0.4: is_garbage = True
        else:
            if (tech_chars / total) > 0.25: is_garbage = True
            
        # Optimization: If we have > 100 characters and it's NOT garbage, 
        # we stop checking for the rest of this message stream.
        if not is_garbage and total > 100:
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

    async def _call_llm_stream(self, messages: List[ProviderMessage], tools: List[Dict] = None) -> AsyncIterator[Any]:
        loop = asyncio.get_running_loop()
        queue = asyncio.Queue()
        
        def run_stream():
            try:
                # Assuming provider implements .stream() yielding LLMStreamChunk
                for chunk in self.llm.stream(messages, tools=tools):
                    asyncio.run_coroutine_threadsafe(queue.put(chunk), loop)
            except Exception as e:
                asyncio.run_coroutine_threadsafe(queue.put(e), loop)
            finally:
                asyncio.run_coroutine_threadsafe(queue.put(None), loop)
                
        loop.run_in_executor(None, run_stream)
        
        while True:
            item = await queue.get()
            if item is None:
                break
            if isinstance(item, Exception):
                raise item
            yield item
