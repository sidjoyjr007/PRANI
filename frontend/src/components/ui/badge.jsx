/**
 * Badge Component
 * Beautiful badge with full theme integration
 * Variants: flat (filled) and outline (bordered)
 * Sizes: sm, md, lg
 * Supports colors: primary, secondary, success, warning, destructive
 * Features: status dot, removable, pill shape
 */

import * as React from "react"
import { X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

const Badge = React.forwardRef(({ 
  variant = "flat",
  color = "primary",
  size = "md",
  pill = false,
  dot = false,
  onRemove,
  ...props 
}, ref) => {
  const theme = useTheme()

  const sizeConfig = theme.badgeSizes[size] || theme.badgeSizes.md

  // Color mapping
  const colorMap = {
    primary: {
      flat: {
        backgroundColor: theme.colors.primary[100],
        color: theme.colors.primary[700],
        borderColor: theme.colors.primary[300],
      },
      outline: {
        backgroundColor: theme.colors.card,
        color: theme.colors.primary[700],
        borderColor: theme.colors.primary[300],
      },
      dot: theme.colors.primary[500],
    },
    secondary: {
      flat: {
        backgroundColor: theme.colors.secondary[100],
        color: theme.colors.secondary[700],
        borderColor: theme.colors.secondary[300],
      },
      outline: {
        backgroundColor: theme.colors.card,
        color: theme.colors.secondary[700],
        borderColor: theme.colors.secondary[300],
      },
      dot: theme.colors.secondary[500],
    },
    success: {
      flat: {
        backgroundColor: theme.colors.success[100],
        color: theme.colors.success[700],
        borderColor: theme.colors.success[300],
      },
      outline: {
        backgroundColor: theme.colors.card,
        color: theme.colors.success[700],
        borderColor: theme.colors.success[300],
      },
      dot: theme.colors.success[500],
    },
    warning: {
      flat: {
        backgroundColor: theme.colors.warning[100],
        color: theme.colors.warning[700],
        borderColor: theme.colors.warning[300],
      },
      outline: {
        backgroundColor: theme.colors.card,
        color: theme.colors.warning[700],
        borderColor: theme.colors.warning[300],
      },
      dot: theme.colors.warning[500],
    },
    destructive: {
      flat: {
        backgroundColor: theme.colors.destructive[100],
        color: theme.colors.destructive[700],
        borderColor: theme.colors.destructive[300],
      },
      outline: {
        backgroundColor: theme.colors.card,
        color: theme.colors.destructive[700],
        borderColor: theme.colors.destructive[300],
      },
      dot: theme.colors.destructive[500],
    },
  }

  const colorStyle = colorMap[color] || colorMap.primary
  const variantStyle = colorStyle[variant] || colorStyle.flat
  
  const dotGapSpacing = dot ? theme.spacing[1.5] : theme.spacing[1]
  const removeButtonGapSpacing = onRemove ? `calc(${theme.spacing[4]} - ${theme.spacing[1]})` : theme.spacing[4]

  return (
    <span
      ref={ref}
      style={{
        ...variantStyle,
        height: sizeConfig.height,
        paddingLeft: dot ? `calc(${sizeConfig.paddingX} - ${theme.spacing[1]})` : sizeConfig.paddingX,
        paddingRight: onRemove ? `calc(${sizeConfig.paddingX} - ${theme.spacing[0.5]})` : sizeConfig.paddingX,
        fontSize: sizeConfig.fontSize,
        fontWeight: theme.typography.fontWeight.semibold,
        border: variant === "outline" ? `${theme.borderWidth.sm} solid ${variantStyle.borderColor}` : "none",
        borderRadius: pill ? theme.borderRadius.full : theme.borderRadius.base,
        transition: theme.transitions.fast,
        display: "inline-flex",
        alignItems: "center",
        gap: dotGapSpacing,
        whiteSpace: "nowrap",
      }}
      {...props}
    >
      {dot && (
        <span style={{
          width: `${sizeConfig.dotSize}px`,
          height: `${sizeConfig.dotSize}px`,
          borderRadius: theme.borderRadius.full,
          backgroundColor: colorStyle.dot,
          flexShrink: 0,
        }} />
      )}
      {props.children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            padding: theme.spacing[0.5],
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: theme.spacing[1],
            transition: theme.transitions.fast,
            color: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = theme.opacity.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = theme.opacity.full
          }}
          aria-label="Remove badge"
        >
          <X size={sizeConfig.dotSize + 2} />
        </button>
      )}
    </span>
  )
})
Badge.displayName = "Badge"

export { Badge }
