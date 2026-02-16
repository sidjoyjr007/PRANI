import { useTheme } from "@/context/ThemeContext"

/**
 * Section Component
 * Reusable section wrapper with consistent spacing and styling
 */
export default function Section({ children, title, subtitle, maxWidth = "100%" }) {
  const theme = useTheme()

  return (
    <section style={{
      maxWidth: maxWidth,
      margin: "0 auto",
      padding: theme.spacing[8],
    }}>
      {title && (
        <div style={{ marginBottom: theme.spacing[8] }}>
          <h2 style={{
            margin: 0,
            marginBottom: subtitle ? theme.spacing[2] : 0,
            color: theme.colors.foreground,
            fontSize: theme.typography.fontSize.xl2,
            fontWeight: theme.typography.fontWeight.bold,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{
              margin: 0,
              color: theme.colors.muted_foreground,
              fontSize: theme.typography.fontSize.sm,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
