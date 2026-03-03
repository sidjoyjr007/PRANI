import { useTheme } from "@/context/ThemeContext"

/**
 * InfoCard Component
 * Reusable card for displaying information with hover effects
 */
export default function InfoCard({ title, subtitle, description, footer, onClick }) {
  const theme = useTheme()

  return (
    <div
      style={{
        backgroundColor: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[8],
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.md
          e.currentTarget.style.transform = "translateY(-2px)"
          e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.borderColor = theme.colors.border
      }}
    >
      <h3 style={{
        margin: 0,
        marginBottom: theme.spacing[2],
        color: theme.colors.foreground,
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
      }}>
        {title}
      </h3>

      {subtitle && (
        <p style={{
          margin: 0,
          marginBottom: theme.spacing[2],
          color: theme.colors.muted_foreground,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        }}>
          {subtitle}
        </p>
      )}

      {description && (
        <p style={{
          margin: 0,
          marginBottom: theme.spacing[6],
          color: theme.colors.foreground,
          fontSize: theme.typography.fontSize.sm,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {description}
        </p>
      )}

      {footer && (
        <div style={{ marginTop: theme.spacing[6] }}>
          {footer}
        </div>
      )}
    </div>
  )
}
