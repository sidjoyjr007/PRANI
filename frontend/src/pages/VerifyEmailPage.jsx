import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/components/AuthLayout"

export default function VerifyEmailPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyEmail, sendVerificationEmail, isLoading } = useAuth()
  
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      handleVerifyWithToken()
    }
  }, [token])

  const handleVerifyWithToken = async () => {
    if (!token) {
      setError("No verification token provided")
      return
    }

    setError("")
    setSuccess("")

    const result = await verifyEmail(token)
    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => navigate("/login"), 2000)
    } else {
      setError(result.message)
    }
  }

  const handleSendVerificationEmail = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError("No email provided")
      return
    }

    setError("")
    setSuccess("")

    const result = await sendVerificationEmail(email)
    if (result.success) {
      setSuccess(result.message)
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout>
      <Card variant="default" style={{ maxWidth: "420px", margin: "0 auto", width: "100%", backgroundColor: "white", padding: theme.spacing[8], borderRadius: theme.borderRadius.lg }}>
        <CardHeader style={{ paddingBottom: theme.spacing[6], marginBottom: theme.spacing[6], borderBottomWidth: "1px", borderBottomColor: theme.colors.neutral[200] }}>
          <CardTitle style={{ fontSize: theme.typography.fontSize.xl2, textAlign: "center", marginBottom: theme.spacing[2], color: theme.colors.foreground }}>
            Verify Email
          </CardTitle>
          <CardDescription style={{ textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            Verify your email to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {token ? (
            // Auto-verifying with token
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4], textAlign: "center", alignItems: "center" }}>
              <Spinner variant="primary" size="md" />
              <Text size="sm" color="muted">
                Verifying your email...
              </Text>
            </div>
          ) : (
            // Form to send verification email
            <form onSubmit={handleSendVerificationEmail} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <div>
                <Text 
                  as="label"
                  variant="label" 
                  size="sm"
                  style={{ display: "block", marginBottom: theme.spacing[2] }}
                >
                  Email Address
                </Text>
                <div style={{ padding: theme.spacing[3], backgroundColor: theme.colors.neutral[100], borderRadius: theme.borderRadius.md, color: theme.colors.foreground, border: `1px solid ${theme.colors.neutral[200]}` }}>
                  {email || "No email provided"}
                </div>
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
                {isLoading ? "Sending..." : "Send Verification Email"}
              </Button>

              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
                <Text as="p" size="sm" color="muted" style={{ textAlign: "center", margin: 0 }}>
                  <Button 
                    as={Link}
                    to="/login" 
                    variant="link"
                    style={{ fontSize: theme.typography.fontSize.sm, display: "inline" }}
                  >
                    Back to Login
                  </Button>
                </Text>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
