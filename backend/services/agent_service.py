from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional
from uuid import UUID
from models.agent import Agent
from schemas.agent import AgentCreate, AgentUpdate

class AgentService:
    @staticmethod
    def get_agents(db: Session, page: int = 1, size: int = 10, search: Optional[str] = None):
        query = db.query(Agent)
        
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Agent.name.ilike(search_filter),
                    Agent.description.ilike(search_filter)
                )
            )

        # Get total count for pagination
        total = query.count()
        
        # Apply pagination
        skip = (page - 1) * size
        items = query.order_by(desc(Agent.updated_at)).offset(skip).limit(size).all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size
        }

    @staticmethod
    def get_agent(db: Session, agent_id: UUID):
        return db.query(Agent).filter(Agent.id == agent_id).first()

    @staticmethod
    def create_agent(db: Session, agent: AgentCreate):
        db_agent = Agent(
            name=agent.name,
            description=agent.description,
            capabilities=agent.capabilities,
            tool_ids=[str(id) for id in agent.tool_ids],
            mcp_server_ids=[str(id) for id in agent.mcp_server_ids],
            llm_id=agent.llm_id,
            human_in_loop=agent.human_in_loop,
            is_active=agent.is_active
        )
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        return db_agent

    @staticmethod
    def update_agent(db: Session, agent_id: UUID, agent_update: AgentUpdate):
        db_agent = AgentService.get_agent(db, agent_id)
        if not db_agent:
            return None
        
        update_data = agent_update.model_dump(exclude_unset=True)
        
        # Handle UUID list conversion for JSONB fields if they are present in update
        if "tool_ids" in update_data:
            update_data["tool_ids"] = [str(id) for id in update_data["tool_ids"]]
            
        if "mcp_server_ids" in update_data:
            update_data["mcp_server_ids"] = [str(id) for id in update_data["mcp_server_ids"]]

        for key, value in update_data.items():
            setattr(db_agent, key, value)

        db.commit()
        db.refresh(db_agent)
        return db_agent

    @staticmethod
    def delete_agent(db: Session, agent_id: UUID):
        db_agent = AgentService.get_agent(db, agent_id)
        if not db_agent:
            return None
        
        db.delete(db_agent)
        db.commit()
        return db_agent
