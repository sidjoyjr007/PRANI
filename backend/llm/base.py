from abc import ABC, abstractmethod
from typing import List, Iterator, Dict, Any, Optional
from .types import ProviderMessage, LLMResponse, LLMStreamChunk

class LLMProvider(ABC):
    """
    Abstract Base Class for LLM Providers.
    All providers must implement these methods.
    """
    
    def __init__(self, model: str, headers: Dict[str, Any], config: Dict[str, Any]):
        self.model = model
        self.headers = headers
        self.config = config # API Keys, etc.

    @abstractmethod
    def chat(self, messages: List[ProviderMessage]) -> LLMResponse:
        """
        Send a chat request and get a complete response.
        """
        pass

    @abstractmethod
    def stream(self, messages: List[ProviderMessage]) -> Iterator[LLMStreamChunk]:
        """
        Send a chat request and stream the response.
        """
        pass
