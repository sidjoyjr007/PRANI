from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional, Dict, Any
import json
import logging
from sqlalchemy import desc

from models.mcp_server import MCPServer
from models.mcp_secret import MCPSecret
from schemas.mcp_server import MCPCreate, MCPUpdate, MCPEnvVar
from utils.encryption import encrypt_value, decrypt_value
from engine.retrieval import RetrievalSystem

logger = logging.getLogger(__name__)

class MCPService:
    
    def __init__(self):
        self.retrieval = RetrievalSystem()
    async def create_mcp(self, db: Session, mcp_data: MCPCreate, user_id: UUID) -> MCPServer:
        data = mcp_data.dict()
        env_vars = data.pop("environmentVariables", [])
        
        db_mcp = MCPServer(
            owner_id=user_id,
            name=data["name"],
            url=data["url"],
            headers=json.loads(data["headers"]) if isinstance(data["headers"], str) else data["headers"],
            env_vars=[{"key": e["key"], "isExisting": True} for e in env_vars],
            is_active=data.get("is_active", True)
        )
        db.add(db_mcp)
        db.flush()
        
        self._sync_secrets(db, db_mcp.id, env_vars)
        
        db.commit()
        db.refresh(db_mcp)

        # Trigger Tool Sync
        try:
            await self.test_connection(
                db=db,
                url=db_mcp.url,
                headers_json=db_mcp.headers,
                env_vars=env_vars,
                mcp_id=db_mcp.id
            )
        except Exception as e:
            logger.error(f"Post-creation tool sync failed for {db_mcp.id}: {e}")

        return self.format_mcp(db_mcp)

    def get_mcps(self, db: Session, page: int, size: int, search: Optional[str], user_id: UUID):
        query = db.query(MCPServer).filter(MCPServer.owner_id == user_id)
        if search:
            query = query.filter(MCPServer.name.ilike(f"%{search}%"))
        
        total = query.count()
        items = query.order_by(desc(MCPServer.created_at)).offset((page - 1) * size).limit(size).all()
        
        return {
            "items": [self.format_mcp(item) for item in items],
            "total": total,
            "page": page,
            "size": size
        }

    def get_mcp(self, db: Session, mcp_id: UUID) -> Optional[MCPServer]:
        return db.query(MCPServer).filter(MCPServer.id == mcp_id).first()

    async def update_mcp(self, db: Session, mcp_id: UUID, update_data: MCPUpdate, user_id: UUID):
        mcp = self.get_mcp(db, mcp_id)
        if not mcp:
            return None
        
        # Only update provided fields (diff-based)
        data = update_data.dict(exclude_unset=True)
        env_vars = data.pop("environmentVariables", None)
        
        for key, value in data.items():
            if key == "headers" and isinstance(value, str):
                 setattr(mcp, key, json.loads(value))
            else:
                 setattr(mcp, key, value)
        
        if env_vars is not None:
             mcp.env_vars = [{"key": e["key"], "isExisting": True} for e in env_vars]
             self._sync_secrets(db, mcp_id, env_vars)
             
        db.commit()
        db.refresh(mcp)

        # Trigger Tool Sync
        try:
            # Re-fetch secrets if needed
            current_env_vars = []
            if env_vars is not None:
                current_env_vars = env_vars
            else:
                secrets = db.query(MCPSecret).filter(MCPSecret.mcp_id == mcp_id).all()
                current_env_vars = [{"key": s.name, "value": "********"} for s in secrets]

            await self.test_connection(
                db=db,
                url=mcp.url,
                headers_json=mcp.headers,
                env_vars=current_env_vars,
                mcp_id=mcp.id
            )
        except Exception as e:
            logger.error(f"Post-update tool sync failed for {mcp.id}: {e}")

        return self.format_mcp(mcp)

    def delete_mcp(self, db: Session, mcp_id: UUID, user_id: UUID):
        mcp = self.get_mcp(db, mcp_id)
        if mcp:
            db.query(MCPSecret).filter(MCPSecret.mcp_id == mcp_id).delete()
            db.delete(mcp)
            db.commit()
            
            # Remove from vector index
            self.retrieval.delete_server_tools(str(mcp_id))
            
            return True
        return False
        
    async def test_connection(self, db: Session, url: str, headers_json: str, env_vars: List[dict], mcp_id: Optional[UUID] = None):
        """
        Test connection to MCP Server using proper full-duplex SSE + POST.
        """
        import httpx
        import asyncio
        from urllib.parse import urljoin

        # --- 1. Resolve Secrets & Headers (Same as before) ---
        resolved_secrets = {}
        db_secrets = {}
        if mcp_id:
            secrets_query = db.query(MCPSecret).filter(MCPSecret.mcp_id == mcp_id).all()
            for s in secrets_query:
                try:
                    db_secrets[s.name] = decrypt_value(s.encrypted_value)
                except Exception:
                    db_secrets[s.name] = ""

        for env in env_vars:
            key = env["key"]
            value = env["value"] 
            if value == "********" or value == "****************":
                if key in db_secrets:
                     resolved_secrets[key] = db_secrets[key]
                else:
                     resolved_secrets[key] = ""
            else:
                resolved_secrets[key] = value
        # 2. Parse Headers
        headers = {}
        if headers_json:
            try:
                if isinstance(headers_json, str):
                    raw_headers = json.loads(headers_json)
                else:
                    raw_headers = headers_json # Already a dict
                    
                if isinstance(raw_headers, dict):
                    for k, v in raw_headers.items():
                        val_str = str(v)
                        for env_key, env_val in resolved_secrets.items():
                            if env_val:
                                val_str = val_str.replace(f"{{{{env.{env_key}}}}}", env_val)
                        headers[k] = val_str
            except (json.JSONDecodeError, TypeError):
                 # If headers fail to parse, just use empty, or default?
                 # User said "send {} to backend", imply backend receives it.
                 # If parsing fails, maybe warn but proceed with empty?
                 logger.warning(f"Failed to parse headers: {headers_json}")
                 pass # headers remains {}

        # Ensure Accept header is set for MCP compliance -> REMOVED global force
        # We will set it per request instead.

        # --- 2. Async State ---
        endpoint_future = asyncio.Future()
        rpc_futures: Dict[int, asyncio.Future] = {}
        
        # Reader Task Logic
        async def read_sse(response):
            try:
                current_event = None
                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line:
                        current_event = None
                        continue
                    
                    if line.startswith("event:"):
                        current_event = line[6:].strip()
                    elif line.startswith("data:"):
                        data = line[5:].strip()
                        
                        if current_event == "endpoint":
                            if not endpoint_future.done():
                                endpoint_future.set_result(data)
                        
                        elif current_event == "message":
                            try:
                                msg = json.loads(data)
                                # Check if it's a response to one of our requests
                                if "id" in msg and msg["id"] in rpc_futures:
                                    fut = rpc_futures[msg["id"]]
                                    if not fut.done():
                                        fut.set_result(msg)
                            except json.JSONDecodeError:
                                pass # Ignore malformed data
            except Exception as e:
                # If reader crashes and we are waiting, cancel futures?
                if not endpoint_future.done():
                    endpoint_future.set_result(None) # Signal failure instead of exception
                for fut in rpc_futures.values():
                    if not fut.done():
                        fut.set_exception(e)

        # --- 3. Interaction Logic ---
        try:
            timeout = httpx.Timeout(15.0, connect=5.0)
            async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True, verify=False) as client:
                
                # --- Attempt 1: SSE Handshake ---
                fallback_needed = False
                post_endpoint = None
                reader_task = None
                
                try:
                    # Explicitly request SSE
                    async with client.stream("GET", url, headers={"Accept": "text/event-stream"}) as response:
                        if response.status_code != 200:
                            fallback_needed = True
                        else:
                            # Start Reader
                            reader_task = asyncio.create_task(read_sse(response))
                            
                            try:
                                # Wait for endpoint
                                post_endpoint = await asyncio.wait_for(endpoint_future, timeout=5.0)
                                if not post_endpoint:
                                    fallback_needed = True
                                else:
                                    if not post_endpoint.startswith("http"):
                                        from urllib.parse import urljoin
                                        post_endpoint = urljoin(url, post_endpoint)
                                        
                                    # --- Send Initialize ---
                                    # NOTE: Added headers and params
                                    rpc_futures[1] = asyncio.Future()
                                    await client.post(post_endpoint, headers={"Accept": "application/json, text/event-stream", "Content-Type": "application/json"}, json={
                                        "jsonrpc": "2.0",
                                        "method": "initialize",
                                        "id": 1,
                                        "params": {
                                            "protocolVersion": "2024-11-05",
                                            "capabilities": {},
                                            "clientInfo": {"name": "Prani", "version": "0.1.0"}
                                        }
                                    })
                                    # Wait for response via SSE
                                    init_response = await asyncio.wait_for(rpc_futures[1], timeout=5.0)
                                    
                                    if "error" in init_response:
                                         return {"success": False, "error": f"Initialization failed: {init_response['error']}"}
                                    
                                    server_info = init_response.get("result", {}).get("serverInfo", {})
                                    
                                    # --- Send Initialized ---
                                    await client.post(post_endpoint, headers={"Accept": "application/json, text/event-stream", "Content-Type": "application/json"}, json={
                                        "jsonrpc": "2.0",
                                        "method": "notifications/initialized"
                                    })

                                    # --- List Tools ---
                                    rpc_futures[2] = asyncio.Future()
                                    await client.post(post_endpoint, headers={"Accept": "application/json, text/event-stream", "Content-Type": "application/json"}, json={
                                        "jsonrpc": "2.0",
                                        "method": "tools/list",
                                        "id": 2,
                                        "params": {}
                                    })
                                    tools_response = await asyncio.wait_for(rpc_futures[2], timeout=10.0)

                                    if "error" in tools_response:
                                         return {"success": False, "error": f"List tools failed: {tools_response['error']}"}
                                    
                                    tools = tools_response.get("result", {}).get("tools", [])
                                    
                                    # Index Tools automatically upon sync
                                    if mcp_id and tools:
                                        self._index_mcp_tools(mcp_id, url, tools)
                                    
                                    # Cleanup
                                    reader_task.cancel()
                                    try:
                                        await reader_task
                                    except asyncio.CancelledError:
                                        pass
                                    
                                    return {
                                        "success": True, 
                                        "status": 200, 
                                        "message": f"Connected to {server_info.get('name', 'MCP Server')}. Found {len(tools)} tools. (Mode: SSE)",
                                        "serverInfo": server_info,
                                        "tools": tools
                                    }

                            except asyncio.TimeoutError:
                                fallback_needed = True
                                if reader_task: reader_task.cancel()
                            except Exception as e:
                                logger.error(f"SSE interaction failed: {e}")
                                fallback_needed = True
                                if reader_task: reader_task.cancel()

                except Exception as e:
                    logger.error(f"SSE Connect failed: {e}")
                    fallback_needed = True

                # --- Attempt 2: Direct POST Fallback ---
                if fallback_needed:
                    logger.info(f"Using Direct POST Fallback for {url}")
                    
                    async def post_and_parse(url, payload):
                        # Construct Headers
                        req_headers = {
                            "Accept": "application/json, text/event-stream", 
                            "Content-Type": "application/json",
                            "User-Agent": "Prani-MCP-Client/1.0"
                        }
                        
                        msg = f"MCP Request: Posting to {url}\nHeaders: {req_headers}\nBody: {json.dumps(payload)}"
                        logger.info(msg)
                        print(msg) # Explicit console log as requested

                        resp = await client.post(url, content=json.dumps(payload), headers=req_headers)
                        
                        if resp.is_error:
                             logger.error(f"Post failed {resp.status_code}: {resp.text}")
                             return {"error": f"HTTP Error {resp.status_code}: {resp.text[:200]}", "status": resp.status_code}
                        
                        # Handle Success with No Content (e.g. Notifications)
                        if resp.status_code in (202, 204):
                            return {}

                        # Try standard JSON
                        try:
                            return resp.json()
                        except json.JSONDecodeError:
                            pass
                        
                        # Try parsing SSE-wrapped response
                        text = resp.text
                        data_line = None
                        for line in text.splitlines():
                            if line.startswith("data:"):
                                data_line = line[5:].strip()
                                break
                        
                        if data_line:
                            try:
                                return json.loads(data_line)
                            except json.JSONDecodeError:
                                pass
                        
                        return {"error": f"Invalid JSON/SSE response ({resp.status_code}): {resp.text[:200]}"}

                    # Initialize
                    init_res = await post_and_parse(url, {
                        "jsonrpc": "2.0",
                        "method": "initialize",
                        "id": 1,
                        "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "tester", "version": "1.0"}}
                    })
                    
                    if "error" in init_res:
                        return {"success": False, "error": init_res["error"]}
                    
                    server_info = init_res.get("result", {}).get("serverInfo", {})

                    # Initialized
                    initialized_res = await post_and_parse(url, {
                        "jsonrpc": "2.0", 
                        "method": "notifications/initialized"
                        # Omit params to avoid 400 error on some servers
                    })
                    if "error" in initialized_res:
                        logger.warning(f"Initialized notification failed (non-critical): {initialized_res['error']}")

                    # List Tools (Removed params)
                    tools_res = await post_and_parse(url, {
                        "jsonrpc": "2.0", 
                        "method": "tools/list", 
                        "id": 2
                    })
                    
                    if "error" in tools_res and "code" not in tools_res:
                         if isinstance(tools_res.get("error"), str):
                             return {"success": False, "error": tools_res["error"]}
                         else:
                             return {"success": False, "error": f"List tools failed: {tools_res['error']}"}

                    tools = tools_res.get("result", {}).get("tools", [])
                    
                    # Index Tools automatically upon sync
                    if mcp_id and tools:
                        self._index_mcp_tools(mcp_id, url, tools)
                    
                    return {
                        "success": True, 
                        "status": 200, 
                        "message": f"Connected to {server_info.get('name', 'MCP Server')}. Found {len(tools)} tools. (Mode: Direct POST+SSE)",
                        "serverInfo": server_info,
                        "tools": tools
                    }

        except Exception as e:
            return {"success": False, "error": f"Connection failed: {str(e)}"}

    # --- Helpers ---

    def _index_mcp_tools(self, mcp_id: UUID, url: str, mcp_tools: list):
        """Format and index MCP tools into the vector store"""
        from models.mcp_server import MCPServer
        from config.database import SessionLocal
        
        server_name = "mcp"
        db = SessionLocal()
        try:
            server = db.query(MCPServer).filter(MCPServer.id == mcp_id).first()
            if server:
                server_name = server.name
        finally:
            db.close()

        try:
            formatted_tools = []
            for t in mcp_tools:
                t_name = t.get("name")
                t_desc = t.get("description")
                t_schema = t.get("inputSchema")
                tool_def = {
                    "id": f"mcp_{mcp_id}_{t_name}",
                    "name": t_name,
                    "description": t_desc,
                    "schema": t_schema,
                    "source": "mcp",
                    "metadata": {
                        "server_id": str(mcp_id), 
                        "server_name": server_name, 
                        "url": url
                    }
                }
                formatted_tools.append(tool_def)
            self.retrieval.index_tools(formatted_tools)
        except Exception as e:
            logger.error(f"Failed to index MCP tools for {mcp_id}: {e}")

    def _sync_secrets(self, db: Session, mcp_id: UUID, env_vars: List[dict]):
        existing_secrets = {s.name: s for s in db.query(MCPSecret).filter(MCPSecret.mcp_id == mcp_id).all()}
        current_keys = set()
        
        for env in env_vars:
            key = env["key"]
            value = env["value"]
            current_keys.add(key)
            
            # Skip if masked (value didn't change)
            if value == "********" or value == "****************":
                 continue
                 
            encrypted = encrypt_value(value)
            
            if key in existing_secrets:
                existing_secrets[key].encrypted_value = encrypted
            else:
                new_secret = MCPSecret(mcp_id=mcp_id, name=key, encrypted_value=encrypted)
                db.add(new_secret)
        
        # Delete secrets that are no longer in env_vars
        for key, secret in existing_secrets.items():
            if key not in current_keys:
                db.delete(secret)

    async def call_mcp_tool(self, db: Session, mcp_id: UUID, tool_name: str, arguments: dict) -> dict:
        """
        Executes a tool on a remote MCP server using Direct POST logic.
        """
        server = db.query(MCPServer).filter(MCPServer.id == mcp_id).first()
        if not server:
            return {"success": False, "error": f"MCP Server {mcp_id} not found."}
            
        url = server.url
        headers_dict = server.headers or {}
        
        # Resolve secrets
        secrets = db.query(MCPSecret).filter(MCPSecret.mcp_id == mcp_id).all()
        for s in secrets:
            headers_dict[s.name] = decrypt_value(s.encrypted_value)
            
        import httpx
        timeout = httpx.Timeout(60.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async def post_and_parse(url_to_call, payload):
                req_headers = {
                    "Accept": "application/json, text/event-stream", 
                    "Content-Type": "application/json",
                    "User-Agent": "Prani-MCP-Client/1.0"
                }
                req_headers.update(headers_dict)
                logger.info(f"MCP Call Payload to {url_to_call}: {json.dumps(payload)}")
                resp = await client.post(url_to_call, content=json.dumps(payload), headers=req_headers)
                
                if resp.is_error:
                     return {"error": f"HTTP Error {resp.status_code}: {resp.text[:200]}"}
                     
                try: return resp.json()
                except json.JSONDecodeError:
                    text = resp.text
                    data_line = next((line[5:].strip() for line in text.splitlines() if line.startswith("data:")), None)
                    if data_line:
                        try: return json.loads(data_line)
                        except: pass
                return {"error": f"Invalid response: {resp.text[:200]}"}

            # Initialization sequence
            init_res = await post_and_parse(url, {
                "jsonrpc": "2.0", "method": "initialize", "id": 1,
                "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "prani", "version": "1.0"}}
            })
            if "error" in init_res: 
                return {"success": False, "error": init_res["error"]}
            
            # Notifications/Initialized
            await post_and_parse(url, {"jsonrpc": "2.0", "method": "notifications/initialized"})
            
            # Call Actual Tool
            call_res = await post_and_parse(url, {
                "jsonrpc": "2.0", "method": "tools/call", "id": 2,
                "params": {"name": tool_name, "arguments": arguments}
            })
            
            if "error" in call_res and "code" not in call_res:
                return {"success": False, "error": call_res.get("error")}
                
            return {"success": True, "result": call_res.get("result", {})}

    def format_mcp(self, mcp: MCPServer):
        response_env = []
        if mcp.env_vars:
            for item in mcp.env_vars:
                # Basic structure
                response_env.append({
                    "key": item.get("key"),
                    "value": "****************",
                    "isPassword": True,
                    "isExisting": True
                })
        
        headers_str = json.dumps(mcp.headers, indent=2)
        
        return {
            "id": mcp.id,
            "owner_id": mcp.owner_id,
            "name": mcp.name,
            "url": mcp.url,
            "headers": headers_str,
            "environmentVariables": response_env,
            "is_active": mcp.is_active,
            "created_at": mcp.created_at,
            "updated_at": mcp.updated_at
        }
        
mcp_service = MCPService()
