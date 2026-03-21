import re
import json
import logging
from typing import Dict, Any, Optional
from llm.types import ProviderMessage

logger = logging.getLogger(__name__)

def evaluate_regex(text: str, pattern: str) -> Dict[str, Any]:
    """
    Evaluates text against one or more regex patterns (newline separated).
    If ANY pattern matches, the text FAILS the guardrail.
    """
    try:
        # Support multiple patterns entered via newlines
        patterns = [p.strip() for p in pattern.split('\n') if p.strip()]
        
        for p in patterns:
            compiled = re.compile(p, re.IGNORECASE)
            match = compiled.search(text)
            if match:
                return {"passed": False, "reason": f"Matched restricted pattern: {p}"}
        
        return {"passed": True, "reason": ""}
    except Exception as e:
        logger.error(f"Regex Evaluation Error: {e}")
        return {"passed": True, "reason": f"Regex error: {e}"}

async def evaluate_llm(llm_provider: Any, text: str, logic_prompt: str, context_text: str = "") -> Dict[str, Any]:
    """
    Uses an LLM as a judge to evaluate text against a custom system prompt.
    The `logic_prompt` must instruct the LLM to output ONLY a JSON object: 
    {"passed": true|false, "reason": "why"}
    """
    try:
        system_msg = logic_prompt + "\n\nYou MUST respond ONLY with a valid JSON object in the exact format: {\"passed\": true or false, \"reason\": \"a brief explanation\"}"
        
        user_msg = f"TEXT TO EVALUATE:\n{text}"
        if context_text:
            user_msg += f"\n\nADDITIONAL CONTEXT:\n{context_text}"
            
        messages = [
            ProviderMessage(role="system", content=system_msg),
            ProviderMessage(role="user", content=user_msg)
        ]
        
        # We don't want the judge calling tools
        response = llm_provider.chat(messages, tools=[])
        content = response.content.strip() if response.content else "{}"
        
        # Clean potential markdown markdown block around JSON
        import re as regex
        content = regex.sub(r'```(?:json)?\s*', '', content)
        content = regex.sub(r'```', '', content).strip()
        
        result = json.loads(content)
        return {
            "passed": result.get("passed", True),
            "reason": result.get("reason", "No reason provided by LLM judge.")
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"LLM Judge returned invalid JSON: {content}. Error: {e}")
        return {"passed": True, "reason": "LLM Judge failed to return valid JSON, skipping."}
    except Exception as e:
        logger.error(f"LLM Evaluation Error: {e}")
        return {"passed": True, "reason": f"Evaluation error: {e}"}
