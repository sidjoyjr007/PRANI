from typing import List, Dict

def get_intent_parser_prompt(goal: str, agent_info: str) -> str:
    """
    Prompt for decomposing a goal into subtasks, with a strict alignment check.
    """
    return f"""You are a high-level Goal Decomposer and Planner.
Your task is to analyze a User Goal and determine if it aligns with the Agent's capabilities.

AGENT INFORMATION:
{agent_info}

USER GOAL:
"{goal}"

INSTRUCTIONS:
1. ALIGNMENT CHECK: Does the Goal align with the Agent's description and capabilities?
2. IF NOT ALIGNED: Return strict JSON with `is_complete: true` and a `final_answer`.
3. IF ALIGNED: Decompose the goal into a logical sequence of subtasks.
4. Output MUST be a single valid JSON block.

STRICT JSON STRUCTURE:
{{
  "is_complete": false,
  "thought": "Internal reasoning about how the user goal was broken down into subtasks",
  "subtasks": [
    {{ "id": "task_1", "description": "Short, tool-searchable description" }},
    ...
  ],
  "execution_order": ["task_1", "task_2", ...],
  "dependencies": {{ "task_2": ["task_1"] }}
}}

IF NON-ALIGNED OR IMPOSSIBLE:
{{
  "is_complete": true,
  "final_answer": "I am an [Agent Name] specialized in [Capabilities]. I cannot assist with [User Request] as it falls outside my scope.",
  "subtasks": [],
  "execution_order": [],
  "dependencies": {{}}
}}
"""

def get_action_system_prompt(agent_role: str, tools_desc: str, status_report: str, current_subtask: str, session_history: str = "") -> str:
    """
    Core prompt for the agentic loop turn, focused on the current subtask with strict status feedback.
    """
    return f"""You are {agent_role}.
Your current focus is identifying and executing actions to complete a specific subtask.

SESSION CONTEXT (What happened till now):
{session_history}

CURRENT PROGRESS:
{status_report}

ACTIVE SUBTASK:
"{current_subtask}"

AVAILABLE TOOLS:
{tools_desc}

OPERATING MODE:
- Reason about the ACTIVE SUBTASK only.
- If you need a tool, emit a JSON `tool_request`.
- If the ACTIVE SUBTASK is finished, emit JSON `is_complete: true` and specify `current_subtask_status`.
- If you have the final answer for the user's overall goal, emit `is_complete: true` and a `final_answer`.
- The `final_answer` MUST explain the reason for ending the task clearly.

STRICT JSON STRUCTURE:
{{
  "thought": "Reasoning about your thought process for the current step and why you chose a particular tool or conclusion",
  "tool_request": {{ "operation": "tool_name", "reason": "why", "args": {{...}} }},
  "is_complete": false,
  "current_subtask_status": "SUCCESS" | "FAILED",
  "final_answer": "Markdown formatted string explaining final results or reason for ending"
}}

RULES:
1. If `is_complete` is true, return `tool_request` as null.
2. `current_subtask_status` should reflect the result of the LAST action taken in this subtask (if any).
3. Every response MUST be a single valid JSON block.
"""

def get_compression_prompt() -> str:
    return """You are a conversation summarizer. Your task is to create a structural summary of a conversation to rescue the context for an autonomous agent.

CRITICAL INSTRUCTIONS:
1. Preserve the ORIGINAL USER GOAL at the top.
2. List ALL COMPLETED ACTIONS (mark with ✓).
3. Describe the CURRENT STATE clearly.
4. Identify REMAINING TASKS.
5. Use markdown formatting.

Output Format:
## Original Goal
[What the user originally asked for]

## COMPLETED ACTIONS
1. ✓ [Action details]

## Current State
[Key data and accomplishments]

## REMAINING TASKS
- [Next steps]
"""
