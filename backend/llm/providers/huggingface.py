import requests
import json
from typing import List, Iterator, Dict, Any, Optional
from ..base import LLMProvider, ProviderMessage, LLMResponse, LLMStreamChunk
from ..types import ToolCall

class HuggingFaceProvider(LLMProvider):
    # Implementing for HF Inference Router (OpenAI Compatible)
    
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        super().__init__(model, headers, config)
        self.api_key = config.get("HF_API_KEY") or config.get("HUGGINGFACE_API_KEY") or config.get("API_KEY")
        self.base_url = "https://router.huggingface.co/v1" # Router URL
        
    def _prepare_headers(self):
        headers = self.headers.copy()
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        headers["Content-Type"] = "application/json"
        return headers

    def _prepare_messages(self, messages: List[ProviderMessage]):
        # OpenAI compatible format
        formatted = []
        for m in messages:
            formatted.append({"role": m.role, "content": m.content})
        return formatted

    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": self._prepare_messages(messages),
            "stream": False,
            "max_tokens": 512
        }
        
        response = requests.post(url, headers=self._prepare_headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        
        choice = data["choices"][0]
        msg = choice["message"]
        
        return LLMResponse(
            content=msg.get("content"),
            role="assistant",
            finish_reason=choice.get("finish_reason")
        )

    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": self._prepare_messages(messages),
            "stream": True,
            "max_tokens": 512
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
                                role="assistant",
                                finish_reason=choice.get("finish_reason")
                            )
                        except:
                            continue
