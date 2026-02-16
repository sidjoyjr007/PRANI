/**
 * Scroll Area Component with theme integration
 * Scrollable container
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const ScrollArea = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-md border border-border",
      className
    )}
    {...props}
  />
))
ScrollArea.displayName = "ScrollArea"

const ScrollAreaViewport = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-full w-full rounded-[inherit] overflow-auto", className)}
    {...props}
  />
))
ScrollAreaViewport.displayName = "ScrollAreaViewport"

const ScrollAreaScrollbar = React.forwardRef(({ 
  className, 
  orientation = "vertical",
  ...props 
}, ref) => {
  const orientationClasses = {
    vertical: "w-2.5",
    horizontal: "h-2.5 flex-col",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-muted rounded-full",
        orientationClasses[orientation],
        className
      )}
      {...props}
    />
  )
})
ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar"

const ScrollAreaThumb = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex-1 rounded-full bg-border hover:bg-border/60 transition-colors",
      className
    )}
    {...props}
  />
))
ScrollAreaThumb.displayName = "ScrollAreaThumb"

export {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
}
