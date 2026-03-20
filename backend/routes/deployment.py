from fastapi import APIRouter, Depends, HTTPException, Query, Header, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from config.database import get_db
from schemas.deployment import DeploymentCreate, DeploymentUpdate, DeploymentResponse, DeploymentListResponse, DeploymentRunResponse, DeploymentTriggerRequest
from services.deployment_service import DeploymentService
from middleware.security import get_current_user
from models.user import User

router = APIRouter(responses={404: {"description": "Not found"}})

@router.get("/", response_model=DeploymentListResponse)
def read_deployments(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DeploymentService.get_deployments(db, user_id=current_user.id, page=page, size=size)

@router.post("/", response_model=DeploymentResponse)
def create_deployment(
    deployment: DeploymentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_dep, api_key = DeploymentService.create_deployment(db, deployment, current_user.id)
    
    # Return the deployment with the optional api_key field populated
    response = DeploymentResponse.from_orm(db_dep)
    response.api_key = api_key
    return response

@router.get("/{deployment_id}", response_model=DeploymentResponse)
def read_deployment(
    deployment_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_dep = DeploymentService.get_deployment(db, deployment_id, current_user.id)
    if not db_dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return db_dep

@router.patch("/{deployment_id}", response_model=DeploymentResponse)
def update_deployment(
    deployment_id: UUID, 
    deployment_update: DeploymentUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_dep = DeploymentService.update_deployment(db, deployment_id, deployment_update, current_user.id)
    if not db_dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return db_dep

@router.delete("/{deployment_id}")
def delete_deployment(
    deployment_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    success = DeploymentService.delete_deployment(db, deployment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return {"status": "deleted"}

from engine.tasks import run_agent_deployment

@router.post("/{deployment_id}/trigger", response_model=DeploymentRunResponse)
def trigger_deployment(
    deployment_id: UUID, 
    background_tasks: BackgroundTasks,
    request: Optional[DeploymentTriggerRequest] = None,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Public webhook / trigger endpoint. Requires x-api-key header for API-type deployments.
    """
    try:
        run_input = request.run_input if request else None
        run = DeploymentService.trigger_run(db, deployment_id, x_api_key, run_input)
        run_agent_deployment.delay(str(run.id))
        return run
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{deployment_id}/run-now", response_model=DeploymentRunResponse)
def trigger_deployment_admin(
    deployment_id: UUID,
    request: Optional[DeploymentTriggerRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin/UI trigger endpoint. Authenticated via user session instead of API key.
    Bypasses API key check so users can run deployments from the dashboard.
    """
    try:
        # Verify the deployment belongs to this user first
        db_dep = DeploymentService.get_deployment(db, deployment_id, current_user.id)
        if not db_dep:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        run_input = request.run_input if request else None
        
        # Create the run record directly (bypassing API key check)
        from models.deployment_run import DeploymentRun, RunStatus
        new_run = DeploymentRun(
            deployment_id=db_dep.id,
            status=RunStatus.PENDING,
            run_input=run_input or db_dep.default_input
        )
        db.add(new_run)
        db.commit()
        db.refresh(new_run)
        
        # Dispatch Celery task
        run_agent_deployment.delay(str(new_run.id))
        
        return new_run
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from models.deployment_run import DeploymentRun
from sqlalchemy import desc

@router.get("/{deployment_id}/runs")
def read_deployment_runs(
    deployment_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Ensure deployment belongs to user
    db_dep = DeploymentService.get_deployment(db, deployment_id, current_user.id)
    if not db_dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
        
    runs = db.query(DeploymentRun).filter(
        DeploymentRun.deployment_id == deployment_id
    ).order_by(desc(DeploymentRun.created_at)).all()
    
    return [
        {
            "id": str(run.id),
            "deployment_id": str(run.deployment_id),
            "status": run.status.value,
            "run_input": run.run_input,
            "logs": run.logs,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            "created_at": run.created_at.isoformat() if run.created_at else None,
            "updated_at": run.updated_at.isoformat() if run.updated_at else None,
        }
        for run in runs
    ]
