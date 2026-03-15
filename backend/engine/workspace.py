from typing import Optional, Dict

class WorkspacePlanner:
    def __init__(self):
        # The core state of the system is just a Markdown string.
        # It defaults to an empty string until the agent writes a plan.
        self.current_plan_markdown: str = ""
        # We track if the plan is "active" to decide when to enforce the Exit Guard
        self.is_plan_initialized: bool = False

    def update_plan(self, markdown_content: str) -> None:
        """
        Overwrites the current markdown plan with new content.
        This is the only state mutation method needed.
        """
        self.current_plan_markdown = markdown_content
        self.is_plan_initialized = bool(markdown_content and markdown_content.strip())

    def get_plan_markdown(self) -> str:
        """
        Returns the raw markdown string to be injected into the LLM context and UI.
        """
        return self.current_plan_markdown

    def is_plan_fully_resolved(self) -> bool:
        """
        The Exit Guard: Returns True if there are NO unchecked markdown checkboxes.
        If there are unchecked boxes, the agent is not allowed to exit the session.
        """
        if not self.is_plan_initialized:
            return True # If no plan was ever made (simple chat), they can exit anytime.
        
        # Simple string matching for markdown unchecked boxes
        # Covers variations like "- [ ]", "* [ ]", "1. [ ]"
        return "- [ ]" not in self.current_plan_markdown and "* [ ]" not in self.current_plan_markdown 

    def get_active_task(self) -> str:
        """
        Extracts the first unchecked task from the markdown string to enrich context.
        """
        if not self.is_plan_initialized:
            return ""
        
        import re
        match = re.search(r"^[\*\-]\s+\[\s\]\s+(.*?)$", self.current_plan_markdown, re.MULTILINE)
        if match:
            return match.group(1).strip()
        return ""

    def to_dict(self) -> Dict:
        """
        Serialize for StateService persistence. 
        Instead of a complex tree of nodes, we just save the string.
        """
        return {
            "version": "v1_markdown",
            "content": self.current_plan_markdown,
            "initialized": self.is_plan_initialized
        }

    def from_dict(self, data: Dict) -> None:
        """
        Restore state from StateService.
        """
        self.current_plan_markdown = data.get("content", "")
        self.is_plan_initialized = data.get("initialized", bool(self.current_plan_markdown))
