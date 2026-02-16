/**
 * Button Component
 * Production-grade button with proper theme integration
 * All values from theme.js - ZERO hardcoding
 * Inspired by Tailwind UI button patterns
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Button = React.forwardRef(({ 
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  type = "button",
  as = "button",
  ...props
}, ref) => {
  const theme = useTheme()
  const [isHovering, setIsHovering] = React.useState(false)
  
  if (!theme) {
    throw new Error("Button must be used within ThemeProvider")
  }

  // Variant styles - all from theme
  const variantStyles = {
    primary: {
      bg: theme.colors.primary[600],
      bgHover: theme.colors.primary[500],
      text: theme.colors.white,
      border: "none",
    },
    secondary: {
      bg: theme.colors.secondary[600],
      bgHover: theme.colors.secondary[500],
      text: theme.colors.white,
      border: "none",
    },
    soft: {
      bg: theme.colors.primary[100],
      bgHover: theme.colors.primary[200],
      text: theme.colors.primary[700],
      border: "none",
    },
    outline: {
      bg: theme.colors.card,
      bgHover: theme.colors.neutral[50],
      text: theme.colors.foreground,
      border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[300]}`,
      borderHover: `${theme.borderWidth.sm} solid ${theme.colors.neutral[400]}`,
    },
    ghost: {
      bg: "transparent",
      bgHover: theme.colors.neutral[100],
      text: theme.colors.foreground,
      border: "none",
    },
    link: {
      bg: "transparent",
      bgHover: "transparent",
      text: theme.colors.primary[600],
      textHover: theme.colors.primary[700],
      border: "none",
      textDecoration: "none",
      textDecorationHover: "none",
      noPadding: true,
    },
    destructive: {
      bg: theme.colors.destructive[600],
      bgHover: theme.colors.destructive[500],
      text: theme.colors.white,
      border: "none",
    },
  }

  const styles = variantStyles[variant] || variantStyles.primary

  // Get sizes from theme.spacing
  const getSize = () => {
    switch(size) {
      case "sm":
        return { 
          height: theme.spacing[8], 
          padX: theme.spacing[3], 
          fontSize: theme.typography.fontSize.sm, 
          iconSize: parseInt(theme.sizes.height.iconSm), 
          gap: theme.spacing[1] 
        }
      case "lg":
        return { 
          height: theme.spacing[12], 
          padX: theme.spacing[6], 
          fontSize: theme.typography.fontSize.base, 
          iconSize: parseInt(theme.sizes.height.iconLg), 
          gap: theme.spacing[3] 
        }
      default: // md
        return { 
          height: theme.spacing[10], 
          padX: theme.spacing[4], 
          fontSize: theme.typography.fontSize.sm, 
          iconSize: parseInt(theme.sizes.height.iconMd), 
          gap: theme.spacing[2] 
        }
    }
  }

  const sizeConfig = getSize()

  // Use hover state to determine colors
  const currentBg = isHovering && !disabled ? styles.bgHover : styles.bg
  const currentColor = isHovering && !disabled ? (styles.textHover || styles.text) : styles.text
  const currentBorder = isHovering && !disabled ? (styles.borderHover || styles.border) : styles.border
  const currentTextDecoration = isHovering && !disabled ? (styles.textDecorationHover || styles.textDecoration || "none") : (styles.textDecoration || "none")

  const baseStyle = {
    height: styles.noPadding ? "auto" : sizeConfig.height,
    paddingLeft: styles.noPadding ? theme.spacing[0] : sizeConfig.padX,
    paddingRight: styles.noPadding ? theme.spacing[0] : sizeConfig.padX,
    paddingTop: theme.spacing[0],
    paddingBottom: theme.spacing[0],
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.semibold,
    borderRadius: styles.noPadding ? theme.spacing[0] : theme.borderRadius.md,
    border: currentBorder,
    backgroundColor: currentBg,
    color: currentColor,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
    transition: `all ${theme.transitions.normal}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sizeConfig.gap,
    whiteSpace: "nowrap",
    outline: "none",
    fontFamily: "inherit",
    textDecoration: currentTextDecoration,
    position: "relative",
  }

  // Merge with props.style properly
  const mergedStyle = {
    ...baseStyle,
    ...(props.style || {}),
  }

  const Element = as

  const handleMouseEnter = (e) => {
    if (!disabled) setIsHovering(true)
    props.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e) => {
    setIsHovering(false)
    props.onMouseLeave?.(e)
  }

  return (
    <Element
      ref={ref}
      type={as === "button" ? type : undefined}
      disabled={disabled && as === "button"}
      aria-disabled={disabled}
      data-variant={variant}
      data-size={size}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "button",
        `button--${variant}`,
        `button--${size}`,
        disabled && "button--disabled",
        className
      )}
      {...props}

      style={mergedStyle}
    >
      {LeadingIcon && <LeadingIcon size={sizeConfig.iconSize} aria-hidden="true" />}
      {props.children}
      {TrailingIcon && <TrailingIcon size={sizeConfig.iconSize} aria-hidden="true" />}
    </Element>
  )
})

Button.displayName = "Button"

export { Button }
