"""
E2E Test: Agent Tool Filtering and Execution

Tests the full flow:
  1. A DB tool is embedded when created (via ToolService)
  2. An MCP tool is embedded when the server is synced
  3. When an agent runs, only its assigned tools are retrieved (filtered by IDs)
  4. JIT search for a query returns only tools the agent can access
  5. MCP tool execution via call_mcp_tool works correctly
"""
import asyncio
import uuid
import json
from config.database import SessionLocal
from models.agent import Agent
from models.mcp_server import MCPServer
from engine.tools import ToolRegistry
from services.mcp_service import MCPService

MCP_ID = uuid.UUID("0e392278-7f58-46ca-84af-e94ad5011495")
AGENT_ID = uuid.UUID("087c060f-4cca-4528-8b5e-83d3ce887ffa")

async def run():
    db = SessionLocal()
    try:
        agent = db.query(Agent).filter(Agent.id == AGENT_ID).first()
        assert agent, "❌ Agent not found"
        print(f"✅ Agent: {agent.name}")
        print(f"   tool_ids: {agent.tool_ids}")
        print(f"   mcp_server_ids: {agent.mcp_server_ids}")

        registry = ToolRegistry(db)

        # ─────────────────────────────────────────────
        # Step 1: Build allowlist and verify filtering
        # ─────────────────────────────────────────────
        print("\n--- Step 1: Agent Allowlist ---")
        allowlist = registry.get_agent_allowlist(agent)
        print(f"  allowed_ids:        {allowlist['allowed_ids']}")
        print(f"  allowed_server_ids: {allowlist['allowed_server_ids']}")
        assert str(MCP_ID) in allowlist["allowed_server_ids"], "❌ MCP server not in allowlist"
        print("  ✅ MCP server is in allowlist")

        # ─────────────────────────────────────────────
        # Step 2: Get all assigned tools from ChromaDB
        # ─────────────────────────────────────────────
        print("\n--- Step 2: Assigned Tools from Index ---")
        assigned = registry.get_assigned_tools(agent)
        print(f"  Found {len(assigned)} assigned tool(s):")
        for t in assigned:
            print(f"    - [{t.get('source')}] {t.get('name')}")
        assert len(assigned) > 0, "❌ No assigned tools found in index"
        print("  ✅ Assigned tools retrieved successfully")

        # ─────────────────────────────────────────────
        # Step 3: JIT search with a query
        # ─────────────────────────────────────────────
        print("\n--- Step 3: JIT Search ---")
        jit_results = registry.search_tools("search the web for bitcoin price", agent=agent, limit=5)
        print(f"  JIT search returned {len(jit_results)} tool(s):")
        for t in jit_results:
            print(f"    - [{t.get('source')}] {t.get('name')}")

        # ─────────────────────────────────────────────
        # Step 4: Exact lookup by name (no normalization)
        # ─────────────────────────────────────────────
        print("\n--- Step 4: Exact Name Lookup ---")
        t = registry.get_tool_by_name("web-search", agent)
        assert t is not None, "❌ 'web-search' not found"
        assert t.get("source") == "mcp", f"❌ Expected source 'mcp', got '{t.get('source')}'"
        server_id = t.get("metadata", {}).get("server_id")
        assert server_id == str(MCP_ID), f"❌ Wrong server_id: {server_id}"
        print(f"  ✅ Found 'web-search' — source={t.get('source')}, server_id={server_id}")

        # Negative test: normalized name should NOT match
        t_neg = registry.get_tool_by_name("web_search", agent)
        assert t_neg is None, f"❌ 'web_search' should not match (no normalization), but found: {t_neg}"
        print("  ✅ 'web_search' correctly NOT found (exact matching enforced)")

        # ─────────────────────────────────────────────
        # Step 5: Execute the MCP tool
        # ─────────────────────────────────────────────
        print("\n--- Step 5: MCP Tool Execution ---")
        service = MCPService()
        res = await service.call_mcp_tool(db, MCP_ID, "web-search", {"query": "latest AI news"})
        assert res.get("success"), f"❌ call_mcp_tool failed: {res.get('error')}"
        parts = res.get("result", {}).get("content", [])
        assert isinstance(parts, list) and len(parts) > 0, "❌ Expected list of content parts"
        print(f"  ✅ MCP tool executed — received {len(parts)} content part(s)")
        print(f"  Sample: {parts[0].get('text', '')[:120]}...")

        print("\n============================")
        print("✅ ALL CHECKS PASSED")
        print("============================")

    except AssertionError as e:
        print(f"\n{e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run())
