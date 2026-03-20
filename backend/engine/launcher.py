import asyncio
import argparse
import logging
import uuid
import sys
import os

# Append the backend root to sys.path so that absolute imports (like 'llm', 'models') work reliably inside Celery workers
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from sqlalchemy.orm import Session
from datetime import datetime

from config.database import SessionLocal
from config.settings import settings
from config.logger import setup_logging
from models.deployment_run import DeploymentRun, RunStatus
from models.deployment import Deployment
from models.agent import Agent
from models.llm import LLM
from models.secret import LLMSecret
from engine.loop import AgenticLoop
from engine.events import EventBus
from llm.factory import LLMFactory
from utils.encryption import decrypt_value
from engine.events import AgentEvent, AgentEventType

# Setup json logging
setup_logging()
logger = logging.getLogger("launcher")

class DeploymentEventBus:
    """
    In isolated backend executions (deployments), we don't send events to the frontend via Redis SSE.
    Instead, we intercept them and append them to the DeploymentRun's logs column.
    """
    def __init__(self, run_id_str: str, db: Session):
        self.run_id_str = run_id_str
        self.db = db

    async def emit(self, event: AgentEvent):
        # We only care about meaningful human-readable events for the logs
        allowed_types = {
            AgentEventType.MESSAGE,
            AgentEventType.THOUGHT,
            AgentEventType.TOOL_START,
            AgentEventType.TOOL_OUTPUT,
            AgentEventType.ERROR,
            AgentEventType.STATUS
        }
        
        if event.type not in allowed_types:
            return

        # Format the event for the text log
        timestamp = event.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        event_type = str(event.type.value if hasattr(event.type, 'value') else event.type).upper()
        
        prefix = f"[{timestamp}] [{event_type}] "
        content = event.content or ""
        
        # Format specific events nicely
        if event.type == AgentEventType.TOOL_START:
            tool_name = event.metadata.get("tool", "unknown_tool")
            content = f"Executing tool: {tool_name}"
            if "args" in event.metadata:
                content += f" with args {event.metadata['args']}"
        elif event.type == AgentEventType.TOOL_OUTPUT:
            tool_name = event.metadata.get("tool", "unknown_tool")
            content = f"Tool {tool_name} returned: {content}"
            if len(content) > 500:
                content = content[:500] + "... (truncated)"
        
        log_line = f"{prefix} {content}\n"
        
        # Append to database (real-time)
        try:
            run = self.db.query(DeploymentRun).filter(DeploymentRun.id == uuid.UUID(self.run_id_str)).first()
            if run:
                current_logs = run.logs or ""
                run.logs = current_logs + log_line
                self.db.commit()
                # Print to stdout/Celery logs as well
                print(log_line.strip())
        except Exception as e:
            logger.error(f"Failed to save event to deployment logs: {e}")

    def create_event(self, session_id: str, event_type: AgentEventType, content: str = "", metadata: dict = None, run_id: str = None) -> AgentEvent:
        return AgentEvent(
            session_id=str(session_id),
            type=event_type,
            content=content,
            metadata=metadata or {},
            run_id=run_id
        )

async def run_isolated_deployment(run_id_str: str):
    logger.info(f"Starting isolated launcher for Run: {run_id_str}")
    db: Session = SessionLocal()
    
    try:
        run_id = uuid.UUID(run_id_str)
        run = db.query(DeploymentRun).filter(DeploymentRun.id == run_id).first()
        if not run:
            logger.error("Run not found")
            return
            
        deployment = db.query(Deployment).filter(Deployment.id == run.deployment_id).first()
        if not deployment:
            logger.error("Deployment not found")
            return
            
        agent = db.query(Agent).filter(Agent.id == deployment.agent_id).first()
        if not agent:
            logger.error("Agent not found")
            return

        if not agent.llm_id:
            raise Exception("Agent has no LLM configured.")

        llm_config = db.query(LLM).filter(LLM.id == agent.llm_id).first()
        if not llm_config:
            raise Exception("LLM configuration not found.")
        
        # Resolve secrets for the LLM provider (same pattern as execution_service.py)
        secrets = db.query(LLMSecret).filter(LLMSecret.llm_id == llm_config.id).all()
        resolved_secrets = {}
        for s in secrets:
            try:
                resolved_secrets[s.name] = decrypt_value(s.encrypted_value)
            except Exception as e:
                logger.error(f"Failed to decrypt secret {s.name}: {e}")
                resolved_secrets[s.name] = ""
        
        # Initialize LLM provider
        llm_provider = LLMFactory.create_provider(llm_config, resolved_secrets)
        
        # Initialize custom DeploymentEventBus to capture logs
        event_bus = DeploymentEventBus(run_id_str, db)
        
        from models.conversation import Conversation
        # We simulate a session ID for the AgenticLoop's state management
        session_id = str(run_id) # Using run_id as session_id for uniqueness isolation
        
        # Initialize AgenticLoop
        loop = AgenticLoop(
            agent=agent,
            session_id=str(run_id),
            db=db,
            llm_provider=llm_provider,
            event_bus=event_bus,
            user_id=deployment.owner_id,
            run_id=str(run_id)
        )
        
        # Log startup
        greeting = f"Starting Agent Execution Loop in Isolated Deployment Sandbox."
        await event_bus.emit(event_bus.create_event(session_id, AgentEventType.STATUS, content=greeting, run_id=run_id_str))

        # To determine the input, we prioritize run_input over the deployment's default_input.
        user_input = run.run_input or deployment.default_input
        if not user_input:
            user_input = "Execute your configured task based on your instructions. If there are no instructions, summarize your capabilities."
        
        await event_bus.emit(event_bus.create_event(session_id, AgentEventType.STATUS, content=f"User Input: {user_input}", run_id=run_id_str))

        # Run the agentic loop
        await loop.run(user_input=user_input)
        
        await event_bus.emit(event_bus.create_event(session_id, AgentEventType.STATUS, content=f"Successfully completed AgenticLoop for Run {run_id}", run_id=run_id_str))
        logger.info(f"Successfully completed AgenticLoop for Run {run_id}")
        
    except Exception as e:
        logger.error(f"Error executing agent loop in launcher: {e}", exc_info=True)
        # Note: Celery worker wraps Docker exit codes, so an exception here stops the container 
        # and tasks.py will catch it.
        raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prani Isolated Agent Launcher")
    parser.add_argument("run_id", type=str, help="The UUID of the deployment run")
    args = parser.parse_args()
    
    asyncio.run(run_isolated_deployment(args.run_id))
