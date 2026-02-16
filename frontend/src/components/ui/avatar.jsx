/**
 * Avatar Component with theme integration
 * User profile image with fallback
 * Variants: circle, square
 * Sizes: xs, sm, md, lg, xl
 */

import * as React from "react"
import { useTheme } from "@/context/ThemeContext"

const Avatar = React.forwardRef(({ 
  src, 
  alt = "Avatar",
  fallback,
  size = "md",
  variant = "circle",
  ...props 
}, ref) => {
  const theme = useTheme()
  const [imageError, setImageError] = React.useState(false)

  const sizeMap = {
    xs: { width: theme.sizes.width.avatarXs, height: theme.sizes.height.avatarXs, fontSize: theme.typography.fontSize.xs },
    sm: { width: theme.sizes.width.avatarSm, height: theme.sizes.height.avatarSm, fontSize: theme.typography.fontSize.sm },
    md: { width: theme.sizes.width.avatarMd, height: theme.sizes.height.avatarMd, fontSize: theme.typography.fontSize.base },
    lg: { width: theme.sizes.width.avatarLg, height: theme.sizes.height.avatarLg, fontSize: theme.typography.fontSize.lg },
    xl: { width: theme.sizes.width.avatarXl, height: theme.sizes.height.avatarXl, fontSize: theme.typography.fontSize.xl },
  }

  const variantMap = {
    circle: { borderRadius: theme.borderRadius.full },
    square: { borderRadius: theme.borderRadius.md },
  }

  const sizeStyle = sizeMap[size]
  const variantStyle = variantMap[variant]

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: sizeStyle.width,
        height: sizeStyle.height,
        backgroundColor: theme.colors.neutral[200],
        fontWeight: theme.typography.fontWeight.semibold,
        fontSize: sizeStyle.fontSize,
        color: theme.colors.neutral[600],
        ...variantStyle,
      }}
      {...props}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span>{fallback || alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

const AvatarGroup = React.forwardRef(({ children, max = 5, ...props }, ref) => {
  const theme = useTheme()
  const childArray = React.Children.toArray(children).slice(0, max)
  const excess = React.Children.count(children) - max

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: theme.spacing[0],
      }}
      {...props}
    >
      {childArray}
      {excess > 0 && (
        <div style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: theme.sizes.width.avatarMd,
          height: theme.sizes.height.avatarMd,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.neutral[200],
          fontWeight: theme.typography.fontWeight.semibold,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.neutral[600],
          borderWidth: theme.borderWidth.md,
          borderColor: theme.colors.background,
          marginLeft: `-${theme.spacing[2]}`,
        }}>
          +{excess}
        </div>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarGroup }
