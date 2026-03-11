from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional, Dict, Any
import json
import logging
import requests
import re
from fastapi import HTTPException

from models.llm import LLM
from models.secret import LLMSecret
from schemas.llm import LLMCreate, LLMUpdate, LLMEnvVar
from utils.encryption import encrypt_value, decrypt_value

logger = logging.getLogger(__name__)

class LLMService:
    
    def create_llm(self, db: Session, llm_data: LLMCreate, user_id: UUID) -> LLM:
        data = llm_data.dict()
        env_vars = data.pop("environmentVariables", [])
        
        db_llm = LLM(
            owner_id=user_id,
            name=data["name"],
            description=data.get("description"),
            provider=data["provider"],
            model=data["model"],
            headers=json.loads(data["headers"]) if isinstance(data["headers"], str) else data["headers"],
            env_vars=[{"key": e["key"], "isExisting": True} for e in env_vars],
            is_public=data.get("is_public", False)
        )
        db.add(db_llm)
        db.flush()
        
        self._sync_secrets(db, db_llm.id, env_vars)
        
        db.commit()
        db.refresh(db_llm)
        return self._format_response(db_llm)

    def get_llms(self, db: Session, page: int, size: int, search: Optional[str], user_id: UUID):
        query = db.query(LLM).filter(LLM.owner_id == user_id)
        if search:
            query = query.filter(LLM.name.ilike(f"%{search}%"))
        
        total = query.count()
        items = query.order_by(LLM.created_at.desc()).offset((page - 1) * size).limit(size).all()
        
        return {
            "items": [self._format_response(item) for item in items],
            "total": total,
            "page": page,
            "size": size
        }

    def get_llm(self, db: Session, llm_id: UUID) -> Optional[LLM]:
        return db.query(LLM).filter(LLM.id == llm_id).first()

    def update_llm(self, db: Session, llm_id: UUID, update_data: LLMUpdate, user_id: UUID):
        llm = self.get_llm(db, llm_id)
        if not llm:
            return None
        
        data = update_data.dict(exclude_unset=True)
        env_vars = data.pop("environmentVariables", None)
        
        for key, value in data.items():
            if key == "headers" and isinstance(value, str):
                 setattr(llm, key, json.loads(value))
            else:
                 setattr(llm, key, value)
        
        if env_vars is not None:
             llm.env_vars = [{"key": e["key"], "isExisting": True} for e in env_vars]
             self._sync_secrets(db, llm_id, env_vars)
             
        db.commit()
        db.refresh(llm)
        return self._format_response(llm)

    def delete_llm(self, db: Session, llm_id: UUID, user_id: UUID):
        llm = self.get_llm(db, llm_id)
        if llm:
            db.query(LLMSecret).filter(LLMSecret.llm_id == llm_id).delete()
            db.delete(llm)
            db.commit()
            return True
        return False
        
    def test_connection(self, db: Session, provider: str, model: str, headers_json: str, env_vars: List[dict], prompt: str, llm_id: Optional[UUID] = None):
        """
        Adapters for various LLMs.
        """
        # 1. Resolve Secrets
        resolved_secrets = {}
        
        # If we have an ID, fetch existing secrets to resolve masked values
        db_secrets = {}
        if llm_id:
            secrets_query = db.query(LLMSecret).filter(LLMSecret.llm_id == llm_id).all()
            for s in secrets_query:
                try:
                    db_secrets[s.name] = decrypt_value(s.encrypted_value)
                except Exception:
                    db_secrets[s.name] = ""

        # Merge passed env vars with DB secrets
        for env in env_vars:
            key = env["key"]
            value = env["value"] # Helper Pydantic model might be dict here if coming from request
            
            if value == "********" or value == "****************":
                if key in db_secrets:
                    resolved_secrets[key] = db_secrets[key]
                else:
                    # Missing secret
                    resolved_secrets[key] = ""
            else:
                resolved_secrets[key] = value

        # 2. Parse Headers & Apply Env Vars
        headers = {}
        try:
            raw_headers = json.loads(headers_json)
            for k, v in raw_headers.items():
                # Replace {{env.KEY}}
                val_str = str(v)
                for env_key, env_val in resolved_secrets.items():
                    val_str = val_str.replace(f"{{{{env.{env_key}}}}}", env_val)
                headers[k] = val_str
        except json.JSONDecodeError:
            return {"success": False, "error": "Invalid headers JSON"}

        # 3. Provider Adapters
        try:
            if provider == "OpenAI":
                return self._test_openai(model, headers, prompt)
            elif provider == "Gemini":
                return self._test_gemini(model, headers, prompt)
            elif provider == "Anthropic" or provider == "Claude":
                 return self._test_anthropic(model, headers, prompt)
            elif provider == "HuggingFace":
                 return self._test_huggingface(model, headers, prompt)
            else:
                return {"success": False, "error": f"Provider '{provider}' not implemented for testing"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # --- Adapters ---

    def _test_openai(self, model: str, headers: dict, prompt: str):
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 50
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return self._handle_response(resp)

    def _test_gemini(self, model: str, headers: dict, prompt: str):
        # Gemini accepts the key via the x-goog-api-key header or Authorization: Bearer
        # If the user configured it in headers with {{env.KEY}}, it will be injected here.
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return self._handle_response(resp)

    def _test_anthropic(self, model: str, headers: dict, prompt: str):
        url = "https://api.anthropic.com/v1/messages"
        # Ensure anthropic-version header exists if not provided
        if "anthropic-version" not in headers:
            headers["anthropic-version"] = "2023-06-01"
            
        payload = {
            "model": model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return self._handle_response(resp)

    def _test_huggingface(self, model: str, headers: dict, prompt: str):
        # Inference API
        # URL structure often: https://api-inference.huggingface.co/models/<model_id>
        # OR Router: https://router.huggingface.co/v1/chat/completions
        
        # We'll support the Router API (OpenAI compatible) as user requested
        url = "https://router.huggingface.co/v1/chat/completions"
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return self._handle_response(resp)


    def _handle_response(self, resp):
        try:
            data = resp.json()
        except:
            data = resp.text
            
        if resp.status_code >= 400:
            return {
                "success": False, 
                "status": resp.status_code, 
                "error": data
            }
        return {
            "success": True,
            "status": resp.status_code,
            "data": data
        }

    # --- Helpers ---

    def _sync_secrets(self, db: Session, llm_id: UUID, env_vars: List[dict]):
        existing_secrets = {s.name: s for s in db.query(LLMSecret).filter(LLMSecret.llm_id == llm_id).all()}
        current_keys = set()
        
        for env in env_vars:
            key = env["key"]
            value = env["value"]
            current_keys.add(key)
            
            if value == "********" or value == "****************":
                 continue
                 
            encrypted = encrypt_value(value)
            
            if key in existing_secrets:
                existing_secrets[key].encrypted_value = encrypted
            else:
                new_secret = LLMSecret(llm_id=llm_id, name=key, encrypted_value=encrypted)
                db.add(new_secret)
        
        for key, secret in existing_secrets.items():
            if key not in current_keys:
                db.delete(secret)

    def _format_response(self, llm: LLM):
        response_env = []
        if llm.env_vars:
            for item in llm.env_vars:
                # Basic structure
                response_env.append({
                    "key": item.get("key"),
                    "value": "****************",
                    "isPassword": True,
                    "isExisting": True
                })
        
        headers_str = json.dumps(llm.headers, indent=2)
        
        return {
            "id": llm.id,
            "owner_id": llm.owner_id,
            "name": llm.name,
            "description": llm.description,
            "provider": llm.provider,
            "model": llm.model,
            "headers": headers_str,
            "environmentVariables": response_env,
            "is_public": llm.is_public,
            "created_at": llm.created_at,
            "updated_at": llm.updated_at
        }
        
llm_service = LLMService()
