from sqlalchemy.orm import Session
from models.tool import Tool
from models.secret import UserToolSecret
from schemas.tool import ToolCreate, ToolUpdate, ToolSecretCreate
from utils.encryption import encrypt_value, decrypt_value
from uuid import UUID
from typing import Optional, List


class ToolService:
    """Service for managing tools"""

    def create_tool(self, db: Session, tool_data: ToolCreate, owner_id: UUID) -> Tool:
        """Create a new tool and optionally set initial secrets"""
        # Convert Pydantic models to dicts for JSONB storage
        data = tool_data.model_dump()
        
        # Extract secrets to handle separately
        secrets = data.pop('secrets', None)
        
        # Ensure json compatibility for list of models
        if 'input_fields' in data:
            data['input_fields'] = [f for f in data['input_fields']]
        if 'env_var_defs' in data:
            data['env_var_defs'] = [f for f in data['env_var_defs']]

        db_tool = Tool(
            **data,
            owner_id=owner_id
        )
        db.add(db_tool)
        db.commit()
        db.refresh(db_tool)
        
        # Save secrets if provided
        if secrets:
            for name, value in secrets.items():
                self.save_secret(db, db_tool.id, owner_id, ToolSecretCreate(name=name, value=value))
                
        return db_tool

    def get_tool(self, db: Session, tool_id: UUID) -> Optional[Tool]:
        """Get a tool by ID"""
        return db.query(Tool).filter(Tool.id == tool_id).first()

    def get_tools(
        self, 
        db: Session, 
        page: int = 1, 
        size: int = 10, 
        search: Optional[str] = None, 
        owner_id: Optional[UUID] = None
    ) -> dict:
        """List tools with pagination and search"""
        query = db.query(Tool)
        
        if owner_id:
            query = query.filter(Tool.owner_id == owner_id)
            
        if search:
            # Case insensitive partial match on name or description
            search_query = f"%{search}%"
            query = query.filter(
                (Tool.name.ilike(search_query)) | 
                (Tool.description.ilike(search_query))
            )
            
        total = query.count()
        
        skip = (page - 1) * size
        items = query.order_by(Tool.created_at.desc()).offset(skip).limit(size).all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size
        }

    def update_tool(self, db: Session, tool_id: UUID, tool_update: ToolUpdate, owner_id: UUID) -> Optional[Tool]:
        """Update a tool"""
        db_tool = self.get_tool(db, tool_id)
        if not db_tool or db_tool.owner_id != owner_id:
            return None
        
        update_data = tool_update.model_dump(exclude_unset=True)
        
        # Handle secrets
        if 'secrets' in update_data:
            secrets = update_data.pop('secrets')
            if secrets:
                for name, value in secrets.items():
                    self.save_secret(db, tool_id, owner_id, ToolSecretCreate(name=name, value=value))
        
        # Handle list serialization
        if 'input_fields' in update_data:
            update_data['input_fields'] = [f for f in update_data['input_fields']]
        if 'env_var_defs' in update_data:
            update_data['env_var_defs'] = [f for f in update_data['env_var_defs']]

        for key, value in update_data.items():
            setattr(db_tool, key, value)
            
        db.commit()
        db.refresh(db_tool)
        return db_tool

    def delete_tool(self, db: Session, tool_id: UUID, owner_id: UUID) -> bool:
        """Delete a tool"""
        db_tool = self.get_tool(db, tool_id)
        if not db_tool or db_tool.owner_id != owner_id:
            return False
        
        # Secrets cascade delete? DB constraints might handle or we do it manually
        # SQLAlchemy cascade should handle if configured, else manual:
        db.query(UserToolSecret).filter(UserToolSecret.tool_id == tool_id).delete()
        
        db.delete(db_tool)
        db.commit()
        return True

    def save_secret(self, db: Session, tool_id: UUID, user_id: UUID, secret_data: ToolSecretCreate):
        """Encrypt and save a user's secret for a tool"""
        # Check if secret already exists
        existing_secret = db.query(UserToolSecret).filter(
            UserToolSecret.tool_id == tool_id,
            UserToolSecret.user_id == user_id,
            UserToolSecret.name == secret_data.name
        ).first()

        encrypted = encrypt_value(secret_data.value)

        if existing_secret:
            existing_secret.encrypted_value = encrypted
        else:
            new_secret = UserToolSecret(
                tool_id=tool_id,
                user_id=user_id,
                name=secret_data.name,
                encrypted_value=encrypted
            )
            db.add(new_secret)
        
        db.commit()
        return True

    def get_decrypted_secrets(self, db: Session, tool_id: UUID, user_id: UUID) -> dict:
        """
        Retrieve all secrets for a tool/user and decrypt them.
        INTERNAL USE ONLY for tool execution.
        """
        secrets = db.query(UserToolSecret).filter(
            UserToolSecret.tool_id == tool_id,
            UserToolSecret.user_id == user_id
        ).all()
        
        return {s.name: decrypt_value(s.encrypted_value) for s in secrets}

tool_service = ToolService()
