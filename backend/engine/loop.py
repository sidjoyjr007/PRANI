import asyncio
import uuid
import json
import logging
import re
from typing import AsyncIterator, List, Optional, Dict, Any

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

    def clean_tool_name(self, name: str) -> str:
        if not name: return ""
        return name.replace("default_api:", "").replace("default_api.", "")

    async def run(self, user_input: str, approved_tool_calls: Optional[List[Dict]] = None) -> None:
        try:
            # 0. Compact History
            await self.memory.compact_history(self.llm)

            # 1. Initial Planning (Turn 0)
            if user_input and self.loop_count == 0 and not approved_tool_calls and not self.subtask_manager.get_current_task():
                await self.intent_parser.decomposer(user_input, self)

            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_START, metadata={"run_id": self.run_id}))
            is_approved_turn = bool(approved_tool_calls)
            
            while self.loop_count < self.max_loops:
                self.loop_count += 1
                
                # Setup Iteration
                status_report = self.subtask_manager.get_status_report()
                current_task = self.subtask_manager.get_current_task()
                
                if current_task and current_task.status == SubtaskStatus.PENDING:
                    self.subtask_manager.mark_in_progress(current_task.id)
                    # Refresh report after status change
                    status_report = self.subtask_manager.get_status_report()

                tool_defs, system_prompt = self._get_tools_and_prompt(user_input, status_report, current_task)
                
                context = self.memory.get_active_context()
                self._enrich_context(context, system_prompt)

                print("\n" + "="*60)
                print(f"ITERATION {self.loop_count}")
                print("="*60)
                print(f"STATUS: {status_report}")
                print(f"CURRENT TASK: {current_task.description if current_task else 'None'}")
                print(f"CONTEXT: {context}")
                print("="*60 + "\n")

                # Get the Action
                turn_data = {}
                await self._get_turn_action(turn_data, approved_tool_calls, tool_defs, context, current_task, status_report, user_input)
                

                
                full_content = turn_data.get("full_content", "")
                tool_calls_buffer = turn_data.get("tool_calls", [])
                thoughts = turn_data.get("thoughts", [])
                is_complete = turn_data.get("is_complete", False)
                subtask_status = turn_data.get("current_subtask_status")

                if self._detect_loop(full_content, tool_calls_buffer):
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content="Loop detected."))
                    break

                # 1. Execute Actions (Highest priority)
                if tool_calls_buffer:
                    is_approval_required = await self._execute_tool_calls(tool_calls_buffer, full_content, thoughts, is_approved_turn)
                    if is_approval_required:
                        self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                        return 

                    self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    is_approved_turn = False
                    continue 

                if is_complete:
                    self.state_service.clear_plan(self.session_id)
                    display_text = self._extract_display_text(full_content)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=display_text))
                    break 

                if subtask_status:
                    self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                    continue 

                if full_content:
                    display_text = self._extract_display_text(full_content)
                    self.memory.add_message(role="assistant", content=display_text, thoughts=thoughts)
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=display_text))
                
                self.state_service.save_plan(self.session_id, self.subtask_manager.to_dict())
                break

            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE))
            
        except asyncio.CancelledError:
            logger.info(f"Execution cancelled for run {self.run_id}")
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Cancelled"))
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE))
            raise  # bubble up to caller to silently close the task
            
        except Exception as e:
            logger.error(f"Loop Error: {e}")
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content=str(e)))


    def _get_tools_and_prompt(self, user_input, status_report, current_task, parse_error=""):
        current_subtask_desc = current_task.description if current_task else user_input
        tool_recs = self.tool_registry.search_tools(query=current_subtask_desc, agent=self.agent, limit=10)
        unique_tools = {}
        for t in tool_recs:
            name = self.clean_tool_name(t["name"])
            if name not in unique_tools:
                unique_tools[name] = t
        
        tool_defs = []
        tools_desc_list = []
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
            parse_error=parse_error
        )
        return tool_defs, system_prompt

    def _enrich_context(self, context, system_prompt):
        if self.pending_tool_refinement:
            context.append(ProviderMessage(role="system", content=f"IMPORTANT: Previous tool failed. Refinement: {json.dumps(self.pending_tool_refinement)}"))
        if context and context[0].role == "system":
            context[0].content = system_prompt
        else:
            context.insert(0, ProviderMessage(role="system", content=system_prompt))

    async def _get_turn_action(self, result: dict, approved_calls, tool_defs, context, current_task, status_report, user_input) -> None:
        if self.loop_count == 1 and approved_calls:
            result.update({"full_content": "Resuming...", "tool_calls": [ToolCall(**atc) for atc in approved_calls], "thoughts": ["Approved."], "is_complete": False})
            return

        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Thinking..."))
        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_START, content="Thinking..."))

        max_retries = 3
        parse_error = ""

        tool_calls = []
        thoughts = []
        is_complete = False
        full_content = ""
        subtask_status = None

        for attempt in range(max_retries):
            # Update system prompt with the parse_error context if there is one
            tool_defs, system_prompt = self._get_tools_and_prompt(user_input, status_report, current_task, parse_error=parse_error)
            self._enrich_context(context, system_prompt)
            
            llm_response = await self._call_llm(context, tools=tool_defs)
            logger.debug(f"Action parse attempt {attempt+1} llm response: {llm_response}")
            full_content = llm_response.content or ""
            
            tool_calls = []
            thoughts = []
            is_complete = False
            subtask_status = None
            
            try:
                start_idx = full_content.find('{')
                end_idx = full_content.rfind('}')
                
                if start_idx == -1 or end_idx == -1 or start_idx >= end_idx:
                    raise ValueError("Could not find a valid JSON object in the response.")
                    
                json_str = full_content[start_idx:end_idx+1]
                data = json.loads(json_str)
                logger.debug(f"Action json data: {data}")
                
                # Additional Schema Validation
                if "thought" not in data:
                    raise ValueError("JSON missing required 'thought' field.")
                
                # Strict boolean extraction
                is_complete_raw = data.get("is_complete")
                is_complete = is_complete_raw is True or str(is_complete_raw).lower() == "true"
                
                # Check for either a tool request or a subtask completion when not fully complete
                if not is_complete and data.get("tool_request") is None and data.get("current_subtask_status") is None:
                    raise ValueError("JSON must include 'tool_request' or 'current_subtask_status' if 'is_complete' is false.")
                
                # Validation passed, process standard data
                thoughts.append(data["thought"])
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content=data["thought"]))
                
                if data.get("tool_request") is not None:
                    tr = data["tool_request"]
                    op_name = self.clean_tool_name(tr.get("operation", ""))
                    tool_calls.append(ToolCall(id=f"json_{uuid.uuid4().hex[:8]}", function={"name": op_name, "arguments": json.dumps(tr.get("args", {}))}))
                    
                subtask_status = data.get("current_subtask_status")
                
                if (is_complete or (subtask_status is not None)) and current_task:
                    # Default to SUCCESS if session is ending but subtask status wasn't specified
                    status = subtask_status if subtask_status is not None else "SUCCESS"
                    ans = data.get("final_answer") or data.get("thought") or "Done."
                    
                    if status == "FAILED": 
                        self.subtask_manager.mark_failed(current_task.id, error=ans)
                    else: 
                        self.subtask_manager.mark_completed(current_task.id, result=ans)
                        
                    self.memory.add_message(role="assistant", content=ans, thoughts=thoughts, status=f"Step {status}")
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=f"Step Status ({status}): {current_task.description}"))

                if is_complete and not current_task:
                    # Handling overall goal completion when no task manager is used (fallback)
                    ans = data.get("final_answer", "Goal achieved.")
                    self.memory.add_message(role="assistant", content=ans, thoughts=thoughts)

                # Processing succeeded, break out of retry loop
                break
                
            except (ValueError, json.JSONDecodeError, Exception) as e:
                parse_error = f"JSON Validation Error: {str(e)}\nRaw output was: {full_content[:200]}..."
                logger.error(f"Action parse attempt {attempt+1} failed: {parse_error}")
                if attempt == max_retries - 1:
                    # If we exhausted retries, act as if it's a failed step
                    final_ans = f"System Error: Failed to parse reasoning action after {max_retries} attempts. Last error: {e}"
                    thoughts.append(final_ans)
                    if current_task:
                        self.subtask_manager.mark_failed(current_task.id, error=final_ans)
                    self.memory.add_message(role="assistant", content=final_ans, thoughts=thoughts, status="Step FAILED")
                    subtask_status = "FAILED"

        result.update({
            "full_content": full_content,
            "tool_calls": tool_calls,
            "thoughts": thoughts,
            "is_complete": is_complete,
            "current_subtask_status": subtask_status
        })

        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_END))

    async def _execute_tool_calls(self, tool_calls, content, thoughts, is_approved) -> bool:
        display_text = self._extract_display_text(content)
        if self.agent.human_in_loop and not is_approved:
            self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.APPROVAL_REQUIRED, metadata={"tool_calls": [t.dict() for t in tool_calls]}))
            return True

        self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts, status="Executing")
        for tc in tool_calls:
            t_name = tc.function["name"]
            tool_rec = self.tool_registry.get_tool_by_name(t_name, self.agent)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "source": tool_rec.get("source") if tool_rec else "?"}))
            
            try:
                if not tool_rec: res = "Error: Tool not found."
                elif tool_rec.get("source") == "mcp": res = await self._execute_mcp_tool(tool_rec, tc)
                else: res = await self._execute_python_tool(tool_rec, tc)
            except Exception as e: res = f"Error: {e}"

            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_OUTPUT, content=str(res)))
            self.memory.add_message(role="tool", content=res, tool_call_id=tc.id)
            self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if "Error" in str(res) else None

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

    def _extract_display_text(self, content):
        try:
            start_idx = content.find('{')
            end_idx = content.rfind('}')
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx+1]
                data = json.loads(json_str)
                return data.get("final_answer") or data.get("thought") or content
        except Exception as e: 
            logger.debug(f"JSON extraction failed for display text: {e}")
        return content

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        if not tool_id: return {}
        secrets = self.db.query(UserToolSecret).filter(UserToolSecret.tool_id == uuid.UUID(str(tool_id)), UserToolSecret.user_id == self.user_id).all()
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}

    async def _call_llm(self, messages: List[ProviderMessage], tools: List[Dict] = None) -> Any:
        import concurrent.futures
        loop = asyncio.get_running_loop()
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        res = await loop.run_in_executor(executor, lambda: self.llm.chat(messages, tools=tools))
        return res
