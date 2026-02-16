/**
 * Checkbox Component
 * Beautiful checkbox with theme integration, inspired by Tailwind UI
 * Features: multiple variants, sizes, labels, descriptions, card style
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Minus } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const checkboxSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

const Checkbox = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  indeterminate = false,
  disabled = false,
  label,
  description,
  checkboxPosition = "left",
  checked: controlledChecked,
  defaultChecked,
  onChange,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isChecked, setIsChecked] = React.useState(controlledChecked || defaultChecked || false)
  const [isHovering, setIsHovering] = React.useState(false)

  const handleChange = (e) => {
    setIsChecked(e.target.checked)
    onChange?.(e)
  }

  // Size configurations
  const sizeStyles = {
    sm: { checkboxSize: "16px", gap: "8px", fontSize: theme.typography.fontSize.xs },
    md: { checkboxSize: "20px", gap: "12px", fontSize: theme.typography.fontSize.sm },
    lg: { checkboxSize: "24px", gap: "16px", fontSize: theme.typography.fontSize.base },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // Variant styles
  const variantStyles = {
    default: {
      bgColor: isChecked ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[50] : theme.colors.card,
      borderColor: isChecked ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "6px",
      padding: "0",
      outline: true,
    },
    outline: {
      bgColor: "transparent",
      borderColor: isChecked ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "6px",
      padding: "0",
      outline: true,
    },
    card: {
      bgColor: isChecked ? theme.colors.primary[50] : isHovering && !disabled ? theme.colors.neutral[50] : theme.colors.card,
      borderColor: isChecked ? theme.colors.primary[500] : theme.colors.neutral[200],
      borderWidth: "2px",
      borderRadius: "12px",
      padding: "12px",
      outline: true,
    },
    minimal: {
      bgColor: isChecked ? theme.colors.primary[500] : "transparent",
      borderColor: isChecked ? theme.colors.primary[500] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "4px",
      padding: "0",
      outline: false,
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.default

  // Container style for card variant includes full item
  const containerStyle = label && variant === "card" ? {
    display: "flex",
    alignItems: description ? "flex-start" : "center",
    gap: sizeConfig.gap,
    padding: currentVariant.padding,
    backgroundColor: currentVariant.bgColor,
    border: currentVariant.outline ? `${currentVariant.borderWidth} solid ${currentVariant.borderColor}` : "none",
    borderRadius: currentVariant.borderRadius,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 250ms ease",
    flexDirection: checkboxPosition === "right" ? "row-reverse" : "row",
  } : undefined

  const checkboxStyle = {
    width: sizeConfig.checkboxSize,
    height: sizeConfig.checkboxSize,
    minWidth: sizeConfig.checkboxSize,
    minHeight: sizeConfig.checkboxSize,
    borderRadius: currentVariant.borderRadius,
    border: `${currentVariant.borderWidth} solid ${currentVariant.borderColor}`,
    backgroundColor: currentVariant.bgColor,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 250ms ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...(variant === "card" && { marginTop: description ? "2px" : "0" }),
  }

  const labelStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.normal,
    color: isChecked ? theme.colors.primary[700] : theme.colors.foreground,
    margin: 0,
  }

  const descriptionStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: isChecked ? theme.colors.primary[500] : theme.colors.neutral[500],
    margin: "4px 0 0 0",
  }

  // If label is provided, return wrapped version
  if (label) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsChecked(!isChecked)}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={containerStyle || {
          display: "flex",
          alignItems: description ? "flex-start" : "center",
          gap: sizeConfig.gap,
          padding: currentVariant.padding,
          backgroundColor: variant === "card" ? currentVariant.bgColor : "transparent",
          border: variant === "card" ? `${currentVariant.borderWidth} solid ${currentVariant.borderColor}` : "none",
          borderRadius: variant === "card" ? currentVariant.borderRadius : "0",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "all 250ms ease",
          flexDirection: checkboxPosition === "right" ? "row-reverse" : "row",
        }}
        className={cn(className)}
      >
        <input
          type="checkbox"
          ref={ref}
          disabled={disabled}
          checked={isChecked}
          onChange={handleChange}
          className="hidden"
          {...props}
        />
        
        <div style={checkboxStyle}>
          {indeterminate ? (
            <Minus size={parseInt(sizeConfig.checkboxSize) - 6} style={{ color: theme.colors.card }} />
          ) : isChecked ? (
            <Check size={parseInt(sizeConfig.checkboxSize) - 6} style={{ color: theme.colors.card }} />
          ) : null}
        </div>

        {label && (
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>{label}</p>
            {description && <p style={descriptionStyle}>{description}</p>}
          </div>
        )}
      </button>
    )
  }

  // Simple checkbox without label
  return (
    <div className="relative inline-flex">
      <input
        type="checkbox"
        ref={ref}
        disabled={disabled}
        checked={isChecked}
        onChange={handleChange}
        className="hidden"
        {...props}
      />
      <div
        style={checkboxStyle}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {indeterminate ? (
          <Minus size={parseInt(sizeConfig.checkboxSize) - 6} style={{ color: theme.colors.card }} />
        ) : isChecked ? (
          <Check size={parseInt(sizeConfig.checkboxSize) - 6} style={{ color: theme.colors.card }} />
        ) : null}
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxSizes }
