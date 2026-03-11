from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

class MCPEnvVar(BaseModel):
    """Schema for a single environment variable definition in MCP"""
    key: str
    value: str # Masked on read, plain on write (if updating)
    isPassword: bool = True
    isExisting: bool = False # For frontend state management

class MCPBase(BaseModel):
    """Base schema for MCP Server"""
    name: str = Field(..., min_length=3, max_length=255, pattern=r"^[A-Za-z0-9 _-]+$")
    url: str = Field(..., pattern=r"^https?:\/\/|^redis:\/\/|^postgresql:\/\/")
    headers: str # JSON string from Monaco editor
    environmentVariables: List[MCPEnvVar] = Field(default_factory=list)
    is_active: bool = True

    @field_validator('headers')
    def validate_headers_json(cls, v):
        import json
        try:
            if v:
                json.loads(v)
        except ValueError:
            raise ValueError("Headers must be a valid JSON string")
        return v

class MCPCreate(MCPBase):
    """Schema for creating an MCP Server"""
    pass

class MCPUpdate(BaseModel):
    """Schema for updating an MCP Server"""
    name: Optional[str] = Field(None, min_length=3, max_length=255, pattern=r"^[A-Za-z0-9 _-]+$")
    url: Optional[str] = Field(None, pattern=r"^https?:\/\/|^redis:\/\/|^postgresql:\/\/")
    headers: Optional[str] = None
    environmentVariables: Optional[List[MCPEnvVar]] = None
    is_active: Optional[bool] = None

class MCPResponse(MCPBase):
    """Schema for MCP Server response"""
    id: UUID
    owner_id: UUID
    sync_status: str
    sync_error: Optional[str] = None
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MCPListResponse(BaseModel):
    """Schema for paginated MCP list"""
    items: List[MCPResponse]
    total: int
    page: int
    size: int

class MCPTestRequest(BaseModel):
    """Schema for testing an MCP connection"""
    mcp_id: Optional[UUID] = None
    url: str
    headers: str
    environmentVariables: List[MCPEnvVar]
