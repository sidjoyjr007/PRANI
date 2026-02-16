# Environment Configuration

Create a `.env.local` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8000
```

The frontend expects the backend to be running on `http://localhost:8000`.

## CORS Configuration

Make sure your FastAPI backend has CORS enabled for localhost:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Running the Application

1. **Terminal 1 - Backend (FastAPI)**
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

2. **Terminal 2 - Frontend (Vite React)**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## API Request Flow

1. User fills form and submits
2. Page calls `useAuth()` hook (e.g., `login(email, password)`)
3. Hook calls API via `apiClient` (axios instance)
4. Request includes cookies (withCredentials: true)
5. Backend validates and returns tokens in HTTP-only cookies
6. Frontend updates `AuthContext` with user data
7. `ProtectedRoute` checks `isAuthenticated` and allows access

## Token Lifecycle

1. **Login**: Backend sets `access_token` and `refresh_token` cookies
2. **Authenticated Requests**: Cookies sent automatically with every request
3. **Token Expired**: `GET /auth/me` will fail, trigger login redirect
4. **Logout**: Backend clears both cookie values
5. **Refresh**: `POST /auth/refresh` gets new access token

## Debugging

Check browser DevTools:
- **Network**: See all API requests and responses
- **Application/Storage**: View cookies (should see `access_token` and `refresh_token` as HTTP-only)
- **Console**: Check for any auth errors
