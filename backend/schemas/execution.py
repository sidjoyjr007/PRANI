
from typing import List, Dict, Optional
from pydantic import BaseModel
from uuid import UUID

class ApprovalRequest(BaseModel):
    """
    Request payload for resuming execution with approved tools.
    """
    approved_tool_calls: List[Dict]
    # user_message: Optional[str] = None # Optional message to append, e.g. "Proceed with these."
