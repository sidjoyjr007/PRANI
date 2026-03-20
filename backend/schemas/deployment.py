from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from models.deployment import TriggerType, DeploymentStatus
from models.deployment_run import RunStatus

class DeploymentCreate(BaseModel):
    name: str
    agent_id: UUID
    trigger_type: TriggerType
    schedule_cron: Optional[str] = None
    default_input: Optional[str] = None
    is_active: bool = True

class DeploymentUpdate(BaseModel):
    name: Optional[str] = None
    trigger_type: Optional[TriggerType] = None
    schedule_cron: Optional[str] = None
    default_input: Optional[str] = None
    is_active: Optional[bool] = None

class DeploymentResponse(BaseModel):
    id: UUID
    name: str
    agent_id: UUID
    owner_id: UUID
    trigger_type: TriggerType
    schedule_cron: Optional[str] = None
    default_input: Optional[str] = None
    is_active: bool
    status: DeploymentStatus
    api_key: Optional[str] = None  # Returned only once on creation
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeploymentRunResponse(BaseModel):
    id: UUID
    deployment_id: UUID
    status: RunStatus
    run_input: Optional[str] = None
    logs: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
class DeploymentListResponse(BaseModel):
    items: List[DeploymentResponse]
    total: int
    page: int
    size: int

class DeploymentTriggerRequest(BaseModel):
    run_input: Optional[str] = None
