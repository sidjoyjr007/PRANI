from typing import List, Dict, Any

# Tool Name Constants
TOOL_UPDATE_WORKSPACE = "update_workspace"
TOOL_READ_TOOL_RESULTS = "read_tool_results"

BUILTIN_TOOL_DEFS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": TOOL_UPDATE_WORKSPACE,
            "description": "Used to create or update the virtual 'plan.md' workspace that tracks your tasks, goals, and notes. Use this tool to outline an initial plan before executing COMPLEX, multi-step tasks. For simple questions, greetings, or single-step actions, DO NOT use this tool. As you make progress on complex tasks, use this tool to replace the previous markdown with an updated version, checking off completed items using standard markdown checklists (e.g. `- [x] Step 1`). Remember that the entire content you pass here will overwrite the current plan.",
            "parameters": {
                "type": "object",
                "properties": {
                    "markdown_content": {
                        "type": "string",
                        "description": "The complete, formatted Markdown text that represents your current overarching plan, tasks, and notes."
                    }
                },
                "required": ["markdown_content"]
            }
        }
    }
]

BUILTIN_TOOL_DESCRIPTIONS: List[str] = [
    f"- {TOOL_UPDATE_WORKSPACE}: Create or update the virtual 'plan.md' workspace for COMPLEX tasks only."
]

TOOL_READ_TOOL_RESULTS_DEF = {
    "type": "function",
    "function": {
        "name": TOOL_READ_TOOL_RESULTS,
        "description": "Reads specific character ranges (surgical read) from a truncated tool result. Use ONLY when you see a 'VIRTUAL PRUNE' marker highlighting an ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "message_id": { "type": "string", "description": "The message ID provided in the VIRTUAL PRUNE marker." },
                "start_char": { "type": "integer", "description": "The starting character index (default 0).", "default": 0 },
                "end_char": { "type": "integer", "description": "The ending character index (max 3000 characters from start)." }
            },
            "required": ["message_id"]
        }
    }
}
