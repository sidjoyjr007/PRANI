import re
import logging
from typing import Any, List

logger = logging.getLogger(__name__)

# PRANI-PERF: Pre-compiled regexes to avoid re-compilation in tight loops
RE_THINKING_FULL = re.compile(r"<thinking>(.*?)</thinking>", re.DOTALL)
RE_THINKING_START = re.compile(r"<thinking>(.*)", re.DOTALL)
RE_SCRUB_THINKING = re.compile(r"<thinking>.*?(</thinking>|$)", re.DOTALL)
RE_JSON_MARKDOWN = re.compile(r"```json.*?```", re.DOTALL)
RE_TOOL_CALL_MIRROR = re.compile(r"\{\s*\"tool_calls\".*?\}\s*\]", re.DOTALL)
RE_RECURSIVE_JSON = re.compile(r"\{[^{}]*\"[^{}]*\".*?\}", re.DOTALL)
RE_JSON_KV_PATTERN = re.compile(r'\"[a-zA-Z0-9_\-]+\"\s*:\s*[\"\{\[\d]')
RE_TECH_CHARS = re.compile(r"[\{\}\[\]\"\:,\\]")

class ResponseCleaner:
    def __init__(self):
        self.action_history: List[str] = []
        self._is_confident_not_garbage = False

    def detect_loop(self, content: str, tools: List[Any]) -> bool:
        if tools:
            # If tools are used, signature is based purely on the exact tools and their arguments
            sig = str(sorted([(t.function['name'], t.function.get('arguments', '')) for t in tools]))
        else:
            # If no tools, signature is the text content
            sig = content.strip()

        self.action_history.append(sig)
        # PRANI-PERF: Cap history to prevent memory leak
        if len(self.action_history) > 15:
            self.action_history = self.action_history[-15:]
            
        # Detect cyclic loops: if this EXACT signature appears 3 or more times in the whole history
        return self.action_history.count(sig) >= 3

    def is_garbage_json(self, text: str) -> bool:
        """
        Regex-based 'Absolute Zero Garbage' cleaner 3.2 (High-Sensitivity).
        Optimized: Returns False immediately if we've already deemed this stream 'clean'.
        """
        if self._is_confident_not_garbage:
            return False
            
        t = text.strip()
        if not t: return False
        
        # 1. Catch definite JSON starts or fragments (even short ones)
        if t in ["{}", "[]", '{"', '["', '},', '],', '}]']:
            return True
        
        # 2. Key-value pattern detection (e.g. "tool_calls":)
        if RE_JSON_KV_PATTERN.search(t):
            return True

        # 3. Density Check: Very strict for short strings to catch JSON structures
        total = len(t)
        tech_chars = len(RE_TECH_CHARS.findall(t))
        
        is_garbage = False
        if total < 20:
            if (tech_chars / total) > 0.6: is_garbage = True
        elif total < 50:
            if (tech_chars / total) > 0.4: is_garbage = True
        else:
            if (tech_chars / total) > 0.25: is_garbage = True
            
        # Optimization PRANI-PERF: Once we have > 60 characters and it's NOT garbage, 
        # we stop checking for the rest of this session stream.
        if not is_garbage and total > 60:
            self._is_confident_not_garbage = True
            
        return is_garbage

    def scrub_metadata(self, data: Any) -> Any:
        """
        Recursively scrubs <thinking> tags and technical JSON remnants from strings.
        Final defensive layer for Absolute Zero Garbage.
        """
        if isinstance(data, str):
            # 1. Nuke <thinking>
            res = RE_SCRUB_THINKING.sub("", data)
            # 2. Nuke trailing/leading JSON technical characters
            res = re.sub(r"[\{\}\[\]\"\:,\s]*$", "", res) # trailing remnants
            res = re.sub(r"^[\{\}\[\]\"\:,\s]*", "", res) # leading remnants
            return res.strip()
        if isinstance(data, list):
            return [self.scrub_metadata(item) for item in data]
        if isinstance(data, dict):
            return {k: self.scrub_metadata(v) for k, v in data.items()}
        return data
