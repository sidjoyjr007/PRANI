/**
 * Field Component with theme integration
 * Form field wrapper with label and error
 * States: default, error, success
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Field = React.forwardRef(({ 
  className, 
  error,
  hint,
  label,
  required,
  children,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("w-full space-y-2", className)} {...props}>
      {label && (
        <label className={cn(
          "text-sm font-medium text-foreground",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
})
Field.displayName = "Field"

export { Field }
