/**
 * Drawer Component
 * Slide-out side panel with multiple variants and positions
 * Directions: left, right, top, bottom
 * Sizes: sm, md, lg, full
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"
import { X } from "lucide-react"

const DrawerContext = React.createContext({ isOpen: false, handleOpenChange: () => {}, direction: "right" })

const Drawer = React.forwardRef(({ 
  className, 
  open = false,
  onOpenChange,
  direction = "right",
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(open)

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DrawerContext.Provider value={{ isOpen, handleOpenChange, direction }}>
      <div ref={ref} {...props} />
    </DrawerContext.Provider>
  )
})
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef(({ className, asChild = false, children, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(DrawerContext)

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
DrawerTrigger.displayName = "DrawerTrigger"

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange, isOpen } = React.useContext(DrawerContext)
  const theme = useTheme()

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        backgroundColor: `${theme.colors.shadow}80`,
        animation: "fadeIn 0.2s ease-in",
        cursor: "pointer",
      }}
      onClick={() => handleOpenChange(false)}
      className={cn(className)}
      {...props}
    />
  )
})
DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef(({ 
  className,
  size = "md",
  variant = "default",
  showOverlay = true,
  ...props 
}, ref) => {
  const { isOpen, handleOpenChange, direction } = React.useContext(DrawerContext)
  const theme = useTheme()

  const sizeConfig = {
    left: {
      sm: { width: "20rem" },
      md: { width: "24rem" },
      lg: { width: "32rem" },
      full: { width: "100%" },
    },
    right: {
      sm: { width: "20rem" },
      md: { width: "24rem" },
      lg: { width: "32rem" },
      full: { width: "100%" },
    },
    top: {
      sm: { height: "20rem" },
      md: { height: "24rem" },
      lg: { height: "28rem" },
      full: { height: "100%" },
    },
    bottom: {
      sm: { height: "20rem" },
      md: { height: "24rem" },
      lg: { height: "28rem" },
      full: { height: "100%" },
    },
  }

  const directionStyles = {
    left: {
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      animation: isOpen ? "slideInLeft 0.3s ease-out" : "slideOutLeft 0.2s ease-in",
    },
    right: {
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      animation: isOpen ? "slideInRight 0.3s ease-out" : "slideOutRight 0.2s ease-in",
    },
    top: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      animation: isOpen ? "slideInTop 0.3s ease-out" : "slideOutTop 0.2s ease-in",
    },
    bottom: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      animation: isOpen ? "slideInBottom 0.3s ease-out" : "slideOutBottom 0.2s ease-in",
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: "white",
      borderColor: theme.colors.neutral[200],
      borderWidth: "2px",
      borderStyle: "solid",
      boxShadow: `0 20px 25px -5px ${theme.colors.shadow}20`,
    },
    outline: {
      backgroundColor: "white",
      borderColor: theme.colors.neutral[300],
      borderWidth: "2px",
      borderStyle: "solid",
      boxShadow: "none",
    },
    filled: {
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: "0px",
      boxShadow: `0 20px 25px -5px ${theme.colors.shadow}20`,
    },
  }

  if (!isOpen) return null

  const style = variantStyles[variant] || variantStyles.default
  const sizeStyle = sizeConfig[direction][size] || sizeConfig[direction].md

  return (
    <>
      {showOverlay && <DrawerOverlay />}
      <div
        ref={ref}
        style={{
          ...directionStyles[direction],
          ...sizeStyle,
          ...style,
          display: "flex",
          flexDirection: "column",
          transition: `all ${theme.transitions.normal}`,
        }}
        className={cn(className)}
        {...props}
      />
    </>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing[6],
        borderBottomColor: theme.colors.neutral[200],
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: theme.spacing[3],
        justifyContent: "flex-end",
        padding: theme.spacing[6],
        borderTopColor: theme.colors.neutral[200],
        borderTopWidth: "2px",
        borderTopStyle: "solid",
        marginTop: "auto",
      }}
      className={cn(className)}
      {...props}
    />
  )
})
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => {
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
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => {
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
DrawerDescription.displayName = "DrawerDescription"

const DrawerClose = React.forwardRef(({ className, ...props }, ref) => {
  const { handleOpenChange } = React.useContext(DrawerContext)
  const theme = useTheme()

  return (
    <button
      ref={ref}
      onClick={() => handleOpenChange(false)}
      style={{
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
DrawerClose.displayName = "DrawerClose"

export {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
}
