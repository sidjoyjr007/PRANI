from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
import secrets
import hashlib
from config.database import get_db
from config.settings import settings
from schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
)
from services.auth_service import auth_service
from middleware.security import get_current_user
from models.user import User
from utils.token import decode_token, verify_token_type

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = auth_service.create_user(db, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user",
        )
    
    # Send verification email (non-blocking - continue even if it fails)
    email_sent = False
    try:
        await auth_service.send_verification_email(db, user)
        email_sent = True
        message = "User created successfully. Please check your email to verify your account."
    except Exception as e:
        message = "User created successfully. Please use the verify-email-dev endpoint to verify your email."
    
    return {
        "message": message,
        "email": user.email,
        "email_sent": email_sent,
        "user": UserResponse.from_orm(user),
    }


@router.post("/login", response_model=dict)
def login(
    credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    """Login user"""
    
    user = auth_service.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in.",
        )
    
    # Create tokens
    access_token, refresh_token = auth_service.create_tokens(str(user.id))
    
    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        httponly=True,
        secure=not settings.debug,  # Only secure in production
        samesite="lax",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
    )
    
    return {
        "message": "Logged in successfully",
        "user": UserResponse.from_orm(user),
        "access_token": access_token,
    }


@router.post("/logout")
def logout(response: Response):
    """Logout user"""
    
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=dict)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    
    return {
        "user": UserResponse.from_orm(current_user),
    }


@router.post("/refresh", response_model=dict)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Refresh access token using refresh token from cookies"""
    
    refresh_token_value = request.cookies.get("refresh_token")
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
        )
    
    payload = decode_token(refresh_token_value)
    if not payload or not verify_token_type(refresh_token_value, "refresh"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new access token
    new_access_token, new_refresh_token = auth_service.create_tokens(str(user.id))
    
    # Set new tokens in cookies
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
    )
    
    return {"message": "Token refreshed", "access_token": new_access_token}


@router.post("/verify-email", response_model=dict)
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify user email"""
    
    user = auth_service.verify_email(db, data.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    
    return {
        "message": "Email verified successfully",
        "user": UserResponse.from_orm(user),
    }


@router.post("/send-verification-email", response_model=dict)
async def send_verification_email(
    data: dict,
    db: Session = Depends(get_db),
):
    """Send verification email to user"""
    
    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified",
        )
    
    try:
        await auth_service.send_verification_email(db, user)
        return {
            "message": "Verification email sent successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email",
        )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Request password reset"""
    
    # Send reset email
    await auth_service.send_password_reset_email(db, data.email)
    
    # Always return success to prevent email enumeration
    return {
        "message": "If an account with that email exists, a password reset link has been sent.",
    }


@router.post("/reset-password", response_model=dict)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Reset password with token"""
    
    user = auth_service.reset_password(db, data.token, data.new_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    
    return {
        "message": "Password reset successfully. Please login with your new password.",
        "user": UserResponse.from_orm(user),
    }


@router.post("/verify-email-dev", response_model=dict)
def verify_email_dev(email: str, db: Session = Depends(get_db)):
    """
    DEV ONLY: Verify email without token (for development/testing)
    Remove this endpoint in production
    """
    if not settings.debug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in debug mode",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_verified = True
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Email verified successfully (dev mode)",
        "user": UserResponse.from_orm(user),
    }

@router.get("/api-key", response_model=dict)
def get_api_key_status(current_user: User = Depends(get_current_user)):
    """Check if the user has an API key set"""
    return {
        "has_api_key": current_user.api_key_hash is not None
    }

@router.post("/api-key/rotate", response_model=dict)
def rotate_api_key(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate a new API key for the user"""
    api_key = secrets.token_urlsafe(32)
    api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    
    current_user.api_key_hash = api_key_hash
    db.commit()
    
    return {
        "api_key": api_key,
        "message": "New API key generated. Please save it now, it will not be shown again."
    }
