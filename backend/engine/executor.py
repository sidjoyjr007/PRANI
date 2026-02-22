import docker
import logging
from typing import Optional, Dict, Any
import uuid

logger = logging.getLogger(__name__)

class DockerExecutor:
    """
    Manages ephemeral Docker containers for secure code execution.
    """
    def __init__(self, image: str = "python:3.11-slim"):
        self.image = image
        self.client = None  # Lazy-init: don't connect to Docker daemon at construction time

    def _get_client(self):
        """Lazily initialize the Docker client, only when actually needed."""
        if self.client is None:
            try:
                self.client = docker.from_env(timeout=5)
            except Exception as e:
                logger.warning(f"Docker client not available: {e}. Executor will fail.")
                self.client = None
        return self.client

    def execute_python(self, code: str, timeout: int = 30, environment: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Runs Python code in a fresh container.
        Returns {"stdout": ..., "stderr": ..., "exit_code": ...}
        """
        client = self._get_client()
        if not client:
            return {"error": "Docker not available", "exit_code": -1}

        container = None
        try:
            # We use a simple strategy: write code to file and run it.
            # But creating a file inside a container requires either mounting or 'docker cp'.
            # Simpler: pass code as argument to python -c
            
            # Robust way: Run container, detach=True, then exec_run.
            # Or run directly with command.
            
            # Let's try running a one-off container.
            # Note: Complex code with newlines needs careful escaping if passed verify CLI.
            # Better: use `client.containers.run(..., command=["python", "-c", code])`
            
            result = client.containers.run(
                self.image,
                command=["python", "-c", code],
                remove=True, # Auto-delete
                stdout=True,
                stderr=True,
                mem_limit="128m", # Resource limit
                network_disabled=False, # Allow network for now (pip install etc), restrict later
                detach=False, # Wait for completion
                environment=environment or {}
            )
            
            # result is bytes
            return {
                "stdout": result.decode("utf-8"),
                "stderr": "",
                "exit_code": 0
            }
            
        except docker.errors.ContainerError as e:
            # ContainerError has .output (bytes) for stdout, and the error message in str(e)
            output_bytes = getattr(e, 'output', None) or getattr(e, 'stdout', None)
            stderr_bytes = getattr(e, 'stderr', None)
            return {
                "stdout": output_bytes.decode("utf-8") if output_bytes else "",
                "stderr": stderr_bytes.decode("utf-8") if stderr_bytes else str(e),
                "exit_code": getattr(e, 'exit_status', getattr(e, 'exit_code', 1))
            }
        except Exception as e:
            logger.error(f"Docker execution failed: {e}")
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": -1
            }
