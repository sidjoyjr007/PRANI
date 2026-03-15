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

    def get_agent_allowlist(self, tool_ids: List[UUID] = None, mcp_server_ids: List[UUID] = None) -> Dict[str, List[str]]:
        """
        Extracts the explicit allowed Tool IDs and MCP Server IDs.
        """
        return {
            "allowed_ids": [str(tid) for tid in tool_ids] if tool_ids else [],
            "allowed_server_ids": [str(sid) for sid in mcp_server_ids] if mcp_server_ids else []
        }

    def get_assigned_tools(self, tool_ids: List[UUID] = None) -> List[Dict[str, Any]]:
        """
        Fetches tools explicitly assigned by IDs.
        """
        allowed_ids = [str(tid) for tid in tool_ids] if tool_ids else []
        
        if not allowed_ids:
            return []
            
        return self.retrieval.get_tools_by_filter(allowed_ids=allowed_ids)

    def get_tools_by_filter(self, allowed_ids: List[str] = None, allowed_server_ids: List[str] = None) -> List[Dict[str, Any]]:
        """
        Proxy method to fetch tools from the retrieval system by allowed IDs or server IDs.
        """
        return self.retrieval.get_tools_by_filter(allowed_ids=allowed_ids, allowed_server_ids=allowed_server_ids)

    def get_mcp_server_names(self, mcp_server_ids: List[UUID]) -> Dict[str, str]:
        """
        Fetches human-readable names for MCP servers.
        """
        if not mcp_server_ids:
            return {}
        
        servers = self.db.query(MCPServer).filter(MCPServer.id.in_(mcp_server_ids)).all()
        return {str(s.id): s.name for s in servers}

    def search_tools(self, query: str, tool_ids: List[UUID] = None, mcp_server_ids: List[UUID] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Semantically searches for additional relevant tools based on allowed IDs.
        """
        allowlist = self.get_agent_allowlist(tool_ids, mcp_server_ids)
        
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

    def get_tool_by_name(self, tool_name: str, tool_ids: List[UUID] = None, mcp_server_ids: List[UUID] = None) -> Optional[Dict[str, Any]]:
        """
        Fetches a tool by name, ensuring it's in the allowed list.
        """
        clean_name = tool_name.replace("default_api:", "").replace("default_api.", "")
        
        # 1. Check Assigned Tools
        assigned = self.get_assigned_tools(tool_ids)
        for t in assigned:
            t_name = t.get("name", "").replace("default_api:", "").replace("default_api.", "")
            if t_name == clean_name:
                return t
        
        # 2. Check Vector Search results
        results = self.search_tools(query=clean_name, tool_ids=tool_ids, mcp_server_ids=mcp_server_ids, limit=10)
        for t in results:
            t_name = t.get("name", "").replace("default_api:", "")
            if t_name == clean_name:
                return t
                
        return None

