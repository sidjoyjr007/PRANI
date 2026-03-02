from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional
from uuid import UUID
from models.agent import Agent
from schemas.agent import AgentCreate, AgentUpdate
from models.tool import Tool
from models.mcp_server import MCPServer
from models.llm import LLM

class AgentService:
    @staticmethod
    def get_agents(db: Session, user_id: UUID, page: int = 1, size: int = 10, search: Optional[str] = None):
        query = db.query(Agent).filter(
            or_(
                Agent.owner_id == user_id,
                Agent.is_public == True
            )
        )
        
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
    def get_agent(db: Session, agent_id: UUID, user_id: UUID = None):
        query = db.query(Agent).filter(Agent.id == agent_id)
        if user_id:
            query = query.filter(
                or_(
                    Agent.owner_id == user_id,
                    Agent.is_public == True
                )
            )
        return query.first()

    @staticmethod
    def _validate_resources(db: Session, user_id: UUID, agent_data: dict):
        """Verify user owns or has public access to linked resources"""
        if "tool_ids" in agent_data and agent_data["tool_ids"]:
            tool_ids = [UUID(tid) if isinstance(tid, str) else tid for tid in agent_data["tool_ids"]]
            count = db.query(Tool).filter(
                Tool.id.in_(tool_ids),
                or_(Tool.owner_id == user_id, Tool.is_public == True)
            ).count()
            if count != len(tool_ids):
                # Fetch missing to be specific? For MVP, just broad error.
                raise Exception("One or more tool IDs are invalid or not owned by you.")

        if "mcp_server_ids" in agent_data and agent_data["mcp_server_ids"]:
            mcp_ids = [UUID(mid) if isinstance(mid, str) else mid for mid in agent_data["mcp_server_ids"]]
            # Note: MCPServers don't have is_public currently. Only owner_id.
            count = db.query(MCPServer).filter(
                MCPServer.id.in_(mcp_ids),
                MCPServer.owner_id == user_id
            ).count()
            if count != len(mcp_ids):
                 raise Exception("One or more MCP Server IDs are invalid or not owned by you.")

        if "llm_id" in agent_data and agent_data["llm_id"]:
            llm_id = UUID(str(agent_data["llm_id"]))
            llm = db.query(LLM).filter(
                LLM.id == llm_id,
                or_(LLM.owner_id == user_id, LLM.is_public == True)
            ).first()
            if not llm:
                raise Exception("LLM ID is invalid or not owned by you.")

    @staticmethod
    def create_agent(db: Session, agent: AgentCreate, user_id: UUID):
        AgentService._validate_resources(db, user_id, agent.model_dump())
        
        db_agent = Agent(
            name=agent.name,
            description=agent.description,
            capabilities=agent.capabilities,
            tool_ids=[str(id) for id in agent.tool_ids],
            mcp_server_ids=[str(id) for id in agent.mcp_server_ids],
            llm_id=agent.llm_id,
            human_in_loop=agent.human_in_loop,
            is_active=agent.is_active,
            owner_id=user_id
        )
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        return db_agent

    @staticmethod
    def update_agent(db: Session, agent_id: UUID, agent_update: AgentUpdate, user_id: UUID):
        db_agent = AgentService.get_agent(db, agent_id, user_id)
        if not db_agent:
            return None
        
        update_data = agent_update.model_dump(exclude_unset=True)
        AgentService._validate_resources(db, user_id, update_data)
        
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
    def delete_agent(db: Session, agent_id: UUID, user_id: UUID):
        db_agent = AgentService.get_agent(db, agent_id, user_id)
        if not db_agent:
            return None
        
        db.delete(db_agent)
        db.commit()
        return db_agent
