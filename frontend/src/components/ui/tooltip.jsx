/**
 * Tooltip Component
 * Small popup hint with theme integration
 * Positions: top, bottom, left, right
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const Tooltip = React.forwardRef(({ 
  content,
  side = "top",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isVisible, setIsVisible] = React.useState(false)

  const sideStyles = {
    top: { bottom: "100%", marginBottom: theme.spacing[2], left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "100%", marginTop: theme.spacing[2], left: "50%", transform: "translateX(-50%)" },
    left: { right: "100%", marginRight: theme.spacing[2], top: "50%", transform: "translateY(-50%)" },
    right: { left: "100%", marginLeft: theme.spacing[2], top: "50%", transform: "translateY(-50%)" },
  }

  const arrowStyles = {
    top: { 
      bottom: `calc(-${theme.spacing[1]} + 2px)`, 
      left: "50%", 
      transform: "translateX(-50%)",
      borderTopColor: theme.colors.foreground,
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
    },
    bottom: { 
      top: `calc(-${theme.spacing[1]} + 2px)`, 
      left: "50%", 
      transform: "translateX(-50%)",
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: theme.colors.foreground,
      borderLeftColor: "transparent",
    },
    left: { 
      right: `calc(-${theme.spacing[1]} + 2px)`, 
      top: "50%", 
      transform: "translateY(-50%)",
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: theme.colors.foreground,
    },
    right: { 
      left: `calc(-${theme.spacing[1]} + 2px)`, 
      top: "50%", 
      transform: "translateY(-50%)",
      borderTopColor: "transparent",
      borderRightColor: theme.colors.foreground,
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
    },
  }

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {props.children}
      {isVisible && content && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            ...sideStyles[side],
            backgroundColor: theme.colors.foreground,
            color: theme.colors.background,
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.normal,
            whiteSpace: "nowrap",
            borderRadius: theme.borderRadius.sm,
            boxShadow: theme.shadows.lg,
            opacity: 1,
            transition: theme.transitions.fast,
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              borderWidth: theme.spacing[1],
              ...arrowStyles[side],
            }}
          />
        </div>
      )}
    </div>
  )
})
Tooltip.displayName = "Tooltip"

export { Tooltip }
