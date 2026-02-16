/**
 * Grid List Component with theme integration
 * Grid-based list for displaying items in columns
 * Variants: simple, cards, contact-cards, image-cards
 * Sizes: 1, 2, 3, 4 columns
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const GridList = React.forwardRef(({ 
  className = "",
  columns = 3,
  gap = "md",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()

  const gapMap = {
    sm: "16px",
    md: "24px",
    lg: "32px"
  }

  const gapValue = gapMap[gap]

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapValue,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
})
GridList.displayName = "GridList"

const GridListCard = React.forwardRef(({ 
  className = "",
  title = "",
  description = "",
  image = null,
  avatar = null,
  badge = null,
  trailing = null,
  href = null,
  onClick = null,
  disabled = false,
  variant = "simple",
  size = "md",
  children,
  ...props 
}, ref) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeMap = {
    sm: { padding: "12px", gap: "8px" },
    md: { padding: "16px", gap: "12px" },
    lg: { padding: "20px", gap: "16px" }
  }

  const sizeStyle = sizeMap[size]

  let cardStyles = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.colors.card,
    border: `2px solid ${theme.colors.neutral[200]}`,
    borderRadius: "8px",
    overflow: "hidden",
    cursor: href || onClick ? "pointer" : "default",
    transition: "all 250ms ease",
    opacity: disabled ? 0.5 : 1,
  }

  if (isHovered && !disabled && (href || onClick)) {
    cardStyles.borderColor = theme.colors.primary[300]
    cardStyles.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`
  }

  const Component = href ? "a" : "div"

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      style={cardStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Image Section */}
      {image && (
        <div
          style={{
            width: "100%",
            height: size === "sm" ? "120px" : size === "md" ? "180px" : "240px",
            backgroundColor: image.bg || theme.colors.neutral[100],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            color: theme.colors.muted_foreground,
            overflow: "hidden",
          }}
        >
          {image.src ? (
            <img src={image.src} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            image.placeholder || "Image"
          )}
        </div>
      )}

      {/* Content Section */}
      <div style={{ padding: sizeStyle.padding, display: "flex", flexDirection: "column", gap: sizeStyle.gap, flex: 1 }}>
        {/* Avatar + Title Row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          {avatar && (
            <div
              style={{
                width: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
                height: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
                minWidth: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
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
          <div style={{ flex: 1 }}>
            {title && (
              <div
                style={{
                  fontSize: size === "sm" ? "14px" : size === "md" ? "15px" : "16px",
                  fontWeight: "600",
                  color: theme.colors.foreground,
                }}
              >
                {title}
              </div>
            )}
            {badge && (
              <div style={{ marginTop: "6px" }}>
                {badge}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: size === "sm" ? "12px" : size === "md" ? "13px" : "14px",
              color: theme.colors.muted_foreground,
              lineHeight: "1.5",
            }}
          >
            {description}
          </div>
        )}

        {/* Custom Children */}
        {children && (
          <div style={{ flex: 1 }}>
            {children}
          </div>
        )}

        {/* Trailing Element */}
        {trailing && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: "8px" }}>
            {trailing}
          </div>
        )}
      </div>
    </Component>
  )
})
GridListCard.displayName = "GridListCard"

export { GridList, GridListCard }
