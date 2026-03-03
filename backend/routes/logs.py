from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from config.database import get_db
from middleware.security import get_current_user
from models.user import User
from models.agent_log import AgentLog
from models.conversation import Conversation

router = APIRouter()


def _serialize_log(log: AgentLog) -> dict:
    return {
        "id": str(log.id),
        "session_id": str(log.session_id),
        "run_id": log.run_id,
        "event_type": log.event_type,
        "level": log.level,
        "source": log.source,
        "content": log.content,
        "timestamp": log.created_at.isoformat() if log.created_at else None,
    }


@router.get("/session/{session_id}")
def get_session_logs(
    session_id: UUID,
    limit: int = Query(default=500, le=2000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return persisted log entries for a session, latest first.
    Only accessible to the conversation owner.
    """
    # Ownership check via Conversation table
    conversation = db.query(Conversation).filter(
        Conversation.id == session_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found or not authorized")

    logs = (
        db.query(AgentLog)
        .filter(AgentLog.session_id == session_id)
        .order_by(AgentLog.created_at.desc())   # Latest first
        .limit(limit)
        .all()
    )
    return [_serialize_log(l) for l in logs]


@router.get("/agent/{agent_id}/sessions")
def get_agent_sessions(
    agent_id: UUID,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a list of sessions (conversations) with log activity for the given agent.
    Returns sessions ordered by most recent activity first.
    """
    from sqlalchemy import func

    # Only return conversations owned by the current user for this agent
    sessions = (
        db.query(
            Conversation.id,
            Conversation.title,
            Conversation.created_at,
            func.count(AgentLog.id).label("log_count"),
            func.max(AgentLog.created_at).label("last_activity"),
        )
        .outerjoin(AgentLog, AgentLog.session_id == Conversation.id)
        .filter(
            Conversation.agent_id == agent_id,
            Conversation.user_id == current_user.id,
        )
        .group_by(Conversation.id, Conversation.title, Conversation.created_at)
        .order_by(func.max(AgentLog.created_at).desc().nullslast())
        .limit(limit)
        .all()
    )

    return [
        {
            "session_id": str(s.id),
            "title": s.title,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "log_count": s.log_count or 0,
            "last_activity": s.last_activity.isoformat() if s.last_activity else None,
        }
        for s in sessions
    ]
