from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union, Dict, Any, Iterator
from datetime import datetime

class ToolCall(BaseModel):
    id: str
    type: Literal["function"] = "function"
    function: Dict[str, Any] # {name: "...", arguments: "..."}

class LLMStreamChunk(BaseModel):
    """
    Standardized chunk for streaming responses.
    """
    content: Optional[str] = None
    role: Optional[Literal["assistant"]] = None
    finish_reason: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None # Structured tool calls

class ProviderMessage(BaseModel):
    """
    Unified message format for internal use.
    """
    role: Literal["system", "user", "assistant", "tool"]
    content: Union[str, List[Dict[str, Any]]] # String or list of content parts (images, text)
    name: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    tool_call_id: Optional[str] = None
    tokens: Optional[int] = None

class LLMResponse(BaseModel):
    """
    Standardized response from LLM.
    """
    content: Optional[str]
    role: Literal["assistant"]
    tool_calls: Optional[List[ToolCall]] = None
    finish_reason: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None
