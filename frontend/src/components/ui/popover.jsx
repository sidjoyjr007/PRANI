/**
 * Popover Component with theme integration
 * Content container triggered by click
 * Variants: default, light
 * Positions: top, bottom, left, right
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const PopoverContext = React.createContext({ isOpen: false, handleOpenChange: () => {} })

const Popover = React.forwardRef(({ 
  className, 
  open = false,
  onOpenChange,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(open)

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <PopoverContext.Provider value={{ isOpen, handleOpenChange }}>
      <div ref={ref} {...props} />
    </PopoverContext.Provider>
  )
})
Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(PopoverContext)

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(true)}
      className={className}
      {...props}
    />
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(({ 
  className, 
  side = "bottom",
  ...props 
}, ref) => {
  const { isOpen, handleOpenChange } = React.useContext(PopoverContext)

  if (!isOpen) return null

  const sideClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          "absolute z-50 rounded-md border border-border bg-card p-4 shadow-lg",
          sideClasses[side],
          "animate-in fade-in slide-in-from-top-2 duration-200",
          className
        )}
        {...props}
      />
    </>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
