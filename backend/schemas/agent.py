from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    capabilities: List[str] = []
    tool_ids: List[UUID] = []
    mcp_server_ids: List[UUID] = []
    llm_id: Optional[UUID] = None
    human_in_loop: bool = False
    is_active: bool = True

    @field_validator('capabilities', mode='before')
    @classmethod
    def parse_capabilities(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return v

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[List[str]] = None
    tool_ids: Optional[List[UUID]] = None
    mcp_server_ids: Optional[List[UUID]] = None
    llm_id: Optional[UUID] = None
    human_in_loop: Optional[bool] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AgentListResponse(BaseModel):
    """Schema for paginated agent list"""
    items: List[AgentResponse]
    total: int
    page: int
    size: int
