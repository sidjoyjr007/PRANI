from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from config.database import get_db
from middleware.security import get_current_user
from models.user import User
from models.guardrail import Guardrail, AgentGuardrail, GuardrailType
from models.agent import Agent
from schemas.guardrail import GuardrailCreate, GuardrailResponse, AgentGuardrailMapping

router = APIRouter()

@router.post("/", response_model=GuardrailResponse)
def create_guardrail(
    data: GuardrailCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guardrail = Guardrail(**data.dict(), owner_id=current_user.id)
    db.add(guardrail)
    db.commit()
    db.refresh(guardrail)
    return guardrail

@router.get("/", response_model=List[GuardrailResponse])
def get_user_guardrails(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's custom guardrails and system default guardrails."""
    guardrails = db.query(Guardrail).filter(
        (Guardrail.owner_id == current_user.id) | (Guardrail.owner_id == None)
    ).all()
    return guardrails

@router.get("/{guardrail_id}", response_model=GuardrailResponse)
def get_guardrail(
    guardrail_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guardrail = db.query(Guardrail).filter(
        Guardrail.id == guardrail_id,
        (Guardrail.owner_id == current_user.id) | (Guardrail.owner_id == None)
    ).first()
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found")
    return guardrail

@router.put("/{guardrail_id}", response_model=GuardrailResponse)
def update_guardrail(
    guardrail_id: UUID,
    data: GuardrailCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guardrail = db.query(Guardrail).filter(
        Guardrail.id == guardrail_id, 
        Guardrail.owner_id == current_user.id
    ).first()
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found or unauthorized")
    
    for key, value in data.dict().items():
        setattr(guardrail, key, value)
    
    db.commit()
    db.refresh(guardrail)
    return guardrail

@router.delete("/{guardrail_id}")
def delete_guardrail(
    guardrail_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guardrail = db.query(Guardrail).filter(
        Guardrail.id == guardrail_id, 
        Guardrail.owner_id == current_user.id
    ).first()
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found or unauthorized")
    
    db.delete(guardrail)
    db.commit()
    return {"status": "success", "message": "Guardrail deleted"}

@router.post("/agent/{agent_id}/link")
def link_guardrails_to_agent(
    agent_id: UUID,
    data: AgentGuardrailMapping,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Link multiple guardrails to an agent, replacing existing ones."""
    # Verify agent ownership
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.owner_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or unauthorized")
        
    # Clear existing links
    db.query(AgentGuardrail).filter(AgentGuardrail.agent_id == agent_id).delete()
    
    # Add new ones
    for gid in data.guardrail_ids:
        # Check if guardrail exists and is allowed (system or user's own)
        g = db.query(Guardrail).filter(
            Guardrail.id == gid, 
            (Guardrail.owner_id == current_user.id) | (Guardrail.owner_id == None)
        ).first()
        if g:
            mapping = AgentGuardrail(agent_id=agent_id, guardrail_id=gid)
            db.add(mapping)
            
    db.commit()
    return {"status": "success", "message": f"Linked {len(data.guardrail_ids)} guardrails to agent {agent_id}"}
