/**
 * Label Component
 * Text label for form fields with theme integration
 * Variants: default, primary, required
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Label = React.forwardRef(({ 
  className, 
  required = false,
  variant = "default",
  htmlFor,
  ...props 
}, ref) => {
  const theme = useTheme()
  
  let color = theme.colors.foreground
  let fontWeight = theme.typography.fontWeight.medium
  
  if (variant === "primary") {
    color = theme.colors.primary.DEFAULT
    fontWeight = theme.typography.fontWeight.semibold
  }

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      style={{
        color: color,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: fontWeight,
        lineHeight: theme.typography.lineHeight.normal,
      }}
      className={cn(
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        required && "after:content-['*'] after:ml-1",
        className
      )}
      {...props}
    >
      {props.children}
    </label>
  )
})
Label.displayName = "Label"

export { Label }