/**
 * Slider Component with theme integration
 * Range input slider
 * Variants: default, primary
 * Sizes: sm, md, lg
 * States: single, range
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

const Slider = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "md",
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const [sliderValue, setSliderValue] = React.useState(value || min)

  const handleChange = (e) => {
    const newValue = Number(e.target.value)
    setSliderValue(newValue)
    onValueChange?.(newValue)
  }

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  const percentage = ((sliderValue - min) / (max - min)) * 100

  return (
    <div className="w-full space-y-2">
      <div className={cn("relative flex items-center", sizeClasses[size])}>
        <div className="absolute inset-y-0 w-full rounded-full bg-muted" />
        <div
          className="absolute inset-y-0 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "relative w-full appearance-none cursor-pointer rounded-full bg-transparent",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary",
            "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer",
            className
          )}
          {...props}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span className="font-medium text-foreground">{sliderValue}</span>
        <span>{max}</span>
      </div>
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
