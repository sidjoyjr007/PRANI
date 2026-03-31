import requests
import json
import logging
from typing import List, Iterator, Dict, Any, Optional

logger = logging.getLogger(__name__)
from ..base import LLMProvider, ProviderMessage, LLMResponse, LLMStreamChunk
from ..types import ToolCall

class HuggingFaceProvider(LLMProvider):
    # Implementing for HF Inference Router (OpenAI Compatible)
    
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        super().__init__(model, headers, config)
        self.base_url = "https://router.huggingface.co/v1" # Router URL

    def _prepare_messages(self, messages: List[ProviderMessage]):
        # OpenAI compatible format
        formatted = []
        for m in messages:
            content = m.content if m.content else ""
            
            # Skip empty assistant messages if no tool calls
            if m.role == "assistant" and not content and not m.tool_calls:
                continue
                
            # Role Consolidation: If this role matches the previous one, merge the content
            if formatted and formatted[-1]["role"] == m.role and not m.tool_calls and not m.tool_call_id and not formatted[-1].get("tool_calls"):
                prev_content = formatted[-1].get("content") or ""
                if isinstance(prev_content, str) and isinstance(content, str):
                    formatted[-1]["content"] = f"{prev_content}\n\n{content}"
                    continue

            msg = {"role": m.role, "content": content}
            if m.tool_calls:
                msg["tool_calls"] = [tc.model_dump() if hasattr(tc, 'model_dump') else tc.dict() if hasattr(tc, 'dict') else tc for tc in m.tool_calls]
            if m.tool_call_id:
                msg["tool_call_id"] = m.tool_call_id
            
            if m.name and m.role == "tool":
                msg["name"] = m.name
            
            formatted.append(msg)
        return formatted

    def _prepare_payload(self, messages: List[ProviderMessage], stream=False, tools: List[Dict] = None):
        payload = {
            "model": self.model,
            "messages": self._prepare_messages(messages),
            "stream": stream,
            "max_tokens": 1024 # Increased for agentic tasks
        }
        
        if tools:
            # HuggingFace Router supports OpenAI-compatible tool definitions
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
            
        return payload

    def chat(self, messages: List[ProviderMessage], **kwargs) -> LLMResponse:
        url = f"{self.base_url}/chat/completions"
        payload = self._prepare_payload(messages, stream=False, tools=kwargs.get("tools"))
        
        response = requests.post(url, headers=self.headers, json=payload, timeout=600)
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 400:
                logger.error(f"HF Router 400 Error Body: {response.text}")
            raise e
        data = response.json()
        
        choice = data["choices"][0]
        msg = choice["message"]
        
        text = msg.get("content")
        raw_tool_calls = msg.get("tool_calls")
        tool_calls = None
        
        if raw_tool_calls:
            tool_calls = []
            for tc in raw_tool_calls:
                # Ensure arguments is a string
                func = tc.get("function", {})
                args = func.get("arguments")
                if isinstance(args, dict):
                    args = json.dumps(args)
                
                tool_calls.append(ToolCall(
                    id=tc.get("id") or f"call_{json.dumps(tc)[:10]}",
                    type="function",
                    function={
                        "name": func.get("name"),
                        "arguments": args or "{}"
                    }
                ))

        print("Text: ", text)
        print("Tool Calls: ", tool_calls)
        
        return LLMResponse(
            content=text if text else None,
            role="assistant",
            tool_calls=tool_calls if tool_calls else None,
            finish_reason=choice.get("finish_reason"),
            usage=data.get("usage")
        )

    def stream(self, messages: List[ProviderMessage], **kwargs) -> Iterator[LLMStreamChunk]:
        url = f"{self.base_url}/chat/completions"
        payload = self._prepare_payload(messages, stream=True, tools=kwargs.get("tools"))
        
        response = requests.post(url, headers=self.headers, json=payload, stream=True, timeout=(10, 600))
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 400:
                logger.error(f"HF Router 400 Error Body: {response.text}")
            raise e
        
        with response:
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            choice = data["choices"][0]
                            delta = choice.get("delta", {})
                            
                            yield LLMStreamChunk(
                                content=delta.get("content"),
                                role="assistant",
                                tool_calls=delta.get("tool_calls"),
                                finish_reason=choice.get("finish_reason")
                            )
                        except:
                            continue
