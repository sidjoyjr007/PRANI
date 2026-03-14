import json
import logging
from typing import List, Optional, Any, Dict
import redis.asyncio as redis
from uuid import UUID

from config.settings import settings

logger = logging.getLogger(__name__)

class MessageCache:
    """
    Redis-backed cache for conversation messages to offload PostgreSQL.
    Stores messages as serialized JSON lists.
    """
    _redis_client: Optional[redis.Redis] = None

    def __init__(self):
        if MessageCache._redis_client is None:
            MessageCache._redis_client = redis.from_url(
                settings.redis_url, 
                health_check_interval=30, 
                retry_on_timeout=True
            )
        self.redis_client = MessageCache._redis_client
        self.ttl = 3600  # 1 hour TTL for active sessions

    def _get_key(self, session_id: UUID) -> str:
        return f"session:messages:{session_id}"

    async def get_messages(self, session_id: UUID) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieves cached messages from Redis.
        Returns None if cache miss.
        """
        try:
            key = self._get_key(session_id)
            data = await self.redis_client.get(key)
            if data:
                logger.debug(f"Cache HIT for session {session_id}")
                return json.loads(data)
            logger.debug(f"Cache MISS for session {session_id}")
            return None
        except Exception as e:
            logger.error(f"Redis get_messages error: {e}")
            return None

    async def set_messages(self, session_id: UUID, messages: List[Any]):
        """
        Serializes and stores full message history in Redis.
        """
        try:
            key = self._get_key(session_id)
            # Serialize SQLAlchemy objects or dicts to JSON-serializable list
            serialized = []
            for m in messages:
                if hasattr(m, '__dict__'):
                    # Handle SQLAlchemy model
                    m_dict = {
                        "id": str(m.id),
                        "role": m.role,
                        "content": m.content,
                        "tokens": m.tokens,
                        "created_at": m.created_at.isoformat() if hasattr(m.created_at, 'isoformat') else str(m.created_at)
                    }
                    serialized.append(m_dict)
                else:
                    serialized.append(m)
            
            await self.redis_client.setex(key, self.ttl, json.dumps(serialized))
            logger.debug(f"Cache POPULATED for session {session_id}")
        except Exception as e:
            logger.error(f"Redis set_messages error: {e}")

    async def add_message(self, session_id: UUID, message: Any):
        """
        Appends a single message to the cached list.
        If cache is cold, it does nothing (letting next read populate it).
        """
        try:
            key = self._get_key(session_id)
            data = await self.redis_client.get(key)
            if data:
                messages = json.loads(data)
                
                # Normalize message
                if hasattr(message, '__dict__'):
                   m_dict = {
                        "id": str(message.id),
                        "role": message.role,
                        "content": message.content,
                        "tokens": message.tokens,
                        "created_at": message.created_at.isoformat() if hasattr(message.created_at, 'isoformat') else str(message.created_at)
                    }
                else:
                    m_dict = message
                    
                messages.append(m_dict)
                await self.redis_client.setex(key, self.ttl, json.dumps(messages))
                logger.debug(f"Cache UPDATED (append) for session {session_id}")
        except Exception as e:
            logger.error(f"Redis add_message error: {e}")

    async def clear_cache(self, session_id: UUID):
        """
        Invalidates the cache for a session.
        """
        try:
            key = self._get_key(session_id)
            await self.redis_client.delete(key)
            logger.debug(f"Cache INVALIDATED for session {session_id}")
        except Exception as e:
            logger.error(f"Redis clear_cache error: {e}")
