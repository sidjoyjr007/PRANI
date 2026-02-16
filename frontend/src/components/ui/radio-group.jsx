/**
 * Radio Group Component
 * Beautiful radio button group inspired by Tailwind UI, styled with purple theme
 * Features: multiple layouts, descriptions, card variants, sizes
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const RadioGroupContext = React.createContext({ 
  selectedValue: null, 
  handleChange: () => {}, 
  disabled: false,
  variant: "default",
  layout: "vertical",
  size: "md",
})

const RadioGroup = React.forwardRef(({ 
  className, 
  value,
  onValueChange,
  disabled = false,
  variant = "default",
  layout = "vertical",
  size = "md",
  ...props 
}, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(value)

  const handleChange = (newValue) => {
    if (!disabled) {
      setSelectedValue(newValue)
      onValueChange?.(newValue)
    }
  }

  const layoutStyle = layout === "inline" 
    ? { display: "flex", gap: "24px", flexWrap: "wrap" }
    : { display: "flex", flexDirection: "column", gap: "12px" }

  return (
    <div
      ref={ref}
      style={layoutStyle}
      role="radiogroup"
      className={cn(className)}
      {...props}
    >
      <RadioGroupContext.Provider value={{ 
        selectedValue, 
        handleChange, 
        disabled,
        variant,
        layout,
        size,
      }}>
        {props.children}
      </RadioGroupContext.Provider>
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ 
  value, 
  className, 
  disabled: itemDisabled,
  label,
  description,
  radioPosition = "left",
  ...props 
}, ref) => {
  const theme = useTheme()
  const { selectedValue, handleChange, disabled: groupDisabled, variant, size } = React.useContext(RadioGroupContext)
  const isDisabled = itemDisabled || groupDisabled
  const isSelected = selectedValue === value
  const [isHovering, setIsHovering] = React.useState(false)

  // Size configurations
  const sizeStyles = {
    sm: { radioSize: "16px", gap: "8px", fontSize: theme.typography.fontSize.xs },
    md: { radioSize: "20px", gap: "12px", fontSize: theme.typography.fontSize.sm },
    lg: { radioSize: "24px", gap: "16px", fontSize: theme.typography.fontSize.base },
  }

  const sizeConfig = sizeStyles[size] || sizeStyles.md

  // Variant styles
  const variantStyles = {
    default: {
      bgColor: isSelected ? theme.colors.primary[50] : isHovering && !isDisabled ? theme.colors.neutral[50] : "transparent",
      borderColor: isSelected ? theme.colors.primary[500] : isHovering && !isDisabled ? theme.colors.neutral[400] : theme.colors.neutral[300],
      borderWidth: "2px",
      borderRadius: "8px",
      padding: "8px 12px",
      outline: true,
    },
    card: {
      bgColor: isSelected ? theme.colors.primary[50] : isHovering && !isDisabled ? theme.colors.neutral[50] : theme.colors.card,
      borderColor: isSelected ? theme.colors.primary[500] : theme.colors.neutral[200],
      borderWidth: "2px",
      borderRadius: "12px",
      padding: "16px",
      outline: true,
    },
    minimal: {
      bgColor: "transparent",
      borderColor: "transparent",
      borderWidth: "0",
      borderRadius: "0",
      padding: "0",
      outline: false,
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.default

  const containerStyle = {
    display: "flex",
    alignItems: description ? "flex-start" : "center",
    gap: sizeConfig.gap,
    padding: currentVariant.padding,
    backgroundColor: currentVariant.bgColor,
    border: currentVariant.outline ? `${currentVariant.borderWidth} solid ${currentVariant.borderColor}` : "none",
    borderRadius: currentVariant.borderRadius,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.6 : 1,
    transition: "all 250ms ease",
    flexDirection: radioPosition === "right" ? "row-reverse" : "row",
    order: radioPosition === "right" ? 1 : 0,
  }

  const radioStyle = {
    width: sizeConfig.radioSize,
    height: sizeConfig.radioSize,
    minWidth: sizeConfig.radioSize,
    minHeight: sizeConfig.radioSize,
    borderRadius: "50%",
    border: `2px solid ${isSelected ? theme.colors.primary[500] : isHovering && !isDisabled ? theme.colors.neutral[400] : theme.colors.neutral[300]}`,
    backgroundColor: isSelected ? theme.colors.primary[500] : "transparent",
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 250ms ease",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: description ? "2px" : "0",
  }

  const labelStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.normal,
    color: isSelected ? theme.colors.primary[700] : theme.colors.foreground,
    margin: 0,
  }

  const descriptionStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: isSelected ? theme.colors.primary[500] : theme.colors.neutral[500],
    margin: "4px 0 0 0",
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => handleChange(value)}
      onMouseEnter={() => !isDisabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={containerStyle}
      className={cn(className)}
      {...props}
    >
      <div style={radioStyle}>
        {isSelected && (
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: theme.colors.card,
          }} />
        )}
      </div>

      {label && (
        <div style={{ flex: 1 }}>
          <p style={labelStyle}>{label}</p>
          {description && <p style={descriptionStyle}>{description}</p>}
        </div>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
