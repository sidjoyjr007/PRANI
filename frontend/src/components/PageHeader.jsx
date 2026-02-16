import { useTheme } from "@/context/ThemeContext"

/**
 * PageHeader Component
 * Reusable page header with title and optional subtitle
 */
export default function PageHeader({ title, subtitle, children }) {
  const theme = useTheme()

  return (
    <div style={{ marginBottom: theme.spacing[8] }}>
      <h1 style={{ 
        margin: 0, 
        marginBottom: subtitle || children ? theme.spacing[2] : 0,
        color: theme.colors.foreground,
        fontSize: theme.typography.fontSize.xl3,
        fontWeight: theme.typography.fontWeight.bold,
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          margin: 0,
          color: theme.colors.muted_foreground,
          fontSize: theme.typography.fontSize.sm,
        }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}
