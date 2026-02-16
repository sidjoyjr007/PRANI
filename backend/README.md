# Prani Backend - Python FastAPI

Secure authentication backend with JWT, email verification, and password reset functionality.

## Features

✅ User registration and login  
✅ Email verification  
✅ JWT access & refresh tokens (HTTP-only cookies)  
✅ Secure password reset flow  
✅ Password hashing with bcrypt  
✅ CORS configuration  
✅ PostgreSQL database  
✅ SMTP email sending  
✅ Fully modularized architecture  
✅ Security best practices  

## Project Structure

```
backend/
├── config/
│   ├── settings.py        # Configuration from environment
│   └── database.py        # Database connection
├── models/
│   └── user.py            # SQLAlchemy User model
├── schemas/
│   └── user.py            # Pydantic request/response schemas
├── routes/
│   └── auth.py            # Authentication endpoints
├── services/
│   ├── auth_service.py    # Authentication logic
│   └── email_service.py   # Email sending logic
├── middleware/
│   └── security.py        # JWT validation & authorization
├── utils/
│   ├── password.py        # Password hashing
│   └── token.py           # JWT token creation/validation
├── main.py                # FastAPI application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── .env.example          # Example environment variables
```

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Key settings:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Change to a strong random string (min 32 chars)
- `SMTP_*`: Email configuration (Gmail or other SMTP provider)

### 4. Start PostgreSQL

```bash
docker-compose up -d
```

### 5. Create Database Tables

Tables are automatically created when the app starts.

### 6. Run Development Server

```bash
python main.py
```

Server runs at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Email & Password

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

## Security Features

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- No plaintext passwords stored
- Password reset tokens expire in 1 hour

### Token Security
- JWT tokens signed with HS256
- Access tokens: 15 minutes (short-lived)
- Refresh tokens: 7 days (long-lived)
- Tokens stored in HTTP-only cookies
- Secure flag set in production
- SameSite=Lax for CSRF protection

### Email Security
- Email verification required before login
- Verification tokens expire in 24 hours
- Verification tokens are single-use

### API Security
- CORS restricted to frontend origins
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- Rate limiting ready (implement in production)
- No sensitive data in logs

### Database Security
- Password hashes never logged
- User IDs use UUID
- Created/updated timestamps for audit
- Email field indexed and unique

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

### Other SMTP Providers

Update `SMTP_HOST` and `SMTP_PORT` accordingly:
- SendGrid: smtp.sendgrid.net:587
- Mailgun: smtp.mailgun.org:587
- AWS SES: email-smtp.region.amazonaws.com:587

## Environment Variables

See `.env.example` for all available options.

### Critical Settings (Change in Production)

- `JWT_SECRET_KEY`: Generate with `openssl rand -hex 32`
- `DEBUG`: Set to False in production
- `ALLOWED_ORIGINS`: Add production frontend URL
- `SECURE` cookie flag: Automatically enabled when DEBUG=False

## Development Tips

### Reset Database

```bash
# Stop PostgreSQL
docker-compose down

# Remove volume
docker volume rm prani_postgres_data

# Restart
docker-compose up -d
```

### View Database

```bash
docker exec -it prani_postgres psql -U prani_user -d prani_db
```

### Test Email Sending

```python
from services.email_service import email_service
import asyncio

asyncio.run(email_service.send_email(
    "test@example.com",
    "Test Subject",
    "<h1>Test</h1>"
))
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "detail": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid token)
- 403: Forbidden (email not verified)
- 409: Conflict (email already exists)
- 500: Internal Server Error

## Next Steps

1. ✅ Backend setup complete
2. Next: Frontend (React + Vite)
