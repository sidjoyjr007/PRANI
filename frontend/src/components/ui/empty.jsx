/**
 * Empty State Component
 * Shows when no data is available with multiple variants and styles
 * Variants: default, outline, filled, subtle, card
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const getEmptyStyles = (variant, theme) => {
  const styles = {
    default: {
      container: {
        backgroundColor: theme.colors.neutral[50],
        borderColor: theme.colors.neutral[200],
        borderWidth: "2px",
        borderStyle: "dashed",
      },
      icon: { color: theme.colors.neutral[400] },
      title: { color: theme.colors.neutral[900] },
      description: { color: theme.colors.neutral[600] },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderColor: theme.colors.neutral[300],
        borderWidth: "2px",
        borderStyle: "dashed",
      },
      icon: { color: theme.colors.neutral[400] },
      title: { color: theme.colors.neutral[900] },
      description: { color: theme.colors.neutral[600] },
    },
    filled: {
      container: {
        backgroundColor: theme.colors.neutral[100],
        borderColor: theme.colors.neutral[200],
        borderWidth: "0px",
      },
      icon: { color: theme.colors.neutral[500] },
      title: { color: theme.colors.neutral[900] },
      description: { color: theme.colors.neutral[600] },
    },
    subtle: {
      container: {
        backgroundColor: "transparent",
        borderColor: "transparent",
        borderWidth: "0px",
      },
      icon: { color: theme.colors.neutral[400] },
      title: { color: theme.colors.neutral[900] },
      description: { color: theme.colors.neutral[600] },
    },
    card: {
      container: {
        backgroundColor: theme.colors.neutral[50],
        borderColor: theme.colors.neutral[200],
        borderWidth: "2px",
        borderStyle: "solid",
        boxShadow: `0 1px 3px 0 ${theme.colors.shadow}20`,
      },
      icon: { color: theme.colors.primary[400] },
      title: { color: theme.colors.neutral[900] },
      description: { color: theme.colors.neutral[600] },
    },
  }
  return styles[variant] || styles.default
}

const Empty = React.forwardRef(({ 
  className, 
  icon: Icon = Package,
  title = "No data",
  description = "There's nothing here yet",
  action,
  variant = "default",
  size = "md",
  ...props 
}, ref) => {
  const theme = useTheme()
  const styles = getEmptyStyles(variant, theme)

  const sizeConfig = {
    sm: { padding: theme.spacing[6], gap: theme.spacing[2], iconSize: "h-8 w-8", titleSize: theme.typography.fontSize.sm, descSize: theme.typography.fontSize.xs },
    md: { padding: theme.spacing[8], gap: theme.spacing[3], iconSize: "h-12 w-12", titleSize: theme.typography.fontSize.base, descSize: theme.typography.fontSize.sm },
    lg: { padding: theme.spacing[12], gap: theme.spacing[4], iconSize: "h-16 w-16", titleSize: theme.typography.fontSize.lg, descSize: theme.typography.fontSize.base },
  }
  const config = sizeConfig[size] || sizeConfig.md

  return (
    <div
      ref={ref}
      style={{
        ...styles.container,
        borderRadius: theme.borderRadius.lg,
        padding: config.padding,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        transition: `all ${theme.transitions.normal}`,
      }}
      className={cn(className)}
      {...props}
    >
      {Icon && (
        <Icon 
          style={styles.icon}
          className={config.iconSize}
          aria-hidden="true"
        />
      )}
      <h3 style={{ 
        ...styles.title,
        fontSize: config.titleSize,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight,
        marginTop: config.gap,
        marginBottom: 0,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ 
          ...styles.description,
          fontSize: config.descSize,
          marginTop: theme.spacing[1],
          marginBottom: 0,
        }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: config.gap }}>
          {action}
        </div>
      )}
    </div>
  )
})
Empty.displayName = "Empty"

export { Empty }
