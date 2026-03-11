/**
 * Dialog (Modal) Component
 * Modal dialog overlay with multiple variants and layouts
 * Variants: default (simple), alert, centered, fullscreen
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const DialogContext = React.createContext({ isOpen: false, handleOpenChange: () => { } })

const Dialog = React.forwardRef(({
  className,
  open = false,
  onOpenChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DialogContext.Provider value={{ isOpen, handleOpenChange }}>
      <div ref={ref} {...props} />
    </DialogContext.Provider>
  )
})
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef(({ className, asChild = false, children, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(DialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: (e) => {
        children.props.onClick?.(e)
        handleOpenChange(true)
      },
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = ({ children }) => {
  const { isOpen } = React.useContext(DialogContext)

  if (!isOpen) return null

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      {children}
    </div>
  )
}
DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(DialogContext)
  const theme = useTheme()

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        animation: "fadeIn 0.2s ease-in",
        cursor: "pointer",
      }}
      onClick={() => handleOpenChange(false)}
      className={cn(className)}
      {...props}
    />
  )
})
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({
  className,
  variant = "default",
  size = "md",
  onClose,
  showOverlay = true,
  ...props
}, ref) => {
  const { handleOpenChange, isOpen } = React.useContext(DialogContext)
  const theme = useTheme()

  if (!isOpen) return null

  const sizeConfig = {
    sm: { maxWidth: "24rem" },
    md: { maxWidth: "28rem" },
    lg: { maxWidth: "32rem" },
    xl: { maxWidth: "36rem" },
  }

  const variantStyles = {
    default: {
      borderColor: theme.colors.neutral[200],
      borderWidth: "2px",
      borderStyle: "solid",
      backgroundColor: "white",
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`,
    },
    alert: {
      borderColor: theme.colors.destructive[200],
      borderWidth: "2px",
      borderStyle: "solid",
      backgroundColor: theme.colors.destructive[50],
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`,
    },
    centered: {
      borderColor: "transparent",
      borderWidth: "0px",
      backgroundColor: "white",
      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
    },
  }

  const style = variantStyles[variant] || variantStyles.default

  return (
    <>
      {showOverlay && <DialogOverlay />}
      <div
        ref={ref}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50,
          width: "100%",
          ...sizeConfig[size],
          padding: theme.spacing[6],
          borderRadius: theme.borderRadius.lg,
          ...style,
          animation: isOpen ? "slideIn 0.3s ease-out" : "slideOut 0.2s ease-in",
          ...props.style,
        }}
        className={cn(className)}
        {...(() => {
          const { style: _style, ...rest } = props;
          return rest;
        })()}
      />
    </>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[2],
        marginBottom: theme.spacing[4],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: theme.spacing[3],
        justifyContent: "flex-end",
        marginTop: theme.spacing[6],
        paddingTop: theme.spacing[4],
        borderTopColor: theme.colors.neutral[200],
        borderTopWidth: "2px",
        borderTopStyle: "solid",
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <h2
      ref={ref}
      style={{
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight,
        color: theme.colors.neutral[900],
        marginBottom: 0,
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <p
      ref={ref}
      style={{
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.neutral[600],
        marginTop: theme.spacing[1],
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(DialogContext)
  const theme = useTheme()

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(false)}
      style={{
        position: "absolute",
        right: theme.spacing[4],
        top: theme.spacing[4],
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        padding: theme.spacing[1],
        color: theme.colors.neutral[500],
        transition: `color ${theme.transitions.normal}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.neutral[900]}
      onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[500]}
      className={cn(className)}
      {...props}
    >
      <X className="h-5 w-5" />
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>Close</span>
    </button>
  )
})
DialogClose.displayName = "DialogClose"

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
