import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import AuthLayout from "@/components/AuthLayout"

export default function ResetPasswordPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword, isLoading } = useAuth()
  
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!token) {
      setError("Invalid reset link")
      return
    }

    const result = await resetPassword(token, password)
    if (result.success) {
      setSuccess("Password reset successfully!")
      setTimeout(() => navigate("/login"), 1500)
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout>
      <Card variant="default" style={{ maxWidth: "500px", margin: "0 auto", width: "100%", backgroundColor: "white", padding: theme.spacing[8], borderRadius: theme.borderRadius.lg }}>
        <CardHeader style={{ paddingBottom: theme.spacing[8], marginBottom: theme.spacing[8], borderBottomWidth: "1px", borderBottomColor: theme.colors.neutral[200] }}>
          <CardTitle style={{ fontSize: theme.typography.fontSize.xl2, textAlign: "center", marginBottom: theme.spacing[3], color: theme.colors.foreground }}>
            Reset Password
          </CardTitle>
          <CardDescription style={{ textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
            <div>
              <Text 
                as="label" 
                variant="label" 
                size="sm"
                style={{ display: "block", marginBottom: theme.spacing[2] }}
              >
                New Password *
              </Text>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: "absolute",
                    right: theme.spacing[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: isLoading ? theme.colors.neutral[400] : theme.colors.muted_foreground,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    padding: theme.spacing[2],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isLoading ? 0.5 : 1,
                    transition: "color 250ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.color = theme.colors.primary[600]
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.color = theme.colors.muted_foreground
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Text as="p" size="xs" color="muted" style={{ marginTop: theme.spacing[2], marginBottom: 0 }}>
                At least 8 characters
              </Text>
            </div>

            <div>
              <Text 
                as="label" 
                variant="label" 
                size="sm"
                style={{ display: "block", marginBottom: theme.spacing[2] }}
              >
                Confirm Password *
              </Text>
              <div style={{ position: "relative" }}>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  style={{
                    position: "absolute",
                    right: theme.spacing[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: isLoading ? theme.colors.neutral[400] : theme.colors.muted_foreground,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    padding: theme.spacing[2],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isLoading ? 0.5 : 1,
                    transition: "color 250ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.color = theme.colors.primary[600]
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.color = theme.colors.muted_foreground
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              disabled={isLoading || !password || !confirmPassword}
              variant="primary"
              size="lg"
              style={{ width: "100%", marginTop: theme.spacing[2] }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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
