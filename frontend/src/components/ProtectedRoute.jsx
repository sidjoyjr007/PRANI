import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth()
  const theme = useTheme()

  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <div style={{ color: theme.colors.foreground }}>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth()
  const theme = useTheme()

  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <div style={{ color: theme.colors.foreground }}>Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/work" replace />
  }

  return children
}
