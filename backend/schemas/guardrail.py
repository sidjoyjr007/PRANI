from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from models.guardrail import GuardrailType, GuardrailMechanism, GuardrailAction

class GuardrailBase(BaseModel):
    name: str = Field(..., description="Name of the guardrail")
    description: Optional[str] = Field(None, description="Description of rule")
    type: GuardrailType = Field(..., description="When the guardrail triggers (input, output, execution)")
    mechanism: GuardrailMechanism = Field(..., description="regex or llm_judge")
    action: GuardrailAction = Field(GuardrailAction.BLOCK, description="What to do if it fails")
    logic: str = Field(..., description="The regex pattern or LLM system prompt")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional settings")
    is_active: bool = Field(True, description="Is it active?")

class GuardrailCreate(GuardrailBase):
    pass

class GuardrailResponse(GuardrailBase):
    id: UUID
    owner_id: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class AgentGuardrailMapping(BaseModel):
    guardrail_ids: List[UUID] = Field(..., description="List of guardrail IDs to link to the agent")
