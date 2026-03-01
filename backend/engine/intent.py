import json
import logging
import asyncio
from typing import List, Dict, Any, Optional, TYPE_CHECKING

from llm.factory import LLMProvider
from llm.types import ProviderMessage
from engine.prompts import get_decomposer_prompt
from engine.events import AgentEventType
from engine.subtasks import Subtask

if TYPE_CHECKING:
    from engine.loop import AgenticLoop

logger = logging.getLogger(__name__)

class IntentParser:


    def __init__(self, llm_provider: LLMProvider):
        self.llm = llm_provider

    async def decomposer(self, user_input: str, loop_instance: 'AgenticLoop') -> None:
        await loop_instance.bus.emit(
            loop_instance.bus.create_event(
                loop_instance.session_id, 
                AgentEventType.STATUS, 
                content="Understanding Query"
            )
        )
        await loop_instance.bus.emit(
            loop_instance.bus.create_event(
                loop_instance.session_id, 
                AgentEventType.THOUGHT_START, 
                content="Planning..."
            )
        )
        
        plan = await self._get_plan(user_input, loop_instance.agent, loop_instance)
        
        print("\n" + "="*60)
        print("plan", plan)
        print("="*60 + "\n")
        
        if "thought" in plan:
            await loop_instance.bus.emit(
                loop_instance.bus.create_event(
                    loop_instance.session_id, 
                    AgentEventType.THOUGHT, 
                    content=plan["thought"]
                )
            )
        
        await loop_instance.bus.emit(
            loop_instance.bus.create_event(
                loop_instance.session_id, 
                AgentEventType.THOUGHT_END
            )
        )

        if plan.get("is_complete"):
            final_answer = plan.get("final_answer", "Request out of scope.")
            loop_instance.memory.add_message(role="assistant", content=final_answer)
            await loop_instance.bus.emit(
                loop_instance.bus.create_event(
                    loop_instance.session_id, 
                    AgentEventType.MESSAGE, 
                    content=final_answer
                )
            )
            await loop_instance.bus.emit(
                loop_instance.bus.create_event(
                    loop_instance.session_id, 
                    AgentEventType.LOOP_COMPLETE
                )
            )
            return

        for st in plan.get("subtasks", []):
            loop_instance.subtask_manager.add_subtask(Subtask(id=st["id"], description=st["description"]))
        
        loop_instance.subtask_manager.set_execution_order(plan.get("execution_order", []))
        
        manager_dict = loop_instance.subtask_manager.to_dict()
        
        loop_instance.state_service.save_plan(loop_instance.session_id, manager_dict)
        await loop_instance.bus.emit(
            loop_instance.bus.create_event(
                loop_instance.session_id, 
                AgentEventType.PLAN, 
                metadata={"plan": manager_dict}
            )
        )

    async def _get_plan(self, goal: str, agent: Any, loop_instance: 'AgenticLoop', max_retries: int = 3) -> Dict[str, Any]:
        agent_info = f"Name: {agent.name}\nDescription: {agent.description}\nCapabilities: {agent.capabilities}"
        planning_error = None

        for attempt in range(max_retries):
            prompt = get_decomposer_prompt(goal, agent_info, planning_error)
            messages = [
                ProviderMessage(role="system", content=prompt),
                ProviderMessage(role="user", content=f"Goal: {goal}")
            ]

            self._log_attempt(attempt, max_retries, planning_error, messages)
            
            try:
                def collect_sync():
                    res = self.llm.chat(messages)
                    return res.content or ""

                loop = asyncio.get_running_loop()
                response_text = await loop.run_in_executor(None, collect_sync)
                
                return self._process_response(response_text)

            except Exception as e:
                planning_error = f"Error: {str(e)}"
                if isinstance(e, json.JSONDecodeError):
                    planning_error = (
                        f"Invalid JSON format. Check brackets and quotes. Error: {str(e)}\n"
                        f"Response was: {response_text}"
                    )
                logger.warning(f"Intent parsing attempt {attempt+1} failed: {planning_error}")
                
                # Notify frontend of retry status
                if attempt + 1 < max_retries:
                    await loop_instance.bus.emit(
                        loop_instance.bus.create_event(
                            loop_instance.session_id, 
                            AgentEventType.STATUS, 
                            content=f"Error occurred, retrying ({attempt + 1}/{max_retries})..."
                        )
                    )

        logger.error(f"Intent Parsing failed after {max_retries} attempts.")
        
        error_msg = "Planning failed: I couldn't break down this goal into a structured plan because the LLM provider keeps returning invalid responses or timing out. Please try rephrasing your goal, or try again later."
        
        await loop_instance.bus.emit(
            loop_instance.bus.create_event(
                loop_instance.session_id, 
                AgentEventType.ERROR, 
                content=error_msg
            )
        )
        raise Exception(error_msg)

    def _process_response(self, response_text: str) -> Dict[str, Any]:
        start = response_text.find('{')
        end = response_text.rfind('}')
        
        if start == -1 or end == -1:
            raise ValueError("No JSON block found in response.")
            
        json_str = response_text[start:end+1]
        data = json.loads(json_str)

        if "is_complete" not in data:
            raise ValueError("Missing 'is_complete' key in JSON.")
        
        is_comp = data.get("is_complete")
        is_complete = is_comp is True or str(is_comp).lower() == "true"
        data["is_complete"] = is_complete

        if not is_complete:
            subtasks = data.get("subtasks", [])
            if not subtasks or not isinstance(subtasks, list):
                raise ValueError("If 'is_complete' is false, a non-empty 'subtasks' array must be provided.")
        
        logger.info(f"Successfully decomposed goal into {len(data.get('subtasks', []))} subtasks.")
        return data

    def _log_attempt(self, attempt: int, max_retries: int, error: Optional[str], messages: List[ProviderMessage]) -> None:
        """Utility to format terminal logs for each planning LLM turn."""
        print(f"\n{'='*60}")
        print(f"PLANNING ATTEMPT {attempt + 1}/{max_retries}")
        if error:
            print(f"Previous Error: {error}")
        print(f"{'='*60}\n")


