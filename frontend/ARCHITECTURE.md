# Frontend Architecture - Complete Setup

## Project Structure

```
src/
├── context/
│   ├── ThemeContext.jsx        # Centralized theme system
│   └── AuthContext.jsx         # Authentication state management
├── pages/
│   ├── LoginPage.jsx           # User login
│   ├── SignupPage.jsx          # User registration
│   ├── ForgotPasswordPage.jsx   # Password reset request
│   ├── ResetPasswordPage.jsx    # Password reset with token
│   └── DashboardPage.jsx        # Main authenticated page
├── components/
│   ├── ProtectedRoute.jsx       # Route guard for authenticated pages
│   └── ui/
│       ├── button.jsx           # Button with states (hover, active, focus, disabled)
│       ├── input.jsx            # Input with focus/hover states
│       ├── label.jsx            # Label with cursor states
│       └── card.jsx
├── services/
│   └── api.js                   # API client with all endpoints
├── App.jsx                      # Router setup
└── main.jsx                     # App entry with providers
```

## Authentication Flow

### Endpoints Integrated
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Clear auth tokens
- `GET /auth/me` - Get current user
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/refresh` - Refresh access token

### Auth Flow
1. **Public Routes**: Login, Signup, Forgot Password, Reset Password
   - Redirect to Dashboard if already authenticated
   
2. **Protected Routes**: Dashboard (and future pages)
   - Redirect to Login if not authenticated
   - Show loading state while checking auth

3. **Token Management**
   - HTTP-only cookies (secure in production)
   - Automatic token refresh on failed requests
   - Logout clears all tokens

## Component States & Behaviors

### Button Component
- **Base**: cursor: pointer, transition animations
- **Hover**: opacity 0.9, translateY up, shadow
- **Active**: translateY down, lighter shadow
- **Focus**: ring shadow (3px)
- **Disabled**: cursor: not-allowed, opacity 0.5

### Input Component
- **Base**: cursor: text, transition
- **Hover**: border color changes to primary/50%
- **Focus**: border primary color, ring shadow
- **Disabled**: greyed out background, opacity 0.6

### Label Component
- **Base**: cursor: default
- **Hover (when linked)**: cursor: pointer, opacity 0.9

## Theme System

### Color Management
All colors come from CSS variables in `/src/index.css`:
- **Primary**: Black (#000)
- **Secondary**: Dark grey
- **Background**: White/Light
- **Foreground**: Black/Dark
- **Muted**: Light grey (95%)
- **Success**: Green
- **Destructive**: Red
- **Warning**: Amber

### Theme Objects
```javascript
{
  colors: { primary, secondary, background, foreground, ... },
  spacing: { xs, sm, md, lg, xl },
  sizes: { cardMaxWidth, borderRadius, ... },
  typography: { title, label, body },
  transitions: { default, fast, slow },
  states: { button, input, link, card },
  cursors: { ... }
}
```

## Page Components

### LoginPage
- Email/Password validation
- Error/Success messages
- Links to Signup and Forgot Password
- Uses `useAuth` hook for login

### SignupPage
- Email/Password/Confirm Password fields
- Password confirmation validation
- Email uniqueness check via API
- Verification email notification

### ForgotPasswordPage
- Email input only
- Sends reset link via email
- Success message with redirect

### ResetPasswordPage
- Requires token from URL query param
- New password + confirm password
- Password validation
- Redirects to login on success

### DashboardPage
- Protected route - requires authentication
- User info display
- Logout button
- Account status (verified/pending)

## API Integration

### AuthContext provides:
```javascript
const {
  user,                // Current user object
  isAuthenticated,     // Boolean
  isLoading,          // Boolean
  error,              // Error message string
  signup,             // (email, password) => Promise
  login,              // (email, password) => Promise
  logout,             // () => Promise
  verifyEmail,        // (token) => Promise
  forgotPassword,     // (email) => Promise
  resetPassword,      // (token, newPassword) => Promise
} = useAuth()
```

## Security Features

✅ HTTP-only cookies for token storage
✅ CSRF protection (samesite: lax)
✅ Secure flag in production
✅ Email verification required before login
✅ Token expiration and refresh
✅ Protected routes with auth check
✅ Loading states during auth operations

## No Hardcoded Values

✅ All colors from theme context
✅ All spacing from theme context
✅ All typography from theme context
✅ All component states managed internally
✅ All API endpoints centralized
✅ All routes managed by React Router
