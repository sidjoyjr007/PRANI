/**
 * Input Component
 * Beautiful input inspired by Tailwind UI but styled with our gorgeous theme
 * Purple primary, clean neutral borders, elegant states
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  placeholder,
  disabled = false,
  error = false,
  helperText,
  label,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isFocused, setIsFocused] = React.useState(false)

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
      
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {LeadingIcon && (
          <div style={{
            position: "absolute",
            left: theme.spacing[3],
            color: isFocused ? theme.colors.primary[500] : theme.colors.neutral[400],
            transition: `color ${theme.transitions.normal}`,
            display: "flex",
            alignItems: "center",
          }}>
            <LeadingIcon size={20} />
          </div>
        )}

        <input
          type={type}
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: theme.spacing[12],
            paddingLeft: LeadingIcon ? theme.spacing[11] : theme.spacing[4],
            paddingRight: TrailingIcon ? theme.spacing[11] : theme.spacing[4],
            backgroundColor: disabled 
              ? theme.colors.neutral[50]
              : error
                ? theme.colors.destructive[50]
                : theme.colors.card,
            color: theme.colors.foreground,
            border: `2px solid ${error
              ? theme.colors.destructive[500]
              : isFocused
                ? theme.colors.primary[500]
                : theme.colors.neutral[300]}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.normal,
            fontFamily: "inherit",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.6 : 1,
            transition: `all ${theme.transitions.normal}`,
            outline: "none",
            boxShadow: isFocused
              ? `0 0 0 3px ${error ? theme.colors.destructive[100] : theme.colors.primary[100]}`
              : `0 1px 2px ${theme.colors.shadow}10`,
          }}
          className={cn(className)}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {TrailingIcon && (
          <div style={{
            position: "absolute",
            right: theme.spacing[3],
            color: isFocused ? theme.colors.primary[500] : theme.colors.neutral[400],
            transition: `color ${theme.transitions.normal}`,
            display: "flex",
            alignItems: "center",
          }}>
            <TrailingIcon size={20} />
          </div>
        )}
      </div>

      {helperText && (
        <p style={{
          marginTop: theme.spacing[2],
          fontSize: theme.typography.fontSize.xs,
          color: error ? theme.colors.destructive[600] : theme.colors.neutral[500],
          fontWeight: theme.typography.fontWeight.normal,
        }}>
          {helperText}
        </p>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
