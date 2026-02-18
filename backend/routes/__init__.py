from fastapi import APIRouter
from .auth import router as auth_router
from .tool import router as tool_router
from .llm import router as llm_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(tool_router, prefix="/tools", tags=["tools"])
api_router.include_router(llm_router, prefix="/llms", tags=["llms"])

__all__ = ["api_router"]
