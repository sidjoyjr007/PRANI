/**
 * Tabs Component with theme integration
 * Tabbed navigation interface with multiple variants
 * Variants: underline, pills, filled, badge
 * Sizes: sm, md, lg
 * Supports icons and badges
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const TabsContext = React.createContext({ activeTab: "", setActiveTab: () => {} })

const Tabs = React.forwardRef(({ 
  defaultValue = "",
  value,
  onValueChange,
  variant = "underline",
  size = "md",
  fullWidth = false,
  children,
  ...props 
}, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  const handleTabChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant, size, fullWidth }}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme()
  const { variant, fullWidth } = React.useContext(TabsContext)

  const listStyles = {
    underline: {
      display: fullWidth ? "flex" : "inline-flex",
      borderBottom: `${theme.borderWidth.md} solid ${theme.colors.neutral[200]}`,
      gap: 0,
      width: fullWidth ? "100%" : "auto",
    },
    pills: {
      display: fullWidth ? "flex" : "inline-flex",
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[1],
      gap: theme.spacing[1],
      width: fullWidth ? "100%" : "auto",
    },
    filled: {
      display: fullWidth ? "flex" : "inline-flex",
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[1],
      gap: 0,
      width: fullWidth ? "100%" : "auto",
    },
    badge: {
      display: fullWidth ? "flex" : "inline-flex",
      gap: theme.spacing[8],
      width: fullWidth ? "100%" : "auto",
    }
  }

  const style = listStyles[variant] || listStyles.underline

  return (
    <div
      ref={ref}
      style={style}
      role="tablist"
      {...props}
    />
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ 
  value, 
  disabled = false,
  icon: Icon = null,
  badge = null,
  ...props 
}, ref) => {
  const theme = useTheme()
  const { activeTab, setActiveTab, variant, size, fullWidth } = React.useContext(TabsContext)
  const isActive = activeTab === value
  const [isHovering, setIsHovering] = React.useState(false)

  const sizeConfig = theme.tabSizes[size] || theme.tabSizes.md

  let triggerStyles = {}

  if (variant === "underline") {
    triggerStyles = {
      padding: `${sizeConfig.paddingV} ${sizeConfig.paddingH}`,
      fontSize: sizeConfig.fontSize,
      fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.primary[600] : theme.colors.neutral[600],
      borderBottom: isActive ? `${theme.borderWidth.md} solid ${theme.colors.primary[600]}` : `${theme.borderWidth.md} solid transparent`,
      backgroundColor: "transparent",
      borderRadius: "0px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.normal,
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing[2],
      whiteSpace: "nowrap",
      opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
      border: "none",
    }
    if (isHovering && !disabled && !isActive) {
      triggerStyles.color = theme.colors.foreground
    }
  } else if (variant === "pills") {
    triggerStyles = {
      padding: `${sizeConfig.paddingV} ${sizeConfig.paddingH}`,
      fontSize: sizeConfig.fontSize,
      fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.white : theme.colors.neutral[600],
      backgroundColor: isActive ? theme.colors.primary[600] : "transparent",
      borderRadius: theme.borderRadius.md,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.normal,
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing[2],
      whiteSpace: "nowrap",
      opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
      flex: fullWidth ? 1 : "auto",
      justifyContent: fullWidth ? "center" : "flex-start",
    }
    if (isHovering && !disabled && !isActive) {
      triggerStyles.backgroundColor = theme.colors.neutral[200]
      triggerStyles.color = theme.colors.foreground
    }
  } else if (variant === "filled") {
    triggerStyles = {
      padding: `${sizeConfig.paddingV} ${sizeConfig.paddingH}`,
      fontSize: sizeConfig.fontSize,
      fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.white : theme.colors.neutral[600],
      backgroundColor: isActive ? theme.colors.primary[600] : "transparent",
      borderRadius: theme.borderRadius.base,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.normal,
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing[2],
      whiteSpace: "nowrap",
      opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
      flex: fullWidth ? 1 : "auto",
      justifyContent: fullWidth ? "center" : "flex-start",
    }
    if (isHovering && !disabled && !isActive) {
      triggerStyles.backgroundColor = theme.colors.neutral[200]
      triggerStyles.color = theme.colors.foreground
    }
  } else if (variant === "badge") {
    triggerStyles = {
      padding: `${sizeConfig.paddingV} ${sizeConfig.paddingH}`,
      fontSize: sizeConfig.fontSize,
      fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.white : theme.colors.neutral[600],
      backgroundColor: isActive ? theme.colors.primary[600] : theme.colors.neutral[100],
      borderRadius: theme.borderRadius.full,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.normal,
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing[2],
      whiteSpace: "nowrap",
      opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
      flex: fullWidth ? 1 : "auto",
      justifyContent: fullWidth ? "center" : "flex-start",
    }
    if (isHovering && !disabled && !isActive) {
      triggerStyles.backgroundColor = theme.colors.neutral[200]
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      style={triggerStyles}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {Icon && <Icon size={sizeConfig.iconSize} />}
      <span>{props.children}</span>
      {badge && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: theme.spacing[5],
            height: theme.spacing[5],
            borderRadius: theme.borderRadius.full,
            backgroundColor: isActive ? `${theme.colors.white}4D` : theme.colors.primary[100],
            color: isActive ? theme.colors.white : theme.colors.primary[600],
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ value, className = "", ...props }, ref) => {
  const { activeTab } = React.useContext(TabsContext)

  if (activeTab !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={className}
      style={{
        animation: "fadeIn 250ms ease-in",
      }}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }