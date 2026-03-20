import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { ListTodo, Bot, Wrench, Server, Brain, LogOut, Rocket } from "lucide-react"
import praniLogo from "@/assets/only-logo.svg"
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
    { id: "mcp", icon: Server, label: "MCP", route: "/mcp-servers" },
    { id: "llm", icon: Brain, label: "LLM", route: "/llms" },
    { id: "deployments", icon: Rocket, label: "Deployments", route: "/deployments" },
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
      {/* Main Container with Sidebar and Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          height: "100vh"
        }}
      >
        {/* Sidebar - Fixed vertical navigation */}
        <div
          style={{
            width: "72px",
            backgroundColor: theme.colors.card,
            borderRight: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: theme.spacing[6],
            paddingBottom: theme.spacing[6],
            overflow: "visible", // Allow dropdowns to overflow sidebar width
            zIndex: 100
          }}
        >
          {/* Logo Section - Top */}
          <div style={{ marginBottom: theme.spacing[10], flexShrink: 0 }}>
            <img
              src={praniLogo}
              alt="Prani"
              style={{
                height: "28px",
                width: "auto",
              }}
            />
          </div>

          {/* Menu Items Section - Middle (Internal Scroll) */}
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: theme.spacing[4], 
            overflowY: "auto", 
            width: "100%", 
            alignItems: "center" 
          }} className="hide-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.route || location.pathname.startsWith(`${item.route}/`)
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

          {/* User Profile Section - Bottom */}
          <div style={{ marginTop: "auto", paddingTop: theme.spacing[4], flexShrink: 0 }}>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="ghost" size="sm" style={{ padding: theme.spacing[1], borderRadius: theme.borderRadius.md }}>
                  <Avatar
                    size="md"
                    fallback={getInitials(user?.name)}
                  />
                </Button>
              </DropdownTrigger>

              <DropdownContent align="end" side="right" sideOffset={12}>
                <div style={{ padding: `${theme.spacing[4]} ${theme.spacing[4]}`, borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, minWidth: "180px" }}>
                  <Text as="p" variant="label" size="sm" style={{ margin: 0, color: theme.colors.foreground }}>
                    {user?.name || "User"}
                  </Text>
                  <Text as="p" variant="helper" size="xs" style={{ margin: `${theme.spacing[1]} 0 0 0`, color: theme.colors.muted_foreground }}>
                    {user?.email || ""}
                  </Text>
                </div>



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
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
