/**
 * Switch Component
 * Toggle switch for binary selections with smooth animations
 * Designed with inspiration from shadcn/ui
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Switch = React.forwardRef(({ 
  className, 
  checked = false,
  onCheckedChange,
  disabled = false,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isChecked, setIsChecked] = React.useState(checked)

  const handleToggle = () => {
    if (!disabled) {
      setIsChecked(!isChecked)
      onCheckedChange?.(!isChecked)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      style={{
        backgroundColor: isChecked ? theme.colors.primary.DEFAULT : theme.colors.input,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: theme.transitions.normal,
        opacity: disabled ? 0.5 : 1,
      }}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border-0 p-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = isChecked 
            ? theme.colors.primary[600]
            : theme.colors.input
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = isChecked 
            ? theme.colors.primary.DEFAULT
            : theme.colors.input
        }
      }}
      {...props}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform"
        style={{
          transform: isChecked ? "translateX(24px)" : "translateX(4px)",
          transition: theme.transitions.normal,
        }}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }
