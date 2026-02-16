/**
 * Alert Dialog Component with theme integration
 * Modal confirmation dialog
 * States: open, closed
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const AlertDialogContext = React.createContext({ isOpen: false, handleOpenChange: () => {} })

const AlertDialog = React.forwardRef(({ 
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
    <AlertDialogContext.Provider value={{ isOpen, handleOpenChange }}>
      <div ref={ref} {...props} />
    </AlertDialogContext.Provider>
  )
})
AlertDialog.displayName = "AlertDialog"

const AlertDialogTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(AlertDialogContext)

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(true)}
      className={className}
      {...props}
    />
  )
})
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  const { isOpen, handleOpenChange } = React.useContext(AlertDialogContext)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg rounded-lg",
          "animate-in fade-in slide-in-from-top-2 duration-200",
          className
        )}
        {...props}
      />
    </>
  )
})
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4", className)} {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-destructive", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(AlertDialogContext)

  return (
    <button
      ref={ref}
      onClick={() => {
        props.onClick?.()
        handleOpenChange(false)
      }}
      className={cn(
        "h-9 px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium",
        "hover:bg-destructive/90 transition-colors",
        className
      )}
      {...props}
    />
  )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(AlertDialogContext)

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(false)}
      className={cn(
        "h-9 px-4 py-2 border border-input rounded-md font-medium",
        "hover:bg-muted transition-colors",
        className
      )}
      {...props}
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
