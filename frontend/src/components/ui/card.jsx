/**
 * Card Component
 * Reusable card containers with multiple variants and layouts
 * Variants: default (elevated), outline, filled, subtle, well
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const getCardStyles = (variant, theme) => {
  const styles = {
    default: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderColor: "rgba(228, 232, 236, 0.5)",
      borderWidth: "1px",
      borderStyle: "solid",
      boxShadow: "none",
    },
    outline: {
      backgroundColor: "white",
      borderColor: theme.colors.neutral[300],
      borderWidth: "2px",
      borderStyle: "solid",
      boxShadow: "none",
    },
    filled: {
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: "0px",
      boxShadow: "none",
    },
    subtle: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: "0px",
      boxShadow: "none",
    },
    well: {
      backgroundColor: theme.colors.neutral[100],
      borderColor: theme.colors.neutral[300],
      borderWidth: "2px",
      borderStyle: "solid",
      boxShadow: `inset 0 2px 4px 0 ${theme.colors.shadow}10`,
    },
  }
  return styles[variant] || styles.default
}

const Card = React.forwardRef(({
  className,
  variant = "default",
  hoverable = true,
  style: callerStyle,
  ...props
}, ref) => {
  const theme = useTheme()
  const styles = getCardStyles(variant, theme)

  return (
    <div
      ref={ref}
      style={{
        ...styles,
        borderRadius: "20px",
        padding: theme.spacing[6],
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: hoverable ? "pointer" : "default",
        position: "relative",
        overflow: "visible",
        zIndex: 1,
        ...callerStyle,
      }}
      className={cn(className)}
      onMouseEnter={hoverable ? (e) => {
        e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0, 0, 0, 0.1)`
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.borderColor = theme.colors.primary[500]
        e.currentTarget.style.zIndex = "10"
        if (props.onMouseEnter) props.onMouseEnter(e)
      } : props.onMouseEnter}
      onMouseLeave={hoverable ? (e) => {
        e.currentTarget.style.boxShadow = styles.boxShadow
        e.currentTarget.style.transform = "translateY(0px)"
        e.currentTarget.style.borderColor = styles.borderColor
        e.currentTarget.style.zIndex = "1"
        if (props.onMouseLeave) props.onMouseLeave(e)
      } : props.onMouseLeave}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        marginBottom: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        borderBottomColor: theme.colors.neutral[200],
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
      }}
      className={cn(className)}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <h2
      ref={ref}
      style={{
        color: theme.colors.neutral[900],
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight,
        marginBottom: theme.spacing[1],
        marginTop: 0,
      }}
      className={cn(className)}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <p
      ref={ref}
      style={{
        color: theme.colors.neutral[600],
        fontSize: theme.typography.fontSize.sm,
        marginTop: 0,
        marginBottom: 0,
      }}
      className={cn(className)}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.neutral[700],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        marginTop: theme.spacing[6],
        paddingTop: theme.spacing[4],
        borderTopColor: theme.colors.neutral[200],
        borderTopWidth: "2px",
        borderTopStyle: "solid",
        display: "flex",
        justifyContent: "flex-end",
        gap: theme.spacing[3],
        alignItems: "center",
      }}
      className={cn(className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
