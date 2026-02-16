import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFoundPage() {
  const theme = useTheme()

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background, padding: theme.spacing[4] }}>
      <Card variant="default" style={{ maxWidth: "420px", width: "100%" }}>
        <CardContent style={{ padding: theme.spacing[12], textAlign: "center" }}>
          <div style={{ marginBottom: theme.spacing[6] }}>
            <h1 style={{ fontSize: "60px", fontWeight: theme.typography.fontWeight.bold, margin: 0, color: theme.colors.primary[600] }}>404</h1>
            <h2 style={{ fontSize: theme.typography.fontSize.xl2, fontWeight: theme.typography.fontWeight.semibold, margin: `${theme.spacing[3]} 0`, color: theme.colors.foreground }}>Page Not Found</h2>
          </div>

          <p style={{ color: theme.colors.muted_foreground, marginBottom: theme.spacing[6], margin: 0 }}>
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <Link to="/login" style={{ display: "block", textDecoration: "none", marginTop: theme.spacing[4] }}>
            <Button variant="primary" size="md" style={{ width: "100%" }}>
              Go Back to Login
            </Button>
          </Link>

          <div style={{ marginTop: theme.spacing[6], fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            <p style={{ margin: 0 }}>
              Need help?{" "}
              <Link 
                to="/login" 
                style={{ 
                  color: theme.colors.primary[600],
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "text-decoration 250ms ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
