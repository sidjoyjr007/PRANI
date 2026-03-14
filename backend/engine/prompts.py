from typing import List, Dict


def get_action_system_prompt(agent_role: str, agent_instructions: str, tools_desc: str, status_report: str, current_subtask: str, session_history: str = "", parse_error: str = "", global_goal: str = "") -> str:
    instructions_section = f"\nCUSTOM INSTRUCTIONS:\n{agent_instructions}\n" if agent_instructions else ""
    
    prompt = f"""You are {agent_role}.
    {instructions_section}
Your goal is to execute the user's request by intelligently using the tools provided to you.

OVERALL GOAL: {global_goal}

AVAILABLE TOOLS:
{tools_desc}

STRICT INSTRUCTIONS:
1. Break down COMPLEX, multi-step user requests using the `add_subtasks` tool. If the request is a simple greeting (e.g. "hi"), a simple question, or something you can answer immediately, DO NOT create subtasks; just reply directly.
2. Complete your subtasks and update their status using `update_subtask_status`.
3. Think step-by-step to fulfill the user's request.
4. If you need to use a tool, use your native tool calling capabilities.
5. NEVER output raw JSON, internal data structures, or code-blocks containing tool results in your final message. Use plain, clean Markdown for the user.
6. You MUST write your internal reasoning inside `<thinking>` and `</thinking>` tags.
6. Anything you output OUTSIDE those tags will be sent directly to the user as a message. Do not include tool execution thoughts outside the thinking tags.
7. Only output markdown formatting when communicating a final answer outside the tags.

<status_report>
{status_report}
</status_report>

<current_subtask>
{current_subtask}
</current_subtask>

SESSION HISTORY:
{session_history}

EXAMPLE OUTPUT (Calling a tool):
<thinking>
I need to find the price of Bitcoin. I will use the Coinstats tool to fetch the current market data.
</thinking>

EXAMPLE OUTPUT (Responding to user):
<thinking>
I have the data. The price is $60,000. I will now inform the user.
</thinking>
The current price of Bitcoin is $60,000.
"""
    if parse_error:
        prompt += f"\n\nPREVIOUS ERROR:\nThe last attempt failed because: {parse_error}\nPlease correct your formatting."
        
    return prompt

def get_compression_prompt() -> str:
    return """You are a High-Fidelity Context Restorer. Your task is to synthesize a 'State of the World' summary to rescue an autonomous agent's context window.
    
CRITICAL INSTRUCTIONS:
1. COMPREHENSIVE RESTORATION: Do not just summarize. You must extract and preserve ALL verified facts, data points, and values found during technical execution.
2. STATE CAPTURE: Clearly document active constraints, user preferences, and the exact status of the global goal.
3. NUANCE PRESERVATION: If the agent found conflicting data, preserve the conflict so the agent can resolve it.
4. NO TECHNICAL NOISE: Do not include tool retry logs, JSON structures, or formatting errors. Only the factual outcomes.

Output Format:
## [!] COMPREHENSIVE STATE RESTORATION
**Goal**: [Original Goal]
**Status**: [e.g. 60% Complete]

### 1. Verified Facts & Data
- [List every specific data point found, e.g. "HPE Revenue 2024: $29.1B"]

### 2. Active Constraints & Preferences
- [e.g. "User prefers Markdown tables", "Environment: Production"]

### 3. Execution History (Consolidated)
- ✓ [Action 1: Results]
- ✓ [Action 2: Results]

### 4. Remaining Subtasks
- [ ] [Next Step 1]
"""
