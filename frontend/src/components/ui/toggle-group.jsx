/**
 * Toggle Group Component with theme integration
 * Multiple choice toggle buttons
 * Variants: default
 * Sizes: sm, md, lg
 * Types: single, multiple
 * Designed with inspiration from shadcn/ui
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const ToggleGroupContext = React.createContext({ 
  value: [], 
  handleValueChange: () => {},
  type: "single"
})

const ToggleGroup = React.forwardRef(({ 
  className, 
  value = [],
  onValueChange,
  type = "single",
  disabled = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [selectedValue, setSelectedValue] = React.useState(value)

  const handleValueChange = (newValue) => {
    let updated
    if (type === "single") {
      updated = selectedValue.includes(newValue) ? [] : [newValue]
    } else {
      updated = selectedValue.includes(newValue)
        ? selectedValue.filter(v => v !== newValue)
        : [...selectedValue, newValue]
    }
    setSelectedValue(updated)
    onValueChange?.(updated)
  }

  return (
    <ToggleGroupContext.Provider 
      value={{ value: selectedValue, handleValueChange, type, disabled }}
    >
      <div
        ref={ref}
        style={{
          display: "inline-flex",
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.input,
          borderWidth: theme.borderWidth.sm,
          borderStyle: "solid",
          padding: theme.spacing[1],
          gap: theme.spacing[1],
          backgroundColor: theme.colors.muted,
        }}
        className={className}
        role="group"
        {...props}
      />
    </ToggleGroupContext.Provider>
  )
})
ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef(({ 
  value, 
  className, 
  ...props 
}, ref) => {
  const theme = useTheme()
  const { value: selectedValue, handleValueChange, disabled } = React.useContext(ToggleGroupContext)
  const isSelected = selectedValue.includes(value)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => handleValueChange(value)}
      disabled={disabled}
      style={{
        backgroundColor: isSelected ? theme.colors.background : "transparent",
        color: isSelected ? theme.colors.foreground : theme.colors.muted_foreground,
        transition: theme.transitions.normal,
        borderRadius: theme.borderRadius.md,
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      onMouseEnter={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.color = theme.colors.foreground
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.color = theme.colors.muted_foreground
        }
      }}
      {...props}
    />
  )
})
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
