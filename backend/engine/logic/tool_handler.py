import json
import json_repair
import uuid
import logging
import asyncio
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from engine.events import AgentEventType, EventBus
from engine.memory import ContextManager
from engine.workspace import WorkspacePlanner
from engine.tool_defs import (
    TOOL_UPDATE_WORKSPACE,
    TOOL_READ_TOOL_RESULTS,
    TOOL_SEARCH_TOOL_REGISTRY
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
        workspace_planner: WorkspacePlanner,
        tool_registry: Any,
        agent: Any,
        run_id: str,
        guardrail_manager: Any
    ):
        self.db = db
        self.user_id = user_id
        self.session_id = session_id
        self.bus = bus
        self.memory = memory
        self.workspace_planner = workspace_planner
        self.tool_registry = tool_registry
        self.agent = agent
        self.run_id = run_id
        self.guardrail_manager = guardrail_manager
        self.pending_tool_refinement: Optional[Dict] = None

    def clean_tool_name(self, name: str) -> str:
        if not name: return ""
        return name.replace("default_api:", "").replace("default_api.", "")

    async def execute_tool_calls(self, tool_calls, content, thoughts, is_approved) -> bool:
        display_text = content.strip()
        
        internal_tools = {TOOL_UPDATE_WORKSPACE}
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

        # 0.5. Execution Guardrails (Check BEFORE approval to avoid asking for dangerous things)
        for tc in tool_calls:
            t_name = tc.function["name"]
            passed, reason = await self.guardrail_manager.validate_execution(t_name, tc.function.get("arguments", ""))
            if not passed:
                res = f"System Error - Action Blocked By Governance Guardrail: {reason}"
                await self.memory.add_message(role="assistant", content=display_text, tool_calls=tool_calls, thoughts=thoughts)
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=True)
                self.pending_tool_refinement = {"tool": t_name, "error": str(res)}
                return False # Don't pause for approval, let the loop retry or fail

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
            is_internal_only = t_name in [TOOL_READ_TOOL_RESULTS, TOOL_UPDATE_WORKSPACE]
            
            # --- INTERNAL TOOL EXECUTION ---
            if t_name == TOOL_UPDATE_WORKSPACE:
                # Suppress TOOL_START for internal plan management to keep UI clean
                try:
                    args = json_repair.loads(tc.function["arguments"])
                    markdown_content = args.get("markdown_content", "")
                    
                    self.workspace_planner.update_plan(markdown_content)
                    res = "Workspace updated successfully."
                    
                    await self.bus.emit(self.bus.create_event(
                        self.session_id, 
                        AgentEventType.PLAN, 
                        content=markdown_content, 
                        run_id=self.run_id
                    ))
                except Exception as e:
                    res = f"Error updating workspace: {e}"
                
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name)
                continue
            
            if t_name == TOOL_READ_TOOL_RESULTS:
                # Suppress TOOL_START for internal read tool
                # await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={"tool": t_name, "args": tc.function.get("arguments")}, run_id=self.run_id))
                try:
                    args = json_repair.loads(tc.function["arguments"])
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

            if t_name == TOOL_SEARCH_TOOL_REGISTRY:
                try:
                    args = json_repair.loads(tc.function["arguments"])
                    query = args.get("query")
                    specific_tools = args.get("specific_tools", [])
                    
                    # 1. Start with semantic search if query is provided
                    results = []
                    if query:
                        results = self.tool_registry.search_tools(
                            query=query, 
                            tool_ids=self.agent.tool_ids, 
                            mcp_server_ids=self.agent.mcp_server_ids, 
                            limit=10
                        )
                    
                    # 2. Add specific tools if requested
                    if specific_tools:
                        allowed_tool_ids = [str(tid) for tid in self.agent.tool_ids] if self.agent.tool_ids else []
                        allowed_mcp_ids = [str(sid) for sid in self.agent.mcp_server_ids] if self.agent.mcp_server_ids else []
                        
                        # Fetch and filter to ensure authorization
                        filtered_tools = self.tool_registry.get_tools_by_filter(allowed_ids=allowed_tool_ids, allowed_server_ids=allowed_mcp_ids)
                        for ft in filtered_tools:
                            if ft.get("name") in specific_tools:
                                # Avoid duplicates if already found by semantic search
                                if not any(r.get("name") == ft.get("name") for r in results):
                                    results.append(ft)
                    
                    # 3. Format into JSON schemas for the LLM
                    schema_output = []
                    for r in results:
                        schema_output.append({
                            "name": r.get("name"),
                            "description": r.get("description"),
                            "parameters": r.get("schema")
                        })
                    
                    res = json.dumps(schema_output, indent=2)
                except Exception as e:
                    res = f"Error searching registry: {e}"
                
                await self.memory.add_message(role="tool", content=res, tool_call_id=tc.id, name=t_name, display=True)
                continue

            # External Tool Execution
            tool_rec = await asyncio.to_thread(self.tool_registry.get_tool_by_name, t_name, [tid for tid in self.agent.tool_ids] if self.agent.tool_ids else [], [sid for sid in self.agent.mcp_server_ids] if self.agent.mcp_server_ids else [])
            
            if not is_internal_only:
                display_name = f"Executing {t_name}..."
                
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.STATUS, content=display_name, run_id=self.run_id))
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.TOOL_START, metadata={
                    "tool": t_name, 
                    "args": tc.function.get("arguments"), 
                    "source": tool_rec.get("source") if tool_rec else "?",
                    "description": None
                }, run_id=self.run_id))
            
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
                
                # Emit TOOL_OUTPUT unconditionally so the frontend knows it finished, pass error state in metadata
                await self.bus.emit(self.bus.create_event(
                    self.session_id, 
                    AgentEventType.TOOL_OUTPUT, 
                    content=str(res), 
                    metadata={"tool": t_name, "is_error": is_error}, 
                    run_id=self.run_id
                ))
            
            await self.memory.add_message(
                role="tool", 
                content=str(res), 
                tool_call_id=tc.id, 
                name=t_name, 
                display=not is_internal_only,
                is_error=is_error
            )
            self.pending_tool_refinement = {"tool": t_name, "error": str(res)} if is_error else None
            
        return False

    async def _execute_mcp_tool(self, tool_rec, tc):
        args = json_repair.loads(tc.function["arguments"]) if tc.function["arguments"] else {}
        res = await self.tool_registry.mcp_service.call_mcp_tool(self.db, uuid.UUID(tool_rec["metadata"]["server_id"]), tool_rec["name"], args)
        if res.get("success"):
            c = res.get("result", {})
            return c.get("content") if isinstance(c, dict) and "content" in c else str(c)
        return f"MCP Error: {res.get('error')}"

    async def _execute_python_tool(self, tool_rec, tc):
        args = json_repair.loads(tc.function["arguments"]) if tc.function["arguments"] else {}
        res = await asyncio.get_running_loop().run_in_executor(None, lambda: execute_python_tool(tool_rec['metadata']['content'], args, self._resolve_tool_secrets(tool_rec.get("id")), tool_rec.get("input_fields")))
        return res.get("result") if res.get("success") else f"Error: {res.get('error')}"

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        if not tool_id: return {}
        secrets = self.db.query(UserToolSecret).filter(UserToolSecret.tool_id == uuid.UUID(str(tool_id)), UserToolSecret.user_id == self.user_id).all()
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}
