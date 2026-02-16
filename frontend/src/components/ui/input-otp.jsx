/**
 * Input OTP Component with theme integration
 * One-time password input
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const InputOTP = React.forwardRef(({ 
  className, 
  maxLength = 6,
  onChange,
  value = "",
  size = "md",
  ...props 
}, ref) => {
  const [otpValue, setOtpValue] = React.useState(value)
  const inputRefs = React.useRef([])

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  }

  const handleChange = (index, event) => {
    const val = event.target.value
    if (!/^\d*$/.test(val)) return

    const newOtp = otpValue.split("")
    newOtp[index] = val
    const newValue = newOtp.join("").slice(0, maxLength)
    
    setOtpValue(newValue)
    onChange?.(newValue)

    if (val && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex gap-2", className)}
      {...props}
    >
      {Array.from({ length: maxLength }).map((_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          maxLength="1"
          inputMode="numeric"
          value={otpValue[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={cn(
            "text-center font-semibold border-2 border-input rounded-lg",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30",
            "bg-background text-foreground",
            sizeClasses[size]
          )}
        />
      ))}
    </div>
  )
})
InputOTP.displayName = "InputOTP"

export { InputOTP }
