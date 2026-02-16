import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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

export default function SignupPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { signup, isLoading } = useAuth()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const result = await signup(name, email, password)
    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 2000)
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout>
      <Card variant="default" style={{ maxWidth: "500px", margin: "0 auto", width: "100%", backgroundColor: "white", padding: theme.spacing[8], borderRadius: theme.borderRadius.lg }}>
        <CardHeader style={{ paddingBottom: theme.spacing[8], marginBottom: theme.spacing[8], borderBottomWidth: "1px", borderBottomColor: theme.colors.neutral[200] }}>
          <CardTitle style={{ fontSize: theme.typography.fontSize.xl2, textAlign: "center", marginBottom: theme.spacing[3], color: theme.colors.foreground }}>
            Sign Up
          </CardTitle>
          <CardDescription style={{ textAlign: "center", fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground }}>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
            <div>
              <Text 
                as="label" 
                htmlFor="name"
                variant="label" 
                size="sm"
                style={{ display: "block", marginBottom: theme.spacing[2] }}
              >
                Full Name *
              </Text>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                size="lg"
              />
            </div>

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
              <Text 
                as="p"
                variant="helper" 
                size="xs" 
                color="muted"
                style={{ marginBottom: theme.spacing[2] }}
              >
                At least 8 characters
              </Text>
              <div style={{ position: "relative" }}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
                    cursor: isLoading ? "not-allowed" : "pointer",
                    color: theme.colors.muted_foreground,
                    padding: theme.spacing[2],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 250ms ease",
                    opacity: isLoading ? 0.5 : 1,
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
              disabled={isLoading || !name || !email || !password} 
              variant="primary"
              size="lg"
              style={{ width: "100%", marginTop: theme.spacing[2] }}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <Separator variant="with-label" label="OR" position="center" />

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
              <Text as="p" size="sm" color="muted" style={{ textAlign: "center", margin: 0 }}>
                Already have an account?{" "}
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
