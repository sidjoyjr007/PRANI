from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

class LLMEnvVar(BaseModel):
    """Schema for a single environment variable definition in LLM"""
    key: str
    value: str # Masked on read, plain on write (if updating)
    isPassword: bool = True
    isExisting: bool = False # For frontend state management

class LLMBase(BaseModel):
    """Base schema for LLM"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    provider: str
    model: str
    headers: str # JSON string from Monaco editor
    environmentVariables: List[LLMEnvVar] = Field(default_factory=list)
    is_public: bool = False

    @field_validator('headers')
    def validate_headers_json(cls, v):
        import json
        try:
            if v:
                json.loads(v)
        except ValueError:
            raise ValueError("Headers must be a valid JSON string")
        return v

class LLMCreate(LLMBase):
    """Schema for creating an LLM"""
    pass

class LLMUpdate(BaseModel):
    """Schema for updating an LLM"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    headers: Optional[str] = None
    environmentVariables: Optional[List[LLMEnvVar]] = None
    is_public: Optional[bool] = None

class LLMResponse(LLMBase):
    """Schema for LLM response"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LLMListResponse(BaseModel):
    """Schema for paginated LLM list"""
    items: List[LLMResponse]
    total: int
    page: int
    size: int

class LLMTestRequest(BaseModel):
    """Schema for testing an LLM connection"""
    llm_id: Optional[UUID] = None
    provider: str
    model: str
    headers: str
    environmentVariables: List[LLMEnvVar]
    prompt: str = "Hello, strict test."
