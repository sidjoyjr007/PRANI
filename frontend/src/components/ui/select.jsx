/**
 * Select Component
 * Beautiful select dropdown inspired by Tailwind UI, styled with purple theme
 * Features: multiple variants, searchable, grouped options, avatars, status indicators
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const SelectContext = React.createContext({ 
  value: "", 
  isOpen: false, 
  handleOpenChange: () => {}, 
  handleValueChange: () => {},
  registerLabel: () => {},
  labels: {},
  variant: "default",
  size: "md",
})

const Select = React.forwardRef(({ 
  className, 
  value = "",
  onValueChange,
  children,
  variant = "default",
  size = "md",
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const [labels, setLabels] = React.useState({})

  const handleOpenChange = (newOpen) => setIsOpen(newOpen)
  
  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  const registerLabel = React.useCallback((val, label) => {
    setLabels(prev => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  // Sync internal selectedValue with prop value
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  // Close on escape
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ 
      value: selectedValue, 
      isOpen, 
      handleOpenChange, 
      handleValueChange,
      registerLabel,
      labels,
      variant,
      size,
    }}>
      <div ref={ref} style={{ position: "relative", width: "100%" }} className={cn("select-container", className)} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

const SelectGroup = React.forwardRef(({ className, label, children, ...props }, ref) => (
  <div ref={ref} style={{ overflow: "hidden" }} className={className} {...props}>
    {label && <SelectLabel>{label}</SelectLabel>}
    {children}
  </div>
))
SelectGroup.displayName = "SelectGroup"

const SelectValue = ({ placeholder = "Select..." }) => {
  const { value, labels } = React.useContext(SelectContext)
  return labels[value] || placeholder
}



const SelectTrigger = React.forwardRef(({ 
  className, 
  size = "md",
  disabled = false,
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const { isOpen, handleOpenChange, value, variant } = React.useContext(SelectContext)
  const [isHovering, setIsHovering] = React.useState(false)

  const sizeStyles = {
    sm: { height: "32px", paddingX: "12px", fontSize: "0.875rem" },
    md: { height: "40px", paddingX: "16px", fontSize: "0.875rem" },
    lg: { height: "48px", paddingX: "16px", fontSize: "1rem" },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // Variant styles
  const variantStyles = {
    default: {
      bgColor: disabled ? theme.colors.neutral[50] : theme.colors.card,
      borderColor: isOpen ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    outline: {
      bgColor: "transparent",
      borderColor: isOpen ? theme.colors.primary[500] : isHovering && !disabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    },
    minimal: {
      bgColor: "transparent",
      borderColor: "transparent",
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `inset 0 -2px 0 ${theme.colors.primary[500]}` : `inset 0 -1px 0 ${theme.colors.neutral[300]}`,
    },
    filled: {
      bgColor: disabled ? theme.colors.neutral[50] : theme.colors.neutral[100],
      borderColor: "transparent",
      textColor: theme.colors.foreground,
      boxShadow: isOpen ? `0 0 0 3px ${theme.colors.primary[100]}` : "none",
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.default

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && handleOpenChange(!isOpen)}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: sizeConfig.height,
        paddingLeft: sizeConfig.paddingX,
        paddingRight: sizeConfig.paddingX,
        fontSize: sizeConfig.fontSize,
        fontWeight: theme.typography.fontWeight.normal,
        backgroundColor: currentVariant.bgColor,
        color: currentVariant.textColor,
        border: variant === "minimal" ? "none" : `2px solid ${currentVariant.borderColor}`,
        borderRadius: variant === "minimal" ? "0" : "8px",
        transition: "all 150ms ease",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: currentVariant.boxShadow,
      }}
      className={cn(className)}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <span style={{ color: value ? theme.colors.foreground : theme.colors.neutral[500] }}>
        {children}
      </span>
      <ChevronDown 
        size={18} 
        style={{ 
          transition: "transform 150ms ease", 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          flexShrink: 0,
          marginLeft: "8px",
          color: theme.colors.neutral[400]
        }} 
      />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, maxHeight = "320px", side = "auto", ...props }, ref) => {
  const theme = useTheme()
  const { isOpen, handleOpenChange } = React.useContext(SelectContext)
  const [position, setPosition] = React.useState("bottom")
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    if (!isOpen || side !== "auto") {
      setPosition(side === "top" ? "top" : "bottom")
      return
    }

    // Auto-detect if dropdown should appear on top
    const checkPosition = () => {
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect()
        const isHidden = contentRect.bottom > window.innerHeight - 10
        setPosition(isHidden ? "top" : "bottom")
      }
    }

    // Check position after a small delay to ensure content is rendered
    const timer = setTimeout(checkPosition, 0)
    return () => clearTimeout(timer)
  }, [isOpen, side])

  if (!isOpen) return null

  const positionStyles = {
    bottom: {
      top: "100%",
      marginTop: "8px",
      marginBottom: "0",
    },
    top: {
      bottom: "100%",
      marginTop: "0",
      marginBottom: "8px",
    }
  }

  const currentPosition = positionStyles[position] || positionStyles.bottom

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
        }}
        onClick={() => handleOpenChange(false)}
      />
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          left: 0,
          minWidth: "200px",
          maxHeight: maxHeight,
          borderRadius: "8px",
          border: `2px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.card,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          zIndex: 9999,
          overflowY: "auto",
          ...currentPosition,
        }}
        className={cn(className)}
        {...props}
      />
    </>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ 
  value, 
  disabled = false,
  className, 
  children,
  leadingIcon: LeadingIcon,
  avatar,
  status,
  description,
  checkPosition = "right",
  ...props 
}, ref) => {
  const theme = useTheme()
  const { value: selectedValue, handleValueChange, registerLabel } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  const [isHovering, setIsHovering] = React.useState(false)

  React.useEffect(() => {
    if (value !== undefined && children) {
      // Simple text extraction from children if it's a string, otherwise use value
      const label = typeof children === 'string' ? children : String(children)
      registerLabel(value, label)
    }
  }, [value, children, registerLabel])

  const statusColors = {
    online: theme.colors.success[500],
    away: theme.colors.warning[500],
    offline: theme.colors.neutral[500],
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && handleValueChange(value)}
      style={{
        display: "flex",
        width: "100%",
        textAlign: "left",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.normal,
        backgroundColor: isSelected ? theme.colors.primary[50] : isHovering && !disabled ? theme.colors.neutral[50] : "transparent",
        color: isSelected ? theme.colors.primary[700] : theme.colors.foreground,
        border: "none",
        transition: "background-color 150ms ease",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      className={cn(className)}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {checkPosition === "left" && isSelected && (
        <Check size={16} style={{ flexShrink: 0, color: theme.colors.primary[600] }} />
      )}
      
      {avatar && (
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundImage: `url(${avatar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
          position: "relative",
          border: `2px solid ${theme.colors.neutral[200]}`,
        }}>
          {status && (
            <div style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: statusColors[status] || statusColors.offline,
              border: `2px solid ${theme.colors.card}`,
            }} />
          )}
        </div>
      )}

      {LeadingIcon && !avatar && (
        <LeadingIcon size={16} style={{ flexShrink: 0 }} />
      )}

      <div style={{ flex: 1 }}>
        <div>{children}</div>
        {description && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: isSelected ? theme.colors.primary[500] : theme.colors.neutral[500],
            marginTop: "4px",
          }}>
            {description}
          </div>
        )}
      </div>

      {checkPosition === "right" && isSelected && (
        <Check size={16} style={{ flexShrink: 0, color: theme.colors.primary[600] }} />
      )}
    </button>
  )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: theme.colors.neutral[200],
        margin: "8px 0",
        height: "1px",
      }}
      className={className}
      {...props}
    />
  )
})
SelectSeparator.displayName = "SelectSeparator"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  const theme = useTheme()
  return (
    <div
      ref={ref}
      style={{
        color: theme.colors.neutral[500],
        padding: "8px 16px",
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
      className={className}
      {...props}
    />
  )
})
SelectLabel.displayName = "SelectLabel"

const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
}
