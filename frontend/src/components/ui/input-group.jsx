/**
 * Input Group Component with theme integration
 * Group inputs with icons, addons, and buttons
 * Variants: default, inline-addon, leading-dropdown, with-button
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const InputGroup = React.forwardRef(({ 
  className = "",
  size = "md",
  layout = "horizontal",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  let groupStyles = {
    display: layout === "horizontal" ? "flex" : "flex",
    flexDirection: layout === "horizontal" ? "row" : "column",
    gap: "0px",
    alignItems: "center",
  }

  return (
    <div
      ref={ref}
      style={groupStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
})
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef(({ 
  className = "",
  size = "md",
  position = "leading",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  const sizeMap = {
    sm: { padding: "8px 12px", fontSize: "13px", height: "32px" },
    md: { padding: "12px 16px", fontSize: "14px", height: "40px" },
    lg: { padding: "14px 20px", fontSize: "15px", height: "48px" }
  }

  const sizeStyle = sizeMap[size]

  let addonStyles = {
    padding: sizeStyle.padding,
    height: sizeStyle.height,
    fontSize: sizeStyle.fontSize,
    backgroundColor: theme.colors.neutral[100],
    color: theme.colors.muted_foreground,
    fontWeight: "500",
    border: `2px solid ${theme.colors.neutral[300]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    borderRadius: position === "leading" ? "8px 0 0 8px" : "0 8px 8px 0",
  }

  return (
    <div
      ref={ref}
      style={addonStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
})
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupInput = React.forwardRef(({ 
  className = "",
  size = "md",
  hasLeading = false,
  hasTrailing = false,
  error = false,
  disabled = false,
  icon: Icon = null,
  placeholder = "",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isFocused, setIsFocused] = React.useState(false)

  const sizeMap = {
    sm: { padding: "8px 12px", fontSize: "13px", height: "32px", iconPadding: "8px" },
    md: { padding: "12px 16px", fontSize: "14px", height: "40px", iconPadding: "12px" },
    lg: { padding: "14px 20px", fontSize: "15px", height: "48px", iconPadding: "16px" }
  }

  const sizeStyle = sizeMap[size]

  let inputStyles = {
    flex: 1,
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontFamily: "inherit",
    backgroundColor: theme.colors.card,
    color: theme.colors.foreground,
    border: `2px solid ${error ? theme.colors.destructive[500] : isFocused ? theme.colors.primary[500] : theme.colors.neutral[300]}`,
    borderRadius: hasLeading && hasTrailing ? "0px" : hasLeading ? "0 8px 8px 0" : hasTrailing ? "8px 0 0 8px" : "8px",
    outline: "none",
    transition: "all 250ms ease",
    boxShadow: isFocused ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "text",
  }

  return (
    <input
      ref={ref}
      style={inputStyles}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => !disabled && setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  )
})
InputGroupInput.displayName = "InputGroupInput"

const InputGroupButton = React.forwardRef(({ 
  className = "",
  size = "md",
  position = "trailing",
  variant = "primary",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeMap = {
    sm: { padding: "8px 16px", fontSize: "13px", height: "32px" },
    md: { padding: "12px 20px", fontSize: "14px", height: "40px" },
    lg: { padding: "14px 24px", fontSize: "15px", height: "48px" }
  }

  const sizeStyle = sizeMap[size]

  let buttonStyles = {
    padding: sizeStyle.padding,
    height: sizeStyle.height,
    fontSize: sizeStyle.fontSize,
    fontWeight: "500",
    backgroundColor: variant === "primary" ? theme.colors.primary[600] : theme.colors.neutral[200],
    color: variant === "primary" ? theme.colors.white : theme.colors.foreground,
    border: "none",
    borderRadius: position === "trailing" ? "0 8px 8px 0" : "8px 0 0 8px",
    cursor: "pointer",
    transition: "all 250ms ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  }

  if (isHovered) {
    buttonStyles.backgroundColor = variant === "primary" ? theme.colors.primary[700] : theme.colors.neutral[300]
  }

  return (
    <button
      ref={ref}
      style={buttonStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  )
})
InputGroupButton.displayName = "InputGroupButton"

const InputGroupLabel = React.forwardRef(({ 
  className = "",
  htmlFor = "",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  let labelStyles = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: theme.colors.foreground,
  }

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      style={labelStyles}
      className={className}
      {...props}
    >
      {children}
    </label>
  )
})
InputGroupLabel.displayName = "InputGroupLabel"

const InputGroupHelperText = React.forwardRef(({ 
  className = "",
  error = false,
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  let helperStyles = {
    marginTop: "6px",
    fontSize: "12px",
    color: error ? theme.colors.destructive[600] : theme.colors.muted_foreground,
  }

  return (
    <p
      ref={ref}
      style={helperStyles}
      className={className}
      {...props}
    >
      {children}
    </p>
  )
})
InputGroupHelperText.displayName = "InputGroupHelperText"

export { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupInput, 
  InputGroupButton, 
  InputGroupLabel,
  InputGroupHelperText 
}
