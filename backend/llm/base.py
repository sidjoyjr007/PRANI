from abc import ABC, abstractmethod
from typing import List, Iterator, Dict, Any, Optional, Set
from .types import ProviderMessage, LLMResponse, LLMStreamChunk

class LLMProvider(ABC):
    """
    Abstract Base Class for LLM Providers.
    All providers must implement chat() and stream().

    Schema sanitization:
      Override `_schema_allowed_keys` with a set of JSON Schema field names your
      provider supports. `sanitize_tool_schema()` will strip everything else.
      Leave as None (default) to pass schemas through unchanged.
    """

    # Subclasses override this to restrict which JSON Schema fields are forwarded.
    # None means "accept everything" (OpenAI, Anthropic, etc.)
    _schema_allowed_keys: Optional[Set[str]] = None

    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        self.model = model
        self.config = config
        
        # Auto-resolve {{env.KEY}} placeholders in headers
        import re
        self.headers = {}
        for k, v in headers.items():
            val_str = str(v)
            # Find all {{env.KEY}} patterns
            matches = re.findall(r"\{\{env\.(.*?)\}\}", val_str)
            for key in matches:
                # Replace with secret if exists in config, else empty string
                secret_val = config.get(key, "")
                val_str = val_str.replace(f"{{{{env.{key}}}}}", secret_val)
            self.headers[k] = val_str
            
        print(f"DEBUG: Initialized {self.model} with resolved headers: {self.headers}")


    def sanitize_tool_schema(self, schema: Any) -> Any:
        """
        Recursively strip unsupported JSON Schema fields based on `_schema_allowed_keys`.
        Flattens anyOf/oneOf unions to the first concrete (non-null) type.
        """
        if not isinstance(schema, dict):
            return schema

        # Flatten anyOf / oneOf to first non-null concrete option
        for union_key in ("anyOf", "oneOf"):
            if union_key in schema:
                options = [o for o in schema[union_key] if o.get("type") != "null"]
                schema = {**schema, **(options[0] if options else {})}
                schema.pop(union_key, None)
                break

        # If no allowlist, return as-is (only union flattening applied)
        if self._schema_allowed_keys is None:
            return {k: self.sanitize_tool_schema(v) if isinstance(v, dict) else v
                    for k, v in schema.items()}

        result = {}
        for k, v in schema.items():
            if k not in self._schema_allowed_keys:
                continue
            
            if k == "properties" and isinstance(v, dict):
                # Inside 'properties', keys are arbitrary field names, not JSON Schema keywords.
                # Do not filter these keys against _schema_allowed_keys, but do sanitize their values.
                result[k] = {
                    pk: self.sanitize_tool_schema(pv) if isinstance(pv, dict) else pv
                    for pk, pv in v.items()
                }
            elif k == "items" and isinstance(v, dict):
                result[k] = self.sanitize_tool_schema(v)
            elif isinstance(v, dict):
                result[k] = self.sanitize_tool_schema(v)
            elif isinstance(v, list):
                result[k] = [self.sanitize_tool_schema(i) if isinstance(i, dict) else i for i in v]
            else:
                result[k] = v
        return result

    @abstractmethod
    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        """Send a chat request and get a complete response."""
        pass

    @abstractmethod
    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        """Send a chat request and stream the response."""
        pass
