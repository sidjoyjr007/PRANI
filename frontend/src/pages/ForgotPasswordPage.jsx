import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import AuthLayout from "@/components/AuthLayout"

export default function ForgotPasswordPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { forgotPassword, isLoading } = useAuth()
  
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Please enter your email")
      return
    }

    const result = await forgotPassword(email)
    if (result.success) {
      setSuccess("Reset link sent to your email!")
      setTimeout(() => navigate("/login"), 2000)
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout>
      <Card variant="default" style={{ maxWidth: "420px", margin: "0 auto", width: "100%", backgroundColor: "white", padding: theme.spacing[8], borderRadius: theme.borderRadius.lg }}>
        <CardHeader style={{ paddingBottom: theme.spacing[6], marginBottom: theme.spacing[6], borderBottomWidth: "1px", borderBottomColor: theme.colors.neutral[200] }}>
          <CardTitle style={{ fontSize: theme.typography.fontSize.xl2, textAlign: "center", marginBottom: theme.spacing[2], color: theme.colors.foreground }}>
            Forgot Password
          </CardTitle>
          <CardDescription style={{ textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
            <div>
              <Text 
                as="label" 
                htmlFor="email"
                variant="label" 
                size="sm"
                style={{ display: "block", marginBottom: theme.spacing[2] }}
              >
                Email Address *
              </Text>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                size="lg"
              />
            </div>

            {error && (
              <Alert 
                variant="default"
                title="Error"
                description={error}
                status="destructive"
              />
            )}

            {success && (
              <Alert 
                variant="default"
                title="Success"
                description={success}
                status="success"
              />
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !email}
              variant="primary"
              size="lg"
              style={{ width: "100%", marginTop: theme.spacing[2] }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Separator variant="with-label" label="OR" position="center" />

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
              <Text as="p" size="sm" color="muted" style={{ textAlign: "center", margin: 0 }}>
                Remember your password?{" "}
                <Button 
                  as={Link}
                  to="/login" 
                  variant="link"
                  style={{ fontSize: theme.typography.fontSize.sm, display: "inline" }}
                >
                  Sign in
                </Button>
              </Text>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
