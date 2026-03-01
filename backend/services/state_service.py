import json
import logging
from typing import Optional, Dict, Any
import redis
from config.settings import settings

logger = logging.getLogger(__name__)

class StateService:
    def __init__(self):
        try:
            self.redis_client = redis.from_url(settings.redis_url)
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None

    def _get_key(self, session_id: str) -> str:
        return f"prani:plan:{session_id}"

    def save_plan(self, session_id: str, plan_dict: Dict[str, Any], expire_seconds: int = 7200):
        if not self.redis_client:
            logger.warning("Redis client not initialized. Cannot save plan.")
            return

        key = self._get_key(session_id)
        try:
            self.redis_client.setex(
                name=key,
                time=expire_seconds,
                value=json.dumps(plan_dict)
            )
            logger.debug(f"Saved plan state to Redis for session {session_id}")
        except Exception as e:
            logger.error(f"Error saving plan to Redis for session {session_id}: {e}")

    def load_plan(self, session_id: str) -> Optional[Dict[str, Any]]:
        if not self.redis_client:
            return None

        key = self._get_key(session_id)
        try:
            val = self.redis_client.get(key)
            if val:
                logger.debug(f"Loaded plan state from Redis for session {session_id}")
                return json.loads(val)
            return None
        except Exception as e:
            logger.error(f"Error loading plan from Redis for session {session_id}: {e}")
            return None

    def clear_plan(self, session_id: str):
        if not self.redis_client:
            return

        key = self._get_key(session_id)
        try:
            self.redis_client.delete(key)
            logger.debug(f"Cleared plan state from Redis for session {session_id}")
        except Exception as e:
            logger.error(f"Error clearing plan from Redis for session {session_id}: {e}")
