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
        if role == "system": return "user"
        if role == "tool": return "function"
        return "user"

    def _prepare_payload(self, messages: List[ProviderMessage], tools: List[Dict] = None):
        contents = []
        system_instruction = None

        # 1. Separate system message and process others
        for m in messages:
            if m.role == "system":
                if not system_instruction:
                    system_instruction = {"parts": [{"text": m.content}]}
                else:
                    system_instruction["parts"].append({"text": m.content})
            else:
                role = self._convert_role(m.role)
                parts = []
                
                # Handle Tool/Function specialized parts
                if role == "function":
                    # Gemini expects 'functionResponse' part
                    # We prioritize m.name (tool name) over tool_call_id
                    tool_name = m.name or (m.tool_call_id.split("___")[0] if m.tool_call_id and "___" in m.tool_call_id else (m.tool_call_id or "unknown_tool"))
                    parts.append({
                        "functionResponse": {
                            "name": tool_name,
                            "response": {"result": m.content}
                        }
                    })
                else:
                    # Text content
                    if m.content:
                        parts.append({"text": m.content})
                    
                    # Tool Calls (if assistant/model message)
                    if m.role == "assistant" and m.tool_calls:
                        for tc in m.tool_calls:
                            # tc is a dict or ToolCall object
                            tc_func = tc.get("function", {}) if isinstance(tc, dict) else tc.function
                            parts.append({
                                "functionCall": {
                                    "name": tc_func.get("name"),
                                    "args": json.loads(tc_func.get("arguments", "{}")) if isinstance(tc_func.get("arguments"), str) else tc_func.get("arguments", {})
                                }
                            })

                if contents and contents[-1]["role"] == role:
                    contents[-1]["parts"].extend(parts)
                else:
                    contents.append({
                        "role": role,
                        "parts": parts
                    })

        # Ensure first message is 'user' (Gemini requirement)
        if contents and contents[0]["role"] != "user":
             contents.insert(0, {"role": "user", "parts": [{"text": "Initializing..."}]})

        payload = {"contents": contents}
        if system_instruction:
            payload["system_instruction"] = system_instruction
            
        # 2. Add tools if any
        if tools:
            func_decls = []
            for t in tools:
                if "function" in t:
                    func_decls.append(t["function"])
                elif "name" in t:
                    func_decls.append(t)
                    
            if func_decls:
                payload["tools"] = [{"functionDeclarations": func_decls}]

        return payload

    def chat(self, messages: List[ProviderMessage], **kwargs) -> LLMResponse:
        url = self._prepare_url(stream=False)
        payload = self._prepare_payload(messages, tools=kwargs.get("tools"))
        headers = self.headers.copy()
        
        if "Authorization" in headers:
            headers.pop("Authorization")
            
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
        except requests.exceptions.Timeout:
            raise Exception("Gemini API request timed out after 60 seconds.")
        except Exception as e:
            raise Exception(f"Gemini API request failed: {e}")
            
        data = response.json()
        
        try:
            candidate = data["candidates"][0]
            content_part = candidate.get("content", {}).get("parts", [{}])[0]
            text = content_part.get("text", "")
            finish_reason = candidate.get("finishReason")
            
            return LLMResponse(
                content=text,
                role="assistant",
                finish_reason=finish_reason
            )
        except (KeyError, IndexError) as e:
             return LLMResponse(content=f"Error parsing Gemini response: {e}", role="assistant")

    def stream(self, messages: List[ProviderMessage], **kwargs) -> Iterator[LLMStreamChunk]:
        url = self._prepare_url(stream=True)
        payload = self._prepare_payload(messages, tools=kwargs.get("tools"))
        headers = self.headers.copy()
        if "Authorization" in headers:
             headers.pop("Authorization")
             
        # SSE format
        try:
            with requests.post(url, json=payload, headers=headers, stream=True, timeout=(10, 60)) as response:
                if not response.ok:
                    raise Exception(f"Gemini API Error: {response.status_code} - {response.text}")
                
                for line in response.iter_lines():
                    if line:
                        line = line.decode("utf-8")
                        if line.startswith("data: "):
                            data_str = line[6:]
                            try:
                                data = json.loads(data_str)
                                candidate = data["candidates"][0]
                                content = candidate.get("content", {})
                                parts = content.get("parts", [])
                                
                                text = ""
                                tool_calls = []
                                import uuid
                                
                                for p in parts:
                                    if "text" in p:
                                        text += p["text"]
                                    if "functionCall" in p:
                                        tc_uuid = str(uuid.uuid4())
                                        fc = p["functionCall"]
                                        tool_call_id = f"{fc['name']}___{tc_uuid}"
                                        tool_calls.append(ToolCall(
                                            id=tool_call_id,
                                            type="function",
                                            function={
                                                "name": fc["name"],
                                                "arguments": json.dumps(fc.get("args", {}))
                                            }
                                        ))
                                
                                yield LLMStreamChunk(
                                    content=text,
                                    role="assistant",
                                    finish_reason=candidate.get("finishReason"),
                                    tool_calls=tool_calls if tool_calls else None
                                )
                            except Exception:
                                continue
        except requests.exceptions.Timeout:
            raise Exception("Gemini streaming request timed out.")
        except Exception as e:
            raise Exception(f"Gemini streaming failed: {e}")
