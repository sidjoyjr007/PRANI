from typing import Dict, Any, Optional
from uuid import UUID
from .base import LLMProvider
from .providers.openai import OpenAIProvider
from .providers.gemini import GeminiProvider
from .providers.anthropic import AnthropicProvider
from .providers.huggingface import HuggingFaceProvider
from models.llm import LLM

class LLMFactory:
    
    @staticmethod
    def create_provider(llm_model: LLM, resolved_secrets: Dict[str, str]) -> LLMProvider:
        """
        Creates a provider instance from an LLM database model and resolved secrets.
        """
        provider_name = llm_model.provider
        model_name = llm_model.model
        headers = llm_model.headers or {}
        
        # Merge secrets into config
        config = resolved_secrets.copy()
        
        if provider_name == "OpenAI":
            return OpenAIProvider(model_name, headers, config)
        elif provider_name == "Gemini":
             return GeminiProvider(model_name, headers, config)
        elif provider_name == "Anthropic" or provider_name == "Claude":
             return AnthropicProvider(model_name, headers, config)
        elif provider_name == "HuggingFace":
             return HuggingFaceProvider(model_name, headers, config)
        else:
            raise ValueError(f"Unsupported provider: {provider_name}")
