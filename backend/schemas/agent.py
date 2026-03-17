from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class AgentBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, pattern=r"^[A-Za-z0-9 _-]+$")
    instructions: Optional[str] = None
    tool_ids: List[UUID] = []
    mcp_server_ids: List[UUID] = []
    llm_id: Optional[UUID] = None
    human_in_loop: bool = False
    is_active: bool = True

    @field_validator('instructions')
    @classmethod
    def validate_instructions_word_count(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            word_count = len([w for w in v.split() if w.strip()])
            if word_count > 250:
                raise ValueError("Instructions cannot exceed 250 words.")
        return v

        return v

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    instructions: Optional[str] = None
    tool_ids: Optional[List[UUID]] = None
    mcp_server_ids: Optional[List[UUID]] = None
    llm_id: Optional[UUID] = None
    human_in_loop: Optional[bool] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Names for frontend display
    tool_names: List[str] = []
    mcp_server_names: List[str] = []
    llm_name: Optional[str] = None

    class Config:
        from_attributes = True

class AgentListResponse(BaseModel):
    """Schema for paginated agent list"""
    items: List[AgentResponse]
    total: int
    page: int
    size: int
