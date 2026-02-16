# Quick Reference Guide

## Pages Overview

| Page | Route | Type | Purpose |
|------|-------|------|---------|
| Login | `/login` | Public | User authentication |
| Signup | `/signup` | Public | New account creation |
| Forgot Password | `/forgot-password` | Public | Password reset request |
| Reset Password | `/reset-password?token=xxx` | Public | Set new password |
| Dashboard | `/dashboard` | Protected | Main authenticated area |

## Using useAuth Hook

```javascript
import { useAuth } from "@/context/AuthContext"

function MyComponent() {
  const {
    user,              // { id, email, is_verified, created_at, ... }
    isAuthenticated,   // boolean
    isLoading,         // boolean
    error,             // string or ""
    login,             // async (email, password)
    logout,            // async ()
    signup,            // async (email, password)
    forgotPassword,    // async (email)
    resetPassword,     // async (token, newPassword)
    verifyEmail,       // async (token)
  } = useAuth()

  // Example login
  const handleLogin = async () => {
    const result = await login(email, password)
    if (result.success) {
      // User logged in, AuthContext updated
    } else {
      // Show error: result.message
    }
  }
}
```

## Using useTheme Hook

```javascript
import { useTheme } from "@/context/ThemeContext"

function MyComponent() {
  const theme = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      fontSize: theme.typography.body.fontSize,
    }}>
      {/* All styling from theme */}
    </div>
  )
}
```

## Creating Protected Pages

```javascript
import { ProtectedRoute } from "@/components/ProtectedRoute"
import MyPage from "@/pages/MyPage"

// In App.jsx Routes:
<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

## Adding New Pages with Theme

```javascript
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function MyPage() {
  const theme = useTheme()
  const { user, logout } = useAuth()

  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <Card style={{ ...theme.styles.card }}>
        <CardHeader>
          <CardTitle style={{ color: theme.colors.foreground }}>
            Hello {user?.email}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={logout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Component State Management

Components manage their own states internally:

### Button
```javascript
<Button
  onClick={handleClick}
  disabled={isLoading}
  style={{
    backgroundColor: theme.colors.primary,
    color: theme.colors.primaryForeground,
  }}
>
  Click me
</Button>
```
- Automatically handles: hover, active, focus, disabled states
- No need to track state in parent

### Input
```javascript
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter email"
/>
```
- Automatically handles: focus, hover states
- Shows ring shadow on focus
- No state needed in parent

### Label
```javascript
<Label htmlFor="email">Email Address</Label>
```
- Shows pointer cursor when linked to input
- No additional styling needed

## API Response Handling

```javascript
const result = await login(email, password)

// result = {
//   success: true/false,
//   message: "error or success message"
// }

if (result.success) {
  // Navigate away, show success, etc
} else {
  // Show error message to user
  setError(result.message)
}
```

## Color Reference

```
Primary (Black):         theme.colors.primary
Secondary (Dark Grey):   theme.colors.secondary
Background (White):      theme.colors.background
Foreground (Black):      theme.colors.foreground
Muted (Light Grey):      theme.colors.muted
Accent:                  theme.colors.accent
Success (Green):         theme.colors.success
Destructive (Red):       theme.colors.destructive
Warning (Amber):         theme.colors.warning
Card:                    theme.colors.card
Border:                  theme.colors.border
Input:                   theme.colors.input
```

## Spacing Scale

```
theme.spacing.xs = 0.25rem (4px)
theme.spacing.sm = 0.5rem  (8px)
theme.spacing.md = 1rem    (16px)
theme.spacing.lg = 1.5rem  (24px)
theme.spacing.xl = 2rem    (32px)
```

## Typography Styles

```javascript
theme.typography.title        // { fontSize, fontWeight }
theme.typography.label        // { fontSize, fontWeight }
theme.typography.body         // { fontSize, fontWeight }
```

## Common Patterns

### Form with Validation
```javascript
const [email, setEmail] = useState("")
const [error, setError] = useState("")

const handleSubmit = async (e) => {
  e.preventDefault()
  setError("")
  
  if (!email) {
    setError("Email required")
    return
  }
  
  const result = await someAuthMethod(email)
  if (!result.success) {
    setError(result.message)
  }
}
```

### Redirect After Action
```javascript
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

const result = await login(email, password)
if (result.success) {
  setTimeout(() => navigate("/dashboard"), 1500)
}
```

### Loading States
```javascript
const { isLoading } = useAuth()

<Input disabled={isLoading} />
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```
