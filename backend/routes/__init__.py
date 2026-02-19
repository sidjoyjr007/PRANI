from fastapi import APIRouter
from .auth import router as auth_router
from .tool import router as tool_router
from .llm import router as llm_router
from .mcp_server import router as mcp_router
from .agent import router as agent_router
from .conversation import router as conversation_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(tool_router, prefix="/tools", tags=["tools"])
api_router.include_router(llm_router, prefix="/llms", tags=["llms"])
api_router.include_router(mcp_router, prefix="/mcp-servers", tags=["mcp-servers"])
api_router.include_router(agent_router, prefix="/agents", tags=["agents"])
api_router.include_router(conversation_router, prefix="/conversations", tags=["conversations"])

__all__ = ["api_router"]
