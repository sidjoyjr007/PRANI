import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"

export default function DashboardPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <Layout>
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[8] }}>
          <PageHeader title="Dashboard" subtitle="Welcome back!" />
          <Button 
            onClick={handleLogout}
            disabled={isLoading}
            variant="destructive"
            size="md"
          >
            {isLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>

        {/* User Info Card */}
        <Card variant="default" style={{ marginBottom: theme.spacing[8] }}>
          <CardContent style={{ padding: theme.spacing[8] }}>
            <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, margin: `0 0 ${theme.spacing[4]} 0`, color: theme.colors.foreground }}>Account Information</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground, margin: 0 }}>Name</p>
                <p style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.foreground, margin: `${theme.spacing[1]} 0 0 0` }}>
                  {user?.name || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground, margin: 0 }}>Email</p>
                <p style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.foreground, margin: `${theme.spacing[1]} 0 0 0` }}>
                  {user?.email || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="default">
          <CardContent style={{ padding: theme.spacing[8] }}>
            <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, margin: `0 0 ${theme.spacing[4]} 0`, color: theme.colors.foreground }}>Quick Actions</h2>
            
            <div style={{ display: "flex", gap: theme.spacing[4], flexWrap: "wrap" }}>
              <Button variant="primary" size="md">
                Edit Profile
              </Button>
              <Button variant="secondary" size="md">
                Change Password
              </Button>
              <Button variant="secondary" size="md">
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}
