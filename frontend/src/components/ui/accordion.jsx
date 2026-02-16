/**
 * Accordion Component
 * Collapsible content container with theme integration
 * Variants: default, bordered, flush, gradient
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const AccordionContext = React.createContext()

const Accordion = React.forwardRef(({ 
  className, 
  variant = "default",
  type = "single",
  collapsible = false,
  ...props 
}, ref) => {
  const [openItems, setOpenItems] = React.useState({})

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems(openItems[value] ? {} : { [value]: true })
    } else {
      setOpenItems(prev => ({
        ...prev,
        [value]: !prev[value]
      }))
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, variant }}>
      <div
        ref={ref}
        style={{ width: "100%" }}
        className={className}
        {...props}
      />
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef(({ className, value, ...props }, ref) => {
  const theme = useTheme()
  const context = React.useContext(AccordionContext)
  const isOpen = context?.openItems[value]
  const variant = context?.variant || "default"

  const getVariantInlineStyle = () => {
    switch (variant) {
      case "default":
        return { 
          borderBottomWidth: theme.borderWidth.sm,
          borderBottomColor: theme.colors.border,
          borderBottomStyle: "solid"
        }
      case "bordered":
        return { 
          borderWidth: theme.borderWidth.sm,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing[2]
        }
      case "gradient":
        return { 
          borderWidth: theme.borderWidth.sm,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing[2],
          backgroundColor: `${theme.colors.primary["50"]}40`
        }
      default:
        return {}
    }
  }

  return (
    <div
      ref={ref}
      style={getVariantInlineStyle()}
      className={className}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, value, disabled = false, ...props }, ref) => {
  const theme = useTheme()
  const context = React.useContext(AccordionContext)
  const isOpen = context?.openItems[value]

  return (
    <button
      ref={ref}
      disabled={disabled}
      onClick={() => !disabled && context?.toggleItem(value)}
      style={{
        color: theme.colors.foreground,
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.transitions.normal,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.colors.muted}80`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
      }}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const theme = useTheme()
  const context = React.useContext(AccordionContext)
  const isOpen = context?.openItems[value]

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      style={{
        color: theme.colors.muted_foreground,
        overflow: "hidden",
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
        transition: theme.transitions.normal,
      }}
      className={cn(
        "animate-in fade-in duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
