/**
 * Skeleton Component with theme integration
 * Loading placeholder
 * Variants: default, circular
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Skeleton = React.forwardRef(({ 
  className,
  variant = "default",
  ...props 
}, ref) => {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "h-4 rounded-md",
    avatar: "h-12 w-12 rounded-full",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-muted",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

const SkeletonText = React.forwardRef(({ lines = 3, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "w-4/5" : "w-full"} />
      ))}
    </div>
  )
})
SkeletonText.displayName = "SkeletonText"

export { Skeleton, SkeletonText }
