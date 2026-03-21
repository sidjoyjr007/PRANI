import uuid
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from models.guardrail import Guardrail, AgentGuardrail, GuardrailType, GuardrailMechanism, GuardrailAction
from engine.guardrails.evaluators import evaluate_regex, evaluate_llm

logger = logging.getLogger(__name__)

class GuardrailManager:
    def __init__(self, db: Session, llm_provider: Any, agent_id: uuid.UUID):
        self.db = db
        self.llm_provider = llm_provider
        self.agent_id = agent_id

    def _get_active_guardrails(self, g_type: GuardrailType) -> List[Guardrail]:
        """Fetch all active system defaults AND agent-specific guardrails of a certain type."""
        
        # Get system defaults (owner_id is None)
        system_defaults = self.db.query(Guardrail).filter(
            Guardrail.type == g_type,
            Guardrail.owner_id == None,
            Guardrail.is_active == True
        ).all()
        
        # Get agent-specific guardrails
        agent_specifics = self.db.query(Guardrail).join(AgentGuardrail).filter(
            AgentGuardrail.agent_id == self.agent_id,
            AgentGuardrail.is_active == True,
            Guardrail.type == g_type,
            Guardrail.is_active == True
        ).all()
        
        return system_defaults + agent_specifics
        
    async def _evaluate_rules(self, rules: List[Guardrail], text: str, context_text: str = "") -> Tuple[bool, str]:
        """Runs the evaluations and returns (passed, reason). Fails fast on first BLOCK."""
        for rule in rules:
            result = {"passed": True, "reason": ""}
            
            if rule.mechanism == GuardrailMechanism.REGEX:
                result = evaluate_regex(text, rule.logic)
            elif rule.mechanism == GuardrailMechanism.LLM_JUDGE:
                result = await evaluate_llm(self.llm_provider, text, rule.logic, context_text)
                
            if not result.get("passed"):
                action_str = "BLOCKED" if rule.action == GuardrailAction.BLOCK else "WARNING"
                reason = result.get('reason', 'Failed guardrail validation.')
                logger.warning(f"Guardrail '{rule.name}' triggered [{action_str}]: {reason}")
                
                if rule.action == GuardrailAction.BLOCK:
                    return False, f"Action blocked by safety policy ({rule.name}): {reason}"
                elif rule.action == GuardrailAction.MODIFY:
                    # In a fully fleshed out system, this might mask PII or rewrite the sentence.
                    # For now, treat modify similarly to a warning or simple rejection.
                    pass
        
        return True, ""

    async def validate_input(self, user_input: str) -> Tuple[bool, str]:
        """
        Runs Before the main LLM call.
        Useful for: Prompt Injection detection, Topic enforcement.
        """
        rules = self._get_active_guardrails(GuardrailType.INPUT)
        if not rules: return True, ""
        return await self._evaluate_rules(rules, user_input)

    async def validate_output(self, llm_response: str, user_request: str = "") -> Tuple[bool, str]:
        """
        Runs After the main LLM call (before showing to user).
        Useful for: PII scanning, Goal Verification, Hallucination checks.
        """
        rules = self._get_active_guardrails(GuardrailType.OUTPUT)
        if not rules: return True, ""
        # Pass the original user request as context so the LLM Judge can verify if the goal was met
        return await self._evaluate_rules(rules, llm_response, context_text=f"Original Request: {user_request}")

    async def validate_execution(self, tool_name: str, tool_args: str) -> Tuple[bool, str]:
        """
        Runs Before a tool is executed.
        Useful for: Governance, blocking dangerous commands (`rm -rf`).
        """
        rules = self._get_active_guardrails(GuardrailType.EXECUTION)
        
        execution_text = f"Tool: {tool_name}\nArguments: {tool_args}"
        
        if not rules: return True, ""
        
        return await self._evaluate_rules(rules, execution_text)
