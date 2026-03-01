import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config.settings import settings
from typing import Optional


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
    ) -> bool:
        """Send email using SMTP"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.sender_name} <{settings.sender_email}>"
            message["To"] = to_email
            
            # Attach HTML content
            part = MIMEText(html_content, "html")
            message.attach(part)
            
            # Send email
            async with aiosmtplib.SMTP(hostname=settings.smtp_host, port=settings.smtp_port) as smtp:
                await smtp.login(settings.smtp_user, settings.smtp_password)
                await smtp.sendmail(settings.sender_email, to_email, message.as_string())
            
            return True
        except Exception as e:
            return False
    
    @staticmethod
    async def send_verification_email(email: str, verification_token: str) -> bool:
        """Send email verification link"""
        verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Welcome to Prani!</h2>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>Or copy this link: {verification_url}</p>
                <p>This link expires in 24 hours.</p>
            </body>
        </html>
        """
        
        return await EmailService.send_email(email, "Verify Your Email", html_content)
    
    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str) -> bool:
        """Send password reset link"""
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>Or copy this link: {reset_url}</p>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
        </html>
        """
        
        return await EmailService.send_email(email, "Reset Your Password", html_content)


# Create singleton instance
email_service = EmailService()
