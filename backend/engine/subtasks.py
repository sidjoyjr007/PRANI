from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import uuid

class SubtaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

@dataclass
class Subtask:
    id: str
    description: str
    status: SubtaskStatus = SubtaskStatus.PENDING
    dependencies: List[str] = field(default_factory=list)
    result: Optional[str] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "description": self.description,
            "status": self.status.value,
            "dependencies": self.dependencies,
            "result": self.result,
            "error": self.error,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

class SubtaskManager:
    """
    Manages a DAG of subtasks for an agentic run.
    """
    def __init__(self):
        self.subtasks: Dict[str, Subtask] = {}
        self.execution_order: List[str] = []
        
    def add_subtask(self, subtask: Subtask):
        self.subtasks[subtask.id] = subtask
        
    def set_execution_order(self, order: List[str]):
        self.execution_order = order
        
    def get_current_task(self) -> Optional[Subtask]:
        for subtask_id in self.execution_order:
            subtask = self.subtasks[subtask_id]
            if subtask.status in [SubtaskStatus.PENDING, SubtaskStatus.IN_PROGRESS]:
                return subtask
        return None

    def mark_in_progress(self, subtask_id: str):
        if subtask_id in self.subtasks:
            subtask = self.subtasks[subtask_id]
            subtask.status = SubtaskStatus.IN_PROGRESS
            subtask.started_at = datetime.now()
        
    def mark_completed(self, subtask_id: str, result: str = None):
        if subtask_id in self.subtasks:
            subtask = self.subtasks[subtask_id]
            subtask.status = SubtaskStatus.COMPLETED
            subtask.result = result
            subtask.completed_at = datetime.now()
            
    def mark_failed(self, subtask_id: str, error: str):
        if subtask_id in self.subtasks:
            subtask = self.subtasks[subtask_id]
            subtask.status = SubtaskStatus.FAILED
            subtask.error = error
            subtask.completed_at = datetime.now()

    def get_status_report(self) -> str:
        if not self.subtasks:
            return "No subtasks defined."
            
        report = "Execution Status:\n"
        for subtask_id in self.execution_order:
            subtask = self.subtasks[subtask_id]
            status_icon = "✓" if subtask.status == SubtaskStatus.COMPLETED else "✗" if subtask.status == SubtaskStatus.FAILED else "○"
            report += f"{status_icon} {subtask.description} ({subtask.status.value})\n"
        return report

    def to_dict(self) -> Dict:
        return {
            "subtasks": {k: v.to_dict() for k, v in self.subtasks.items()},
            "execution_order": self.execution_order
        }
