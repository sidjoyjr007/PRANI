/**
 * Stacked List Component with theme integration
 * List container with multiple layout variants and styles
 * Variants: simple, card, card-mobile, separate, separate-mobile, flat
 * Sizes: sm, md, lg
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const getListContainerStyles = (variant, theme) => {
  const baseStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  }

  const variantStyles = {
    // Simple with dividers - plain vertical list
    simple: {
      ...baseStyles,
      backgroundColor: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: theme.shadows.sm,
    },
    // Card with dividers - list in elevated card
    card: {
      ...baseStyles,
      backgroundColor: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: theme.shadows.md,
    },
    // Card with dividers, responsive mobile
    "card-mobile": {
      ...baseStyles,
      backgroundColor: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: theme.shadows.md,
    },
    // Separate cards - each item is individual card
    separate: {
      ...baseStyles,
      gap: "12px",
    },
    // Separate cards, responsive mobile
    "separate-mobile": {
      ...baseStyles,
      gap: "12px",
    },
    // Flat card - minimal styling
    flat: {
      ...baseStyles,
      backgroundColor: theme.colors.neutral[50],
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "none",
    },
  }

  return variantStyles[variant] || variantStyles.simple
}

const StackedList = React.forwardRef(({ 
  className = "",
  variant = "simple",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const containerStyles = getListContainerStyles(variant, theme)

  return (
    <div
      ref={ref}
      style={containerStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
})
StackedList.displayName = "StackedList"

const StackedListItem = React.forwardRef(({ 
  className = "",
  title = "",
  description = "",
  avatar = null,
  leading = null,
  trailing = null,
  badge = null,
  href = null,
  onClick = null,
  disabled = false,
  variant = "simple",
  size = "md",
  divider = true,
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeConfig = {
    sm: { padding: "12px 16px", gap: "8px", avatarSize: "32px", titleFontSize: "14px", descriptionFontSize: "12px" },
    md: { padding: "16px 20px", gap: "12px", avatarSize: "40px", titleFontSize: "15px", descriptionFontSize: "13px" },
    lg: { padding: "20px 24px", gap: "16px", avatarSize: "48px", titleFontSize: "16px", descriptionFontSize: "14px" }
  }

  const config = sizeConfig[size]

  // For separate variant, each item is its own card
  const isSeparateVariant = variant === "separate" || variant === "separate-mobile"
  
  let itemStyles = {
    padding: config.padding,
    display: "flex",
    alignItems: "center",
    gap: config.gap,
    borderBottom: !isSeparateVariant && divider ? `1px solid ${theme.colors.neutral[200]}` : "none",
    backgroundColor: isHovered && !isSeparateVariant ? theme.colors.neutral[50] : theme.colors.card,
    cursor: href || onClick ? "pointer" : "default",
    transition: "all 250ms ease",
    opacity: disabled ? 0.5 : 1,
    borderRadius: isSeparateVariant ? "8px" : "0",
    border: isSeparateVariant ? `1px solid ${theme.colors.border}` : "none",
    boxShadow: isSeparateVariant && isHovered ? theme.shadows.md : isSeparateVariant ? theme.shadows.sm : "none",
    transform: isSeparateVariant && isHovered ? "translateY(-2px)" : "translateY(0)",
  }

  // Remove border-bottom for last item in simple variants
  const Component = href ? "a" : "div"

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      style={itemStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Leading Avatar or Icon */}
      {avatar && (
        <div
          style={{
            width: config.avatarSize,
            height: config.avatarSize,
            minWidth: config.avatarSize,
            borderRadius: "50%",
            backgroundColor: avatar.bg || theme.colors.primary[100],
            color: avatar.color || theme.colors.primary[600],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size === "sm" ? "12px" : size === "md" ? "14px" : "16px",
            fontWeight: "600",
          }}
        >
          {avatar.initials || avatar.icon}
        </div>
      )}
      {leading && !avatar && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "40px", color: theme.colors.muted_foreground }}>
          {leading}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: config.titleFontSize,
            fontWeight: "600",
            color: theme.colors.foreground,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: config.descriptionFontSize,
              color: theme.colors.muted_foreground,
              marginTop: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </div>
        )}
        {children && !description && (
          <div style={{ marginTop: "4px", fontSize: config.descriptionFontSize, color: theme.colors.muted_foreground }}>
            {children}
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: size === "sm" ? "4px 8px" : size === "md" ? "6px 12px" : "8px 16px",
            borderRadius: "6px",
            backgroundColor: badge.bg || theme.colors.primary[100],
            color: badge.color || theme.colors.primary[600],
            fontSize: size === "sm" ? "11px" : size === "md" ? "12px" : "13px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {badge.label}
        </div>
      )}

      {/* Trailing Icon/Action */}
      {trailing && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "40px", color: theme.colors.muted_foreground }}>
          {trailing}
        </div>
      )}
    </Component>
  )
})
StackedListItem.displayName = "StackedListItem"

const StackedListSection = React.forwardRef(({ 
  className = "",
  title = "",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  return (
    <div ref={ref} className={className} {...props}>
      {title && (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: theme.colors.neutral[100],
            fontSize: "12px",
            fontWeight: "600",
            color: theme.colors.muted_foreground,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  )
})
StackedListSection.displayName = "StackedListSection"

export { StackedList, StackedListItem, StackedListSection }
