import os
import logging
import uuid
import json
from typing import List, Dict, Any, Optional
try:
    import chromadb
    from chromadb.config import Settings
    from chromadb.api import ClientAPI
except ImportError:
    chromadb = None
    Settings = None
    ClientAPI = None

logger = logging.getLogger(__name__)

class RetrievalSystem:
    _client: Optional[ClientAPI] = None
    _collection = None
    _connected = False

    def __init__(self, collection_name: str = "agent_tools"):
        # Load from settings which properly reads .env
        try:
            from config.settings import settings
            self.chroma_url = settings.chroma_url
        except Exception:
            self.chroma_url = os.getenv("CHROMA_URL", "http://localhost:8100")
        
        self.collection_name = collection_name

    def _ensure_connected(self):
        """Lazily connect to ChromaDB only when needed."""
        if RetrievalSystem._connected:
            self.client = RetrievalSystem._client
            self.collection = RetrievalSystem._collection
            return
        
        RetrievalSystem._connected = True 
        try:
            clean_url = self.chroma_url.replace("http://", "").replace("https://", "")
            if ":" in clean_url:
                host, port_str = clean_url.split(":")
                port = int(port_str)
            else:
                host = clean_url
                port = 8100
            
            logger.info(f"Connecting to ChromaDB at {host}:{port}...")
            # Pass ssl=False and a short timeout to prevent hangs
            RetrievalSystem._client = chromadb.HttpClient(
                host=host, 
                port=port, 
                ssl=False, 
                settings=Settings(anonymized_telemetry=False),
                headers={},
                tenant="default_tenant",
                database="default_database"
            )
            RetrievalSystem._collection = RetrievalSystem._client.get_or_create_collection(name=self.collection_name)
            
            self.client = RetrievalSystem._client
            self.collection = RetrievalSystem._collection
            logger.info(f"Connected to ChromaDB at {self.chroma_url}, Collection: {self.collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to connect to ChromaDB: {e}. Retrieval will be disabled.")
            self.client = None

    def index_tools(self, tools: List[Dict[str, Any]]):
        """
        Upserts a list of tools into the index.
        tools = [{"id": "...", "name": "...", "description": "...", "source": "db|mcp", "metadata": {...}}]
        """
        self._ensure_connected()
        if not self.collection:
            return

        if not tools:
            return

        ids = []
        documents = []
        metadatas = []
        
        for t in tools:
            # Document content = Name + Description + Args (Schema)
            content = f"Tool: {t.get('name')}\nDescription: {t.get('description')}\nSchema: {json.dumps(t.get('schema', {}))}"
            
            ids.append(str(t.get('id')))
            documents.append(content)
            
            # Metadata for filtering/reconstruction
            meta = t.get('metadata', {}).copy()
            meta['tool_id'] = str(t.get('id')) 
            meta['name'] = t.get('name')
            meta['description'] = t.get('description', '')  # Store description for reconstruction
            meta['source'] = t.get('source', 'unknown')
            
            # Chroma metadata must be simpler types
            if 'schema' in t:
                 meta['schema_json'] = json.dumps(t['schema'])
            
            # Ensure no nested dicts/lists in metadata
            clean_meta = {}
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                else:
                    clean_meta[k] = json.dumps(v)
            metadatas.append(clean_meta)

        # Batch Upsert (adds new, updates existing)
        if ids:
            try:
                self.collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas
                )
                logger.info(f"Upserted {len(ids)} tools into ChromaDB.")
            except Exception as e:
                logger.error(f"Failed to upsert tools into Chroma: {e}")

    def delete_tools(self, ids: List[str]):
        """
        Deletes specific tools from the index by ID.
        """
        self._ensure_connected()
        if not self.collection or not ids:
            return
            
        try:
            self.collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} tools from ChromaDB.")
        except Exception as e:
            logger.error(f"Failed to delete tools from Chroma: {e}")

    def delete_server_tools(self, server_id: str):
        """
        Deletes all tools belonging to a specific MCP server.
        """
        self._ensure_connected()
        if not self.collection:
            return
            
        try:
            # We can find all tools by metadata filtering, then delete by ID
            results = self.collection.get(where={"server_id": str(server_id)})
            if results and results.get("ids"):
                self.collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} MCP tools for server {server_id}.")
        except Exception as e:
            logger.error(f"Failed to delete server tools from Chroma: {e}")

    def query_tools(self, query: str, limit: int = 5, allowed_ids: List[str] = None, allowed_server_ids: List[str] = None, threshold: float = 1.8) -> List[Dict[str, Any]]:
        """
        Semantic search for tools.
        Returns full definition objects reconstructed from metadata/db.
        Adds a relevance threshold check on distances.
        """
        self._ensure_connected()
        if not self.collection:
            return []

        where_filter = None
        
        # Build ChromaDB metadata filter
        id_filter = {"tool_id": {"$in": allowed_ids}} if allowed_ids else None
        server_filter = {"server_id": {"$in": allowed_server_ids}} if allowed_server_ids else None
        
        if id_filter and server_filter:
            where_filter = {"$or": [id_filter, server_filter]}
        elif id_filter:
            where_filter = id_filter
        elif server_filter:
            where_filter = server_filter

        # Request distances as well
        results = self.collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        # Parse results with relevance filtering
        found_tools = []
        if results['ids']:
            ids = results['ids'][0]
            metas = results['metadatas'][0]
            distances = results['distances'][0] if 'distances' in results and results['distances'] else [0.0] * len(ids)
            
            for i, tool_id in enumerate(ids):
                # Filter by distance (lower is closer/more relevant)
                if distances[i] > threshold:
                    logger.debug(f"Skipping tool {metas[i].get('name')} due to relevance threshold: {distances[i]} > {threshold}")
                    continue

                meta = metas[i]
                
                # Reconstruct generic tool definition
                tool_def = {
                    "id": tool_id,
                    "name": meta.get('name'),
                    "source": meta.get('source'),
                    "schema": json.loads(meta.get('schema_json', '{}')),
                    "description": meta.get('description', ''),
                    "metadata": meta,
                    "distance": distances[i]
                }
                found_tools.append(tool_def)
                
        return found_tools

    def get_tools_by_filter(self, allowed_ids: List[str] = None, allowed_server_ids: List[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches all tools matching the allowed IDs or Server IDs directly from Chroma without a semantic query.
        """
        self._ensure_connected()
        if not self.collection:
            return []

        where_filter = None
        id_filter = {"tool_id": {"$in": allowed_ids}} if allowed_ids else None
        server_filter = {"server_id": {"$in": allowed_server_ids}} if allowed_server_ids else None
        
        if id_filter and server_filter:
            where_filter = {"$or": [id_filter, server_filter]}
        elif id_filter:
            where_filter = id_filter
        elif server_filter:
            where_filter = server_filter

        if not where_filter:
            return [] # Don't return all tools if no filter provided in this context

        results = self.collection.get(where=where_filter)
        
        found_tools = []
        if results and results.get('ids'):
            for i, tool_id in enumerate(results['ids']):
                meta = results['metadatas'][i]
                tool_def = {
                    "id": tool_id,
                    "name": meta.get('name'),
                    "source": meta.get('source'),
                    "schema": json.loads(meta.get('schema_json', '{}')),
                    "metadata": meta
                }
                found_tools.append(tool_def)
                
        return found_tools
