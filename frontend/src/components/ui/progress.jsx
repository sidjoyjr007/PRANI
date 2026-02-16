/**
 * Progress Component
 * Progress bar indicator with theme integration
 * Variants: default, success, warning, destructive
 * Sizes: xs, sm, md, lg
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const progressSizes = {
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

const getProgressColor = (variant, theme) => {
  switch (variant) {
    case "success":
      return theme.colors.success.DEFAULT
    case "warning":
      return theme.colors.warning.DEFAULT
    case "destructive":
      return theme.colors.destructive.DEFAULT
    default:
      return theme.colors.primary.DEFAULT
  }
}

const Progress = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  value = 0,
  max = 100,
  label,
  showLabel = false,
  animated = true,
  ...props 
}, ref) => {
  const theme = useTheme()
  const percentage = (value / max) * 100
  const color = getProgressColor(variant, theme)

  return (
    <div className="w-full space-y-2">
      {(label || showLabel) && (
        <div className="flex justify-between text-sm">
          <span style={{ color: theme.colors.foreground, fontWeight: theme.typography.fontWeight.medium }}>
            {label}
          </span>
          <span style={{ color: theme.colors.muted_foreground }}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        ref={ref}
        style={{
          backgroundColor: theme.colors.muted,
        }}
        className={cn(
          "w-full overflow-hidden rounded-full",
          progressSizes[size],
          className
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all",
            animated && "duration-500",
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
