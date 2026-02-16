# Prani - Full Stack Authentication System - Implementation Plan

## Overview
A secure, modularized full-stack authentication application with:
- **Frontend**: React + Vite + Shadcn UI + React Router + Redux JS
- **Backend**: Python (FastAPI) + PostgreSQL + JWT + SMTP
- **Security**: Best practices throughout

---

## PHASE 1: Backend Setup (Python + FastAPI)

### Step 1.1: Project Structure
```
backend/
├── main.py                 # Entry point
├── requirements.txt        # Dependencies
├── .env.example           # Environment variables
├── .gitignore
├── config/
│   ├── __init__.py
│   ├── settings.py        # Configuration
│   └── database.py        # DB connection
├── models/
│   ├── __init__.py
│   └── user.py            # User ORM model
├── schemas/
│   ├── __init__.py
│   └── user.py            # Pydantic schemas
├── routes/
│   ├── __init__.py
│   └── auth.py            # Auth endpoints
├── services/
│   ├── __init__.py
│   ├── auth_service.py    # Auth logic
│   ├── email_service.py   # Email sending
│   └── token_service.py   # JWT handling
├── middleware/
│   ├── __init__.py
│   └── security.py        # Security checks
└── utils/
    ├── __init__.py
    └── password.py        # Password hashing
```

### Step 1.2: Core Dependencies
- FastAPI
- SQLAlchemy (ORM)
- Alembic (Migrations)
- Pydantic
- python-jose (JWT)
- passlib + bcrypt (Password hashing)
- python-multipart
- aiosmtplib (Email)
- python-dotenv
- psycopg2-binary (PostgreSQL)
- cors (CORS)

### Step 1.3: Security Features
- ✅ HTTP-only cookies
- ✅ JWT access token (short-lived)
- ✅ JWT refresh token (long-lived)
- ✅ Password hashing (bcrypt)
- ✅ Email verification with tokens
- ✅ Secure password reset flow
- ✅ CORS configuration
- ✅ Input validation
- ✅ Rate limiting
- ✅ SQL injection prevention (SQLAlchemy)

---

## PHASE 2: Database Setup (PostgreSQL + Docker)

### Step 2.1: Docker Compose Configuration
```
docker-compose.yml
- PostgreSQL service
- Environment variables
- Volume persistence
```

### Step 2.2: Database Models
- User table with:
  - id (UUID primary key)
  - email (unique)
  - password_hash
  - is_verified (email verification flag)
  - is_active
  - created_at, updated_at

---

## PHASE 3: Frontend Setup (React + Vite)

### Step 3.1: Project Structure
```
frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css          # Global styles
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── store/            # Redux store
│   ├── services/         # API calls
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Helpers
│   └── ui/               # Shadcn components
```

### Step 3.2: Core Dependencies
- react, react-dom
- react-router-dom
- redux, react-redux, @reduxjs/toolkit
- axios
- shadcn/ui (with default theme)
- tailwindcss
- zod (validation)
- lucide-react (icons)

### Step 3.3: Pages
1. **Login** - Email & password with remember me
2. **Signup** - Email, password, validation
3. **Forgot Password** - Email submission
4. **Reset Password** - Token-based password reset
5. **Verify Email** - Email verification page
6. **Home** - Protected route after login

### Step 3.4: State Management (Redux)
- Auth slice:
  - user state
  - authentication status
  - loading state
  - error messages
  - token management

### Step 3.5: Security Features
- ✅ Axios with credentials (cookies)
- ✅ Protected routes with middleware
- ✅ Form validation (Zod)
- ✅ Secure cookie handling
- ✅ CSRF tokens (via cookies)
- ✅ Token refresh interceptor

---

## PHASE 4: Integration

### Step 4.1: API Endpoints
```
POST   /api/auth/signup           - Create new account
POST   /api/auth/login            - User login
POST   /api/auth/logout           - User logout
POST   /api/auth/refresh          - Refresh access token
GET    /api/auth/me               - Get current user
POST   /api/auth/verify-email     - Verify email
POST   /api/auth/forgot-password  - Send reset email
POST   /api/auth/reset-password   - Reset password with token
```

### Step 4.2: Cookie Strategy
- Access token: Short-lived (15 mins), HTTP-only, Secure
- Refresh token: Long-lived (7 days), HTTP-only, Secure
- Storage: Cookies only (no localStorage)

### Step 4.3: Error Handling
- Consistent error responses
- Proper HTTP status codes
- User-friendly error messages

---

## Implementation Order

1. ✅ Plan (THIS FILE)
2. Backend Phase 1: Project structure
3. Backend Phase 2: Database setup
4. Backend Phase 3: Authentication logic
5. Docker compose + PostgreSQL
6. Frontend Phase 1: Project structure
7. Frontend Phase 2: Components & pages
8. Frontend Phase 3: Redux + API integration
9. Testing & security review
10. Documentation

---

## Security Checklist

- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens signed with secret
- [ ] Refresh token rotation
- [ ] Email verification required
- [ ] Password reset tokens expire
- [ ] CORS restricted to frontend
- [ ] HTTPS in production
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all inputs
- [ ] SQL injection prevention
- [ ] XSS protection (React handles)
- [ ] CSRF protection
- [ ] Secure cookie flags set
- [ ] Environment variables for secrets
- [ ] No sensitive data in logs

---

## Next Step
Ready to start **Step 1: Backend project structure**?
