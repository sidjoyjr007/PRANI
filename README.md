# Prani - Secure Authentication System

A full-stack authentication application with a modern frontend and secure backend.

## Project Structure

```
Prani/
├── frontend/          # React + Vite application
├── backend/           # Python FastAPI server
└── docker-compose.yml # Database and services orchestration
```

## Features

### Frontend
- React + Vite for fast development
- Shadcn UI components with default theme
- React Router for navigation
- Redux JS for state management
- Pages: Login, Signup, Forgot Password, Reset Password, Verify Email, Home

### Backend
- Python FastAPI server
- JWT access tokens + refresh tokens
- HTTP-only secure cookies
- Email verification via SMTP
- PostgreSQL database (Docker)
- Fully modularized architecture
- Security best practices implemented

## Security Features

✅ HTTP-only cookies for token storage  
✅ JWT tokens (access + refresh)  
✅ CORS properly configured  
✅ Password hashing (bcrypt)  
✅ Email verification  
✅ Rate limiting  
✅ CSRF protection  
✅ Input validation & sanitization  
✅ Secure password reset flow  
✅ SQL injection prevention (ORM)  

## Getting Started

### Prerequisites
- Node.js 16+ (Frontend)
- Python 3.9+ (Backend)
- Docker & Docker Compose

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Database Setup
```bash
docker-compose up -d
```

## Next Steps

1. ✅ Create folder structure
2. Next: Set up Frontend (React + Vite)
