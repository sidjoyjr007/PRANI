import { useTheme } from "@/context/ThemeContext"

/**
 * Badge Component (Enhanced)
 * Reusable status/tag badge with different variants
 */
export default function BadgeLabel({ label, variant = "default", size = "md" }) {
  const theme = useTheme()

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.muted,
      color: theme.colors.muted_foreground,
    },
    success: {
      backgroundColor: theme.colors.success.DEFAULT,
      color: theme.colors.success.foreground,
    },
    warning: {
      backgroundColor: theme.colors.warning.DEFAULT,
      color: theme.colors.warning.foreground,
    },
    destructive: {
      backgroundColor: theme.colors.destructive.DEFAULT,
      color: theme.colors.destructive.foreground,
    },
    primary: {
      backgroundColor: theme.colors.primary["100"],
      color: theme.colors.primary.DEFAULT,
    },
  }

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
      fontSize: theme.typography.fontSize.lg,
    },
  }

  return (
    <span style={{
      display: "inline-block",
      borderRadius: theme.borderRadius.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      ...variantStyles[variant],
      ...sizeStyles[size],
    }}>
      {label}
    </span>
  )
}
