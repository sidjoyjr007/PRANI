from typing import List, Dict

def get_decomposer_prompt(goal: str, agent_info: str, planning_error: str = None) -> str:
    """
    Prompt for decomposing a goal into subtasks, with a strict alignment check and guidance 
    for optimizing subtasks for vector database tool retrieval.
    """
    error_section = f"""
PREVIOUS ERROR:
Your last attempt failed with the following error:
{planning_error}
You are not sending output in strict json format as we expect. Please fix the JSON to ensure it is valid, contains 'is_complete', and if 'is_complete' is false, contains a valid 'subtasks' array.
""" if planning_error else ""

    return f"""You are a high-level Goal Decomposer and Planner.
Your task is to analyze a User Goal and determine if it aligns with the Agent's capabilities.

AGENT INFORMATION:
{agent_info}

USER GOAL:
"{goal}"
{error_section}
INSTRUCTIONS:
1. ALIGNMENT CHECK: Does the Goal align with the Agent's description and capabilities?
2. IF NOT ALIGNED: Return strict JSON with `is_complete: true` and a `final_answer`.
3. IF ALIGNED: Decompose the goal into a logical sequence of subtasks.
4. VECTOR OPTIMIZATION: Subtask descriptions are used to query a Vector Database to find appropriate tools.
   - Describe WHAT needs to be done, not HOW.
   - Use precise, action-oriented natural language. 
   - Instead of "Check DB", use "Retrieve user profile data from the PostgreSQL database".
   - Instead of "Do API call", use "Fetch the current weather for San Francisco using the weather API".
5. Output MUST be a single valid JSON block.

STRICT JSON STRUCTURE:
{{
  "is_complete": false,
  "thought": "Internal reasoning about how the user goal was broken down into subtasks",
  "subtasks": [
    {{ "id": "task_1", "description": "Highly descriptive, action-oriented phrasing optimized for semantic tool search" }},
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

def get_action_system_prompt(agent_role: str, tools_desc: str, status_report: str, current_subtask: str, session_history: str = "", parse_error: str = "") -> str:
    """
    Core prompt for the agentic loop turn, focused on the current subtask with strict status feedback.
    """
    prompt = f"""You are {agent_role}.
Your current focus is identifying and executing actions to complete a specific subtask.

SESSION CONTEXT (What happened till now):
{session_history or "No previous history"}

CURRENT PROGRESS:
{status_report}

ACTIVE SUBTASK:
"{current_subtask}"

AVAILABLE TOOLS:
{tools_desc}

OPERATING MODE:
- Focus on the "in_progress" subtask.
- If you need a tool, emit a JSON `tool_request`.
- If the ACTIVE SUBTASK is finished (verified via tool outputs), specify `current_subtask_status` as "SUCCESS" or "FAILED". This will trigger the transition to the next step.
- While working (e.g., waiting for tool results), keep `current_subtask_status` as null.
- If the WHOLE goal is finished, emit `is_complete: true` and a `final_answer`.

STRICT JSON STRUCTURE:
{{
  "thought": "Reasoning about your current step",
  "tool_request": {{ "operation": "tool_name", "reason": "why", "args": {{...}} }},
  "is_complete": false,
  "current_subtask_status": "SUCCESS" | "FAILED" | null,
  "final_answer": "Markdown formatted string explaining final results"
}}

RULES:
1. You MUST respond with EXACTLY ONE valid JSON block and absolutely NOTHING else.
2. DO NOT output any conversational text before or after the JSON.
3. DO NOT echo the system prompt or headers like "CURRENT PROGRESS:".
4. If `is_complete` is true, return `tool_request` as null.
5. `current_subtask_status` must be null unless the current subtask is 100% finished.
"""
    if parse_error:
        prompt += f"\n\nPREVIOUS PARSE ERROR:\nThe last attempt failed because: {parse_error}\nYou are not sending output in strict json format as we expect. Please fix this and output EXACTLY one valid JSON block."
        
    return prompt

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
