/**
 * Alert Component
 * Feedback container for messages with multiple variants and theme integration
 * Variants: default, outline, filled, subtle
 * Status variants: success, warning, destructive
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const getAlertStyles = (variant, status, theme) => {
  const statusColors = {
    default: { bg: theme.colors.neutral[50], border: theme.colors.neutral[200], text: theme.colors.neutral[900], icon: theme.colors.neutral[600] },
    success: { bg: theme.colors.success[50], border: theme.colors.success[200], text: theme.colors.success[900], icon: theme.colors.success[600] },
    warning: { bg: theme.colors.warning[50], border: theme.colors.warning[200], text: theme.colors.warning[900], icon: theme.colors.warning[600] },
    destructive: { bg: theme.colors.destructive[50], border: theme.colors.destructive[200], text: theme.colors.destructive[900], icon: theme.colors.destructive[600] },
    info: { bg: theme.colors.primary[50], border: theme.colors.primary[200], text: theme.colors.primary[900], icon: theme.colors.primary[600] },
  }

  const colors = statusColors[status] || statusColors.default

  const styles = {
    default: {
      container: {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: "2px",
        borderStyle: "solid",
      },
      title: { color: colors.text },
      description: { color: theme.colors.neutral[600] },
      icon: { color: colors.icon },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderColor: colors.border,
        borderWidth: "2px",
        borderStyle: "solid",
      },
      title: { color: colors.text },
      description: { color: theme.colors.neutral[600] },
      icon: { color: colors.icon },
    },
    filled: {
      container: {
        backgroundColor: colors.border,
        borderColor: colors.border,
        borderWidth: "2px",
        borderStyle: "solid",
      },
      title: { color: colors.text },
      description: { color: theme.colors.neutral[700] },
      icon: { color: colors.icon },
    },
    subtle: {
      container: {
        backgroundColor: "transparent",
        borderColor: "transparent",
        borderWidth: "0px",
      },
      title: { color: colors.text },
      description: { color: theme.colors.neutral[600] },
      icon: { color: colors.icon },
    },
    accent: {
      container: {
        backgroundColor: colors.bg,
        borderColor: "transparent",
        borderWidth: "0px",
        borderLeftColor: colors.icon,
        borderLeftWidth: "4px",
        borderLeftStyle: "solid",
      },
      title: { color: colors.text },
      description: { color: theme.colors.neutral[600] },
      icon: { color: colors.icon },
    },
  }
  return styles[variant] || styles.default
}

const getIconForVariant = (status) => {
  switch (status) {
    case "destructive":
      return AlertCircle
    case "warning":
      return AlertTriangle
    case "success":
      return CheckCircle
    case "info":
      return Info
    default:
      return AlertCircle
  }
}

const Alert = React.forwardRef(({ 
  className, 
  variant = "default",
  status = "default",
  title,
  description,
  icon: customIcon,
  onDismiss,
  action,
  showIcon = true,
  children,
  size = "md",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = React.useState(true)
  const styles = getAlertStyles(variant, status, theme)
  const IconComponent = customIcon || getIconForVariant(status)

  const sizeStyles = {
    sm: { padding: theme.spacing[3], gap: theme.spacing[2], titleSize: theme.typography.fontSize.sm },
    md: { padding: theme.spacing[4], gap: theme.spacing[3], titleSize: theme.typography.fontSize.base },
    lg: { padding: theme.spacing[5], gap: theme.spacing[4], titleSize: theme.typography.fontSize.lg },
  }
  const sizeConfig = sizeStyles[size] || sizeStyles.md

  const handleDismiss = () => {
    setIsOpen(false)
    onDismiss?.()
  }

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      role="alert"
      style={{
        ...styles.container,
        borderRadius: theme.borderRadius.lg,
        padding: sizeConfig.padding,
        transition: `all ${theme.transitions.normal}`,
      }}
      className={cn(className)}
      {...props}
    >
      <div style={{ display: "flex", gap: sizeConfig.gap, alignItems: "flex-start" }}>
        {showIcon && IconComponent && (
          <IconComponent 
            style={{ ...styles.icon, flexShrink: 0, marginTop: size === 'sm' ? 0 : 2 }}
            className={size === 'sm' ? "h-4 w-4" : size === 'md' ? "h-5 w-5" : "h-6 w-6"}
            aria-hidden="true"
          />
        )}
        <div style={{ flex: 1 }}>
          {title && (
            <h5 style={{ 
              ...styles.title, 
              fontSize: sizeConfig.titleSize,
              fontWeight: theme.typography.fontWeight.semibold,
              lineHeight: theme.typography.lineHeight.tight,
              marginBottom: description || children ? theme.spacing[1] : 0,
              marginTop: 0,
            }}>
              {title}
            </h5>
          )}
          {description && (
            <p style={{ 
              ...styles.description,
              fontSize: theme.typography.fontSize.sm,
              marginTop: 0,
              marginBottom: children ? theme.spacing[2] : 0,
            }}>
              {description}
            </p>
          )}
          {children && (
            <div style={{ ...styles.description, fontSize: theme.typography.fontSize.sm }}>
              {children}
            </div>
          )}
        </div>
        {action && (
          <div style={{ marginLeft: theme.spacing[2], flexShrink: 0 }}>
            {action}
          </div>
        )}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            style={{
              ...styles.icon,
              marginLeft: action ? 0 : "auto",
              flexShrink: 0,
              opacity: 0.6,
              transition: `opacity ${theme.transitions.normal}`,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
            aria-label="Dismiss alert"
          >
            <X className={size === 'sm' ? "h-3 w-3" : size === 'md' ? "h-4 w-4" : "h-5 w-5"} />
          </button>
        )}
      </div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <h5 
      ref={ref} 
      style={{
        marginBottom: theme.spacing[1],
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight,
      }}
      className={className} 
      {...props} 
    />
  )
})
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div 
      ref={ref} 
      style={{ fontSize: theme.typography.fontSize.sm }}
      className={className} 
      {...props} 
    />
  )
})
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
