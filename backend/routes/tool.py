from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from config.database import get_db
from middleware.security import get_current_user
from models.user import User
from schemas.tool import ToolCreate, ToolResponse, ToolUpdate, ToolTestRequest, ToolSecretCreate, ToolListResponse
from services.tool_service import tool_service

router = APIRouter()


@router.post("/", response_model=ToolResponse, status_code=status.HTTP_201_CREATED)
def create_tool(
    tool_data: ToolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new tool"""
    return tool_service.create_tool(db, tool_data, current_user.id)


from fastapi import Query

@router.get("/", response_model=ToolListResponse)
def list_tools(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search query for name or description"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all tools owned by the current user with pagination and search"""
    return tool_service.get_tools(db, page, size, search, current_user.id)


@router.get("/{tool_id}", response_model=ToolResponse)
def get_tool(
    tool_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific tool by ID"""
    tool = tool_service.get_tool(db, tool_id)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )
    if tool.owner_id != current_user.id and not tool.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this tool",
        )
    return tool


@router.patch("/{tool_id}", response_model=ToolResponse)
def update_tool(
    tool_id: UUID,
    tool_update: ToolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a tool (partial update)"""
    existing_tool = tool_service.get_tool(db, tool_id)
    if not existing_tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
        
    if existing_tool.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this tool")

    updated_tool = tool_service.update_tool(db, tool_id, tool_update, current_user.id)
    return updated_tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(
    tool_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a tool"""
    existing_tool = tool_service.get_tool(db, tool_id)
    if not existing_tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
        
    if existing_tool.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this tool")

    success = tool_service.delete_tool(db, tool_id, current_user.id)
    if not success:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete tool")
    return None


@router.post("/{tool_id}/sync", response_model=ToolResponse)
def sync_tool(
    tool_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Force sync a tool with the vector database"""
    tool = tool_service.force_sync(db, tool_id, current_user.id)
    if not tool:
        # Distinguish between not found and unauthorized if needed, simple approach:
        existing = tool_service.get_tool(db, tool_id)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return tool


@router.post("/{tool_id}/secrets", status_code=status.HTTP_200_OK)
def save_tool_secret(
    tool_id: UUID,
    secret_data: ToolSecretCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save an encrypted secret for a tool"""
    existing_tool = tool_service.get_tool(db, tool_id)
    if not existing_tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    
    # Do we allow non-owners to use tools? If so, they need to save their own secrets.
    # For now, allow any authenticated user to save secrets for a tool they can access.
    
    tool_service.save_secret(db, tool_id, current_user.id, secret_data)
    return {"message": "Secret saved successfully"}


from utils.execution import execute_python_tool

@router.post("/{tool_id}/test", response_model=dict)
def test_tool(
    tool_id: UUID,
    test_request: ToolTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Test/Run a tool.
    Injects decrypted secrets into execution environment.
    """
    tool = tool_service.get_tool(db, tool_id)
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    
    if tool.owner_id != current_user.id and not tool.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to use this tool")

    # Fetch secrets (decrypted)
    secrets = tool_service.get_decrypted_secrets(db, tool_id, current_user.id)
    
    # Execute the tool
    execution_result = execute_python_tool(
        code=tool.code,
        inputs=test_request.input_data,
        secrets=secrets,
        input_fields=tool.input_fields
    )
    
    if not execution_result["success"]:
        return {
            "success": False,
            "message": "Tool execution failed",
            "error": execution_result.get("error"),
            "traceback": execution_result.get("traceback")
        }

    return {
        "success": True,
        "message": f"Tool '{tool.name}' executed successfully",
        "result": execution_result["result"],
        "input": test_request.input_data
    }
