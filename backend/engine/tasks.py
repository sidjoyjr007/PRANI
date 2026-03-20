import logging
import asyncio
import traceback
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from config.database import SessionLocal
from engine.celery_app import celery_app
from models.deployment_run import DeploymentRun, RunStatus

import croniter
from models.deployment import Deployment, TriggerType
from services.deployment_service import DeploymentService

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="engine.tasks.run_agent_deployment")
def run_agent_deployment(self, run_id: str):
    """
    Executes the agent for the given deployment run directly in the Celery worker process.
    No Docker containers — the worker already has the full environment via the venv.
    """
    logger.info(f"Starting Celery task for Deployment Run: {run_id}")
    db: Session = SessionLocal()

    try:
        run = db.query(DeploymentRun).filter(DeploymentRun.id == UUID(run_id)).first()
        if not run:
            logger.error(f"Run {run_id} not found")
            return

        run.status = RunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()

        # Run the agent directly via the launcher logic
        try:
            from engine.launcher import run_isolated_deployment
            asyncio.run(run_isolated_deployment(run_id))
            
            # Reload the run from DB to get updated logs/status set by launcher
            db.expire(run)
            run = db.query(DeploymentRun).filter(DeploymentRun.id == UUID(run_id)).first()
            
            # If launcher didn't update status (e.g. completed silently), mark as completed
            if run and run.status == RunStatus.RUNNING:
                run.status = RunStatus.COMPLETED
                run.completed_at = datetime.utcnow()
                db.commit()
                
        except Exception as e:
            logger.error(f"Agent execution failed for run {run_id}: {e}")
            error_log = f"Execution Error:\n{traceback.format_exc()}"
            run = db.query(DeploymentRun).filter(DeploymentRun.id == UUID(run_id)).first()
            if run:
                run.status = RunStatus.FAILED
                run.logs = (run.logs or "") + f"\n\n{error_log}"
                run.completed_at = datetime.utcnow()
                db.commit()

        logger.info(f"Finished Run {run_id}")

    except Exception as e:
        logger.error(f"Unexpected error in run_agent_deployment: {e}")
        try:
            run = db.query(DeploymentRun).filter(DeploymentRun.id == UUID(run_id)).first()
            if run:
                run.status = RunStatus.FAILED
                run.logs = f"Internal Exception: {traceback.format_exc()}"
                run.completed_at = datetime.utcnow()
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
@celery_app.task(name="engine.tasks.check_scheduled_deployments")
def check_scheduled_deployments():
    """
    Periodic task that checks all active scheduled deployments and triggers 
    them if they are due.
    """
    logger.info("Checking for due scheduled deployments...")
    db: Session = SessionLocal()
    try:
        # Get active scheduled deployments
        active_scheduled = db.query(Deployment).filter(
            Deployment.is_active == True,
            Deployment.trigger_type == TriggerType.SCHEDULED
        ).all()
        
        now = datetime.utcnow()
        triggered_count = 0
        
        for deployment in active_scheduled:
            if not deployment.schedule_cron:
                continue
                
            try:
                # Check if it's due
                # Support sub-minute resolution if a 6-part cron is provided
                it = croniter.croniter(deployment.schedule_cron, now, second_at_beginning=True)
                
                # get_prev(datetime) returns the closest past valid trigger time.
                prev_run = it.get_prev(datetime)
                
                # Calculate how much time has passed since this schedule was due
                drift_seconds = (now - prev_run).total_seconds()
                
                # Only trigger if it was due in the last 60 seconds.
                # If the worker was down for hours, we skip old missed triggers.
                if drift_seconds <= 60.0:
                    # Prevent duplicate runs: check if a run was already created for this specific trigger time
                    recent_run = db.query(DeploymentRun).filter(
                        DeploymentRun.deployment_id == deployment.id,
                        DeploymentRun.created_at >= prev_run
                    ).first()
                    
                    if not recent_run:
                        logger.info(f"Triggering scheduled deployment: {deployment.id}")
                        # Use DeploymentService.trigger_run to create the run
                        run = DeploymentService.trigger_run(
                            db, 
                            deployment.id, 
                            api_key=None, 
                            run_input=None # uses default_input from deployment
                        )
                        # Trigger the execution task
                        run_agent_deployment.delay(str(run.id))
                        triggered_count += 1

                    
            except Exception as e:
                logger.error(f"Error checking schedule for deployment {deployment.id}: {e}")
                
        if triggered_count > 0:
            logger.info(f"Successfully triggered {triggered_count} scheduled deployments.")
            
    except Exception as e:
        logger.error(f"Error in check_scheduled_deployments: {e}")
    finally:
        db.close()
