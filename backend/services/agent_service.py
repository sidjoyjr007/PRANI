from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional
from uuid import UUID
from models.agent import Agent
from schemas.agent import AgentCreate, AgentUpdate
from models.tool import Tool
from models.mcp_server import MCPServer
from models.llm import LLM
from models.guardrail import AgentGuardrail, Guardrail

class AgentService:
    @staticmethod
    def _populate_agent_names(db: Session, agents: List[Agent]):
        if not agents:
            return

        # Collect all unique IDs
        all_tool_ids = set()
        all_mcp_ids = set()
        all_llm_ids = set()

        for a in agents:
            if hasattr(a, 'tool_ids') and a.tool_ids:
                for tid in a.tool_ids:
                    try:
                        all_tool_ids.add(UUID(tid) if isinstance(tid, str) else tid)
                    except: pass
            if hasattr(a, 'mcp_server_ids') and a.mcp_server_ids:
                for mid in a.mcp_server_ids:
                    try:
                        all_mcp_ids.add(UUID(mid) if isinstance(mid, str) else mid)
                    except: pass
            if hasattr(a, 'llm_id') and a.llm_id:
                all_llm_ids.add(a.llm_id)

        # Bulk fetch names
        tool_map = {t.id: t.name for t in db.query(Tool.id, Tool.name).filter(Tool.id.in_(all_tool_ids)).all()} if all_tool_ids else {}
        mcp_map = {m.id: m.name for m in db.query(MCPServer.id, MCPServer.name).filter(MCPServer.id.in_(all_mcp_ids)).all()} if all_mcp_ids else {}
        llm_map = {l.id: l.name for l in db.query(LLM.id, LLM.name).filter(LLM.id.in_(all_llm_ids)).all()} if all_llm_ids else {}

        # Assign back to agents
        for a in agents:
            a.tool_names = []
            if hasattr(a, 'tool_ids') and a.tool_ids:
                for tid in a.tool_ids:
                    try:
                        tid_uuid = UUID(tid) if isinstance(tid, str) else tid
                        if tid_uuid in tool_map:
                            a.tool_names.append(tool_map[tid_uuid])
                    except: pass
            
            a.mcp_server_names = []
            if hasattr(a, 'mcp_server_ids') and a.mcp_server_ids:
                for mid in a.mcp_server_ids:
                    try:
                        mid_uuid = UUID(mid) if isinstance(mid, str) else mid
                        if mid_uuid in mcp_map:
                            a.mcp_server_names.append(mcp_map[mid_uuid])
                    except: pass
            
            a.llm_name = llm_map.get(a.llm_id) if hasattr(a, 'llm_id') else None

        # Fetch and Group Guardrails
        agent_ids = [a.id for a in agents]
        agent_guardrails = db.query(AgentGuardrail, Guardrail).join(
            Guardrail, AgentGuardrail.guardrail_id == Guardrail.id
        ).filter(AgentGuardrail.agent_id.in_(agent_ids)).all()

        guardrails_by_agent = {}
        for ag, g in agent_guardrails:
            if ag.agent_id not in guardrails_by_agent:
                guardrails_by_agent[ag.agent_id] = []
            guardrails_by_agent[ag.agent_id].append(g)

        for a in agents:
            a.guardrails = guardrails_by_agent.get(a.id, [])

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
                    Agent.instructions.ilike(search_filter)
                )
            )

        # Get total count for pagination
        total = query.count()
        
        # Apply pagination
        skip = (page - 1) * size
        items = query.order_by(desc(Agent.updated_at)).offset(skip).limit(size).all()
        
        # Populate names
        AgentService._populate_agent_names(db, items)
        
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
        agent = query.first()
        if agent:
            AgentService._populate_agent_names(db, [agent])
        return agent

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
            instructions=agent.instructions,
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
