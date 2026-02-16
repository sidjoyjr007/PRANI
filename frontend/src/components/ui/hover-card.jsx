/**
 * Hover Card Component with theme integration
 * Shows content on hover
 * Positions: top, bottom, left, right
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const HoverCard = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative inline-block", className)} {...props} />
))
HoverCard.displayName = "HoverCard"

const HoverCardTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  />
))
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardContent = React.forwardRef(({ 
  className, 
  side = "bottom",
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)

  const sideClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {props.children && React.Children.toArray(props.children)[0]}
      {isVisible && (
        <div
          ref={ref}
          className={cn(
            "absolute z-50 rounded-md border border-border bg-card p-4 shadow-lg w-64",
            sideClasses[side],
            "animate-in fade-in slide-in-from-top-2 duration-200",
            className
          )}
          {...props}
        >
          {React.Children.toArray(props.children)[1]}
        </div>
      )}
    </div>
  )
})
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
