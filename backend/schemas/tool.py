from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime



class ToolInput(BaseModel):
    """Schema for a single input field definition"""
    name: str
    type: str  # string, int, boolean, etc.
    description: str
    default: Optional[Any] = None
    required: bool = False


class ToolEnvVar(BaseModel):
    """Schema for a single environment variable definition"""
    name: str
    description: str
    required: bool = False


class ToolBase(BaseModel):
    """Base schema for Tool"""
    name: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    code: str
    categories: List[str] = Field(..., min_length=1)
    input_fields: List[ToolInput] = Field(default_factory=list)
    env_var_defs: List[ToolEnvVar] = Field(default_factory=list)
    is_public: bool = False

    @field_validator('code')
    def validate_code(cls, v):
        if "def execute_tool" not in v:
            raise ValueError("Code must contain 'def execute_tool' function definition")
        return v


class ToolCreate(ToolBase):
    """Schema for creating a tool"""
    # Optional dictionary of secrets to set on creation: {"API_KEY": "sk-..."}
    secrets: Optional[Dict[str, str]] = None


class ToolUpdate(BaseModel):
    """Schema for updating a tool"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    code: Optional[str] = None
    categories: Optional[List[str]] = Field(None, min_length=1)
    input_fields: Optional[List[ToolInput]] = None
    env_var_defs: Optional[List[ToolEnvVar]] = None
    is_public: Optional[bool] = None
    # Optional secrets to update/set
    secrets: Optional[Dict[str, str]] = None

    @field_validator('code')
    def validate_code(cls, v):
        if v is not None and "def execute_tool" not in v:
            raise ValueError("Code must contain 'def execute_tool' function definition")
        return v


class ToolResponse(ToolBase):
    """Schema for tool response"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ToolListResponse(BaseModel):
    """Schema for paginated tool list"""
    items: List[ToolResponse]
    total: int
    page: int
    size: int


class ToolSecretCreate(BaseModel):
    """Schema for saving a tool secret"""
    name: str
    value: str


class ToolTestRequest(BaseModel):
    """Schema for testing a tool"""
    input_data: Dict[str, Any]
