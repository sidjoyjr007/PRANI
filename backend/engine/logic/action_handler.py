import json
import logging
import asyncio
import os
import time
from typing import List, Dict, Any, AsyncIterator, Optional
from engine.events import AgentEventType, EventBus
from engine.memory import ContextManager
from engine.prompts import get_action_system_prompt, get_compression_prompt
from engine.tool_defs import (
    BUILTIN_TOOL_DEFS, 
    BUILTIN_TOOL_DESCRIPTIONS,
    TOOL_READ_TOOL_RESULTS_DEF
)
from llm.types import ProviderMessage, ToolCall
from engine.logic.cleaner import RE_THINKING_FULL, RE_THINKING_START, RE_SCRUB_THINKING, RE_JSON_MARKDOWN, RE_TOOL_CALL_MIRROR, RE_RECURSIVE_JSON

logger = logging.getLogger(__name__)

SUMMARIZATION_THRESHOLD = int(os.getenv("SUMMARIZATION_THRESHOLD", "60000"))

class ActionHandler:
    def __init__(
        self, 
        llm_provider: Any, 
        bus: EventBus, 
        memory: ContextManager, 
        session_id: str, 
        run_id: str,
        tool_registry: Any,
        agent: Any,
        user_id: Any,
        cleaner: Any
    ):
        self.llm = llm_provider
        self.bus = bus
        self.memory = memory
        self.session_id = session_id
        self.run_id = run_id
        self.tool_registry = tool_registry
        self.agent = agent
        self.user_id = user_id
        self.cleaner = cleaner
        self._tool_search_cache = {}

    async def get_turn_action(self, result: dict, approved_calls, tool_defs, context, user_input, pending_tool_refinement, loop_warning_triggered) -> None:
        """
        Main entry point for calculating the next action in the loop.
        Handles tool calls, thoughts, and message streaming.
        """
        if approved_calls:
            logger.debug(f"ActionHandler.get_turn_action: Resuming with {len(approved_calls)} calls")
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
        tool_calls = []
        final_thoughts = []
        is_complete = False
        final_message = ""

        for attempt in range(max_retries):
            # 1. Prepare system prompt and tools
            tool_defs, system_prompt = await self._get_tools_and_prompt(user_input, parse_error)
            self._enrich_context(context, system_prompt, pending_tool_refinement, loop_warning_triggered)
            
            error_occurred = False
            try:
                # 2. Call LLM (synchronous wrapper to thread to avoid blocking loop)
                response = await asyncio.to_thread(self.llm.chat, context, tools=tool_defs)
                full_content = response.content or ""
                streamed_tools = response.tool_calls or []
                
                # 3. Emit immediate feedback
                if "<thinking>" in full_content:
                    thinking_match = RE_THINKING_FULL.search(full_content)
                    if thinking_match:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_CHUNK, content=thinking_match.group(1), run_id=self.run_id))
                    msg_only = RE_SCRUB_THINKING.sub("", full_content).strip()
                    if msg_only:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=msg_only, run_id=self.run_id))
                else:
                    if full_content:
                        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.MESSAGE_CHUNK, content=full_content, run_id=self.run_id))
            except Exception as e:
                logger.error(f"Action parse attempt {attempt+1} error: {e}")
                parse_error = f"Network or parsing error occurred: {e}. Please try again."
                error_occurred = True
                
            if error_occurred: continue
            
            # 4. Final cleaning and extraction
            final_thoughts = []
            for match in RE_THINKING_FULL.finditer(full_content):
                final_thoughts.append(match.group(1).strip())
            if not final_thoughts and "<thinking>" in full_content:
                unclosed_match = RE_THINKING_START.search(full_content)
                if unclosed_match: final_thoughts.append(unclosed_match.group(1).strip())
                    
            final_message = RE_SCRUB_THINKING.sub("", full_content).strip()
            # PRANI-FIX: preserving RE_JSON_MARKDOWN to allow code examples Fix for Flaw #1
            final_message = RE_TOOL_CALL_MIRROR.sub("", final_message)
            
            # PRANI-FIX: Only scrub recursive JSON if it's NOT inside a markdown block to prevent deleting legitimate examples
            if "```" not in final_message:
                final_message = RE_RECURSIVE_JSON.sub("", final_message).strip()
            
            if self.cleaner.is_garbage_json(final_message): final_message = ""
            
            has_content = bool(final_message) or bool(final_thoughts)
            if not streamed_tools:
                if not has_content:
                    parse_error = "You did not output any response or tool calls. Please continue your task."
                    continue
                else:
                    # Phase 4: We no longer override is_complete based on subtasks here.
                    # We let the LLM's intent (or lack of tools) drive is_complete,
                    # and the loop's Exit Guard will catch it if subtasks are orphaned.
                    is_complete = not bool(streamed_tools)
            
            tool_calls = streamed_tools
            if final_thoughts:
                await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content="\n".join(final_thoughts), run_id=self.run_id))
            break

        if attempt == max_retries - 1 and (error_occurred or (not streamed_tools and not has_content)):
            # PRANI-FIX: Fix for Flaw #3 (Silent Failure)
            # Emit a clear error instead of silently completing
            error_msg = f"Critically stalled after {max_retries} failed attempts to generate a valid action. Error: {parse_error}"
            await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.ERROR, content=error_msg, run_id=self.run_id))
            final_message = "I'm having trouble processing the next step. I've tried multiple times but stalled out. Please check if the instructions are clear or if a tool is producing unexpected output."
            is_complete = True

        result.update({"full_content": final_message, "tool_calls": tool_calls, "thoughts": final_thoughts, "is_complete": is_complete})
        await self.bus.emit(self.bus.create_event(self.session_id, AgentEventType.THOUGHT_END, run_id=self.run_id))

    async def _get_tools_and_prompt(self, user_input, parse_error=""):
        current_subtask_desc = user_input
        allowed_tool_ids = [str(tid) for tid in self.agent.tool_ids] if self.agent.tool_ids else []
        allowed_mcp_ids = [str(sid) for sid in self.agent.mcp_server_ids] if self.agent.mcp_server_ids else []
        
        # --- NEW CAPABILITIES EXTRACTION LOGIC ---
        all_allowed_tools = self.tool_registry.get_tools_by_filter(allowed_ids=allowed_tool_ids, allowed_server_ids=allowed_mcp_ids)
        mcp_groups = {}
        native_tools = []
        
        for t in all_allowed_tools:
            meta = t.get("metadata", {})
            if meta.get("source") == "mcp" and "server_id" in meta:
                sid = meta["server_id"]
                if sid not in mcp_groups:
                    mcp_groups[sid] = []
                mcp_groups[sid].append(t.get("name"))
            else:
                native_tools.append(t)
        
        # Resolve server names
        mcp_server_names = self.tool_registry.get_mcp_server_names(self.agent.mcp_server_ids) if hasattr(self.agent, 'mcp_server_ids') and self.agent.mcp_server_ids else {}
                
        capabilities_list = []
        for sid, t_names in mcp_groups.items():
            # Try to find a human-readable name if available, otherwise fallback to ID
            server_label = mcp_server_names.get(sid, sid)
            # We list ALL tools as requested by user
            capabilities_list.append(f"- MCP Server ({server_label}): Provides tools like [{', '.join(t_names)}]")
            
        for t in native_tools:
            capabilities_list.append(f"- {t.get('name')}: {t.get('description', '')}")
            
        capabilities_desc = "\n".join(capabilities_list)
        if not capabilities_desc:
            capabilities_desc = "- No specific capabilities assigned. Rely on built-in tools."
        # --- END NEW LOGIC ---

        cache_key = f"{current_subtask_desc}|{allowed_tool_ids}|{allowed_mcp_ids}"
        if cache_key in self._tool_search_cache:
            tool_recs = self._tool_search_cache[cache_key]
        else:
            tool_recs = self.tool_registry.search_tools(query=current_subtask_desc, tool_ids=self.agent.tool_ids, mcp_server_ids=self.agent.mcp_server_ids, limit=10)
            self._tool_search_cache[cache_key] = tool_recs

        unique_tools = {}
        for t in tool_recs:
            name = t["name"].replace("default_api:", "").replace("default_api.", "")
            if name not in unique_tools: unique_tools[name] = t
        
        tool_defs = list(BUILTIN_TOOL_DEFS)
        tools_desc_list = []
        for td in tool_defs:
            f = td["function"]
            tools_desc_list.append(f"- {f['name']}: {f.get('description', '')}\n  Schema: {json.dumps(f.get('parameters', {}), indent=2)}")

        for name, t in unique_tools.items():
            t_func = {"name": name, "description": t.get("description", ""), "parameters": t.get("schema", {})}
            tool_defs.append({"type": "function", "function": t_func})
            tools_desc_list.append(f"- {name}: {t_func.get('description', '')}\n  Schema: {json.dumps(t_func.get('parameters', {}), indent=2)}")
        
        context = await self.memory.get_active_context()
        has_pruning = any("[VIRTUAL PRUNE" in m.content for m in context if isinstance(m.content, str))
        if has_pruning:
            tool_defs.append(TOOL_READ_TOOL_RESULTS_DEF)
            t_func = TOOL_READ_TOOL_RESULTS_DEF["function"]
            tools_desc_list.append(f"- {t_func['name']}: {t_func['description']}\n  Schema: {json.dumps(t_func['parameters'], indent=2)}")

        history_text = await self.memory.get_history_text(limit=10)
        system_prompt = get_action_system_prompt(
            agent_role=self.agent.name or "Autonomous Agent",
            agent_instructions=self.agent.instructions or "",
            tools_desc="\n".join(tools_desc_list), 
            session_history="",
            parse_error=parse_error,
            global_goal=user_input,
            capabilities_desc=capabilities_desc
        )
        print(system_prompt, "system_prompt")
        return tool_defs, system_prompt

    def _enrich_context(self, context, system_prompt, pending_tool_refinement, loop_warning_triggered):
        if context and context[0].role == "system": context[0].content = system_prompt
        else: context.insert(0, ProviderMessage(role="system", content=system_prompt))
            
        if pending_tool_refinement:
            hint = f"IMPORTANT: Previous tool failed. Refinement: {json.dumps(pending_tool_refinement)}"
            if not any(m.role == "system" and m.content == hint for m in context):
                context.insert(1, ProviderMessage(role="system", content=hint))

        if loop_warning_triggered:
            warning_msg = "SYSTEM GUARDRAIL: You are caught in a repeating loop. You MUST completely change your approach, use different tools, or ask the user for clarification. Do not repeat the previous action."
            if not any(m.role == "system" and m.content == warning_msg for m in context):
                context.insert(1, ProviderMessage(role="system", content=warning_msg))

    async def should_summarize(self) -> bool:
        db_messages = await self.memory._get_db_messages()
        delta_tokens = 0
        for m in reversed(db_messages):
            if m.role == "system" and isinstance(m.content, dict) and m.content.get("type") == "context_restoration": break
            delta_tokens += m.tokens or 0
        return delta_tokens > SUMMARIZATION_THRESHOLD

    async def execute_summarization(self):
        logger.info(f"Triggering Context Summarization for session {self.session_id}")
        full_context = await self.memory.get_active_context()
        compression_prompt = get_compression_prompt()
        summary_messages = full_context + [ProviderMessage(role="user", content=compression_prompt)]
        
        summary_text = ""
        async for chunk in self._call_llm_stream(summary_messages):
            val = getattr(chunk, 'text', None) or getattr(chunk, 'content', None)
            if val: summary_text += val
        
        if summary_text:
            await self.memory.add_message(role="system", content=summary_text, metadata_type="context_restoration", display=False)

    async def _call_llm_stream(self, messages: List[ProviderMessage], tools: List[Dict] = None) -> AsyncIterator[Any]:
        loop = asyncio.get_running_loop()
        queue = asyncio.Queue()
        def run_stream():
            try:
                for chunk in self.llm.stream(messages, tools=tools):
                    loop.call_soon_threadsafe(queue.put_nowait, chunk)
            except Exception as e:
                loop.call_soon_threadsafe(queue.put_nowait, e)
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)
        loop.run_in_executor(None, run_stream)
        while True:
            item = await queue.get()
            if item is None: break
            if isinstance(item, Exception): raise item
            yield item
