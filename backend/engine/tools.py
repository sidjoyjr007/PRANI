import logging
import json
import asyncio
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from models.tool import Tool
from models.mcp_server import MCPServer
from services.mcp_service import MCPService
from engine.retrieval import RetrievalSystem

logger = logging.getLogger(__name__)

class ToolRegistry:
    """
    Manages tool definitions and retrieval via ChromaDB Zero-Latency index.
    Phase 4: Stateless proxy. Tools are indexed asynchronously upon creation/sync.
    """
    def __init__(self, db: Session):
        self.db = db
        self.mcp_service = MCPService()
        self.retrieval = RetrievalSystem()

    def get_agent_allowlist(self, agent) -> Dict[str, List[str]]:
        """
        Extracts the explicit allowed Tool IDs and MCP Server IDs for an agent.
        """
        return {
            "allowed_ids": [str(tid) for tid in agent.tool_ids] if agent.tool_ids else [],
            "allowed_server_ids": [str(sid) for sid in agent.mcp_server_ids] if agent.mcp_server_ids else []
        }

    def get_assigned_tools(self, agent) -> List[Dict[str, Any]]:
        """
        Fetches tools explicitly assigned to the agent.
        """
        # We no longer eagerly load all tools from assigned MCP servers.
        # We only keep the explicitly linked tools by ID.
        allowed_ids = [str(tid) for tid in agent.tool_ids] if agent.tool_ids else []
        
        if not allowed_ids:
            return []
            
        return self.retrieval.get_tools_by_filter(allowed_ids=allowed_ids)

    def search_tools(self, query: str, agent, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Semantically searches for additional relevant tools the agent has access to.
        """
        allowlist = self.get_agent_allowlist(agent)
        
        if not allowlist["allowed_ids"] and not allowlist["allowed_server_ids"]:
            return []
            
        try:
            return self.retrieval.query_tools(
                query=query, 
                limit=limit, 
                allowed_ids=allowlist["allowed_ids"],
                allowed_server_ids=allowlist["allowed_server_ids"]
            )
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    def get_tool_definitions(self, tool_ids: List[str] = None) -> List[Dict[str, Any]]:
        """
        Returns JSON schemas for the specified tools by fetching them from Chroma.
        """
        if not tool_ids:
            return []
            
        tools = self.retrieval.get_tools_by_filter(allowed_ids=tool_ids)
        definitions = []
        for tool in tools:
            definitions.append({
                "type": "function",
                "function": tool["schema"] or {}
            })
        return definitions

    def get_tool(self, tool_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific tool definition from Chroma by ID.
        """
        tools = self.retrieval.get_tools_by_filter(allowed_ids=[tool_id])
        return tools[0] if tools else None

    def get_tool_by_name(self, tool_name: str, agent) -> Optional[Dict[str, Any]]:
        """
        Fetches a tool by name, ensuring the agent is allowed to use it.
        Performs exact name matching as per user requirement (no normalization).
        """
        # 1. Check Assigned Tools (Fast path)
        assigned = self.get_assigned_tools(agent)
        for t in assigned:
            if t.get("name") == tool_name:
                return t
        
        # 2. Check Vector Search results
        # We search with the tool name as the query
        results = self.search_tools(query=tool_name, agent=agent, limit=10)
        for t in results:
            if t.get("name") == tool_name:
                return t
                
        return None

