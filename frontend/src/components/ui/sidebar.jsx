/**
 * Sidebar Component with theme integration
 * Side navigation panel
 * Variants: default, collapsed
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const Sidebar = React.forwardRef(({ 
  variant = "default",
  collapsible = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const width = isCollapsed ? theme.sizes.width.sidebarCollapsed : theme.sizes.width.sidebarFull

  return (
    <aside
      ref={ref}
      style={{
        width,
        height: "100vh",
        backgroundColor: theme.colors.card,
        borderRight: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
        transition: theme.transitions.normal,
      }}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme()
  
  return (
    <div
      ref={ref}
      style={{
        padding: theme.spacing[4],
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[2],
        height: "100%",
        overflow: "auto",
      }}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarItem = React.forwardRef(({ 
  active = false,
  icon: Icon,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovering, setIsHovering] = React.useState(false)

  return (
    <button
      ref={ref}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: theme.spacing[3],
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        borderRadius: theme.borderRadius.lg,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.transitions.normal,
        backgroundColor: active 
          ? theme.colors.primary.DEFAULT 
          : isHovering 
            ? theme.colors.muted 
            : "transparent",
        color: active 
          ? theme.colors.primaryForeground 
          : theme.colors.foreground,
        border: "none",
        cursor: "pointer",
        outline: "none",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {Icon && <Icon size={20} style={{ flexShrink: 0 }} />}
      {props.children}
    </button>
  )
})
SidebarItem.displayName = "SidebarItem"

const SidebarLabel = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme()
  
  return (
    <div
      ref={ref}
      style={{
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.neutral[500],
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
      {...props}
    />
  )
})
SidebarLabel.displayName = "SidebarLabel"

export { Sidebar, SidebarContent, SidebarItem, SidebarLabel }
