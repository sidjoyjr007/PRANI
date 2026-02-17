from sqlalchemy import Column, String, ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from config.database import Base


class UserToolSecret(Base):
    """
    Stores encrypted secrets for tools on a per-user basis.
    Example: User A's API Key for Tool X.
    """
    __tablename__ = "user_tool_secrets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tool_id = Column(UUID(as_uuid=True), ForeignKey("tools.id"), nullable=False)
    
    name = Column(String(255), nullable=False)     # e.g., "OPENAI_API_KEY"
    encrypted_value = Column(String, nullable=False) # e.g., "gAAAAABl..."
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="tool_secrets")
    tool = relationship("Tool", backref="user_secrets")
    
    # Constraints: One value per variable per tool per user
    __table_args__ = (
        UniqueConstraint('user_id', 'tool_id', 'name', name='uq_user_tool_secret'),
    )

    def __repr__(self):
        return f"<UserToolSecret {self.name}>"
