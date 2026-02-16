import { X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export const Chips = ({
  items = [],
  onRemove = null,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  style = {},
}) => {
  const theme = useTheme()

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
      height: theme.sizes.height.chipsSmall,
    },
    md: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      height: theme.sizes.height.chipsMedium,
    },
    lg: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      height: theme.sizes.height.chipsLarge,
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[800],
      borderColor: theme.colors.primary[300],
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[800],
      borderColor: theme.colors.secondary[300],
    },
    success: {
      backgroundColor: theme.colors.success[100],
      color: theme.colors.success[800],
      borderColor: theme.colors.success[300],
    },
    warning: {
      backgroundColor: theme.colors.warning[100],
      color: theme.colors.warning[800],
      borderColor: theme.colors.warning[300],
    },
    destructive: {
      backgroundColor: theme.colors.destructive[100],
      color: theme.colors.destructive[700],
      borderColor: theme.colors.destructive[300],
    },
    outline: {
      backgroundColor: "transparent",
      color: theme.colors.foreground,
      borderColor: theme.colors.border,
    },
  }

  const currentSize = sizeStyles[size] || sizeStyles.md
  const currentVariant = variantStyles[variant] || variantStyles.default

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing[2],
        ...style,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id || index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: theme.spacing[1],
            backgroundColor: currentVariant.backgroundColor,
            color: currentVariant.color,
            border: `1px solid ${currentVariant.borderColor}`,
            borderRadius: theme.borderRadius.full,
            ...currentSize,
            opacity: disabled ? 0.6 : 1,
            transition: theme.transitions.normal,
            cursor: disabled ? "not-allowed" : "default",
          }}
        >
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.label || item}
          </span>
          {onRemove && !disabled && (
            <button
              onClick={() => onRemove(item.id || index)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                padding: 0,
                marginLeft: theme.spacing[1],
                cursor: "pointer",
                color: "inherit",
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
              }}
              aria-label={`Remove ${item.label || item}`}
            >
              <X size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

Chips.displayName = "Chips"

export default Chips
