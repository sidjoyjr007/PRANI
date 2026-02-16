/**
 * Text Component
 * Reusable text/typography component with theme integration
 * Variants: body, caption, label, helper
 * Sizes: xs, sm, base, lg, xl
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Text = React.forwardRef(({ 
  className,
  variant = "body",
  size = "base",
  color = "foreground",
  weight = "normal",
  as = "span",
  ...props 
}, ref) => {
  const theme = useTheme()

  if (!theme) {
    throw new Error("Text must be used within ThemeProvider")
  }

  // Variant configurations
  const variantStyles = {
    body: {
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },
    caption: {
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.tight,
    },
    label: {
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.tight,
    },
    helper: {
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },
  }

  // Font size mapping
  const fontSizeMap = {
    xs: theme.typography.fontSize.xs,
    sm: theme.typography.fontSize.sm,
    base: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg,
    xl: theme.typography.fontSize.xl,
  }

  // Font weight mapping
  const fontWeightMap = {
    light: theme.typography.fontWeight.light,
    normal: theme.typography.fontWeight.normal,
    medium: theme.typography.fontWeight.medium,
    semibold: theme.typography.fontWeight.semibold,
    bold: theme.typography.fontWeight.bold,
  }

  // Color mapping
  const colorMap = {
    foreground: theme.colors.foreground,
    muted: theme.colors.muted_foreground,
    primary: theme.colors.primary[600],
    secondary: theme.colors.secondary[600],
    success: theme.colors.success[600],
    warning: theme.colors.warning[600],
    destructive: theme.colors.destructive[600],
    white: theme.colors.white,
  }

  const styles = variantStyles[variant] || variantStyles.body

  const baseStyle = {
    fontSize: fontSizeMap[size],
    fontWeight: fontWeightMap[weight],
    color: colorMap[color],
    ...styles,
  }

  const Element = as

  return (
    <Element
      ref={ref}
      style={baseStyle}
      className={cn(
        "text",
        `text--${variant}`,
        `text--${size}`,
        `text--${color}`,
        `text--${weight}`,
        className
      )}
      {...props}
    />
  )
})

Text.displayName = "Text"

export { Text }
