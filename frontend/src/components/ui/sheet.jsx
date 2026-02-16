/**
 * Sheet Component with theme integration
 * Side panel similar to drawer
 * Variants: left, right, top, bottom
 * Sizes: sm, md, lg, full
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const SheetContext = React.createContext({ isOpen: false, handleOpenChange: () => {} })

const Sheet = React.forwardRef(({ 
  className, 
  open = false,
  onOpenChange,
  side = "right",
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(open)

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <SheetContext.Provider value={{ isOpen, handleOpenChange, side }}>
      <div ref={ref} {...props} />
    </SheetContext.Provider>
  )
})
Sheet.displayName = "Sheet"

const SheetTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(SheetContext)

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(true)}
      className={className}
      {...props}
    />
  )
})
SheetTrigger.displayName = "SheetTrigger"

const sheetSideClasses = {
  left: "left-0 h-full w-3/4 max-w-xs animate-in fade-in slide-in-from-left duration-300",
  right: "right-0 h-full w-3/4 max-w-xs animate-in fade-in slide-in-from-right duration-300",
  top: "top-0 w-full h-3/4 animate-in fade-in slide-in-from-top duration-300",
  bottom: "bottom-0 w-full h-3/4 animate-in fade-in slide-in-from-bottom duration-300",
}

const SheetContent = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  const { isOpen, handleOpenChange, side } = React.useContext(SheetContext)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-card border border-border rounded-lg shadow-lg",
          sheetSideClasses[side],
          className
        )}
        {...props}
      />
    </>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn("flex items-center justify-between p-6 border-b border-border", className)}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border p-6", className)}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

const SheetClose = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(SheetContext)

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(false)}
      className={cn(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
})
SheetClose.displayName = "SheetClose"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
}
