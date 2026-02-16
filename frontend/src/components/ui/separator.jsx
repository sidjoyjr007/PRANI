/**
 * Separator Component with enhanced divider patterns
 * Multiple variants: simple, with-label, with-icon, with-title, with-button, with-toolbar
 * Positions: center, left, right
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const getSeparatorStyles = (variant, position, theme) => {
  const baseStyles = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: "12px",
  }

  const variantStyles = {
    // Simple horizontal line
    simple: {
      ...baseStyles,
      height: "1px",
      backgroundColor: theme.colors.border,
    },
    // Vertical divider
    vertical: {
      ...baseStyles,
      flexDirection: "column",
      height: "100%",
      width: "1px",
      backgroundColor: theme.colors.border,
    },
    // With centered label/text
    "with-label": {
      ...baseStyles,
      height: "auto",
      gap: "12px",
    },
    // With centered icon
    "with-icon": {
      ...baseStyles,
      height: "auto",
      gap: "12px",
    },
    // With title text
    "with-title": {
      ...baseStyles,
      height: "auto",
      gap: "16px",
    },
    // With action button
    "with-button": {
      ...baseStyles,
      height: "auto",
      gap: "12px",
      justifyContent: position === "left" ? "flex-start" : position === "right" ? "flex-end" : "center",
    },
    // With toolbar
    "with-toolbar": {
      ...baseStyles,
      height: "auto",
      gap: "8px",
      justifyContent: position === "left" ? "flex-start" : position === "right" ? "flex-end" : "space-between",
    },
  }

  return variantStyles[variant] || variantStyles.simple
}

const Separator = React.forwardRef(({ 
  className = "",
  variant = "simple",
  position = "center",
  label = null,
  icon = null,
  title = null,
  button = null,
  toolbar = null,
  size = "md",
  orientation = "horizontal",
  decorative = true,
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const styles = getSeparatorStyles(variant, position, theme)

  if (variant === "simple") {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation}
        style={{
          height: orientation === "horizontal" ? "1px" : "100%",
          width: orientation === "horizontal" ? "100%" : "1px",
          backgroundColor: theme.colors.border,
        }}
        className={className}
        {...props}
      />
    )
  }

  if (variant === "vertical") {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation="vertical"
        style={{
          height: "100%",
          width: "1px",
          backgroundColor: theme.colors.border,
        }}
        className={className}
        {...props}
      />
    )
  }

  // For complex variants with content
  const lineSize = size === "sm" ? "1px" : size === "md" ? "1px" : "2px"
  const textSize = size === "sm" ? "12px" : size === "md" ? "14px" : "16px"
  const textColor = theme.colors.muted_foreground

  return (
    <div
      ref={ref}
      style={{
        ...styles,
        marginTop: variant === "with-toolbar" ? "8px" : "12px",
        marginBottom: variant === "with-toolbar" ? "8px" : "12px",
      }}
      className={className}
      {...props}
    >
      {/* Left line */}
      {(variant === "with-label" || variant === "with-icon" || variant === "with-title") && position !== "left" && (
        <div
          style={{
            flex: 1,
            height: lineSize,
            backgroundColor: theme.colors.border,
          }}
        />
      )}

      {/* Label content */}
      {label && (
        <div
          style={{
            fontSize: textSize,
            color: textColor,
            whiteSpace: "nowrap",
            fontWeight: "500",
          }}
        >
          {label}
        </div>
      )}

      {/* Icon content */}
      {icon && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.muted_foreground,
          }}
        >
          {icon}
        </div>
      )}

      {/* Title content */}
      {title && (
        <div
          style={{
            fontSize: size === "sm" ? "13px" : size === "md" ? "15px" : "17px",
            color: theme.colors.foreground,
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      )}

      {/* Button content */}
      {button && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {button}
        </div>
      )}

      {/* Toolbar content */}
      {toolbar && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: position === "left" ? "0" : "auto",
            marginRight: position === "right" ? "0" : "auto",
          }}
        >
          {toolbar}
        </div>
      )}

      {/* Children */}
      {children && !label && !icon && !title && !button && !toolbar && (
        <div style={{ flex: 1 }}>
          {children}
        </div>
      )}

      {/* Right line */}
      {(variant === "with-label" || variant === "with-icon" || variant === "with-title") && position !== "right" && (
        <div
          style={{
            flex: 1,
            height: lineSize,
            backgroundColor: theme.colors.border,
          }}
        />
      )}
    </div>
  )
})
Separator.displayName = "Separator"

export { Separator }
