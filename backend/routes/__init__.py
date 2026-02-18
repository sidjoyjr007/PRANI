from fastapi import APIRouter
from .auth import router as auth_router
from .tool import router as tool_router
from .llm import router as llm_router
from .mcp_server import router as mcp_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(tool_router, prefix="/tools", tags=["tools"])
api_router.include_router(llm_router, prefix="/llms", tags=["llms"])
api_router.include_router(mcp_router, prefix="/mcp-servers", tags=["mcp-servers"])

__all__ = ["api_router"]
