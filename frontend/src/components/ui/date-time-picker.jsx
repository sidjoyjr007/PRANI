import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Input } from "./input"

const DateTimePicker = React.forwardRef(({ 
  value, 
  onChange, 
  label, 
  className,
  ...props 
}, ref) => {
  const theme = useTheme()

  return (
    <div className={className} style={{ width: "100%" }}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: theme.spacing[2],
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.foreground,
        }}>
          {label}
        </label>
      )}
      <Input
        type="datetime-local"
        value={value}
        onChange={onChange}
        ref={ref}
        leadingIcon={CalendarIcon}
        {...props}
        style={{
          ...props.style,
          appearance: "none",
        }}
      />
    </div>
  )
})

DateTimePicker.displayName = "DateTimePicker"

export { DateTimePicker }
