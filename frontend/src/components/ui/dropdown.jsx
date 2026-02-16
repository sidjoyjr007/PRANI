/**
 * Dropdown Menu Component
 * Beautiful dropdown inspired by Tailwind UI, styled with purple theme
 * Features: icons, dividers, headers, action variants
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const DropdownContext = React.createContext({ isOpen: false, handleOpenChange: () => {} })

const Dropdown = React.forwardRef(({ 
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

  // Close on escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, handleOpenChange])

  return (
    <DropdownContext.Provider value={{ isOpen, handleOpenChange }}>
      <div ref={ref} style={{ position: "relative", display: "inline-block" }} {...props} />
    </DropdownContext.Provider>
  )
})
Dropdown.displayName = "Dropdown"

const DropdownTrigger = React.forwardRef(({ className, asChild = false, children, ...props }, ref) => {
  const { isOpen, handleOpenChange } = React.useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: (e) => {
        children.props.onClick?.(e)
        handleOpenChange(!isOpen)
      },
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => handleOpenChange(!isOpen)}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownTrigger.displayName = "DropdownTrigger"

const DropdownContent = React.forwardRef(({ 
  align = "start",
  side = "bottom",
  ...props 
}, ref) => {
  const theme = useTheme()
  const { isOpen, handleOpenChange } = React.useContext(DropdownContext)

  if (!isOpen) return null

  const alignmentStyles = {
    start: { left: 0 },
    center: { left: "50%", transform: "translateX(-50%)" },
    end: { right: 0 },
  }

  const sideStyles = {
    top: { bottom: "100%", marginBottom: theme.spacing[2] },
    bottom: { top: "100%", marginTop: theme.spacing[2] },
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
        }}
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={ref}
        style={{
          position: "absolute",
          ...alignmentStyles[align],
          ...sideStyles[side],
          minWidth: theme.sizes.minWidth.dropdown,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.card,
          border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          boxShadow: `0 ${theme.spacing[5]} ${theme.spacing[6]} -${theme.spacing[1]} ${theme.colors.foreground}15, 0 ${theme.spacing[2]} ${theme.spacing[2.5]} -${theme.spacing[1]} ${theme.colors.foreground}08`,
          zIndex: 50,
          overflow: "hidden",
          outline: "none",
        }}
        {...props}
      />
    </>
  )
})
DropdownContent.displayName = "DropdownContent"

const DropdownItem = React.forwardRef(({ 
  variant = "default",
  disabled = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...props 
}, ref) => {
  const theme = useTheme()
  const { handleOpenChange } = React.useContext(DropdownContext)
  const [isHovering, setIsHovering] = React.useState(false)

  const variantStyles = {
    default: {
      color: theme.colors.foreground,
      hoverBg: theme.colors.neutral[50],
    },
    destructive: {
      color: theme.colors.destructive[600],
      hoverBg: theme.colors.destructive[50],
    },
  }

  const style = variantStyles[variant]

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => {
        props.onClick?.()
        handleOpenChange(false)
      }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.normal,
        color: style.color,
        backgroundColor: isHovering && !disabled ? style.hoverBg : "transparent",
        opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: theme.transitions.normal,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing[2],
        border: "none",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {LeadingIcon && (
        <LeadingIcon size={16} style={{ flexShrink: 0 }} />
      )}
      {props.children}
      {TrailingIcon && (
        <TrailingIcon size={16} style={{ marginLeft: "auto", flexShrink: 0 }} />
      )}
    </button>
  )
})
DropdownItem.displayName = "DropdownItem"

const DropdownSeparator = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        height: theme.borderWidth.sm,
        backgroundColor: theme.colors.neutral[200],
        margin: `${theme.spacing[1]} 0`,
      }}
      {...props}
    />
  )
})
DropdownSeparator.displayName = "DropdownSeparator"

const DropdownLabel = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.neutral[500],
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
      {...props}
    />
  )
})
DropdownLabel.displayName = "DropdownLabel"

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
}
