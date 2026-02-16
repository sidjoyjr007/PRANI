/**
 * Spinner Component
 * Loading indicator with theme integration
 * Variants: default, primary, secondary, success, destructive
 * Sizes: xs, sm, md, lg, xl
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const spinnerSizes = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-3",
}

const getSpinnerColor = (variant, theme) => {
  switch (variant) {
    case "primary":
      return theme.colors.primary.DEFAULT
    case "secondary":
      return theme.colors.secondary.DEFAULT
    case "success":
      return theme.colors.success.DEFAULT
    case "destructive":
      return theme.colors.destructive.DEFAULT
    default:
      return theme.colors.primary.DEFAULT
  }
}

const Spinner = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  ...props 
}, ref) => {
  const theme = useTheme()
  const color = getSpinnerColor(variant, theme)
  
  return (
    <div
      ref={ref}
      style={{
        borderColor: `${color}20`,
        borderTopColor: color,
      }}
      className={cn(
        "inline-block rounded-full animate-spin",
        spinnerSizes[size],
        className
      )}
      {...props}
    />
  )
})
Spinner.displayName = "Spinner"

export { Spinner, spinnerSizes }
