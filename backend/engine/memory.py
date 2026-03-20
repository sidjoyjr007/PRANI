from __future__ import annotations
import logging
import asyncio
import os
from utils.llm_token import estimate_tokens

logger = logging.getLogger(__name__)
from typing import List, Optional, Any, TYPE_CHECKING
import uuid
import json
from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import desc

from llm.types import ProviderMessage
from schemas.conversation import MessageCreate
from models.conversation import Message, Conversation
from services.conversation_service import ConversationService
from engine.prompts import get_compression_prompt
from utils.cache import MessageCache

if TYPE_CHECKING:
    from models.agent import Agent

class ContextManager:
    """
    Manages the 'Active Context' window for the LLM using token awareness.
    """
    
    def __init__(self, db: Session, session_id: UUID, agent: Agent, user_id: UUID, run_id: Optional[UUID] = None):
        self.db = db
        self.session_id = session_id
        self.agent = agent
        self.user_id = user_id
        self.run_id = run_id
        self.conversation_service = ConversationService(db)
        
        # Context Pressure Configuration
        self.context_pressure_threshold = int(os.getenv("PRUNING_THRESHOLD", 30_000))
        self.virtual_prune_char_limit = int(os.getenv("VIRTUAL_PRUNE_CHAR_LIMIT", 2000))
        self.max_context_tokens = int(os.getenv("MAX_CONTEXT_TOKENS", 80_000))
        self.compaction_threshold_pct = float(os.getenv("COMPACTION_THRESHOLD_PCT", 0.9))
        
        # Caching & Optimization
        self.cache = MessageCache()
        self._db_messages_cache: Optional[List[Message]] = None
        self._last_compact_msg_count = 0

    def _get_message_tokens(self, msg: ProviderMessage) -> int:
        if msg.tokens is not None:
            return msg.tokens
            
        return estimate_tokens(msg.role) + estimate_tokens(msg.content) + 4

    async def _get_db_messages(self, force_refresh=False) -> List[Any]:
        if not force_refresh and self._db_messages_cache is not None:
            return self._db_messages_cache
            
        # 1. Isolated Run Storage
        if self.run_id:
            from models.deployment_run import DeploymentRun
            run = self.db.query(DeploymentRun).filter(DeploymentRun.id == self.run_id).first()
            if not run or not run.messages:
                return []
            
            # Convert JSON dicts back to transient Message-like objects for the context builder
            from models.conversation import Message
            messages = []
            for m in run.messages:
                messages.append(Message(
                    role=m["role"],
                    content=m["content"],
                    tokens=m.get("tokens"),
                    created_at=datetime.fromisoformat(m["created_at"]) if m.get("created_at") else datetime.now()
                ))
            self._db_messages_cache = messages
            return messages

        # 2. Try Redis Cache first (for conversations)
        if not force_refresh:
            cached_data = await self.cache.get_messages(self.session_id)
            if cached_data:
                # Convert dicts back to Message models
                messages = []
                for m in cached_data:
                    messages.append(Message(
                        id=UUID(m["id"]),
                        role=m["role"],
                        content=m["content"],
                        tokens=m["tokens"],
                        conversation_id=self.session_id,
                        created_at=datetime.fromisoformat(m["created_at"]) if isinstance(m.get("created_at"), str) else m.get("created_at")
                    ))
                self._db_messages_cache = messages
                return messages

        # 2. Fallback to SQL
        db_messages = await asyncio.to_thread(self.conversation_service.get_messages, self.session_id, user_id=self.user_id)
        self._db_messages_cache = db_messages
        
        # 3. Background update Redis
        if db_messages:
            asyncio.create_task(self.cache.set_messages(self.session_id, db_messages))
            
        return db_messages

    async def get_active_context(self) -> List[ProviderMessage]:
        """
        Assembles a token-aware context window using Pivot Logic:
        [System Prompt] + [Latest Summary Fact] + [Messages AFTER Summary]
        """
        db_messages = await self._get_db_messages()
        
        context = []
        
        # 1. System Prompt (Highest Priority)
        if self.agent.instructions:
            sys_msg = ProviderMessage(role="system", content=self.agent.instructions)
            context.append(sys_msg)

        if not db_messages:
            return context

        # 2. Find Pivot Point (Latest Summary)
        # We look for context_restoration messages
        summary_msg = None
        pivot_index = -1
        for i, m in enumerate(reversed(db_messages)):
            if m.role == "system" and isinstance(m.content, dict) and m.content.get("type") == "context_restoration":
                summary_msg = m
                pivot_index = len(db_messages) - 1 - i
                break
        
        if summary_msg:
            # Assembly Case B: Summary + Delta
            p_summary = self._to_provider_msg(summary_msg)
            context.append(p_summary)
            
            # Add all messages created strictly after the summary
            recent_deltas = db_messages[pivot_index + 1:]
            for m in recent_deltas:
                context.append(self._to_provider_msg(m))
        else:
            # Assembly Case A: Standard History (usually at start of session)
            # Find original goal (first user message)
            goal_msg = next((m for m in db_messages if m.role == "user"), None)
            seen_ids = set()
            
            if goal_msg:
                p_goal = self._to_provider_msg(goal_msg)
                context.append(p_goal)
                seen_ids.add(goal_msg.id)
            
            # Add remaining history until max tokens
            current_tokens = sum(self._get_message_tokens(m) for m in context)
            history_pool = [m for m in db_messages if m.id not in seen_ids]
            
            # Fill remaining window with the history tail
            for m in history_pool:
                p_msg = self._to_provider_msg(m)
                msg_tokens = self._get_message_tokens(p_msg)
                if current_tokens + msg_tokens > self.max_context_tokens:
                    break
                context.append(p_msg)
                current_tokens += msg_tokens
        # 3. Apply Adaptive Hybrid Pruning (Conditional Surgical Mode)
        total_tokens = sum(self._get_message_tokens(m) for m in context)
        
        if total_tokens >= self.context_pressure_threshold:
            logger.info(f"Context pressure detected ({total_tokens} tokens). Applying virtual pruning.")
            for msg in context:
                # We only prune tool results to maintain surgical precision
                # We look for large tool outputs (> 2000 chars)
                if msg.role == "tool" and isinstance(msg.content, str) and len(msg.content) > self.virtual_prune_char_limit:
                    original_len = len(msg.content)
                    
                    # Try to find the original message ID from db_messages for the surgical marker
                    msg_id = "unknown"
                    for db_m in db_messages:
                        db_text = db_m.content.get("text") if isinstance(db_m.content, dict) else str(db_m.content)
                        if db_text == msg.content:
                            msg_id = str(db_m.id)
                            break
                    
                    head = msg.content[:1000]
                    tail = msg.content[-1000:]
                    marker = f"\n\n[VIRTUAL PRUNE | ID: {msg_id} | TOTAL: {original_len} chars | Context Pressure Active. Use read_tool_results(message_id='{msg_id}', start_char=..., end_char=...) for surgical access]\n\n"
                    msg.content = f"{head}{marker}{tail}"
                    logger.info(f"Virtually pruned message {msg_id} from {original_len} to ~2000 chars")

        return context

    async def get_goal_text(self) -> str:
        """
        Retrieves the original user request (the first user message).
        """
        db_messages = await asyncio.to_thread(self.conversation_service.get_messages, self.session_id, user_id=self.user_id)
        if not db_messages: return ""
        goal_msg = next((m for m in db_messages if m.role == "user"), None)
        if not goal_msg: return ""
        return goal_msg.content if isinstance(goal_msg.content, str) else str(goal_msg.content)

    def _to_provider_msg(self, db_msg: Message) -> ProviderMessage:
        content = db_msg.content
        text_or_parts = ""
        tool_calls = None
        tool_call_id = None
        name = content.get("name") if isinstance(content, dict) else None

        if isinstance(content, dict):
            # If it has 'parts', it's multi-modal
            if "parts" in content:
                text_or_parts = content["parts"]
            else:
                text_or_parts = content.get("text", "")
            
            tool_calls = content.get("tool_calls")
            tool_call_id = content.get("tool_call_id")

            # PRANI-ENHANCEMENT: Inject explicit anchors into text content
            # (Allows LLM to see source/intent even if it ignores metadata)
            if db_msg.role == "tool" and name:
                text_or_parts = f"[SOURCE TOOL: {name}]\n{text_or_parts}"
            elif db_msg.role == "assistant" and tool_calls:
                call_names = [tc.get("function", {}).get("name", "?") for tc in tool_calls]
                text_or_parts = f"[INTENT: Calling {', '.join(call_names)}]\n{text_or_parts}"
        else:
            text_or_parts = str(content)
            
        return ProviderMessage(
            role=db_msg.role, 
            content=text_or_parts, 
            name=name,
            tool_calls=tool_calls, 
            tool_call_id=tool_call_id,
            tokens=db_msg.tokens
        )

    async def add_message(self, role: str, content: Any, tool_calls: list = None, tool_call_id: str = None, name: str = None, metadata_type: str = None, thoughts: list = None, status: str = None, display: bool = True) -> Message:
        if isinstance(content, list):
            rich_content = {"parts": content}
            rich_content["text"] = "\n".join([p.get("text", "") for p in content if p.get("type") == "text"])
        else:
            rich_content = {"text": str(content)}

        if metadata_type: rich_content["type"] = metadata_type
        if tool_calls:
            serialized = [tc.dict() if hasattr(tc, 'dict') else tc for tc in tool_calls]
            rich_content["tool_calls"] = serialized
        if tool_call_id: rich_content["tool_call_id"] = tool_call_id
        if name: rich_content["name"] = name
        if thoughts: rich_content["thoughts"] = thoughts
        if status: rich_content["status"] = status
        
        # Dispatch persistence
        if self.run_id:
            from models.deployment_run import DeploymentRun
            run = self.db.query(DeploymentRun).filter(DeploymentRun.id == self.run_id).first()
            if run:
                current_msgs = run.messages or []
                msg_json = {
                    "role": role,
                    "content": rich_content,
                    "tokens": self._calculate_tokens(role, rich_content),
                    "created_at": datetime.now().isoformat()
                }
                current_msgs.append(msg_json)
                run.messages = current_msgs
                self.db.commit()
                
                # Create a transient message object for local processing
                from models.conversation import Message
                new_msg = Message(
                    role=role,
                    content=rich_content,
                    tokens=msg_json["tokens"],
                    created_at=datetime.now()
                )
        else:
            # Standard conversation persistence
            msg_data = MessageCreate(role=role, content=rich_content)
            new_msg = await asyncio.to_thread(self.conversation_service.add_message, self.session_id, msg_data, user_id=self.user_id)
        
        if new_msg:
            # Update local cache
            if self._db_messages_cache is not None:
                self._db_messages_cache.append(new_msg)
            
            # Update Redis cache (only for non-run sessions)
            if not self.run_id:
                asyncio.create_task(self.cache.add_message(self.session_id, new_msg))
            
        return new_msg

    def _calculate_tokens(self, role: str, content: Any) -> int:
        return estimate_tokens(role) + estimate_tokens(content)

    async def compact_history(self, llm_provider: Any):
        """
        Performs structural compaction if tokens exceed threshold.
        """
        logger.debug("ContextManager.compact_history: started")

        # Check total tokens (offload DB retrieval)
        db_messages = await self._get_db_messages()
        
        # Optimization: Don't re-calculate everything if only a few messages added
        if len(db_messages) < self._last_compact_msg_count + 3:
            return
            
        logger.debug(f"ContextManager.compact_history: counting tokens for {len(db_messages)} messages")
        total_tokens = sum(self._get_message_tokens(self._to_provider_msg(m)) for m in db_messages)
        self._last_compact_msg_count = len(db_messages)
        
        if total_tokens < self.max_context_tokens * self.compaction_threshold_pct:
            return

        # Prepare for compaction
        history_text = "\n".join([f"{m.role}: {m.content['text'] if isinstance(m.content, dict) else m.content}" for m in db_messages])
        
        prompt = [
            ProviderMessage(role="system", content=get_compression_prompt()),
            ProviderMessage(role="user", content=f"History:\n{history_text}")
        ]
        
        try:
            summary = await self._call_llm_sync(llm_provider, prompt)
            if not summary:
                return

            restoration_text = f"# Context Restoration\n\n{summary}\n\nResume from where we left off."
            await self.add_message("system", restoration_text, metadata_type="context_restoration")
            
            # Identify messages to archive (logic kept for future tagging, but DELETION IS REMOVED)
            # We no longer delete from SQL to ensure 100% historical reliability.
            # The get_active_context logic already ensures these older messages stay out of the LLM window.
            logger.info(f"Summarization pivot created. Preservation mode active: 0 messages deleted.")
            
            # Invalidate Redis so next fetch pulls fresh state from DB
            await self.cache.clear_cache(self.session_id)
            await self._get_db_messages(force_refresh=True)
            
        except Exception as e:
            logger.error(f"Compaction error: {e}")

    async def _call_llm_sync(self, llm, messages) -> str:
        import asyncio
        import concurrent.futures
        logger.debug("ContextManager._call_llm_sync: starting LLM stream")
        def collect():
            text = ""
            try:
                for chunk in llm.stream(messages):
                    if hasattr(chunk, 'content') and chunk.content: text += chunk.content
                    elif isinstance(chunk, str): text += chunk
                return text
            except Exception as e:
                logger.error(f"ContextManager._call_llm_sync error: {e}", exc_info=True)
                return ""
        
        loop = asyncio.get_running_loop()
        res = await loop.run_in_executor(None, collect)
        logger.debug(f"ContextManager._call_llm_sync: complete, received {len(res)} chars")
        return res

                    
    async def get_history_text(self, limit: int = 10) -> str:
        """
        Returns a plain text representation of recent history.
        Enriched with tool attribution for better LLM reasoning.
        """
        db_messages = await self._get_db_messages()
        recent = db_messages[-limit:]
        
        lines = []
        for m in recent:
            content = m.content
            text = content.get("text", "") if isinstance(content, dict) else str(content)
            
            # Attributed Roles (PRANI-ENHANCEMENT)
            if m.role == "assistant" and isinstance(content, dict) and content.get("tool_calls"):
                calls = content["tool_calls"]
                call_names = [c.get("function", {}).get("name", "?") for c in calls]
                role_label = f"ASSISTANT (Calls: {', '.join(call_names)})"
                lines.append(f"{role_label}: {text}")
            elif m.role == "tool" and isinstance(content, dict) and content.get("name"):
                role_label = f"TOOL ({content['name']})"
                lines.append(f"{role_label}: {text}")
            else:
                lines.append(f"{m.role.upper()}: {text}")
            
        return "\n".join(lines)
