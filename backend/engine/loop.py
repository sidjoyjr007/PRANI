import asyncio
import uuid
import json
import logging
import re
from typing import AsyncIterator, List, Optional, Dict, Any

from sqlalchemy.orm import Session
from pydantic import ValidationError

from engine.events import EventBus, AgentEvent, AgentEventType
from engine.memory import ContextManager
from engine.tools import ToolRegistry
from engine.executor import DockerExecutor
from engine.subtasks import SubtaskManager, Subtask, SubtaskStatus
from engine.intent import IntentParser
from engine.prompts import get_action_system_prompt
from models.agent import Agent
from models.secret import UserToolSecret
from utils.encryption import decrypt_value
from utils.execution import execute_python_tool
from llm.factory import LLMFactory
from llm.types import ProviderMessage, LLMStreamChunk, ToolCall

logger = logging.getLogger(__name__)

class AgenticLoop:
    """
    The main execution engine.
    Orchestrates the Thought -> Action -> Observation cycle.
    """
    def __init__(
        self, 
        agent: Agent, 
        session_id: str,
        db: Session,
        llm_provider, # Protocol/Interface for LLMProvider
        event_bus: EventBus
    ):
        self.agent = agent
        self.session_id = session_id
        self.db = db
        self.llm = llm_provider
        self.bus = event_bus
        self.memory = ContextManager(db, session_id, agent)
        self.tool_registry = ToolRegistry(db)
        self.executor = DockerExecutor()
        self.intent_parser = IntentParser(llm_provider)
        self.subtask_manager = SubtaskManager()
        
        # State
        self.loop_count = 0
        self.max_loops = 15
        self.run_id = str(uuid.uuid4())
        self.action_history: List[str] = []
        self.pending_tool_refinement: Optional[Dict] = None

    async def compact_history(self, llm_provider: Any):
        """
        Compacts conversation history if too long.
        """
        await self.memory.compact_history(llm_provider)

    def _resolve_tool_secrets(self, tool_id: str) -> Dict[str, str]:
        """
        Resolves decrypted secrets for a specific tool.
        """
        try:
            # Try to get secrets for this tool. 
            # In a production multi-tenant system, we MUST filter by the current session's user_id.
            # Since user_id isn't currently tracked in the loop, we fetch all relevant secrets for this tool.
            # Usually, there will only be one set of secrets per tool in this simplified version.
            
            secrets = self.db.query(UserToolSecret).filter(
                UserToolSecret.tool_id == uuid.UUID(tool_id)
            ).all()
            
            resolved = {}
            for s in secrets:
                try:
                    resolved[s.name] = decrypt_value(s.encrypted_value)
                except Exception as e:
                    logger.error(f"Failed to decrypt tool secret {s.name}: {e}")
            
            print(f"[loop._resolve_tool_secrets] Resolved {len(resolved)} secret keys for tool {tool_id}")
            return resolved
        except Exception as e:
            logger.error(f"Error resolving tool secrets: {e}")
            return {}

    async def run(self, user_input: str, approved_tool_calls: Optional[List[Dict]] = None) -> AsyncIterator[AgentEvent]:
        """
        Main entry point.
        """
        try:
            print(f"[loop.run] START - session={self.session_id} user_input='{user_input[:50] if user_input else ''}...'")
            
            # 0. Compact History first (skip if it would block)
            print("[loop.run] Calling compact_history...")
            await self.memory.compact_history(self.llm)
            print("[loop.run] compact_history done.")

            # 1. Understanding user Query (First turn Planning)
            if user_input and self.loop_count == 0 and not approved_tool_calls:
                yield self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Understanding user Query")
                yield self.bus.create_event(self.session_id, AgentEventType.THOUGHT_START, content="Thinking...")
                
                assigned_tools = self.tool_registry.get_assigned_tools(self.agent)
                plan = await self.intent_parser.parse(user_input, self.agent, tools=assigned_tools)
                
                # Emit Planner Thought
                if "thought" in plan:
                    yield self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content=plan["thought"])
                
                # Check for Alignment failure or early completion
                if plan.get("is_complete"):
                    final_answer = plan.get("final_answer", "Request out of scope.")
                    # Save to memory before terminating
                    self.memory.add_message(role="assistant", content=final_answer)
                    yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=final_answer)
                    yield self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE)
                    return

                # Load subtasks into manager
                for st in plan.get("subtasks", []):
                    self.subtask_manager.add_subtask(Subtask(id=st["id"], description=st["description"]))
                self.subtask_manager.set_execution_order(plan.get("execution_order", []))
                
                yield self.bus.create_event(self.session_id, AgentEventType.THOUGHT_END)
                
                # Show plan to user and save to memory
                plan_msg = f"### Plan & Steps\n{self.subtask_manager.get_status_report()}"
                self.memory.add_message(
                    role="assistant", 
                    content=plan_msg, 
                    thoughts=[plan.get("thought")] if plan.get("thought") else [],
                    status="Planning Complete"
                )
                yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=plan_msg)

            print("[loop.run] Yielding LOOP_START...")
            # 2. Start Event
            yield self.bus.create_event(
                self.session_id, 
                AgentEventType.LOOP_START, 
                metadata={"run_id": self.run_id}
            )
            print("[loop.run] LOOP_START yielded.")
            
            # Track whether this specific turn has human approval (set once per resume)
            is_approved_turn = bool(approved_tool_calls)
            
            # 2. Enter Loop
            # Track current turn thoughts for persistence
            current_turn_thoughts = []
            
            while self.loop_count < self.max_loops:
                self.loop_count += 1
                print(f"[loop.run] === Loop iteration #{self.loop_count} (turn_approved={is_approved_turn}) ===")
                
                # Emit Thought Start
                yield self.bus.create_event(
                    self.session_id, 
                    AgentEventType.THOUGHT_START,
                    metadata={"loop_count": self.loop_count}
                )
                
                # Get Context
                context = self.memory.get_active_context()
                
                # Update System Prompt with Subtask Progress
                status_report = self.subtask_manager.get_status_report()
                current_task = self.subtask_manager.get_current_task()
                current_subtask_desc = current_task.description if current_task else "Final Review"
                
                # --- 3a. Subtask-Driven Tool Retrieval (JIT Discovery) ---
                yield self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Discovering Tools")
                assigned_tools = self.tool_registry.get_assigned_tools(self.agent)
                
                # Use current subtask description instead of raw user input for retrieval
                search_query = current_subtask_desc[:200]
                jit_tools = self.tool_registry.search_tools(search_query, agent=self.agent, limit=5)
                
                seen_names = set(t.get("name") for t in assigned_tools if t.get("name"))
                tool_recs = list(assigned_tools)
                for t in jit_tools:
                    if t.get("name") not in seen_names: tool_recs.append(t)
                
                tool_defs = []
                for t in tool_recs:
                    if t.get("schema") and t.get("name"):
                        tool_defs.append({
                            "type": "function",
                            "function": {
                                "name": t["name"],
                                "description": t.get("description", ""),
                                "parameters": t["schema"]
                            }
                        })
                
                # Inject Refined System Prompt
                tools_desc = "\n".join([f"- {t['function']['name']}: {t['function']['description']}" for t in tool_defs])
                
                # Fetch recent session history for context injection (last 10 messages)
                history_msg = self.memory.conversation_service.get_messages(self.session_id)
                session_history = "\n".join([
                    f"{m.role.upper()}: {m.content['text'] if isinstance(m.content, dict) else m.content}" 
                    for m in history_msg[-10:]
                ])

                system_prompt = get_action_system_prompt(
                    agent_role=self.agent.description or "Autonomous Agent", 
                    tools_desc=tools_desc, 
                    status_report=status_report,
                    current_subtask=current_subtask_desc,
                    session_history=session_history
                )
                
                # If we have a pending refinement from a failed tool call, add it to the context
                if self.pending_tool_refinement:
                    context.append(ProviderMessage(role="system", content=f"IMPORTANT: Previous tool failed. Refinement: {json.dumps(self.pending_tool_refinement)}"))

                # Replace/Insert the enriched system prompt at the start
                if context and context[0].role == "system":
                    context[0].content = system_prompt
                else:
                    context.insert(0, ProviderMessage(role="system", content=system_prompt))
                
                # Call LLM
                full_content = ""
                tool_calls_buffer: List[Dict] = []
                
                # HITL Resume Logic:
                # If we have approved tool calls and this is the first iteration, use them directly
                if self.loop_count == 1 and approved_tool_calls:
                    logger.info("Resuming with approved tool calls.")
                    is_approved_turn = True
                    for atc in approved_tool_calls:
                         # Reconstruct ToolCall object
                         # We need to make sure we map back to the tool definition if needed?
                         # Or just pass through.
                         tc = ToolCall(**atc)
                         tool_calls_buffer.append(tc);
                         
                else:
                    # Normal LLM Generation
                    yield self.bus.create_event(self.session_id, AgentEventType.STATUS, content="Executing Agent")
                    yield self.bus.create_event(self.session_id, AgentEventType.THOUGHT_START, content="Thinking...")
                    async for chunk in self._stream_llm(context, tools=tool_defs):
                        if isinstance(chunk, str):
                            full_content += chunk
                            # We stop yielding raw MESSAGE events for the internal JSON protocol
                            # yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=chunk)
                        if hasattr(chunk, 'tool_calls') and chunk.tool_calls:
                            tool_calls_buffer.extend(chunk.tool_calls)
                    
                    # Post-generation JSON parsing
                    try:
                        json_match = re.search(r'\{.*\}', full_content, re.DOTALL)
                        if json_match:
                            parsed_json = json.loads(json_match.group(0))
                            
                            # Log reasoning as a THOUGHT event instead of a MESSAGE
                            if "thought" in parsed_json:
                                thought_content = parsed_json['thought']
                                current_turn_thoughts.append(thought_content)
                                yield self.bus.create_event(self.session_id, AgentEventType.THOUGHT, content=thought_content)
                            
                            # Bridge JSON tool_request to tool_calls_buffer
                            if "tool_request" in parsed_json:
                                tr = parsed_json["tool_request"]
                                t_name = tr.get("operation")
                                t_args = tr.get("args", {})
                                
                                # Convert dict args to string for consistency with native execution logic
                                args_str = json.dumps(t_args) if isinstance(t_args, dict) else str(t_args)
                                
                                tc = ToolCall(
                                    id=f"json_{uuid.uuid4().hex[:8]}",
                                    function={"name": t_name, "arguments": args_str}
                                )
                                tool_calls_buffer.append(tc)
                                logger.info(f"Bridged JSON tool_request: {t_name}")

                            # Handle Task Completion or Subtask Transition
                            # If is_complete is true, or if we have a final_answer and no tool calls
                            is_complete = str(parsed_json.get("is_complete")).lower() == "true"
                            final_answer = parsed_json.get("final_answer")
                            
                            if is_complete or (final_answer and not tool_calls_buffer):
                                if current_task:
                                    # Update Subtask Status based on LLM feedback
                                    task_status = parsed_json.get("current_subtask_status", "SUCCESS")
                                    if task_status == "FAILED":
                                        self.subtask_manager.mark_failed(current_task.id, error=final_answer or "Task failed")
                                    else:
                                        self.subtask_manager.mark_completed(current_task.id, result=final_answer)
                                    
                                    yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=f"✅ **Step Status ({task_status}):** {current_task.description}")

                                    # Final Answer should be pure Markdown content
                                    ans = final_answer or "Task finished successfully."
                                    
                                    # CRITICAL: Save to database/memory before exiting
                                    self.memory.add_message(
                                        role="assistant", 
                                        content=ans, 
                                        thoughts=current_turn_thoughts,
                                        status="Task Success" if task_status == "SUCCESS" else "Task Failed"
                                    )
                                    
                                    yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=ans)
                                    yield self.bus.create_event(self.session_id, AgentEventType.LOOP_COMPLETE)
                                    return
                                else:
                                    # Move to next subtask
                                    self.memory.add_message(role="assistant", content=full_content)
                                    continue
                    except Exception as e:
                        logger.error(f"JSON Parse/Bridge Error: {e}")

                # Emit Thought End
                yield self.bus.create_event(
                    self.session_id, 
                    AgentEventType.THOUGHT_END
                )
                
                # Loop Detection
                try:
                    tool_sigs = sorted([f"{tc.function.get('name', '')}:{tc.function.get('arguments', '')}" if isinstance(tc.function, dict) else f"{tc.function}" for tc in tool_calls_buffer])
                except Exception:
                    tool_sigs = []
                step_signature = f"{full_content}|{'|'.join(tool_sigs)}"
                
                self.action_history.append(step_signature)
                if len(self.action_history) >= 3:
                     last_three = self.action_history[-3:]
                     if all(s == step_signature for s in last_three):
                         logger.warning(f"Loop detected for session {self.session_id}")
                         yield self.bus.create_event(
                            self.session_id, 
                            AgentEventType.ERROR, 
                            content="Terminating due to infinite loop detection."
                         )
                         break

                # Decision Point
                print(f"[loop.run] Decision point: tool_calls_buffer={len(tool_calls_buffer)}, human_in_loop={self.agent.human_in_loop}, is_approved_turn={is_approved_turn}")
                if tool_calls_buffer:
                    # Check HITL
                    # If this is a fresh tool call (not pre-approved/resumed) and Agent requires HITL
                    if self.agent.human_in_loop and not is_approved_turn:
                        print(f"[loop.run] HITL triggered! Yielding APPROVAL_REQUIRED event.")
                        # Save Assistant Message with Tool Calls
                        self.memory.add_message(
                            role="assistant", 
                            content=full_content, 
                            tool_calls=tool_calls_buffer
                        )

                        # Serialize tool calls safely
                        serialized_tool_calls = []
                        for t in tool_calls_buffer:
                            try:
                                serialized_tool_calls.append(t.dict())
                            except Exception:
                                serialized_tool_calls.append(t if isinstance(t, dict) else str(t))

                        yield self.bus.create_event(
                            self.session_id, 
                            AgentEventType.APPROVAL_REQUIRED,
                            metadata={"tool_calls": serialized_tool_calls} 
                        )
                        print(f"[loop.run] APPROVAL_REQUIRED event yielded. Breaking loop.")
                        break # Suspend Loop
                    
                    # 0. Save Assistant Message with Tool Calls (if not already saved by HITL check)
                    # This is important for the LLM to know it initiated these calls.
                    self.memory.add_message(
                        role="assistant", 
                        content=full_content, 
                        tool_calls=tool_calls_buffer,
                        thoughts=current_turn_thoughts,
                        status="Executing Tools"
                    )

                    # 1. Execute Tools
                    for tool_call in tool_calls_buffer:
                        # Normalize tool_call structure (Provider specifics vs Internal)
                        # tool_call might be dict or object
                        
                        t_name = tool_call.function["name"]
                        t_args = tool_call.function["arguments"]
                        t_id = tool_call.id
                        
                        # Resolve tool record FIRST before referencing it for source/metadata
                        tool_rec = self.tool_registry.get_tool_by_name(t_name, self.agent)
                        t_source = tool_rec.get("source", "unknown") if tool_rec else "unknown"
                        
                        yield self.bus.create_event(self.session_id, AgentEventType.STATUS, content=f"Executing Tool: {t_name}")
                        yield self.bus.create_event(
                            self.session_id, 
                            AgentEventType.TOOL_START,
                            metadata={"tool": t_name, "args": t_args, "source": t_source}
                        )
                        
                        if not tool_rec:
                             result = f"Error: Tool {t_name} not found."
                        else:
                             try:
                                 # Dispatch based on Source
                                 if tool_rec.get("source") == "mcp":
                                     # MCP Execution
                                     server_id = tool_rec.get("metadata", {}).get("server_id")
                                     if not server_id:
                                         result = "Error: MCP Server ID missing."
                                     else:
                                         try:
                                             mcp_uuid = uuid.UUID(server_id)
                                         except ValueError:
                                             result = f"Error: Invalid MCP Server ID: {server_id}"
                                         else:
                                             import json as _json
                                             try:
                                                 clean_args = _json.loads(t_args) if t_args else {}
                                             except Exception:
                                                 clean_args = {}
                                                 
                                             actual_tool_name = tool_rec.get("name", t_name)
                                             
                                             mcp_res = await self.tool_registry.mcp_service.call_mcp_tool(
                                                 self.db, mcp_uuid, actual_tool_name, clean_args
                                             )
                                             
                                             if mcp_res.get("success"):
                                                 res_content = mcp_res.get("result", {})
                                                 if isinstance(res_content, dict) and "content" in res_content:
                                                     # Keep parts for rich memory/LLM context
                                                     result = res_content["content"] 
                                                 else:
                                                     result = str(res_content)
                                             else:
                                                 result = f"MCP Error: {mcp_res.get('error')}"
                                 else:
                                     # Python/Docker Execution
                                     # 1. Resolve Secrets
                                     tool_id = tool_rec.get("id")
                                     secrets = self._resolve_tool_secrets(tool_id) if tool_id else {}
                                     
                                     # 2. Get Code and Arguments
                                     tool_code = tool_rec['metadata']['content']
                                     
                                     import json as _json
                                     try:
                                         args_dict = _json.loads(t_args) if t_args else {}
                                     except Exception:
                                         args_dict = {}

                                     # 3. Execute via centralized utility
                                     loop = asyncio.get_running_loop()
                                     exec_res = await loop.run_in_executor(
                                         None,
                                         lambda: execute_python_tool(
                                             code=tool_code,
                                             inputs=args_dict,
                                             secrets=secrets,
                                             input_fields=tool_rec.get("input_fields")
                                         )
                                     )
                                     
                                     if exec_res.get("success"):
                                         result = exec_res.get("result", "No output")
                                     else:
                                         result = f"Error: {exec_res.get('error', 'Unknown error')}"
                                         if "traceback" in exec_res:
                                             logger.error(f"Tool {t_name} failed with traceback: {exec_res['traceback']}")
                             except Exception as e:
                                 result = f"Tool Execution Error: {e}"

                        yield self.bus.create_event(
                            self.session_id, 
                            AgentEventType.TOOL_OUTPUT,
                            content=str(result),
                            metadata={"tool": t_name, "source": t_source}
                        )
                        
                        # Add Result to Memory (result might be list of parts or string)
                        # CRITICAL: Use t_id (the unique ID provided by the LLM) so it can track responses.
                        self.memory.add_message(
                            role="tool", 
                            content=result, 
                            tool_call_id=t_id
                        )
                        
                        # Update Subtask Manager and Refinement Tracking
                        if "Error" in str(result):
                            self.pending_tool_refinement = {"tool": t_name, "error": str(result)}
                        else:
                            self.pending_tool_refinement = None
                    
                    # Strict HITL Enforcement: Clear the approval flag after consuming it for this set of calls
                    # This ensures that if the agent makes SUBSEQUENT calls, it must ask again.
                    is_approved_turn = False
                    
                    # Loop continues to reflect on tool output
                    continue
                
                # 3e. Final Response Handling (Fallback for non-protocol turns)
                if full_content and not tool_calls_buffer:
                    # If we reached here, it means the turn finished without yielding a final message.
                    # We'll try to extract a final_answer if it was JSON, otherwise yield full_content.
                    display_text = full_content
                    try:
                        json_match = re.search(r'\{.*\}', full_content, re.DOTALL)
                        if json_match:
                            data = json.loads(json_match.group(0))
                            display_text = data.get("final_answer") or data.get("thought") or full_content
                    except Exception:
                        pass
                        
                    yield self.bus.create_event(self.session_id, AgentEventType.MESSAGE, content=display_text)
                    self.memory.add_message(
                        role="assistant", 
                        content=display_text,
                        thoughts=current_turn_thoughts,
                        status="Message Sent"
                    )
                break
            
            # 4. Finish
            yield self.bus.create_event(
                self.session_id, 
                AgentEventType.LOOP_COMPLETE
            )
            
        except Exception as e:
            logger.error(f"Loop Error: {e}")
            yield self.bus.create_event(
                self.session_id, 
                AgentEventType.ERROR, 
                content=str(e)
            )

    async def _stream_llm(self, messages: List[ProviderMessage], tools: List[Dict] = None) -> AsyncIterator[Any]:
        """
        Wraps the synchronous LLM provider stream.
        Runs the blocking requests-based stream in a thread pool so it doesn't block the async event loop.
        """
        import concurrent.futures
        loop = asyncio.get_running_loop()
        queue = asyncio.Queue()

        kwargs = {}
        if tools:
            kwargs["tools"] = tools

        def run_sync():
            try:
                for chunk in self.llm.stream(messages, **kwargs):
                    # Put items into the queue from the thread - use thread-safe call
                    loop.call_soon_threadsafe(queue.put_nowait, chunk)
            except Exception as e:
                loop.call_soon_threadsafe(queue.put_nowait, e)
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

        # Run the blocking call in a thread
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        future = loop.run_in_executor(executor, run_sync)

        while True:
            item = await queue.get()
            if item is None:
                break  # Stream done
            if isinstance(item, Exception):
                raise item
            if item.content:
                yield item.content
            if item.tool_calls:
                yield item

        await future  # Ensure thread completes cleanly

