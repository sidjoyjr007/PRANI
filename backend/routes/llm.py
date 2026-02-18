from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from config.database import get_db
from middleware.security import get_current_user
from models.user import User
from schemas.llm import LLMCreate, LLMResponse, LLMUpdate, LLMListResponse, LLMTestRequest
from services.llm_service import llm_service

router = APIRouter()

@router.post("/", response_model=LLMResponse, status_code=status.HTTP_201_CREATED)
def create_llm(
    llm_data: LLMCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new LLM configuration"""
    return llm_service.create_llm(db, llm_data, current_user.id)

@router.get("/", response_model=LLMListResponse)
def list_llms(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List LLMs with pagination and search"""
    return llm_service.get_llms(db, page, size, search, current_user.id)

@router.get("/{llm_id}", response_model=LLMResponse)
def get_llm(
    llm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get LLM details"""
    llm = llm_service.get_llm(db, llm_id)
    if not llm:
        raise HTTPException(status_code=404, detail="LLM not found")
    if llm.owner_id != current_user.id and not llm.is_public:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # We need to format the response using the service helper to mask secrets
    # The service `get_llm` returns the DB object.
    # We should use `_format_response` but it's internal.
    # Refactor: explicit public method or just replicate formatting here?
    # Better: Use `get_llm` from service which returns DB object, then format.
    # Actually `llm_service.get_llms` returns formatted dicts.
    # But `get_llm` returns DB object.
    # Let's fix `get_llm` in service to return formatted dict?
    # Or just expose `format_llm` in service.
    # For now, I'll access the internal method or duplicate valid logic.
    # Accessing internal is robust enough for this MVP.
    return llm_service._format_response(llm)

@router.put("/{llm_id}", response_model=LLMResponse)
def update_llm(
    llm_id: UUID,
    update_data: LLMUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update LLM"""
    llm = llm_service.get_llm(db, llm_id)
    if not llm:
        raise HTTPException(status_code=404, detail="LLM not found")
    if llm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    updated = llm_service.update_llm(db, llm_id, update_data, current_user.id)
    return updated

@router.delete("/{llm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_llm(
    llm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete LLM"""
    llm = llm_service.get_llm(db, llm_id)
    if not llm:
        raise HTTPException(status_code=404, detail="LLM not found")
    if llm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    llm_service.delete_llm(db, llm_id, current_user.id)
    return None

@router.post("/test", response_model=dict)
def test_connection(
    test_req: LLMTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test LLM connection"""
    # If llm_id provided, verify ownership
    if test_req.llm_id:
        llm = llm_service.get_llm(db, test_req.llm_id)
        if llm and llm.owner_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized to access this LLM secrets")
    
    result = llm_service.test_connection(
        db,
        test_req.provider,
        test_req.model,
        test_req.headers,
        [e.dict() for e in test_req.environmentVariables],
        test_req.prompt,
        test_req.llm_id
    )
    return result
