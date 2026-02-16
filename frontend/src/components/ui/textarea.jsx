/**
 * Textarea Component
 * Beautiful textarea inspired by Tailwind UI, styled with purple theme
 * Features: multiple variants, sizes, labels, helper text, error states, character count
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Textarea = React.forwardRef(({ 
  className, 
  size = "md",
  variant = "default",
  error = false,
  disabled = false,
  label,
  helperText,
  maxLength,
  rows = 4,
  showCharCount = maxLength ? true : false,
  avatar,
  actions,
  disableFocusStyle = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [charCount, setCharCount] = React.useState(0)
  const [isFocused, setIsFocused] = React.useState(false)

  // Size configurations
  const sizeStyles = {
    sm: { padding: "8px 12px", fontSize: theme.typography.fontSize.xs },
    md: { padding: "12px 16px", fontSize: theme.typography.fontSize.sm },
    lg: { padding: "16px 20px", fontSize: theme.typography.fontSize.base },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // Variant styles
  const variantStyles = {
    default: {
      bgColor: disabled ? theme.colors.neutral[50] : error ? theme.colors.destructive[50] : theme.colors.card,
      borderColor: error ? theme.colors.destructive[500] : isFocused ? theme.colors.primary[500] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "8px",
      boxShadow: isFocused ? `0 0 0 3px ${error ? theme.colors.destructive[100] : theme.colors.primary[100]}` : "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    outline: {
      bgColor: "transparent",
      borderColor: error ? theme.colors.destructive[500] : isFocused ? theme.colors.primary[500] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "8px",
      boxShadow: isFocused ? `0 0 0 3px ${error ? theme.colors.destructive[100] : theme.colors.primary[100]}` : "none",
    },
    minimal: {
      bgColor: "transparent",
      borderColor: "transparent",
      borderWidth: "0",
      borderRadius: "0",
      boxShadow: disableFocusStyle ? "none" : (isFocused ? `inset 0 -2px 0 ${theme.colors.primary[500]}` : `inset 0 -1px 0 ${theme.colors.neutral[300]}`),
    },
    filled: {
      bgColor: disabled ? theme.colors.neutral[50] : theme.colors.neutral[100],
      borderColor: "transparent",
      borderWidth: "0",
      borderRadius: "8px",
      boxShadow: isFocused ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.default

  const handleChange = (e) => {
    setCharCount(e.target.value.length)
    props.onChange?.(e)
  }

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: theme.spacing[2],
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.foreground,
        }}>
          {label}
        </label>
      )}

      {/* Container for textarea and actions */}
      <div style={{
        position: "relative",
        display: "flex",
        gap: theme.spacing[3],
        alignItems: "flex-start",
      }}>
        {/* Avatar section */}
        {avatar && (
          <div style={{
            width: "40px",
            height: "40px",
            minWidth: "40px",
            borderRadius: "50%",
            backgroundImage: `url(${avatar})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `2px solid ${theme.colors.neutral[200]}`,
            marginTop: "4px",
          }} />
        )}

        {/* Textarea wrapper */}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            disabled={disabled}
            rows={rows}
            style={{
              width: "100%",
              padding: sizeConfig.padding,
              fontSize: sizeConfig.fontSize,
              fontWeight: theme.typography.fontWeight.normal,
              fontFamily: "inherit",
              backgroundColor: currentVariant.bgColor,
              color: theme.colors.foreground,
              border: "none",
              borderRadius: currentVariant.borderRadius,
              transition: "all 250ms ease",
              resize: "vertical",
              cursor: disabled ? "not-allowed" : "text",
              opacity: disabled ? 0.6 : 1,
              outline: "none",
              boxShadow: currentVariant.boxShadow,
              paddingRight: actions ? "120px" : sizeConfig.padding.split(" ")[1],
              WebkitAppearance: "none",
              WebkitFocusRingColor: "transparent",
            }}
            className={cn(className)}
            ref={ref}
            onChange={handleChange}
            onFocus={() => !disabled && setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Actions section - absolute positioned */}
          {actions && (
            <div style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              display: "flex",
              gap: theme.spacing[2],
              alignItems: "center",
            }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Helper text and character count */}
      {(helperText || showCharCount) && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: theme.spacing[2],
          fontSize: theme.typography.fontSize.xs,
          gap: theme.spacing[4],
        }}>
          {helperText && (
            <p style={{
              color: error ? theme.colors.destructive[600] : theme.colors.neutral[500],
              margin: 0,
            }}>
              {helperText}
            </p>
          )}
          {showCharCount && maxLength && (
            <p style={{
              color: charCount > maxLength * 0.8 
                ? theme.colors.warning[600] 
                : theme.colors.neutral[500],
              margin: 0,
              marginLeft: helperText ? "auto" : 0,
              whiteSpace: "nowrap",
            }}>
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
