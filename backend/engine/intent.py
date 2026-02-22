import json
import logging
from typing import List, Dict, Any, Optional

from llm.factory import LLMProvider
from llm.types import ProviderMessage
from engine.prompts import get_intent_parser_prompt

logger = logging.getLogger(__name__)

class IntentParser:
    """
    Analyzes the user's high-level goal and decomposes it into subtasks.
    """
    def __init__(self, llm_provider: LLMProvider):
        self.llm = llm_provider

    async def parse(self, goal: str, agent, tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Parses the goal into a structured plan with subtasks, including an alignment check and tool awareness.
        """
        tools_info = ""
        if tools:
            tools_info = "AVAILABLE TOOLS:\n" + "\n".join([
                f"- {t.get('name')} (Source: {t.get('source')}): {t.get('description')}" 
                for t in tools
            ])

        agent_info = f"Name: {agent.name}\nDescription: {agent.description}\nCapabilities: {agent.capabilities}\n\n{tools_info}"
        prompt = get_intent_parser_prompt(goal, agent_info)
        messages = [
            ProviderMessage(role="system", content=prompt),
            ProviderMessage(role="user", content=f"Goal: {goal}")
        ]
        
        try:
            import asyncio
            import concurrent.futures

            llm = self.llm

            def collect_sync():
                text = ""
                for chunk in llm.stream(messages):
                    if hasattr(chunk, 'content') and chunk.content:
                        text += chunk.content
                    elif isinstance(chunk, str):
                        text += chunk
                return text

            loop = asyncio.get_event_loop()
            response_text = await loop.run_in_executor(
                concurrent.futures.ThreadPoolExecutor(max_workers=1),
                collect_sync
            )
            
            # Extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}')
            if start != -1 and end != -1:
                json_str = response_text[start:end+1]
                data = json.loads(json_str)
                logger.info(f"Successfully decomposed goal into {len(data.get('subtasks', []))} subtasks.")
                # We return the whole dict now so the loop can access 'thought'
                return data
            else:
                logger.warning("No JSON found in IntentParser response")
                return self._fallback(goal)
                
        except Exception as e:
            logger.error(f"Intent Parsing failed: {e}")
            return self._fallback(goal)

    def _fallback(self, goal: str) -> Dict[str, Any]:
        return {
            "parsed_goal": goal,
            "subtasks": [{"id": "main_task", "description": goal}],
            "execution_order": ["main_task"],
            "dependencies": {}
        }
