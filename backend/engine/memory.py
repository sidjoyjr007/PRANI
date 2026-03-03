import tiktoken
from typing import List, Optional, Any
import uuid
import json
from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import desc

from llm.types import ProviderMessage
from schemas.conversation import MessageCreate
from models.conversation import Message, Conversation
from models.agent import Agent
from services.conversation_service import ConversationService
from engine.prompts import get_compression_prompt

class ContextManager:
    """
    Manages the 'Active Context' window for the LLM using token awareness.
    """
    
    def __init__(self, db: Session, session_id: UUID, agent: Agent, user_id: UUID):
        self.db = db
        self.session_id = session_id
        self.agent = agent
        self.user_id = user_id
        self.conversation_service = ConversationService(db)
        
        # Token Configuration
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        self.max_context_tokens = 80_000 # Increased from 60k
        self.compaction_threshold_pct = 0.9
        self.prune_threshold_chars = 1000

    def _count_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text))

    def _get_message_tokens(self, msg: ProviderMessage) -> int:
        content_str = msg.content if isinstance(msg.content, str) else json.dumps(msg.content)
        total = self._count_tokens(msg.role) + self._count_tokens(content_str or "")
        
        if msg.tool_calls:
            # Pydantic models (msg.tool_calls) are not directly json serializable with default json.dumps
            total += self._count_tokens(json.dumps([tc.dict() if hasattr(tc, "dict") else tc for tc in msg.tool_calls]))
        if msg.tool_call_id:
            total += self._count_tokens(str(msg.tool_call_id))
        return total + 4 # Padding

    def get_active_context(self) -> List[ProviderMessage]:
        """
        Assembles a token-aware context window.
        Order: [System Prompt] -> [Goal] -> [Summary/Restoration] -> [Recent History]
        """
        context = []
        current_tokens = 0

        # 1. System Prompt
        if self.agent.description:
            sys_msg = ProviderMessage(role="system", content=self.agent.description)
            context.append(sys_msg)
            current_tokens += self._get_message_tokens(sys_msg)

        # 2. Retrieve All History
        db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
        if not db_messages:
            return context

        # 3. Component Extraction
        goal_msg = next((m for m in db_messages if m.role == "user"), None)
        
        # Find latest summary/restoration
        restoration_msg = None
        for m in reversed(db_messages):
            if m.role == "system" and isinstance(m.content, dict) and m.content.get("type") == "context_restoration":
                restoration_msg = m
                break
        
        # 4. Assemble Fixed Components
        seen_ids = set()
        if goal_msg:
            p_goal = self._to_provider_msg(goal_msg)
            context.append(p_goal)
            current_tokens += self._get_message_tokens(p_goal)
            seen_ids.add(goal_msg.id)
            
        if restoration_msg:
            p_rest = self._to_provider_msg(restoration_msg)
            context.append(p_rest)
            current_tokens += self._get_message_tokens(p_rest)
            seen_ids.add(restoration_msg.id)

        # 5. Fill remaining window with recent history from newest to oldest
        history_pool = [m for m in reversed(db_messages) if m.id not in seen_ids]
        recent_context = []
        
        for m in history_pool:
            p_msg = self._to_provider_msg(m)
            msg_tokens = self._get_message_tokens(p_msg)
            
            if current_tokens + msg_tokens > self.max_context_tokens:
                break
                
            recent_context.append(p_msg)
            current_tokens += msg_tokens

        # Reverse recent history back to chronological order and append
        context.extend(reversed(recent_context))
        return context

    def get_goal_text(self) -> str:
        """
        Retrieves the original user request (the first user message).
        """
        db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
        if not db_messages: return ""
        goal_msg = next((m for m in db_messages if m.role == "user"), None)
        if not goal_msg: return ""
        return goal_msg.content if isinstance(goal_msg.content, str) else str(goal_msg.content)

    def _to_provider_msg(self, db_msg: Message) -> ProviderMessage:
        content = db_msg.content
        text_or_parts = ""
        tool_calls = None
        tool_call_id = None

        if isinstance(content, dict):
            # If it has 'parts', it's multi-modal
            if "parts" in content:
                text_or_parts = content["parts"]
            else:
                text_or_parts = content.get("text", "")
            
            tool_calls = content.get("tool_calls")
            tool_call_id = content.get("tool_call_id")
        else:
            text_or_parts = str(content)
            
        return ProviderMessage(
            role=db_msg.role, 
            content=text_or_parts, 
            name=content.get("name") if isinstance(content, dict) else None,
            tool_calls=tool_calls, 
            tool_call_id=tool_call_id
        )

    def add_message(self, role: str, content: Any, tool_calls: list = None, tool_call_id: str = None, name: str = None, metadata_type: str = None, thoughts: list = None, status: str = None) -> Message:
        if isinstance(content, list):
            rich_content = {"parts": content}
            # Fallback text for logs/simple views
            rich_content["text"] = "\n".join([p.get("text", "") for p in content if p.get("type") == "text"])
        else:
            rich_content = {"text": str(content)}

        if metadata_type:
            rich_content["type"] = metadata_type
        if tool_calls:
            serialized = [tc.dict() if hasattr(tc, 'dict') else tc for tc in tool_calls]
            rich_content["tool_calls"] = serialized
        if tool_call_id:
            rich_content["tool_call_id"] = tool_call_id
        if name:
            rich_content["name"] = name
        if thoughts:
            rich_content["thoughts"] = thoughts
        if status:
            rich_content["status"] = status

        msg_data = MessageCreate(role=role, content=rich_content)
        return self.conversation_service.add_message(self.session_id, msg_data, user_id=self.user_id)

    async def compact_history(self, llm_provider: Any):
        """
        Performs structural compaction if tokens exceed threshold.
        """
        print(f"[DEBUG] ContextManager.compact_history: started")
        self.prune_tool_outputs()

        # Check total tokens
        db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
        print(f"[DEBUG] ContextManager.compact_history: counting tokens for {len(db_messages)} messages")
        total_tokens = sum(self._get_message_tokens(self._to_provider_msg(m)) for m in db_messages)
        print(f"[DEBUG] ContextManager.compact_history: total_tokens={total_tokens}, threshold={int(self.max_context_tokens * self.compaction_threshold_pct)}")
        
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

            # Injection: Clear break with context restoration
            restoration_text = f"# Context Restoration\n\n{summary}\n\nResume from where we left off."
            # Note: add_message internal use already includes user_id
            self.add_message("system", restoration_text, metadata_type="context_restoration")
            
            # Identify messages to delete (all except goal and newest restoration)
            # Re-fetch because we just added one
            db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
            goal_msg = next((m for m in db_messages if m.role == "user"), None)
            ids_to_delete = [m.id for m in db_messages if m.role != "user" and (not isinstance(m.content, dict) or m.content.get("type") != "context_restoration")]
            
            # Keep newest restoration (the one we just added)
            newest_ids = [m.id for m in db_messages][-1:]
            ids_to_delete = [mid for mid in ids_to_delete if mid not in newest_ids]
            
            self.conversation_service.delete_messages(ids_to_delete, user_id=self.user_id)
            
        except Exception as e:
            pass

    async def _call_llm_sync(self, llm, messages) -> str:
        import asyncio
        import concurrent.futures
        print(f"[DEBUG] ContextManager._call_llm_sync: starting LLM stream")
        def collect():
            text = ""
            try:
                for chunk in llm.stream(messages):
                    if hasattr(chunk, 'content') and chunk.content: text += chunk.content
                    elif isinstance(chunk, str): text += chunk
                return text
            except Exception as e:
                print(f"[DEBUG] ContextManager._call_llm_sync error: {e}")
                return ""
        
        loop = asyncio.get_running_loop()
        res = await loop.run_in_executor(None, collect)
        print(f"[DEBUG] ContextManager._call_llm_sync: complete, received {len(res)} chars")
        return res

    def prune_tool_outputs(self):
        """
        Aggressively prunes large tool outputs to save tokens.
        """
        db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
        for msg in db_messages:
            if msg.role == "tool" and not (isinstance(msg.content, dict) and msg.content.get("pruned")):
                text = msg.content["text"] if isinstance(msg.content, dict) else str(msg.content)
                if len(text) > self.prune_threshold_chars:
                    head = text[:self.prune_threshold_chars // 2]
                    tail = text[-self.prune_threshold_chars // 2:]
                    new_text = f"{head}\n... [PRUNED {len(text) - self.prune_threshold_chars} chars] ...\n{tail}"
                    
                    content = msg.content if isinstance(msg.content, dict) else {"text": text}
                    content["text"] = new_text
                    content["pruned"] = True
                    
                    self.conversation_service.update_message(msg.id, content, user_id=self.user_id)
                    
    def get_history_text(self, limit: int = 10) -> str:
        """
        Returns a plain text representation of recent history.
        """
        db_messages = self.conversation_service.get_messages(self.session_id, user_id=self.user_id)
        recent = db_messages[-limit:]
        
        lines = []
        for m in recent:
            content = m.content
            text = content.get("text", "") if isinstance(content, dict) else str(content)
            lines.append(f"{m.role.upper()}: {text}")
            
        return "\n".join(lines)
