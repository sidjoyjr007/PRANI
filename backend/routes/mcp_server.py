from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List

from config.database import get_db
from middleware.security import get_current_user
from models.user import User
from schemas.mcp_server import MCPCreate, MCPUpdate, MCPResponse, MCPListResponse, MCPTestRequest
from services.mcp_service import mcp_service

router = APIRouter(
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MCPResponse)
def create_mcp(
    mcp_data: MCPCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new MCP server configuration"""
    return mcp_service.create_mcp(db=db, mcp_data=mcp_data, user_id=current_user.id)

@router.get("/", response_model=MCPListResponse)
def list_mcps(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all MCP servers for the current user"""
    return mcp_service.get_mcps(db=db, page=page, size=size, search=search, user_id=current_user.id)

@router.get("/{mcp_id}", response_model=MCPResponse)
def get_mcp(
    mcp_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific MCP server by ID"""
    mcp = mcp_service.get_mcp(db=db, mcp_id=mcp_id)
    if not mcp:
        raise HTTPException(status_code=404, detail="MCP Server not found")
    if mcp.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this MCP server")
    return mcp_service.format_mcp(mcp)

@router.put("/{mcp_id}", response_model=MCPResponse)
def update_mcp(
    mcp_id: UUID,
    mcp_data: MCPUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing MCP server"""
    mcp = mcp_service.get_mcp(db=db, mcp_id=mcp_id)
    if not mcp:
        raise HTTPException(status_code=404, detail="MCP Server not found")
    if mcp.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this MCP server")
    
    updated_mcp = mcp_service.update_mcp(db=db, mcp_id=mcp_id, update_data=mcp_data, user_id=current_user.id)
    return updated_mcp

@router.delete("/{mcp_id}")
def delete_mcp(
    mcp_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an MCP server"""
    mcp = mcp_service.get_mcp(db=db, mcp_id=mcp_id)
    if not mcp:
        raise HTTPException(status_code=404, detail="MCP Server not found")
    if mcp.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this MCP server")
    
    mcp_service.delete_mcp(db=db, mcp_id=mcp_id, user_id=current_user.id)
    return {"success": True, "message": "MCP Server deleted successfully"}

@router.post("/test")
async def test_connection(
    request: MCPTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test connection to an MCP server"""
    # If ID provided, verify ownership
    if request.mcp_id:
        mcp = mcp_service.get_mcp(db=db, mcp_id=request.mcp_id)
        if mcp and mcp.owner_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized")
             
    result = await mcp_service.test_connection(
        db=db,
        url=request.url,
        headers_json=request.headers,
        env_vars=[env.dict() for env in request.environmentVariables],
        mcp_id=request.mcp_id
    )
    return result
