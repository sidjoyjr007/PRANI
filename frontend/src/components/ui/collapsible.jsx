/**
 * Collapsible Component with theme integration
 * Expandable/collapsible content container
 * Variants: default, card, flush
 * States: open, closed
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const Collapsible = React.forwardRef(({ className, open = false, onOpenChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(open)

  const handleToggle = () => {
    setIsOpen(!isOpen)
    onOpenChange?.(!isOpen)
  }

  return (
    <div
      ref={ref}
      style={{ width: "100%" }}
      className={className}
      {...props}
    >
      <CollapsibleContext.Provider value={{ isOpen, handleToggle }}>
        {props.children}
      </CollapsibleContext.Provider>
    </div>
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleContext = React.createContext({ isOpen: false, handleToggle: () => {} })

const CollapsibleTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  const { isOpen, handleToggle } = React.useContext(CollapsibleContext)

  return (
    <button
      ref={ref}
      onClick={handleToggle}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.transitions.normal,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.colors.muted}80`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
      }}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    >
      <span>{props.children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  const { isOpen } = React.useContext(CollapsibleContext)

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      style={{
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.muted_foreground,
      }}
      className={cn(
        "animate-in fade-in slide-in-from-top-2 duration-200",
        className
      )}
      {...props}
    />
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
