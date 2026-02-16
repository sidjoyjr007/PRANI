import { useTheme } from "@/context/ThemeContext"

/**
 * Container Component
 * Reusable container with max-width and padding
 */
export default function Container({ children, maxWidth = "1280px", padding = 8 }) {
  const theme = useTheme()

  return (
    <div style={{
      maxWidth: maxWidth,
      margin: "0 auto",
      padding: theme.spacing[padding],
      width: "100%",
    }}>
      {children}
    </div>
  )
}
