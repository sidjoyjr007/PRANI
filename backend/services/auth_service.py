from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate
from utils.password import hash_password, verify_password
from utils.token import (
    create_access_token,
    create_refresh_token,
    create_verification_token,
    create_reset_token,
    decode_token,
    verify_token_type,
)
from services.email_service import email_service
from typing import Optional, Tuple


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> Optional[User]:
        """Create a new user"""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            return None
        
        # Create new user
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    async def send_verification_email(db: Session, user: User) -> bool:
        """Send verification email"""
        token = create_verification_token(str(user.id))
        return await email_service.send_verification_email(user.email, token)
    
    @staticmethod
    def verify_email(db: Session, token: str) -> Optional[User]:
        """Verify email with token"""
        if not verify_token_type(token, "verify"):
            return None
        
        payload = decode_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None
        
        user.is_verified = True
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    async def send_password_reset_email(db: Session, email: str) -> bool:
        """Send password reset email"""
        user = AuthService.get_user_by_email(db, email)
        if not user:
            # For security, don't reveal if email exists
            return True
        
        token = create_reset_token(str(user.id))
        return await email_service.send_password_reset_email(user.email, token)
    
    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> Optional[User]:
        """Reset password with token"""
        if not verify_token_type(token, "reset"):
            return None
        
        payload = decode_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None
        
        user.password_hash = hash_password(new_password)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_tokens(user_id: str) -> Tuple[str, str]:
        """Create access and refresh tokens"""
        access_token = create_access_token(user_id)
        refresh_token = create_refresh_token(user_id)
        return access_token, refresh_token


# Create singleton instance
auth_service = AuthService()
