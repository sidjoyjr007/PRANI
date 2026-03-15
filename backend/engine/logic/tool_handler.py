import json
import uuid
import logging
import asyncio
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from engine.events import AgentEventType, EventBus
from engine.memory import ContextManager
from engine.subtasks import SubtaskManager, Subtask
from engine.tool_defs import (
    TOOL_ADD_SUBTASKS, 
    TOOL_UPDATE_SUBTASK_STATUS,
    TOOL_READ_TOOL_RESULTS
)
from models.secret import UserToolSecret
from utils.encryption import decrypt_value
from utils.execution import execute_python_tool

logger = logging.getLogger(__name__)

class ToolHandler:
    def __init__(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        session_id: str, 
        bus: EventBus, 
        memory: ContextManager, 
        subtask_manager: SubtaskManager,
        tool_registry: Any,
        agent: Any,
        run_id: str
    ):
        self.db = db
        self.user_id = user_id
        self.session_id = session_id
        self.bus = bus
        self.memory = memory
        self.subtask_manager = subtask_manager
        self.tool_registry = tool_registry
        self.agent = agent
        self.run_id = run_id
        self.pending_tool_refinement: Optional[Dict] = None

    def clean_tool_name(self, name: str) -> str:
        if not name: return ""
        return name.replace("default_api:", "").replace("default_api.", "")

    async def execute_tool_calls(self, tool_calls, content, thoughts, is_approved) -> bool:
        display_text = content.strip()
        
        internal_tools = {TOOL_ADD_SUBTASKS, TOOL_UPDATE_SUBTASK_STATUS}
        requires_approval = any(self.clean_tool_name(tc.function["name"]) not in internal_tools for tc in tool_calls)
        is_internal_only = all(self.clean_tool_name(tc.function["name"]) in internal_tools for tc in tool_calls)
        
        logger.debug(f"ToolHandler.execute_tool_calls: requires_approval={requires_approval}")
        
        # 0. Prep: Scrub thinking tags from tool call arguments to prevent UI leakage
        for tc in tool_calls:
            try:
                args_str = tc.function.get("arguments", "{}")
                import re
                args_str = re.sub(r"<thinking>.*?</thinking>", "", args_str, flags=re.DOTALL)
                tc.function["arguments"] = args_str.strip()
            except Exception:
                pass

        if self.agent.human_in_loop and not is_approved and requires_approval:
            # We add thoughts here for UI persistence before pause
            await self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts)
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.APPROVAL_REQUIRED, metadata={"tool_calls": [t.dict() for t in tool_calls]}, run_id=self.run_id))
            return True

        # If we reach here, we are approved or it's internal
        if not is_approved:
            await self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts, status="Executing")
        
        for tc in tool_calls:
            res = ""
            t_name = tc.function["name"]
            
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
                    default_end = start_char + 2000
                    end_char = int(args.get("end_char", default_end))
                    
                    if end_char - start_char > 3000:
                        end_char = start_char + 3000

                    msg = await asyncio.to_thread(self.memory.conversation_service.get_message, uuid.UUID(msg_id), user_id=self.user_id)
                    if not msg or str(msg.conversation_id) != self.session_id:
                        res = "Error: Message ID not found in this session."
                    else:
                        full_text = msg.content.get("text") if isinstance(msg.content, dict) else str(msg.content)
                        actual_end = min(len(full_text), end_char)
                        res = full_text[start_char:actual_end]
                        if not res:
                            res = "[No content at this offset range]"
                except Exception as e:
                    res = f"Error performing surgical read: {e}"
                
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=False)
                continue

            # External Tool Execution
            tool_rec = await asyncio.to_thread(self.tool_registry.get_tool_by_name, t_name, [tid for tid in self.agent.tool_ids] if self.agent.tool_ids else [], [sid for sid in self.agent.mcp_server_ids] if self.agent.mcp_server_ids else [])
            
            if not is_internal_only:
                display_name = f"Executing {t_name}..."
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=display_name, run_id=self.run_id))
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments"), "source": tool_rec.get("source") if tool_rec else "?"}, run_id=self.run_id))
            
            try:
                if not tool_rec: 
                    res = "Error: Tool not found."
                elif tool_rec.get("source") == "mcp": 
                    res = await self._execute_mcp_tool(tool_rec, tc)
                else: 
                    res = await self._execute_python_tool(tool_rec, tc)
            except Exception as e: 
                res = f"Error: {e}"

            is_error = isinstance(res, str) and res.startswith("Error")
            if not is_internal_only:
                if is_error:
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"{t_name} error. Self-correcting...", run_id=self.run_id))
                else:
                    await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_OUTPUT, content=str(res), metadata={"tool": t_name}, run_id=self.run_id))
            
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

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        if not tool_id: return {}
        secrets = self.db.query(UserToolSecret).filter(UserToolSecret.tool_id == uuid.UUID(str(tool_id)), UserToolSecret.user_id == self.user_id).all()
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}
