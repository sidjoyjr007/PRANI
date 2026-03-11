import json
from typing import Any

def estimate_tokens(content: Any) -> int:
    """
    Lightweight heuristic to estimate token count.
    Approximates ~4 characters per token for English text.
    """
    if content is None:
        return 0
    
    if not isinstance(content, str):
        try:
            content = json.dumps(content)
        except Exception:
            content = str(content)
            
    # Heuristic: 1 token per 4 characters
    char_count = len(content)
    # Plus a small overhead for message boundaries
    return (char_count // 4) + 2
