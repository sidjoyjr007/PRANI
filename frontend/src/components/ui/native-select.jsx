/**
 * Native Select Component with theme integration
 * HTML native select element
 * Variants: default, outline
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const NativeSelect = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  disabled = false,
  ...props 
}, ref) => {
  const theme = useTheme()

  const sizeStyles = {
    sm: {
      height: theme.sizes.height.selectSm,
      padding: `0 ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.xs,
      borderRadius: theme.borderRadius.md,
    },
    md: {
      height: theme.sizes.height.selectMd,
      padding: `0 ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.md,
    },
    lg: {
      height: theme.sizes.height.selectLg,
      padding: `0 ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borderRadius.md,
    },
  }

  const variantStyles = {
    default: {
      borderWidth: theme.borderWidth.sm,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    outline: {
      borderWidth: "2px",
      borderColor: theme.colors.border,
      backgroundColor: "transparent",
    },
  }

  return (
    <div style={{ position: "relative" }}>
      <select
        ref={ref}
        disabled={disabled}
        style={{
          ...sizeStyles[size],
          ...variantStyles[variant],
          width: "100%",
          appearance: "none",
          color: theme.colors.foreground,
          transition: theme.transitions.normal,
          borderStyle: "solid",
          paddingRight: theme.spacing[9],
        }}
        className={cn(
          "flex placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      <ChevronDown
        style={{
          position: "absolute",
          right: theme.spacing[3],
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.colors.muted_foreground,
          pointerEvents: "none",
        }}
        className="h-4 w-4"
      />
    </div>
  )
})
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
