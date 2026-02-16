import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import AuthLayout from "@/components/AuthLayout"

export default function LoginPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      navigate("/work")
    } else {
      const errorMsg = result.message?.toLowerCase() || ""
      
      if (errorMsg.includes("not verified") || errorMsg.includes("email") && errorMsg.includes("verify")) {
        setError(`${result.message} Redirecting to verify email...`)
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`)
        }, 2000)
      } else {
        setError(result.message)
      }
    }
  }

  return (
    <AuthLayout>
      <Card variant="default" style={{ maxWidth: "500px", margin: "0 auto", width: "100%", backgroundColor: "white", padding: theme.spacing[8], borderRadius: theme.borderRadius.lg }}>
        <CardHeader style={{ paddingBottom: theme.spacing[8], marginBottom: theme.spacing[8], borderBottomWidth: "1px", borderBottomColor: theme.colors.neutral[200] }}>
          <CardTitle style={{ fontSize: theme.typography.fontSize.xl2, textAlign: "center", marginBottom: theme.spacing[3], color: theme.colors.foreground }}>
            Login
          </CardTitle>
          <CardDescription style={{ textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            Enter your credentials to access your account
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
                Email *
              </Text>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                size="lg"
              />
            </div>

            <div>
              <Text 
                as="label" 
                htmlFor="password"
                variant="label" 
                size="sm"
                style={{ display: "block", marginBottom: theme.spacing[2] }}
              >
                Password *
              </Text>
              <div style={{ position: "relative" }}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: theme.spacing[3],
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    color: theme.colors.muted_foreground,
                    padding: theme.spacing[2],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 250ms ease",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  disabled={isLoading}
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
            </div>

            {error && (
              <Alert 
                variant="default"
                title="Error"
                description={error}
                status="destructive"
              />
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !email || !password} 
              variant="primary"
              size="lg"
              style={{ width: "100%", fontWeight: theme.typography.fontWeight.semibold, marginTop: theme.spacing[2] }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Separator variant="with-label" label="OR" position="center" />

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
              <Text as="p" size="sm" color="muted" style={{ textAlign: "center", margin: 0 }}>
                Don't have an account?{" "}
                <Button 
                  as={Link}
                  to="/signup" 
                  variant="link"
                  style={{ fontSize: theme.typography.fontSize.sm, display: "inline" }}
                >
                  Sign up
                </Button>
              </Text>
              <Button 
                as={Link}
                to="/forgot-password" 
                variant="link"
                style={{ fontSize: theme.typography.fontSize.sm }}
              >
                Forgot password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
