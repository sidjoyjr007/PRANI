/**
 * Toggle Component
 * Beautiful toggle switch inspired by Tailwind UI, styled with purple theme
 * Features: multiple sizes, labels, descriptions, icon support
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const toggleSizes = {
  sm: "h-6 px-2 text-xs",
  md: "h-8 px-3 text-sm",
  lg: "h-10 px-4 text-base",
  icon: {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  },
}

const Toggle = React.forwardRef(({ 
  className, 
  size = "md",
  pressed = false,
  defaultPressed,
  onPressedChange,
  disabled = false,
  isIcon = false,
  label,
  description,
  labelPosition = "right",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isPressed, setIsPressed] = React.useState(pressed || defaultPressed || false)
  const [isHovering, setIsHovering] = React.useState(false)

  const handleToggle = () => {
    if (!disabled) {
      const newState = !isPressed
      setIsPressed(newState)
      onPressedChange?.(newState)
    }
  }

  // Size configurations
  const sizeStyles = {
    sm: { switchWidth: "36px", switchHeight: "20px", dotSize: "16px", gap: "8px", fontSize: theme.typography.fontSize.xs },
    md: { switchWidth: "44px", switchHeight: "24px", dotSize: "20px", gap: "12px", fontSize: theme.typography.fontSize.sm },
    lg: { switchWidth: "56px", switchHeight: "28px", dotSize: "24px", gap: "16px", fontSize: theme.typography.fontSize.base },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // If just an icon toggle (no label)
  if (isIcon) {
    const sizeClass = toggleSizes.icon[size]
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        disabled={disabled}
        onClick={handleToggle}
        style={{
          backgroundColor: isPressed ? theme.colors.primary[500] : theme.colors.neutral[200],
          color: theme.colors.card,
          transition: "all 250ms ease",
          borderRadius: "8px",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          sizeClass,
          className
        )}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...props}
      />
    )
  }

  // Toggle switch with label
  const switchStyle = {
    width: sizeConfig.switchWidth,
    height: sizeConfig.switchHeight,
    borderRadius: "9999px",
    backgroundColor: isPressed ? theme.colors.primary[500] : theme.colors.neutral[300],
    transition: "all 250ms ease",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    padding: "2px",
    position: "relative",
  }

  const dotStyle = {
    width: sizeConfig.dotSize,
    height: sizeConfig.dotSize,
    borderRadius: "50%",
    backgroundColor: theme.colors.card,
    transition: "all 250ms ease",
    transform: isPressed ? `translateX(calc(${sizeConfig.switchWidth} - ${sizeConfig.dotSize} - 4px))` : "translateX(0)",
  }

  const labelStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.foreground,
    margin: 0,
  }

  const descriptionStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    margin: "4px 0 0 0",
  }

  const containerStyle = {
    display: "flex",
    alignItems: description ? "flex-start" : "center",
    gap: sizeConfig.gap,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    flexDirection: labelPosition === "left" ? "row-reverse" : "row",
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleToggle}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={containerStyle}
      className={cn(className)}
    >
      <div style={switchStyle}>
        <div style={dotStyle} />
      </div>

      {label && (
        <div style={{ flex: 1 }}>
          <p style={labelStyle}>{label}</p>
          {description && <p style={descriptionStyle}>{description}</p>}
        </div>
      )}
    </button>
  )
})
Toggle.displayName = "Toggle"

export { Toggle, toggleSizes }
