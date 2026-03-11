from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from config.database import get_db
from models.agent import Agent
from schemas.agent import AgentCreate, AgentResponse, AgentUpdate, AgentListResponse
from services.agent_service import AgentService
from middleware.security import get_current_user
from models.user import User


router = APIRouter(
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=AgentListResponse)
def read_agents(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query for name or instructions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve agents with pagination and search.
    """
    return AgentService.get_agents(db, user_id=current_user.id, page=page, size=size, search=search)

@router.post("/", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new agent.
    """
    return AgentService.create_agent(db=db, agent=agent, user_id=current_user.id)

@router.get("/{agent_id}", response_model=AgentResponse)
def read_agent(agent_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a specific agent by ID.
    """
    db_agent = AgentService.get_agent(db, agent_id=agent_id, user_id=current_user.id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: UUID, agent: AgentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Partially update an agent (only changed fields).
    """
    db_agent = AgentService.update_agent(db, agent_id=agent_id, agent_update=agent, user_id=current_user.id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.delete("/{agent_id}", response_model=AgentResponse)
def delete_agent(agent_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete an agent.
    """
    db_agent = AgentService.delete_agent(db, agent_id=agent_id, user_id=current_user.id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent
