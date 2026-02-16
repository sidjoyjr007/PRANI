/**
 * Toast/Notification Component
 * Toast notifications with multiple variants and sizes
 * Variants: default, success, warning, error, info
 * Positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const getIconForVariant = (variant) => {
  switch (variant) {
    case "success":
      return CheckCircle
    case "error":
      return AlertCircle
    case "warning":
      return AlertTriangle
    case "info":
      return Info
    default:
      return Info
  }
}

const getToastStyles = (variant, theme) => {
  const styles = {
    default: {
      bg: "white",
      border: theme.colors.neutral[200],
      text: theme.colors.neutral[900],
      icon: theme.colors.neutral[600],
    },
    success: {
      bg: theme.colors.success[50],
      border: theme.colors.success[200],
      text: theme.colors.success[900],
      icon: theme.colors.success[600],
    },
    error: {
      bg: theme.colors.destructive[50],
      border: theme.colors.destructive[200],
      text: theme.colors.destructive[900],
      icon: theme.colors.destructive[600],
    },
    warning: {
      bg: theme.colors.warning[50],
      border: theme.colors.warning[200],
      text: theme.colors.warning[900],
      icon: theme.colors.warning[600],
    },
    info: {
      bg: theme.colors.primary[50],
      border: theme.colors.primary[200],
      text: theme.colors.primary[900],
      icon: theme.colors.primary[600],
    },
  }
  return styles[variant] || styles.default
}

const Toast = React.forwardRef(({ 
  className, 
  variant = "default",
  title,
  description,
  action,
  onDismiss,
  autoClose = true,
  duration = 5000,
  size = "md",
  showIcon = true,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = React.useState(true)
  const styles = getToastStyles(variant, theme)
  const IconComponent = getIconForVariant(variant)

  const sizeConfig = {
    sm: { padding: theme.spacing[3], gap: theme.spacing[2], titleSize: theme.typography.fontSize.sm },
    md: { padding: theme.spacing[4], gap: theme.spacing[3], titleSize: theme.typography.fontSize.base },
    lg: { padding: theme.spacing[5], gap: theme.spacing[4], titleSize: theme.typography.fontSize.lg },
  }
  const config = sizeConfig[size] || sizeConfig.md

  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false)
        onDismiss?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, isOpen, onDismiss])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: theme.borderRadius.lg,
        padding: config.padding,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`,
        animation: "slideIn 0.3s ease-out",
        color: styles.text,
      }}
      className={cn(className)}
      {...props}
    >
      <div style={{ display: "flex", gap: config.gap, alignItems: "flex-start" }}>
        {showIcon && IconComponent && (
          <IconComponent 
            style={{ color: styles.icon, flexShrink: 0, marginTop: size === 'sm' ? 0 : 2 }}
            className={size === 'sm' ? "h-4 w-4" : size === 'md' ? "h-5 w-5" : "h-6 w-6"}
            aria-hidden="true"
          />
        )}
        <div style={{ flex: 1 }}>
          {title && (
            <h4 style={{ 
              fontSize: config.titleSize,
              fontWeight: theme.typography.fontWeight.semibold,
              lineHeight: theme.typography.lineHeight.tight,
              marginBottom: description ? theme.spacing[1] : 0,
              marginTop: 0,
              color: styles.text,
            }}>
              {title}
            </h4>
          )}
          {description && (
            <p style={{ 
              fontSize: theme.typography.fontSize.sm,
              color: styles.text,
              opacity: 0.85,
              marginTop: 0,
              marginBottom: 0,
            }}>
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsOpen(false)
            onDismiss?.()
          }}
          style={{
            marginLeft: theme.spacing[3],
            flexShrink: 0,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: styles.icon,
            opacity: 0.6,
            transition: `opacity ${theme.transitions.normal}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
          aria-label="Close notification"
        >
          <X className={size === 'sm' ? "h-3 w-3" : size === 'md' ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      </div>
      {action && (
        <div style={{ marginTop: config.gap, marginLeft: showIcon ? (size === 'sm' ? theme.spacing[6] : theme.spacing[8]) : 0 }}>
          {action}
        </div>
      )}
    </div>
  )
})
Toast.displayName = "Toast"

const ToastContainer = React.forwardRef(({ 
  className, 
  position = "bottom-right",
  ...props 
}, ref) => {
  const theme = useTheme()
  
  const positionStyles = {
    "top-left": { top: theme.spacing[4], left: theme.spacing[4] },
    "top-center": { top: theme.spacing[4], left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: theme.spacing[4], right: theme.spacing[4] },
    "bottom-left": { bottom: theme.spacing[4], left: theme.spacing[4] },
    "bottom-center": { bottom: theme.spacing[4], left: "50%", transform: "translateX(-50%)" },
    "bottom-right": { bottom: theme.spacing[4], right: theme.spacing[4] },
  }

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[2],
        pointerEvents: "none",
        maxWidth: "28rem",
        ...positionStyles[position],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
ToastContainer.displayName = "ToastContainer"

export { Toast, ToastContainer }
