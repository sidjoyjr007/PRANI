from typing import List, Iterator, Dict, Any, Optional
import requests
import json
from ..base import LLMProvider, ProviderMessage, LLMResponse, LLMStreamChunk
from ..types import ToolCall

class GeminiProvider(LLMProvider):
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        super().__init__(model, headers, config)
        self.api_key = config.get("GEMINI_API_KEY") or config.get("GOOGLE_API_KEY") or config.get("API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    def _prepare_url(self, stream=False):
        action = "streamGenerateContent" if stream else "generateContent"
        return f"{self.base_url}/models/{self.model}:{action}?key={self.api_key}&alt=sse" if stream else f"{self.base_url}/models/{self.model}:{action}?key={self.api_key}"

    def _convert_role(self, role: str) -> str:
        if role == "user": return "user"
        if role == "assistant": return "model"
        if role == "system": return "user" # Gemini often uses system instructions or merging with user
        return "user"

    def _prepare_payload(self, messages: List[ProviderMessage]):
        contents = []
        system_instruction = None

        for m in messages:
            if m.role == "system":
                # Check if model supports system_instruction, else merge 
                # For now, let's treat system as user message at start or separate field
                system_instruction = {"parts": [{"text": m.content}]}
                continue
            
            parts = [{"text": m.content}] if isinstance(m.content, str) else m.content
            contents.append({
                "role": self._convert_role(m.role),
                "parts": parts
            })
            
        payload = {"contents": contents}
        if system_instruction:
            payload["system_instruction"] = system_instruction
            
        return payload

    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        url = self._prepare_url(stream=False)
        payload = self._prepare_payload(messages)
        headers = self.headers.copy()
        
        # Remove Authorization header if present, as Key is in URL
        if "Authorization" in headers:
            headers.pop("Authorization")
            
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Parse Gemini Response
        # candidates[0].content.parts[0].text
        try:
            candidate = data["candidates"][0]
            content_part = candidate["content"]["parts"][0]
            text = content_part.get("text", "")
            finish_reason = candidate.get("finishReason")
            
            return LLMResponse(
                content=text,
                role="assistant",
                finish_reason=finish_reason
            )
        except (KeyError, IndexError):
             return LLMResponse(content="Error parsing Gemini response", role="assistant")

    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        url = self._prepare_url(stream=True)
        payload = self._prepare_payload(messages)
        headers = self.headers.copy()
        if "Authorization" in headers:
             headers.pop("Authorization")
             
        # SSE format
        with requests.post(url, json=payload, headers=headers, stream=True) as response:
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data_str = line[6:]
                        try:
                            # Gemini SSE returns full object with incremental parts
                            data = json.loads(data_str)
                            candidate = data["candidates"][0]
                            content = candidate.get("content", {})
                            parts = content.get("parts", [])
                            text = parts[0].get("text", "") if parts else ""
                            
                            yield LLMStreamChunk(
                                content=text,
                                role="assistant",
                                finish_reason=candidate.get("finishReason")
                            )
                        except:
                            continue
