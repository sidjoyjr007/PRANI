/**
 * Button Group Component with theme integration
 * Container for grouped buttons with various layouts
 * Variants: default (segmented), outline
 * Sizes: sm, md, lg
 * Supports: basic buttons, icon-only, with stats, with dropdowns
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const ButtonGroup = React.forwardRef(({ 
  className = "",
  variant = "default",
  size = "md",
  vertical = false,
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  
  const sizeStyles = {
    sm: { gap: 0 },
    md: { gap: 0 },
    lg: { gap: 0 }
  }

  const containerStyles = {
    display: "inline-flex",
    flexDirection: vertical ? "column" : "row",
    gap: sizeStyles[size].gap,
    borderRadius: theme.colors.neutral ? theme.borderRadius.md : "6px",
    backgroundColor: variant === "outline" ? "transparent" : theme.colors.card,
    border: variant === "outline" ? `2px solid ${theme.colors.neutral[300]}` : "none",
    transition: "all 250ms ease",
  }

  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child
    
    const totalChildren = React.Children.count(children)
    const isFirst = index === 0
    const isLast = index === totalChildren - 1
    const isMiddle = !isFirst && !isLast

    let borderRadius = "6px"
    if (vertical) {
      if (isFirst) borderRadius = `${theme.borderRadius.md} ${theme.borderRadius.md} 0 0`
      else if (isLast) borderRadius = `0 0 ${theme.borderRadius.md} ${theme.borderRadius.md}`
    } else {
      if (isFirst) borderRadius = `${theme.borderRadius.md} 0 0 ${theme.borderRadius.md}`
      else if (isLast) borderRadius = `0 ${theme.borderRadius.md} ${theme.borderRadius.md} 0`
    }

    return React.cloneElement(child, {
      _buttonGroupContext: {
        variant,
        size,
        isFirst,
        isLast,
        isMiddle,
        borderRadius,
        vertical,
      }
    })
  })

  return (
    <div
      ref={ref}
      style={containerStyles}
      className={className}
      role="group"
      {...props}
    >
      {childrenWithProps}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

const ButtonGroupButton = React.forwardRef(({ 
  className = "",
  variant = "default",
  size = "md",
  isActive = false,
  disabled = false,
  icon: Icon = null,
  label = null,
  stat = null,
  children,
  _buttonGroupContext = {},
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)
  
  const { 
    variant: groupVariant = "default",
    size: groupSize = "md",
    isFirst = false,
    isLast = false,
    isMiddle = false,
    borderRadius = "6px",
    vertical = false,
  } = _buttonGroupContext

  const effectiveVariant = groupVariant
  const effectiveSize = size || groupSize

  const sizeMap = {
    sm: { height: "32px", padding: "0 12px", fontSize: "14px" },
    md: { height: "40px", padding: "0 16px", fontSize: "14px" },
    lg: { height: "48px", padding: "0 20px", fontSize: "16px" }
  }

  const sizeStyle = sizeMap[effectiveSize]
  const borderWidth = "2px"
  const borderColor = effectiveVariant === "outline" 
    ? theme.colors.neutral[300]
    : (isFirst || isMiddle) 
      ? theme.colors.neutral[200] 
      : "transparent"

  const borderStyle = {
    left: vertical ? "none" : (isFirst ? "none" : `${borderWidth} solid ${theme.colors.neutral[200]}`),
    right: "none",
    top: vertical ? ((isFirst || isMiddle) ? "none" : `${borderWidth} solid ${theme.colors.neutral[200]}`) : "none",
    bottom: "none",
  }

  let backgroundColor, textColor, hoverBackground, hoverColor
  
  if (isActive) {
    backgroundColor = theme.colors.primary[500]
    textColor = theme.colors.white
    hoverBackground = theme.colors.primary[600]
    hoverColor = theme.colors.white
  } else if (effectiveVariant === "outline") {
    backgroundColor = theme.colors.card
    textColor = theme.colors.foreground
    hoverBackground = theme.colors.neutral[50]
    hoverColor = theme.colors.primary[600]
  } else {
    backgroundColor = theme.colors.card
    textColor = theme.colors.foreground
    hoverBackground = theme.colors.neutral[50]
    hoverColor = theme.colors.primary[600]
  }

  const buttonStyles = {
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: "500",
    borderRadius: borderRadius,
    backgroundColor: isHovered && !disabled ? hoverBackground : backgroundColor,
    color: isHovered && !disabled ? hoverColor : textColor,
    border: `${borderWidth} solid ${borderColor}`,
    borderLeft: borderStyle.left || "none",
    borderRight: borderStyle.right || "none",
    borderTop: borderStyle.top || "none",
    borderBottom: borderStyle.bottom || "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 250ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    outline: "none",
    boxShadow: isHovered && !disabled && isActive 
      ? `0 0 0 3px ${theme.colors.primary[100]}`
      : "none",
  }

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={buttonStyles}
      className={className}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {Icon && (
        <Icon size={effectiveSize === "sm" ? 16 : effectiveSize === "md" ? 18 : 20} />
      )}
      {label && <span>{label}</span>}
      {children}
      {stat && (
        <span 
          style={{
            marginLeft: "4px",
            fontSize: effectiveSize === "sm" ? "12px" : "13px",
            opacity: 0.7,
          }}
        >
          {stat}
        </span>
      )}
    </button>
  )
})
ButtonGroupButton.displayName = "ButtonGroupButton"

export { ButtonGroup, ButtonGroupButton }
