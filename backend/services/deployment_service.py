import secrets
import hashlib
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, Tuple
from uuid import UUID
from models.deployment import Deployment, TriggerType, DeploymentStatus
from models.deployment_run import DeploymentRun, RunStatus
from models.user import User
from schemas.deployment import DeploymentCreate, DeploymentUpdate

class DeploymentService:
    @staticmethod
    def _hash_api_key(api_key: str) -> str:
        return hashlib.sha256(api_key.encode()).hexdigest()

    @staticmethod
    def create_deployment(db: Session, deployment_data: DeploymentCreate, user_id: UUID) -> Tuple[Deployment, Optional[str]]:
        db_deployment = Deployment(
            name=deployment_data.name,
            agent_id=deployment_data.agent_id,
            owner_id=user_id,
            trigger_type=deployment_data.trigger_type,
            schedule_cron=deployment_data.schedule_cron,
            default_input=deployment_data.default_input,
            api_key_hash=None,
            is_active=deployment_data.is_active
        )

        db.add(db_deployment)
        db.commit()
        db.refresh(db_deployment)
        
        return db_deployment, None

    @staticmethod
    def get_deployments(db: Session, user_id: UUID, page: int = 1, size: int = 10, search: Optional[str] = None):
        query = db.query(Deployment).filter(Deployment.owner_id == user_id)
        if search:
            query = query.filter(Deployment.name.ilike(f"%{search}%"))
            
        total = query.count()
        skip = (page - 1) * size
        items = query.order_by(desc(Deployment.created_at)).offset(skip).limit(size).all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size
        }

    @staticmethod
    def get_deployment(db: Session, deployment_id: UUID, user_id: UUID) -> Optional[Deployment]:
        return db.query(Deployment).filter(
            Deployment.id == deployment_id,
            Deployment.owner_id == user_id
        ).first()

    @staticmethod
    def update_deployment(db: Session, deployment_id: UUID, update_data: DeploymentUpdate, user_id: UUID) -> Optional[Deployment]:
        db_deployment = DeploymentService.get_deployment(db, deployment_id, user_id)
        if not db_deployment:
            return None
            
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_deployment, key, value)
            
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def delete_deployment(db: Session, deployment_id: UUID, user_id: UUID) -> bool:
        db_deployment = DeploymentService.get_deployment(db, deployment_id, user_id)
        if not db_deployment:
            return False
            
        db.delete(db_deployment)
        db.commit()
        return True

    @staticmethod
    def trigger_run(db: Session, deployment_id: UUID, api_key: Optional[str] = None, run_input: Optional[str] = None):
        """
        Creates a DeploymentRun and queues the background execution task.
        """
        db_deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
        if not db_deployment:
            raise Exception("Deployment not found")
            
        if not db_deployment.is_active:
            raise Exception("Deployment is inactive")

        if db_deployment.trigger_type == TriggerType.API:
            if not api_key:
                raise Exception("API key is required for API trigger")
            
            # Match against the owner's global API key hash
            owner = db.query(User).filter(User.id == db_deployment.owner_id).first()
            if not owner or not owner.api_key_hash:
                raise Exception("No API key configured for this account. Please generate one in settings.")
            
            if owner.api_key_hash != DeploymentService._hash_api_key(api_key):
                raise Exception("Invalid API key")
                
        # Create Run record
        new_run = DeploymentRun(
            deployment_id=db_deployment.id,
            status=RunStatus.PENDING,
            run_input=run_input or db_deployment.default_input
        )
        db.add(new_run)
        db.commit()
        db.refresh(new_run)

        
        # NOTE: Here we will integrate with Celery to queue the task asynchronously.
        # For now, we will mark as pending.
        
        return new_run
