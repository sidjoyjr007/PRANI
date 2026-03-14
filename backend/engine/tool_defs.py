from typing import List, Dict, Any

# Tool Name Constants
TOOL_ADD_SUBTASKS = "add_subtasks"
TOOL_UPDATE_SUBTASK_STATUS = "update_subtask_status"
TOOL_READ_TOOL_RESULTS = "read_tool_results"

BUILTIN_TOOL_DEFS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": TOOL_ADD_SUBTASKS,
            "description": "Add one or more steps/subtasks to your execution plan. Use this when you need to break down a complex goal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tasks": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "description": {
                                    "type": "string",
                                    "description": "A clear, action-oriented description of the task."
                                }
                            },
                            "required": ["description"]
                        }
                    }
                },
                "required": ["tasks"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": TOOL_UPDATE_SUBTASK_STATUS,
            "description": "Update the status of the currently active subtask (e.g., mark as COMPLETED or FAILED) along with a result message.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["COMPLETED", "FAILED"],
                        "description": "The new status of the task."
                    },
                    "result": {
                        "type": "string",
                        "description": "A message describing the outcome, or the error if it failed."
                    }
                },
                "required": ["status", "result"]
            }
        }
    }
]

BUILTIN_TOOL_DESCRIPTIONS: List[str] = [
    f"- {TOOL_ADD_SUBTASKS}: Add one or more steps/subtasks to your execution plan. Use this when you need to break down a complex goal.",
    f"- {TOOL_UPDATE_SUBTASK_STATUS}: Update the status of the currently active subtask (e.g., mark as COMPLETED or FAILED) along with a result message."
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
