/**
 * Kbd Component with theme integration
 * Keyboard key display
 * Variants: default, outline
 * Sizes: sm, md
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Kbd = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  ...props 
}, ref) => {
  const variantClasses = {
    default: "bg-muted text-foreground border border-border shadow-sm",
    outline: "border-2 border-border text-foreground bg-background",
  }

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs rounded",
    md: "px-2 py-1 text-sm rounded-md",
  }

  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-mono font-semibold",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
Kbd.displayName = "Kbd"

export { Kbd }
