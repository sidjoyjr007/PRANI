import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Container from "@/components/Container"

export default function HomePage() {
  const theme = useTheme()
  
  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: theme.spacing[12], marginTop: theme.spacing[8] }}>
          <h1 style={{ fontSize: theme.typography.fontSize.xl3, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing[4], color: theme.colors.primary[600] }}>Welcome to Prani</h1>
          <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.muted_foreground }}>
            Sign in or create an account to get started
          </p>
        </div>

        {/* CTA Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: theme.spacing[8], marginBottom: theme.spacing[12] }}>
          <Card variant="default" style={{ textAlign: "center" }}>
            <CardContent style={{ padding: theme.spacing[8] }}>
              <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[3], color: theme.colors.foreground }}>Already have an account?</h2>
              <p style={{ color: theme.colors.muted_foreground, marginBottom: theme.spacing[6], margin: 0 }}>
                Sign in to access your account and dashboard
              </p>
              <Link to="/login" style={{ textDecoration: "none", display: "block", marginTop: theme.spacing[6] }}>
                <Button variant="primary" size="md" style={{ width: "100%" }}>
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="default" style={{ textAlign: "center" }}>
            <CardContent style={{ padding: theme.spacing[8] }}>
              <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[3], color: theme.colors.foreground }}>New user?</h2>
              <p style={{ color: theme.colors.muted_foreground, marginBottom: theme.spacing[6], margin: 0 }}>
                Create a new account and start using our app today
              </p>
              <Link to="/signup" style={{ textDecoration: "none", display: "block", marginTop: theme.spacing[6] }}>
                <Button variant="secondary" size="md" style={{ width: "100%" }}>
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card variant="default">
          <CardContent style={{ padding: theme.spacing[8] }}>
            <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[6], color: theme.colors.foreground }}>Features</h2>
            <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing[4], listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ color: theme.colors.muted_foreground }}>✓ Secure authentication</li>
              <li style={{ color: theme.colors.muted_foreground }}>✓ Email verification</li>
              <li style={{ color: theme.colors.muted_foreground }}>✓ Password reset</li>
              <li style={{ color: theme.colors.muted_foreground }}>✓ User dashboard</li>
            </ul>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
