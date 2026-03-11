import json
import logging
from typing import Optional, Dict, Any
import redis.asyncio as redis
from config.settings import settings

logger = logging.getLogger(__name__)

class StateService:
    _redis_client: Optional[redis.Redis] = None

    def __init__(self):
        if StateService._redis_client is None:
            try:
                StateService._redis_client = redis.from_url(settings.redis_url)
                logger.debug("Initialized shared Redis client for StateService")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                StateService._redis_client = None
        
        self.redis_client = StateService._redis_client

    def _get_key(self, session_id: str) -> str:
        return f"prani:plan:{session_id}"

    async def save_plan(self, session_id: str, plan_dict: Dict[str, Any], expire_seconds: int = 7200):
        if not self.redis_client:
            logger.warning("Redis client not initialized. Cannot save plan.")
            return

        key = self._get_key(session_id)
        try:
            await self.redis_client.setex(
                name=key,
                time=expire_seconds,
                value=json.dumps(plan_dict)
            )
            logger.debug(f"Saved plan state to Redis for session {session_id}")
        except Exception as e:
            logger.error(f"Error saving plan to Redis for session {session_id}: {e}")

    async def load_plan(self, session_id: str) -> Optional[Dict[str, Any]]:
        if not self.redis_client:
            return None

        key = self._get_key(session_id)
        try:
            val = await self.redis_client.get(key)
            if val:
                logger.debug(f"Loaded plan state from Redis for session {session_id}")
                return json.loads(val)
            return None
        except Exception as e:
            logger.error(f"Error loading plan from Redis for session {session_id}: {e}")
            return None

    async def clear_plan(self, session_id: str):
        if not self.redis_client:
            return

        key = self._get_key(session_id)
        try:
            await self.redis_client.delete(key)
            logger.debug(f"Cleared plan state from Redis for session {session_id}")
        except Exception as e:
            logger.error(f"Error clearing plan from Redis for session {session_id}: {e}")

    def _get_state_key(self, session_id: str) -> str:
        return f"prani:agent_state:{session_id}"

    async def save_agent_state(self, session_id: str, state: str, expire_seconds: int = 7200):
        if not self.redis_client: return
        try:
            await self.redis_client.setex(name=self._get_state_key(session_id), time=expire_seconds, value=state)
        except Exception as e:
            logger.error(f"Error saving agent state to Redis: {e}")

    async def load_agent_state(self, session_id: str) -> Optional[str]:
        if not self.redis_client: return None
        try:
            val = await self.redis_client.get(self._get_state_key(session_id))
            return val.decode("utf-8") if val else None
        except Exception as e:
            logger.error(f"Error loading agent state from Redis: {e}")
            return None

    async def clear_agent_state(self, session_id: str):
        if not self.redis_client: return
        try:
            await self.redis_client.delete(self._get_state_key(session_id))
        except Exception as e:
            logger.error(f"Error clearing agent state from Redis: {e}")
