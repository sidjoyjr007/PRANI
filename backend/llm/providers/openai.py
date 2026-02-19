import os
from typing import List, Iterator, Dict, Any, Optional
import requests
import json
from ..base import LLMProvider, ProviderMessage, LLMResponse, LLMStreamChunk
from ..types import ToolCall

class OpenAIProvider(LLMProvider):
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        super().__init__(model, headers, config)
        self.api_key = config.get("OPENAI_API_KEY") or config.get("API_KEY")
        self.base_url = config.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        
    def _prepare_headers(self):
        headers = self.headers.copy()
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        headers["Content-Type"] = "application/json"
        return headers

    def _prepare_messages(self, messages: List[ProviderMessage]):
        # OpenAI expects {role, content}
        formatted = []
        for m in messages:
            msg = {"role": m.role, "content": m.content}
            if m.tool_calls:
                 msg["tool_calls"] = m.tool_calls # Raw dicts or model_dump? Pydanticv2 model_dump
            if m.tool_call_id:
                 msg["tool_call_id"] = m.tool_call_id
            if m.name:
                 msg["name"] = m.name
            formatted.append(msg)
        return formatted

    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": self._prepare_messages(messages),
            "stream": False
        }
        
        response = requests.post(url, headers=self._prepare_headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        
        choice = data["choices"][0]
        msg = choice["message"]
        
        return LLMResponse(
            content=msg.get("content"),
            role=msg.get("role"),
            tool_calls=msg.get("tool_calls"),
            finish_reason=choice.get("finish_reason"),
            usage=data.get("usage")
        )

    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": self._prepare_messages(messages),
            "stream": True
        }
        
        with requests.post(url, headers=self._prepare_headers(), json=payload, stream=True) as response:
            response.raise_for_status()
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
                                role=delta.get("role"), # Only first chunk usually
                                finish_reason=choice.get("finish_reason")
                                # tools todo
                            )
                        except json.JSONDecodeError:
                            continue
