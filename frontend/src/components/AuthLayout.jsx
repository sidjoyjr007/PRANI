import { useTheme } from "@/context/ThemeContext"
import praniLogo from "@/assets/prani-logo.svg"

export default function AuthLayout({ children, title, description }) {
  const theme = useTheme()

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: theme.spacing[4], backgroundColor: theme.colors.muted }}>
      {/* Logo */}
      <div style={{ marginBottom: theme.spacing[8] }}>
        <img 
          src={praniLogo}
          alt="Prani" 
          style={{
            height: "50px",
            width: "auto",
          }}
        />
      </div>
      
      <div style={{ width: "100%", maxWidth: "448px" }}>
        <div style={{ marginBottom: theme.spacing[6], textAlign: "center" }}>
          <h1 style={{ fontSize: theme.typography.fontSize.xl3, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.foreground, margin: 0 }}>
            {title}
          </h1>
          {description && <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.muted_foreground, margin: `${theme.spacing[2]} 0 0 0` }}>
            {description}
          </p>}
        </div>
        {children}
      </div>
    </div>
  )
}
