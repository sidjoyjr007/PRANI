import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { ListTodo, Bot, Wrench, Network, Brain, LogOut, User, Settings } from "lucide-react"
import praniLogo from "@/assets/prani-logo.svg"
import { Avatar } from "@/components/ui/avatar"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Tooltip } from "@/components/ui/tooltip"

export default function Layout({ children }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isLoading } = useAuth()

  const menuItems = [
    { id: "work", icon: ListTodo, label: "Tasks", route: "/work" },
    { id: "agents", icon: Bot, label: "Agents", route: "/agents" },
    { id: "tools", icon: Wrench, label: "Tools", route: "/tools" },
    { id: "mcp", icon: Network, label: "MCP", route: "/mcp-servers" },
    { id: "llm", icon: Brain, label: "LLM", route: "/llms" },
  ]

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: theme.colors.background }}>
      {/* Top Bar - Fixed */}
      <div
        style={{
          height: "60px",
          backgroundColor: theme.colors.card,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: theme.spacing[6],
          paddingRight: theme.spacing[6],
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <div>
          <img 
            src={praniLogo}
            alt="Prani" 
            style={{
              height: "32px",
              width: "auto",
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="ghost" size="sm" style={{ padding: theme.spacing[1], borderRadius: theme.borderRadius.md }}>
                <Avatar 
                  size="md" 
                  fallback={getInitials(user?.name)}
                />
              </Button>
            </DropdownTrigger>

            <DropdownContent align="end">
              <div style={{ padding: `${theme.spacing[4]} ${theme.spacing[4]}`, borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}` }}>
                <Text as="p" variant="label" size="sm" style={{ margin: 0, color: theme.colors.foreground }}>
                  {user?.name || "User"}
                </Text>
                <Text as="p" variant="helper" size="xs" style={{ margin: `${theme.spacing[1]} 0 0 0`, color: theme.colors.muted_foreground }}>
                  {user?.email || ""}
                </Text>
              </div>

              <DropdownItem onClick={() => setShowProfileMenu(false)} leadingIcon={User}>
                Profile
              </DropdownItem>

              <DropdownItem onClick={() => setShowProfileMenu(false)} leadingIcon={Settings}>
                Settings
              </DropdownItem>

              <DropdownSeparator />

              <DropdownItem 
                onClick={handleLogout} 
                disabled={isLoading} 
                variant="destructive"
                leadingIcon={LogOut}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Main Container with Sidebar and Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          marginTop: "60px",
          overflow: "hidden",
        }}
      >
        {/* Sidebar - Fixed */}
        <div
          style={{
            width: theme.sizes.width.sidebarCollapsed,
            backgroundColor: theme.colors.card,
            borderRight: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: theme.spacing[8],
            paddingBottom: theme.spacing[4],
            gap: theme.spacing[4],
            overflowY: "auto",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.route
            return (
              <Tooltip key={item.id} content={item.label} side="right">
                <button
                  onClick={() => navigate(item.route)}
                  style={{
                    width: theme.sizes.width.sidebarIconButton,
                    height: theme.sizes.height.sidebarIconButton,
                    padding: 0,
                    borderRadius: theme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? theme.colors.primary.DEFAULT : "transparent",
                    color: isActive ? theme.colors.primaryForeground : theme.colors.foreground,
                    border: "none",
                    cursor: "pointer",
                    transition: theme.transitions.normal,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme.colors.muted
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <Icon size={20} style={{ color: "inherit" }} />
                </button>
              </Tooltip>
            )
          })}
        </div>

        {/* Content Area - Changes with routing */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            backgroundColor: theme.colors.background,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
