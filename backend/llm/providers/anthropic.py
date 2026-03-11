import requests
import json
from typing import List, Iterator, Dict, Any, Optional
from ..base import LLMProvider, ProviderMessage, LLMResponse, LLMStreamChunk
from ..types import ToolCall

class AnthropicProvider(LLMProvider):
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        super().__init__(model, headers, config)
        self.base_url = "https://api.anthropic.com/v1"
        
    def _prepare_payload(self, messages: List[ProviderMessage], stream=False):
        system_prompt = None
        formatted_messages = []
        
        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                formatted_messages.append({"role": m.role, "content": m.content})
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "max_tokens": 1024, # Default max tokens
            "stream": stream
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        return payload

    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        url = f"{self.base_url}/messages"
        payload = self._prepare_payload(messages, stream=False)
        
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # Anthropic response format: { content: [{type: text, text: ...}], role: assistant }
        content_block = data["content"][0]
        text = content_block.get("text", "")
        
        return LLMResponse(
            content=text,
            role="assistant",
            finish_reason=data.get("stop_reason"),
            usage=data.get("usage")
        )

    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        url = f"{self.base_url}/messages"
        payload = self._prepare_payload(messages, stream=True)
        
        with requests.post(url, headers=self.headers, json=payload, stream=True) as response:
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data_str = line[6:]
                        try:
                            event = json.loads(data_str)
                            type = event.get("type")
                            
                            if type == "content_block_delta":
                                delta = event.get("delta", {})
                                if delta.get("type") == "text_delta":
                                    yield LLMStreamChunk(
                                        content=delta.get("text"),
                                        role="assistant"
                                    )
                            elif type == "message_stop":
                                # Finish
                                pass
                        except:
                            continue
